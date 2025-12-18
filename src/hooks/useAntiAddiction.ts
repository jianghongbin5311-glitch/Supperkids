import { useState, useCallback, useEffect } from 'react';

interface AntiAddictionSettings {
  sessionLimit: number; // minutes
  dailyLimit: number; // minutes
  cooldownTime: number; // minutes
  reminderInterval: number; // seconds
}

interface AntiAddictionState {
  isLocked: boolean;
  lockReason: 'session' | 'daily' | 'cooldown' | null;
  remainingSessionTime: number; // seconds
  remainingDailyTime: number; // seconds
  cooldownRemaining: number; // seconds
  todayUsed: number; // seconds
  canPlay: boolean;
}

interface UseAntiAddictionResult extends AntiAddictionState {
  startSession: () => void;
  endSession: () => void;
  updateTime: () => void;
  parentUnlock: () => void;
  settings: AntiAddictionSettings;
  updateSettings: (newSettings: Partial<AntiAddictionSettings>) => void;
}

const STORAGE_KEY = 'speakbuddy_antiaddiction';
const SETTINGS_KEY = 'speakbuddy_settings';

const DEFAULT_SETTINGS: AntiAddictionSettings = {
  sessionLimit: 8,
  dailyLimit: 30,
  cooldownTime: 20,
  reminderInterval: 3,
};

interface StoredData {
  todayUsed: number;
  lastDate: string;
  lastSessionEnd: number | null;
  parentUnlocked: boolean;
}

function getStoredData(): StoredData {
  const stored = localStorage.getItem(STORAGE_KEY);
  const today = new Date().toDateString();
  
  if (stored) {
    const data = JSON.parse(stored) as StoredData;
    // Reset if it's a new day
    if (data.lastDate !== today) {
      return {
        todayUsed: 0,
        lastDate: today,
        lastSessionEnd: null,
        parentUnlocked: false,
      };
    }
    return data;
  }
  
  return {
    todayUsed: 0,
    lastDate: today,
    lastSessionEnd: null,
    parentUnlocked: false,
  };
}

function saveStoredData(data: StoredData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getSettings(): AntiAddictionSettings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: AntiAddictionSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function useAntiAddiction(): UseAntiAddictionResult {
  const [settings, setSettings] = useState<AntiAddictionSettings>(getSettings);
  const [storedData, setStoredData] = useState<StoredData>(getStoredData);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [currentSessionUsed, setCurrentSessionUsed] = useState(0);

  const calculateState = useCallback((): AntiAddictionState => {
    const now = Date.now();
    const sessionLimitSec = settings.sessionLimit * 60;
    const dailyLimitSec = settings.dailyLimit * 60;
    const cooldownSec = settings.cooldownTime * 60;

    const totalUsedToday = storedData.todayUsed + currentSessionUsed;
    const remainingDaily = Math.max(0, dailyLimitSec - totalUsedToday);
    const remainingSession = Math.max(0, sessionLimitSec - currentSessionUsed);

    // Calculate cooldown
    let cooldownRemaining = 0;
    if (storedData.lastSessionEnd && !storedData.parentUnlocked) {
      const timeSinceLastSession = (now - storedData.lastSessionEnd) / 1000;
      cooldownRemaining = Math.max(0, cooldownSec - timeSinceLastSession);
    }

    // Determine lock status
    let isLocked = false;
    let lockReason: AntiAddictionState['lockReason'] = null;

    if (remainingDaily <= 0) {
      isLocked = true;
      lockReason = 'daily';
    } else if (cooldownRemaining > 0 && sessionStartTime === null) {
      isLocked = true;
      lockReason = 'cooldown';
    } else if (remainingSession <= 0 && sessionStartTime !== null) {
      isLocked = true;
      lockReason = 'session';
    }

    return {
      isLocked,
      lockReason,
      remainingSessionTime: remainingSession,
      remainingDailyTime: remainingDaily,
      cooldownRemaining,
      todayUsed: totalUsedToday,
      canPlay: !isLocked,
    };
  }, [settings, storedData, currentSessionUsed, sessionStartTime]);

  const [state, setState] = useState<AntiAddictionState>(calculateState);

  // Update state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionStartTime !== null) {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        setCurrentSessionUsed(elapsed);
      }
      setState(calculateState());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateState, sessionStartTime]);

  const startSession = useCallback(() => {
    const currentState = calculateState();
    if (currentState.canPlay) {
      setSessionStartTime(Date.now());
      setCurrentSessionUsed(0);
      // Clear parent unlock when starting new session
      const newData = { ...getStoredData(), parentUnlocked: false };
      setStoredData(newData);
      saveStoredData(newData);
    }
  }, [calculateState]);

  const endSession = useCallback(() => {
    if (sessionStartTime !== null) {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      const newData = {
        ...storedData,
        todayUsed: storedData.todayUsed + elapsed,
        lastSessionEnd: Date.now(),
        parentUnlocked: false,
      };
      setStoredData(newData);
      saveStoredData(newData);
      setSessionStartTime(null);
      setCurrentSessionUsed(0);
    }
  }, [sessionStartTime, storedData]);

  const updateTime = useCallback(() => {
    setState(calculateState());
  }, [calculateState]);

  const parentUnlock = useCallback(() => {
    const newData = {
      ...storedData,
      parentUnlocked: true,
      lastSessionEnd: null,
    };
    setStoredData(newData);
    saveStoredData(newData);
    setState(calculateState());
  }, [storedData, calculateState]);

  const updateSettings = useCallback((newSettings: Partial<AntiAddictionSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  }, [settings]);

  return {
    ...state,
    startSession,
    endSession,
    updateTime,
    parentUnlock,
    settings,
    updateSettings,
  };
}
