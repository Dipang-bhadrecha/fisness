import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect } from 'react'
import { useTaliStore } from '../store/taliStore'

const SESSION_KEY = 'matsyakosh_active_session'

export function useTaliSession() {
  const store = useTaliStore()

  useEffect(() => {
    if (store.session) {
      AsyncStorage.setItem(SESSION_KEY, JSON.stringify(store.session))
    } else {
      AsyncStorage.removeItem(SESSION_KEY)
    }
  }, [store.session])

  const loadSavedSession = async () => {
    try {
      const saved = await AsyncStorage.getItem(SESSION_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        useTaliStore.setState({ session: parsed })
      }
    } catch (error) {
      console.log('No saved session found')
    }
  }

  return {
    session: store.session,
    createSession: store.createSession,
    addFishToSession: store.addFishToSession,
    addCount: store.addCount,
    pauseSession: store.pauseSession,
    resumeSession: store.resumeSession,
    setPartialWeight: store.setPartialWeight,
    setActiveFish: store.setActiveFish,
    deleteFish: store.deleteFish,
    endSession: store.endSession,
    clearSession: store.clearSession,
    loadSavedSession,
    addCustomCount: store.addCustomCount, 
  }
}