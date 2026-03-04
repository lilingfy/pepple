/**
 * IndexedDB Storage for Pebble
 * 本地存储敏感数据，保护用户隐私
 */

import Dexie, { type Table } from 'dexie';

// ==========================================
// Type Definitions
// ==========================================

export interface AnalysisRecord {
  id?: number;
  timestamp: Date;
  inputText: string;
  surfaceMeaning: string;
  trueIntent: string;
  attackType: string[];
  culturalContext: string;
  tacticalTip: string;
  replies: {
    minimal: string;
    gentle: string;
    boundary: string;
  };
}

export interface SimulationRecord {
  id?: number;
  timestamp: Date;
  scenarioId: string;
  scenarioName: string;
  finalScore: number;
  turnsCount: number;
  completed: boolean;
  history: Array<{
    role: 'user' | 'antagonist';
    content: string;
    timestamp: Date;
  }>;
}

export interface PanicSession {
  id?: number;
  timestamp: Date;
  durationSeconds: number;
  completed: boolean;
  technique: '4-7-8' | 'box' | 'coherent';
}

export interface UserSettings {
  id?: number;
  key: string;
  value: unknown;
  updatedAt: Date;
}

// ==========================================
// Pebble Database Class
// ==========================================

class PebbleDatabase extends Dexie {
  // Tables
  analyses!: Table<AnalysisRecord>;
  simulations!: Table<SimulationRecord>;
  panicSessions!: Table<PanicSession>;
  settings!: Table<UserSettings>;

  constructor() {
    super('PebbleDB');

    this.version(1).stores({
      analyses: '++id, timestamp, attackType',
      simulations: '++id, timestamp, scenarioId, completed',
      panicSessions: '++id, timestamp, completed',
      settings: 'key',
    });
  }
}

// ==========================================
// Database Instance
// ==========================================

const db = new PebbleDatabase();

// ==========================================
// Analysis Records
// ==========================================

export async function saveAnalysis(record: Omit<AnalysisRecord, 'id'>): Promise<number> {
  return await db.analyses.add(record as AnalysisRecord);
}

export async function getAnalyses(
  limit: number = 50,
  offset: number = 0
): Promise<AnalysisRecord[]> {
  return await db.analyses
    .orderBy('timestamp')
    .reverse()
    .offset(offset)
    .limit(limit)
    .toArray();
}

export async function getAnalysisById(id: number): Promise<AnalysisRecord | undefined> {
  return await db.analyses.get(id);
}

export async function deleteAnalysis(id: number): Promise<void> {
  await db.analyses.delete(id);
}

export async function clearAnalyses(): Promise<void> {
  await db.analyses.clear();
}

// ==========================================
// Simulation Records
// ==========================================

export async function saveSimulation(
  record: Omit<SimulationRecord, 'id'>
): Promise<number> {
  return await db.simulations.add(record as SimulationRecord);
}

export async function updateSimulation(
  id: number,
  changes: Partial<SimulationRecord>
): Promise<void> {
  await db.simulations.update(id, changes);
}

export async function getSimulations(
  limit: number = 50
): Promise<SimulationRecord[]> {
  return await db.simulations
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getSimulationById(
  id: number
): Promise<SimulationRecord | undefined> {
  return await db.simulations.get(id);
}

// ==========================================
// Panic Session Records
// ==========================================

export async function savePanicSession(
  record: Omit<PanicSession, 'id'>
): Promise<number> {
  return await db.panicSessions.add(record as PanicSession);
}

export async function getPanicSessions(
  limit: number = 50
): Promise<PanicSession[]> {
  return await db.panicSessions
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getPanicStats(): Promise<{
  totalSessions: number;
  completedSessions: number;
  totalDurationMinutes: number;
}> {
  const all = await db.panicSessions.toArray();
  const completed = all.filter((s) => s.completed);

  return {
    totalSessions: all.length,
    completedSessions: completed.length,
    totalDurationMinutes: Math.round(
      all.reduce((sum, s) => sum + s.durationSeconds, 0) / 60
    ),
  };
}

// ==========================================
// User Settings
// ==========================================

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await db.settings.put({
    key,
    value,
    updatedAt: new Date(),
  });
}

export async function getSetting<T>(key: string, defaultValue?: T): Promise<T | undefined> {
  const record = await db.settings.get(key);
  return record ? (record.value as T) : defaultValue;
}

export async function deleteSetting(key: string): Promise<void> {
  await db.settings.delete(key);
}

// ==========================================
// Statistics
// ==========================================

export async function getStats(): Promise<{
  totalAnalyses: number;
  totalSimulations: number;
  totalPanicSessions: number;
  mostCommonAttackType: string | null;
}> {
  const [analyses, simulations, panicSessions] = await Promise.all([
    db.analyses.count(),
    db.simulations.count(),
    db.panicSessions.count(),
  ]);

  // Calculate most common attack type
  const allAnalyses = await db.analyses.toArray();
  const attackTypeCounts: Record<string, number> = {};

  allAnalyses.forEach((a) => {
    a.attackType.forEach((type) => {
      attackTypeCounts[type] = (attackTypeCounts[type] || 0) + 1;
    });
  });

  const mostCommonAttackType = Object.entries(attackTypeCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    totalAnalyses: analyses,
    totalSimulations: simulations,
    totalPanicSessions: panicSessions,
    mostCommonAttackType,
  };
}

// ==========================================
// Export Database Instance
// ==========================================

export { db };
export default db;
