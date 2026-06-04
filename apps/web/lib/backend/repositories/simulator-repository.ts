/**
 * Simulator Repository
 * Data access layer for simulation sessions and turns
 */

import { db } from '@/lib/db';
import { simulationSessions, simulationTurns } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { SimulationSession, SimulationTurn } from '@/lib/db/schema';

export interface SessionWithTurns extends SimulationSession {
  turns: SimulationTurn[];
}

// In-memory storage fallback when DB is unavailable
interface MemorySession {
  id: string;
  userId: string | null;
  scenarioId: string;
  turnsCount: number;
  completed: boolean;
  finalScore: number | null;
  completedAt: Date | null;
  historySnapshot: unknown;
  createdAt: Date;
  turns: Array<{
    id: string;
    sessionId: string;
    role: string;
    content: string;
    timestamp: Date;
    analysisJsonb: unknown | null;
    createdAt: Date;
  }>;
}

const memorySessions = new Map<string, MemorySession>();
let memoryIdCounter = 1;

function generateMemoryId(): string {
  return `mem-${Date.now()}-${memoryIdCounter++}`;
}

function checkDB() {
  if (!db) {
    throw new Error('Database unavailable - using memory fallback');
  }
  return db;
}

export class SimulatorRepository {
  /**
   * Check if using memory storage
   */
  isMemoryMode(): boolean {
    return !db;
  }

  /**
   * Create a new simulation session
   */
  async createSession(data: {
    userId?: string | null;
    guestSessionId?: string | null;
    scenarioId: string;
    initialMessage: string;
  }): Promise<SessionWithTurns> {
    // Use memory fallback if DB unavailable
    if (!db) {
      const now = new Date();
      const session: MemorySession = {
        id: generateMemoryId(),
        userId: data.userId ?? null,
        scenarioId: data.scenarioId,
        turnsCount: 1,
        completed: false,
        finalScore: null,
        completedAt: null,
        historySnapshot: null,
        createdAt: now,
        turns: [{
          id: generateMemoryId(),
          sessionId: '', // set below
          role: 'assistant',
          content: data.initialMessage,
          timestamp: now,
          analysisJsonb: null,
          createdAt: now,
        }],
      };
      session.turns[0].sessionId = session.id;
      memorySessions.set(session.id, session);
      return session as unknown as SessionWithTurns;
    }

    // Create session
    const [session] = await db
      .insert(simulationSessions)
      .values({
        userId: data.userId ?? null,
        scenarioId: data.scenarioId,
        turnsCount: 1,
        completed: false,
      })
      .returning();

    if (!session) {
      throw new Error('Failed to create simulation session');
    }

    // Create initial turn
    await db.insert(simulationTurns).values({
      sessionId: session.id,
      role: 'assistant',
      content: data.initialMessage,
      timestamp: new Date(),
    });

    return this.findById(session.id) as Promise<SessionWithTurns>;
  }

  /**
   * Find session by ID with all turns
   */
  async findById(id: string): Promise<SessionWithTurns | null> {
    // Memory fallback
    if (!db) {
      const mem = memorySessions.get(id);
      return mem ? (mem as unknown as SessionWithTurns) : null;
    }

    const [session] = await db
      .select()
      .from(simulationSessions)
      .where(eq(simulationSessions.id, id))
      .limit(1);

    if (!session) return null;

    const turns = await db
      .select()
      .from(simulationTurns)
      .where(eq(simulationTurns.sessionId, id))
      .orderBy(simulationTurns.timestamp);

    return { ...session, turns };
  }

  /**
   * Add a turn to a session
   */
  async addTurn(data: {
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
    analysisJsonb?: unknown;
  }): Promise<SimulationTurn> {
    // Memory fallback
    if (!db) {
      const session = memorySessions.get(data.sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      const now = new Date();
      const turn = {
        id: generateMemoryId(),
        sessionId: data.sessionId,
        role: data.role,
        content: data.content,
        timestamp: now,
        analysisJsonb: data.analysisJsonb ?? null,
        createdAt: now,
      };
      session.turns.push(turn);
      session.turnsCount = session.turns.length;
      return turn as unknown as SimulationTurn;
    }

    const [turn] = await db
      .insert(simulationTurns)
      .values({
        sessionId: data.sessionId,
        role: data.role,
        content: data.content,
        analysisJsonb: data.analysisJsonb ?? null,
        timestamp: new Date(),
      })
      .returning();

    if (!turn) {
      throw new Error('Failed to create turn');
    }

    // Update session turn count
    await db
      .update(simulationSessions)
      .set({
        turnsCount: db.$count(simulationTurns, eq(simulationTurns.sessionId, data.sessionId)),
      })
      .where(eq(simulationSessions.id, data.sessionId));

    return turn;
  }

  /**
   * Mark session as completed
   */
  async completeSession(
    sessionId: string,
    data: {
      finalScore: number;
      summary: unknown;
    }
  ): Promise<SimulationSession | null> {
    // Memory fallback
    if (!db) {
      const session = memorySessions.get(sessionId);
      if (!session) return null;
      session.completed = true;
      session.finalScore = data.finalScore;
      session.completedAt = new Date();
      session.historySnapshot = data.summary;
      return session as unknown as SimulationSession;
    }

    const [session] = await db
      .update(simulationSessions)
      .set({
        completed: true,
        finalScore: data.finalScore,
        completedAt: new Date(),
        historySnapshot: data.summary,
      })
      .where(eq(simulationSessions.id, sessionId))
      .returning();

    return session ?? null;
  }

  /**
   * List active sessions for a user or guest
   */
  async listActiveSessions(params: {
    userId?: string | null;
    guestSessionId?: string | null;
    limit?: number;
  }): Promise<SimulationSession[]> {
    // Memory fallback
    if (!db) {
      return Array.from(memorySessions.values())
        .filter(s => !s.completed)
        .slice(0, params.limit ?? 10);
    }

    const conditions = [eq(simulationSessions.completed, false)];

    if (params.userId) {
      conditions.push(eq(simulationSessions.userId, params.userId));
    }

    const whereClause = conditions.reduce((acc, condition) => and(acc!, condition)!);

    return db
      .select()
      .from(simulationSessions)
      .where(whereClause)
      .orderBy(desc(simulationSessions.createdAt))
      .limit(params.limit ?? 10);
  }

  /**
   * Get recent turns for a session
   */
  async getRecentTurns(sessionId: string, limit: number = 10): Promise<SimulationTurn[]> {
    // Memory fallback
    if (!db) {
      const session = memorySessions.get(sessionId);
      return session?.turns.slice(-limit) ?? [];
    }

    return db
      .select()
      .from(simulationTurns)
      .where(eq(simulationTurns.sessionId, sessionId))
      .orderBy(desc(simulationTurns.timestamp))
      .limit(limit);
  }
}

// Singleton instance
export const simulatorRepository = new SimulatorRepository();
