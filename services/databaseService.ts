
import { Shot } from '../types';
import { INITIAL_SHOT_DB } from '../constants';

const KEYS = {
  SHOTS: 'EDEN_SHOTS_DB_V1',
  STAFF: 'EDEN_STAFF_DB_V1'
};

const INITIAL_STAFF = [{ id: 'bestteameden', pw: '1234' }];

// Simulating database latency and processing
const processRequest = async <T>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), 50));
};

export const db = {
  // Initialize DB if empty
  init: () => {
    if (!localStorage.getItem(KEYS.SHOTS)) {
      localStorage.setItem(KEYS.SHOTS, JSON.stringify(INITIAL_SHOT_DB));
    }
    if (!localStorage.getItem(KEYS.STAFF)) {
      localStorage.setItem(KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
    }
  },

  // Shot (Reference) Operations
  getShots: (): Shot[] => {
    try {
      const data = localStorage.getItem(KEYS.SHOTS);
      return data ? JSON.parse(data) : INITIAL_SHOT_DB;
    } catch {
      return INITIAL_SHOT_DB;
    }
  },

  addShot: async (shot: Shot): Promise<Shot[]> => {
    const current = db.getShots();
    const updated = [...current, shot];
    localStorage.setItem(KEYS.SHOTS, JSON.stringify(updated));
    return await processRequest(updated);
  },

  updateShot: async (updatedShot: Shot): Promise<Shot[]> => {
    const current = db.getShots();
    const updated = current.map(s => s.id === updatedShot.id ? updatedShot : s);
    localStorage.setItem(KEYS.SHOTS, JSON.stringify(updated));
    return await processRequest(updated);
  },

  deleteShot: async (id: string): Promise<Shot[]> => {
    const current = db.getShots();
    const updated = current.filter(s => s.id !== id);
    localStorage.setItem(KEYS.SHOTS, JSON.stringify(updated));
    return await processRequest(updated);
  },

  // Staff Operations
  getStaff: (): Array<{id: string, pw: string}> => {
    try {
      const data = localStorage.getItem(KEYS.STAFF);
      return data ? JSON.parse(data) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  },

  addStaff: async (account: {id: string, pw: string}) => {
    const current = db.getStaff();
    const updated = [...current, account];
    localStorage.setItem(KEYS.STAFF, JSON.stringify(updated));
    return await processRequest(updated);
  },

  deleteStaff: async (id: string) => {
    const current = db.getStaff();
    const updated = current.filter(s => s.id !== id);
    localStorage.setItem(KEYS.STAFF, JSON.stringify(updated));
    return await processRequest(updated);
  }
};