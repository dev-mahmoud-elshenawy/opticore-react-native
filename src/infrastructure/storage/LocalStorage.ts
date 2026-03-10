import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from '../logger/Logger';
import { IStorage } from './interfaces/IStorage';

export class LocalStorage implements IStorage {
  private static instance: LocalStorage;

  private constructor() { }

  public static getInstance(): LocalStorage {
    if (!LocalStorage.instance) {
      LocalStorage.instance = new LocalStorage();
    }
    return LocalStorage.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      try {
        return JSON.parse(value) as T;
      } catch (parseError) {
        Logger.getInstance().warn(
          `[LocalStorage] Failed to parse value for key "${key}", returning null`,
          parseError as Error,
        );
        return null;
      }
    } catch (error) {
      Logger.getInstance().error(`[LocalStorage] Failed to read key "${key}"`, error as Error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      Logger.getInstance().error(`[LocalStorage] Failed to write key "${key}"`, error as Error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      Logger.getInstance().error(`[LocalStorage] Failed to remove key "${key}"`, error as Error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      Logger.getInstance().error('[LocalStorage] Failed to clear storage', error as Error);
      throw error;
    }
  }
}
