/**
 * components/shared/AppTabBar.tsx
 *
 * Shared bottom tab bar used on EVERY main screen.
 * Pass activeTab to highlight the correct tab.
 *
 * Usage:
 *   <AppTabBar activeTab="trips" />
 *   <AppTabBar activeTab="ledger" />
 *   <AppTabBar />   ← no active tab (all grey)
 */

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const SURF  = '#0D1B2E'
const TEAL  = '#0891b2'
const BOR   = 'rgba(255,255,255,0.06)'

export type AppTab = 'home' | 'tali' | 'trips' | 'ledger' | 'crew'

const TABS: {
  id: AppTab
  label: string
  active: keyof typeof Ionicons.glyphMap
  inactive: keyof typeof Ionicons.glyphMap
  route: string
}[] = [
  { id: 'home',    label: 'Home',    active: 'home',         inactive: 'home-outline',    route: '/(home)'     },
  { id: 'tali',    label: 'Tali',    active: 'scale',        inactive: 'scale-outline',   route: '/tali-list'  },
  { id: 'trips',   label: 'Trips',   active: 'boat',         inactive: 'boat-outline',    route: '/trips'      },
  { id: 'ledger',  label: 'Ledger',  active: 'book',         inactive: 'book-outline',    route: '/ledger'     },
  { id: 'crew',    label: 'Crew',    active: 'people',       inactive: 'people-outline',  route: '/crew'       },
]

interface AppTabBarProps {
  activeTab?: AppTab
}

export function AppTabBar({ activeTab }: AppTabBarProps) {
  return (
    <View style={s.bar}>
      {TABS.map(tab => {
        const isActive = tab.id === activeTab
        const iconName = isActive ? tab.active : tab.inactive
        return (
          <TouchableOpacity
            key={tab.id}
            style={s.item}
            activeOpacity={0.7}
            onPress={() => {
              if (!isActive) router.push(tab.route as any)
            }}
          >
            {isActive && <View style={s.activePill} />}
            <Ionicons
              name={iconName}
              size={24}
              color={isActive ? TEAL : '#B0C4DE'}
            />
            <Text style={[s.label, isActive && s.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const s = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: SURF,
    borderTopWidth: 1,
    borderTopColor: BOR,
    paddingTop: 10,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 18,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 4,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0,
    width: 24, height: 2.5,
    borderRadius: 2,
    backgroundColor: TEAL,
  },
  label:       { fontSize: 10, fontWeight: '700', color: '#B0C4DE' },
  labelActive: { color: TEAL, fontWeight: '800' },
})
