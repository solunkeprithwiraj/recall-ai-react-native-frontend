import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * Cross-platform storage utility
 * Uses SecureStore on native (iOS/Android) and localStorage on web
 */
export const storage = {
  /**
   * Get an item from storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        // Use localStorage on web
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      } else {
        // Use SecureStore on native platforms
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error getting item "${key}":`, error);
      return null;
    }
  },

  /**
   * Set an item in storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        // Use localStorage on web
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } else {
        // Use SecureStore on native platforms
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error setting item "${key}":`, error);
      throw error;
    }
  },

  /**
   * Remove an item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        // Use localStorage on web
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } else {
        // Use SecureStore on native platforms
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing item "${key}":`, error);
      throw error;
    }
  },
};

