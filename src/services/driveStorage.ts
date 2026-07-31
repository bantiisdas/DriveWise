import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DriveSession } from '@/src/types/drive';

const STORAGE_KEY = 'drivewise:sessions';

export async function loadSessions(): Promise<DriveSession[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DriveSession[];
    return Array.isArray(parsed)
      ? parsed.sort((a, b) => b.startedAt - a.startedAt)
      : [];
  } catch {
    return [];
  }
}

export async function saveSession(session: DriveSession): Promise<void> {
  const sessions = await loadSessions();
  const next = [session, ...sessions.filter((s) => s.id !== session.id)];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function getSessionById(id: string): Promise<DriveSession | null> {
  const sessions = await loadSessions();
  return sessions.find((s) => s.id === id) ?? null;
}

export async function getLatestSession(): Promise<DriveSession | null> {
  const sessions = await loadSessions();
  return sessions[0] ?? null;
}

export async function clearSessions(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
