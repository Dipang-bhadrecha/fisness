/**
 * useAsyncStorage — Simple AsyncStorage wrapper
 * Provides getItem and setItem functions for storing app preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

export function useAsyncStorage() {
  const getItem = async (key: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(key)
      return value
    } catch (error) {
      console.error(`Failed to read AsyncStorage key "${key}":`, error)
      return null
    }
  }

  const setItem = async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (error) {
      console.error(`Failed to write AsyncStorage key "${key}":`, error)
      throw error
    }
  }

  const removeItem = async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove AsyncStorage key "${key}":`, error)
      throw error
    }
  }

  return {
    getItem,
    setItem,
    removeItem,
  }
}

export default useAsyncStorage
