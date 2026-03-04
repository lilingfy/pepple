/**
 * Storage Module for Pebble
 * 统一导出IndexedDB存储功能
 */

export {
  // Analysis Records
  saveAnalysis,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
  clearAnalyses,

  // Simulation Records
  saveSimulation,
  updateSimulation,
  getSimulations,
  getSimulationById,

  // Panic Session Records
  savePanicSession,
  getPanicSessions,
  getPanicStats,

  // User Settings
  setSetting,
  getSetting,
  deleteSetting,

  // Statistics
  getStats,

  // Database Instance
  db,
} from './indexed-db';

export type {
  AnalysisRecord,
  SimulationRecord,
  PanicSession,
  UserSettings,
} from './indexed-db';
