const STORAGE_KEY = '__inspector_snapshot_v1';

export const saveSnapshot = (snapshotData: any): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshotData));
    return true;
  } catch (e) {
    console.error('Failed to save snapshot:', e);
    return false;
  }
};

export const loadSnapshot = (): any => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load snapshot:', e);
    return null;
  }
};

export const clearSnapshot = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear snapshot:', e);
  }
};
