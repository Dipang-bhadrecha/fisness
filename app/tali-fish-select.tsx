/**
 * app/tali-fish-select.tsx
 *
 * Pre-session fish selection screen.
 * User selects which fish they will weigh today before starting tali.
 *
 * Tabs:
 *   Selected | All | Prawns | Titan | Kolami | Goti | Fish | Other
 *
 * Flow: Home → boat select → THIS SCREEN → /tali (with selectedFish param)
 */

import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FISH_CATEGORIES, FISH_GROUPS } from '../constants/fishTypes'
import { theme } from '../constants/theme'

type GroupId = 'selected' | 'all' | string

export default function TaliFishSelectScreen() {
  const { boatId, boatName, companyId, companyName } = useLocalSearchParams<{
    boatId?: string
    boatName?: string
    companyId?: string
    companyName?: string
  }>()

  // selected: fishId → bucketWeight
  const [selected, setSelected]   = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState<GroupId>('all')
  const [search, setSearch]       = useState('')
  const [customName, setCustomName] = useState('')

  const selectedIds   = Object.keys(selected)
  const selectedCount = selectedIds.length

  // ── Derived fish list ──────────────────────────────────────────────────────
  const displayFish = (() => {
    if (activeTab === 'selected') {
      return selectedIds.map(id => {
        const preset = FISH_CATEGORIES.find(f => f.id === id)
        return preset ?? {
          id,
          name: id.replace('custom_', '').replace(/_/g, ' '),
          nameGujarati: id.replace('custom_', '').replace(/_/g, ' '),
          bucketWeight: selected[id],
        }
      })
    }

    return FISH_CATEGORIES.filter(f => {
      const matchGroup =
        activeTab === 'all' ||
        (FISH_GROUPS.find(g => g.id === activeTab)?.ids.includes(f.id) ?? false)
      const q = search.toLowerCase()
      const matchSearch =
        q === '' ||
        f.name.toLowerCase().includes(q) ||
        f.nameGujarati.includes(search)
      return matchGroup && matchSearch
    })
  })()

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleFish = (id: string, defaultBw: number) => {
    setSelected(prev => {
      const next = { ...prev }
      if (next[id] !== undefined) delete next[id]
      else next[id] = defaultBw
      return next
    })
  }

  const addCustom = () => {
    const name = customName.trim()
    if (!name) return
    const id = `custom_${name.toLowerCase().replace(/\s+/g, '_')}`
    setSelected(prev => ({ ...prev, [id]: 25 }))
    setCustomName('')
    setActiveTab('selected')
  }

  const handleStart = () => {
    if (selectedCount === 0) return
    const fishList = selectedIds.map(id => {
      const preset = FISH_CATEGORIES.find(f => f.id === id)
      return {
        id,
        name:          preset?.name          ?? id.replace('custom_', '').replace(/_/g, ' '),
        nameGujarati:  preset?.nameGujarati  ?? id.replace('custom_', '').replace(/_/g, ' '),
        bucketWeight:  selected[id],
      }
    })
    router.push({
      pathname: '/tali',
      params: {
        boatId:       boatId       ?? '',
        boatName:     boatName     ?? '',
        companyId:    companyId    ?? '',
        companyName:  companyName  ?? '',
        selectedFish: JSON.stringify(fishList),
      },
    } as any)
  }

  // ── Tabs config ────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'selected', label: `Selected${selectedCount > 0 ? ` (${selectedCount})` : ''}`, emoji: '✅' },
    { id: 'all',      label: 'All',    emoji: '' },
    ...FISH_GROUPS.map(g => ({ id: g.id, label: g.label, emoji: g.emoji })),
  ]

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.canGoBack() ? router.back() : null}
        >
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Select Fish</Text>
          <Text style={s.headerSub}>⛵ {boatName ?? 'Boat'}</Text>
        </View>
        {selectedCount > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{selectedCount}</Text>
          </View>
        )}
      </View>

      {/* Search — only show when not on Selected tab */}
      {activeTab !== 'selected' && (
        <View style={s.searchRow}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search fish..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={v => { setSearch(v); if (v) setActiveTab('all') }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={s.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabRow}
      >
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[s.tab, activeTab === tab.id && s.tabActive]}
            onPress={() => { setActiveTab(tab.id); setSearch('') }}
          >
            {tab.emoji ? <Text style={s.tabEmoji}>{tab.emoji}</Text> : null}
            <Text style={[s.tabText, activeTab === tab.id && s.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fish grid */}
      <ScrollView
        contentContainerStyle={s.grid}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Empty state for Selected tab */}
        {activeTab === 'selected' && selectedCount === 0 && (
          <View style={s.emptyBox}>
            <Text style={s.emptyEmoji}>🎣</Text>
            <Text style={s.emptyTitle}>No fish selected yet</Text>
            <Text style={s.emptySub}>Go to All or a category tab to select fish</Text>
          </View>
        )}

        {/* Fish cards */}
        {displayFish.map(fish => {
          const isSelected = selected[fish.id] !== undefined
          return (
            <TouchableOpacity
              key={fish.id}
              style={[s.fishCard, isSelected && s.fishCardSelected]}
              onPress={() => toggleFish(fish.id, fish.bucketWeight)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <View style={s.checkDot}>
                  <Text style={s.checkText}>✓</Text>
                </View>
              )}
              <Text style={[s.fishName, isSelected && s.fishNameSelected]} numberOfLines={2}>
                {fish.name}
              </Text>
              <Text style={s.fishGuj} numberOfLines={1}>{fish.nameGujarati}</Text>
            </TouchableOpacity>
          )
        })}

        {/* No results */}
        {activeTab !== 'selected' && displayFish.length === 0 && (
          <View style={s.emptyBox}>
            <Text style={s.emptyTitle}>No fish found for "{search}"</Text>
          </View>
        )}

        {/* Custom fish row */}
        <View style={s.customRow}>
          <TextInput
            style={s.customInput}
            placeholder="Add custom fish name..."
            placeholderTextColor={theme.colors.textMuted}
            value={customName}
            onChangeText={setCustomName}
            returnKeyType="done"
            onSubmitEditing={addCustom}
          />
          <TouchableOpacity
            style={[s.customBtn, !customName.trim() && s.customBtnOff]}
            onPress={addCustom}
            disabled={!customName.trim()}
          >
            <Text style={s.customBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom Start button */}
      <View style={s.bottomBar}>
        {selectedCount === 0 ? (
          <View style={s.startDisabled}>
            <Text style={s.startDisabledText}>Select at least 1 fish to continue</Text>
          </View>
        ) : (
          <TouchableOpacity style={s.startBtn} onPress={handleStart} activeOpacity={0.85}>
            <Text style={s.startBtnText}>⚖️  Start Tali  ·  {selectedCount} fish</Text>
          </TouchableOpacity>
        )}
      </View>

    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const BG   = theme.colors.background
const SURF = theme.colors.surface
const ELEV = theme.colors.elevated
const BOR  = theme.colors.border
const TP   = theme.colors.textPrimary
const TS   = theme.colors.textSecondary
const TEAL = theme.colors.primary

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: TEAL,
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  backText:     { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  badge: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: TEAL, fontWeight: '800', fontSize: 14 },

  // Search
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    margin: 12, backgroundColor: SURF, borderRadius: 12,
    paddingHorizontal: 12, borderWidth: 1, borderColor: BOR,
  },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 11, color: TP, fontSize: 14 },
  clearText:   { color: TS, fontSize: 16, paddingLeft: 8 },

  // Tabs
  tabRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: SURF,
    borderWidth: 1.5, borderColor: BOR,
  },
  tabActive:     { backgroundColor: TEAL + '20', borderColor: TEAL },
  tabEmoji:      { fontSize: 13 },
  tabText:       { fontSize: 13, color: TS, fontWeight: '600' },
  tabTextActive: { color: TEAL, fontWeight: '700' },

  // Fish grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
    paddingTop: 4,
  },

  // Fish card
  fishCard: {
    width: '30%',
    backgroundColor: SURF,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: BOR,
    minHeight: 64,
    justifyContent: 'center',
  },
  fishCardSelected: { borderColor: TEAL, backgroundColor: TEAL + '12' },
  checkDot: {
    position: 'absolute', top: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center',
  },
  checkText:        { color: '#fff', fontSize: 10, fontWeight: '800' },
  fishName:         { fontSize: 13, fontWeight: '700', color: TP, textAlign: 'center' },
  fishNameSelected: { color: TEAL },
  fishGuj:          { fontSize: 11, color: TS, textAlign: 'center' },

  // Empty
  emptyBox: {
    width: '100%', alignItems: 'center',
    paddingVertical: 48, gap: 8,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: TP, textAlign: 'center' },
  emptySub:   { fontSize: 13, color: TS, textAlign: 'center', maxWidth: 240 },

  // Custom fish
  customRow: {
    width: '100%', flexDirection: 'row',
    gap: 10, marginTop: 8,
  },
  customInput: {
    flex: 1, backgroundColor: SURF, borderRadius: 12,
    borderWidth: 1, borderColor: BOR,
    paddingHorizontal: 14, paddingVertical: 11,
    color: TP, fontSize: 14,
  },
  customBtn: {
    backgroundColor: TEAL, borderRadius: 12,
    paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center',
  },
  customBtnOff:  { backgroundColor: ELEV },
  customBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Bottom bar
  bottomBar: {
    padding: 16, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: BOR, backgroundColor: BG,
  },
  startBtn: {
    backgroundColor: TEAL, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  startDisabled: {
    backgroundColor: SURF, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: BOR,
  },
  startDisabledText: { color: TS, fontSize: 14, fontWeight: '600' },
})