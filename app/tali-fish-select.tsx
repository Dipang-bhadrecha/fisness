/**
 * app/tali-fish-select.tsx
 *
 * Pre-session screen — two steps in one:
 *   1. Select Boat  (shown only when boatId is NOT passed via params)
 *   2. Select Fish  (always shown after boat is chosen)
 *
 * Flow:
 *   Quick Action "Add Tali" → this screen (no params) → pick boat → pick fish → /tali
 *   Boat card "Tali" button → this screen (boatId passed) → pick fish → /tali
 */

import { Ionicons } from '@expo/vector-icons'
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

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG   = theme.colors.background
const SURF = theme.colors.surface
const ELEV = theme.colors.elevated
const BOR  = theme.colors.border
const TP   = theme.colors.textPrimary
const TS   = theme.colors.textSecondary
const TEAL = theme.colors.primary
const TM   = '#3D5A73'

// ─── Mock boats (replace with store/API) ──────────────────────────────────────
const MOCK_BOATS = [
  { id: '1', name: 'Jai Mataji', gujaratiName: 'જય માતાજી', registration: 'GJ-VR-1042', status: 'active' as const },
  { id: '2', name: 'Sea Star',   gujaratiName: 'સી સ્ટાર',  registration: 'GJ-VR-2201', status: 'docked' as const },
  { id: '3', name: 'Deep Blue',  gujaratiName: 'ડીપ બ્લ્યુ', registration: 'GJ-VR-3345', status: 'docked' as const },
]

const STATUS_COLOR = {
  active: '#10b981',
  docked: '#60a5fa',
  repair: '#f59e0b',
} as const

type GroupId = 'selected' | 'all' | string

export default function TaliFishSelectScreen() {
  const params = useLocalSearchParams<{
    boatId?: string
    boatName?: string
    companyId?: string
    companyName?: string
  }>()

  // ── Step 1: boat selection (skip if boatId already passed) ─────────────────
  const [selectedBoatId,   setSelectedBoatId]   = useState(params.boatId   ?? '')
  const [selectedBoatName, setSelectedBoatName] = useState(params.boatName ?? '')

  // ── Step 2: fish selection ──────────────────────────────────────────────────
  const [selected,    setSelected]    = useState<Record<string, number>>({})
  const [activeTab,   setActiveTab]   = useState<GroupId>('all')
  const [search,      setSearch]      = useState('')
  const [customName,  setCustomName]  = useState('')

  const selectedIds   = Object.keys(selected)
  const selectedCount = selectedIds.length
  const boatChosen    = selectedBoatId.length > 0

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
    if (selectedCount === 0 || !boatChosen) return
    const fishList = selectedIds.map(id => {
      const preset = FISH_CATEGORIES.find(f => f.id === id)
      return {
        id,
        name:         preset?.name         ?? id.replace('custom_', '').replace(/_/g, ' '),
        nameGujarati: preset?.nameGujarati ?? id.replace('custom_', '').replace(/_/g, ' '),
        bucketWeight: selected[id],
      }
    })
    router.push({
      pathname: '/tali',
      params: {
        boatId:      selectedBoatId,
        boatName:    selectedBoatName,
        companyId:   params.companyId   ?? '',
        companyName: params.companyName ?? '',
        selectedFish: JSON.stringify(fishList),
      },
    } as any)
  }

  const TABS = [
    { id: 'selected', label: `Selected${selectedCount > 0 ? ` (${selectedCount})` : ''}`, emoji: '✅' },
    { id: 'all',      label: 'All',    emoji: '' },
    ...FISH_GROUPS.map(g => ({ id: g.id, label: g.label, emoji: g.emoji })),
  ]

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.canGoBack() ? router.back() : null}
        >
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>New Tali</Text>
          <Text style={s.headerSub}>
            {boatChosen ? `⛵ ${selectedBoatName}` : 'Select boat & fish'}
          </Text>
        </View>
        {selectedCount > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{selectedCount}</Text>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
      >

        {/* ── STEP 1: Boat Selector (only when no boatId passed) ── */}
        {!params.boatId && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.stepDot, boatChosen && s.stepDotDone]}>
                <Text style={s.stepDotText}>{boatChosen ? '✓' : '1'}</Text>
              </View>
              <Text style={s.sectionTitle}>Select Boat</Text>
            </View>

            <View style={s.boatList}>
              {MOCK_BOATS.map(boat => {
                const isActive = selectedBoatId === boat.id
                const color    = STATUS_COLOR[boat.status]
                return (
                  <TouchableOpacity
                    key={boat.id}
                    style={[s.boatCard, isActive && s.boatCardActive]}
                    onPress={() => { setSelectedBoatId(boat.id); setSelectedBoatName(boat.name) }}
                    activeOpacity={0.75}
                  >
                    {/* Left accent bar */}
                    <View style={[s.boatAccent, { backgroundColor: color }]} />

                    <View style={s.boatIcon}>
                      <Text style={{ fontSize: 22 }}>⛵</Text>
                    </View>

                    <View style={s.boatInfo}>
                      <Text style={[s.boatName, isActive && { color: TEAL }]}>{boat.name}</Text>
                      <Text style={s.boatGuj}>{boat.gujaratiName}</Text>
                      <Text style={s.boatReg}>{boat.registration}</Text>
                    </View>

                    <View style={[s.statusDot, { backgroundColor: color + '25' }]}>
                      <View style={[s.statusDotInner, { backgroundColor: color }]} />
                      <Text style={[s.statusText, { color }]}>
                        {boat.status === 'active' ? 'At Sea' : boat.status === 'docked' ? 'Docked' : 'Repair'}
                      </Text>
                    </View>

                    {isActive && (
                      <View style={s.boatCheck}>
                        <Ionicons name="checkmark-circle" size={22} color={TEAL} />
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        {/* ── STEP 2: Fish Selector ── */}
        <View style={[s.section, !boatChosen && s.sectionDimmed]}>
          <View style={s.sectionHeader}>
            <View style={[s.stepDot, selectedCount > 0 && s.stepDotDone]}>
              <Text style={s.stepDotText}>{!params.boatId ? '2' : selectedCount > 0 ? '✓' : '1'}</Text>
            </View>
            <Text style={s.sectionTitle}>Select Fish</Text>
            {selectedCount > 0 && (
              <Text style={s.sectionCount}>{selectedCount} selected</Text>
            )}
          </View>

          {/* Search */}
          <View style={s.searchRow}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Search fish..."
              placeholderTextColor={TS}
              value={search}
              onChangeText={setSearch}
              editable={boatChosen}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={s.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tabRow}
          >
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[s.tab, activeTab === tab.id && s.tabActive]}
                onPress={() => boatChosen && setActiveTab(tab.id)}
                activeOpacity={0.75}
              >
                {tab.emoji ? <Text style={s.tabEmoji}>{tab.emoji}</Text> : null}
                <Text style={[s.tabText, activeTab === tab.id && s.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Fish grid */}
          <View style={s.grid}>
            {/* Empty — selected tab */}
            {activeTab === 'selected' && selectedCount === 0 && (
              <View style={s.emptyBox}>
                <Text style={s.emptyEmoji}>🎣</Text>
                <Text style={s.emptyTitle}>No fish selected yet</Text>
                <Text style={s.emptySub}>Go to All or a category tab to select fish</Text>
              </View>
            )}

            {/* Fish cards */}
            {boatChosen && displayFish.map(fish => {
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

            {/* No boat selected placeholder */}
            {!boatChosen && (
              <View style={s.emptyBox}>
                <Text style={s.emptyEmoji}>⛵</Text>
                <Text style={s.emptyTitle}>Select a boat first</Text>
                <Text style={s.emptySub}>Choose your boat above to start selecting fish</Text>
              </View>
            )}

            {/* No search results */}
            {boatChosen && activeTab !== 'selected' && displayFish.length === 0 && (
              <View style={s.emptyBox}>
                <Text style={s.emptyTitle}>No fish found for "{search}"</Text>
              </View>
            )}

            {/* Custom fish */}
            {boatChosen && (
              <View style={s.customRow}>
                <TextInput
                  style={s.customInput}
                  placeholder="Add custom fish name..."
                  placeholderTextColor={TS}
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
            )}
          </View>
        </View>

      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={s.bottomBar}>
        {!boatChosen ? (
          <View style={s.startDisabled}>
            <Text style={s.startDisabledText}>Select a boat to continue</Text>
          </View>
        ) : selectedCount === 0 ? (
          <View style={s.startDisabled}>
            <Text style={s.startDisabledText}>Select at least 1 fish to continue</Text>
          </View>
        ) : (
          <TouchableOpacity style={s.startBtn} onPress={handleStart} activeOpacity={0.85}>
            <Text style={s.startBtnText}>⚖️  Start Tali · {selectedCount} fish selected</Text>
          </TouchableOpacity>
        )}
      </View>

    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  badge: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: TEAL, fontWeight: '800', fontSize: 14 },

  // Section
  section:       { paddingHorizontal: 14, paddingTop: 16 },
  sectionDimmed: { opacity: 0.45 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle:  { fontSize: 15, fontWeight: '800', color: TP, flex: 1 },
  sectionCount:  { fontSize: 12, color: TEAL, fontWeight: '700' },

  // Step dot
  stepDot: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: ELEV, borderWidth: 1.5, borderColor: BOR,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotDone:  { backgroundColor: TEAL, borderColor: TEAL },
  stepDotText:  { fontSize: 11, fontWeight: '800', color: TP },

  // Boat list
  boatList: { gap: 10 },
  boatCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SURF, borderRadius: 14,
    borderWidth: 1.5, borderColor: BOR,
    overflow: 'hidden', gap: 10,
  },
  boatCardActive: { borderColor: TEAL, backgroundColor: TEAL + '10' },
  boatAccent:     { width: 4, alignSelf: 'stretch' },
  boatIcon:       { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  boatInfo:       { flex: 1, paddingVertical: 12, gap: 2 },
  boatName:       { fontSize: 15, fontWeight: '800', color: TP },
  boatGuj:        { fontSize: 13, color: TP, opacity: 0.75 },
  boatReg:        { fontSize: 11, color: TEAL, fontWeight: '700', fontFamily: 'monospace' },
  statusDot:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginRight: 6 },
  statusDotInner: { width: 6, height: 6, borderRadius: 3 },
  statusText:     { fontSize: 10, fontWeight: '700' },
  boatCheck:      { paddingRight: 12 },

  // Search
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SURF, borderRadius: 12,
    paddingHorizontal: 12, borderWidth: 1, borderColor: BOR,
    marginBottom: 10,
  },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 11, color: TP, fontSize: 14 },
  clearText:   { color: TS, fontSize: 16, paddingLeft: 8 },

  // Tabs
  tabRow: { paddingVertical: 4, gap: 8, flexDirection: 'row', marginBottom: 10 },
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  fishCard: {
    width: '30%', backgroundColor: SURF, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 8,
    alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderColor: BOR,
    minHeight: 64, justifyContent: 'center',
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
  emptyBox:  { width: '100%', alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyEmoji:{ fontSize: 40 },
  emptyTitle:{ fontSize: 15, fontWeight: '700', color: TP, textAlign: 'center' },
  emptySub:  { fontSize: 13, color: TS, textAlign: 'center', maxWidth: 240 },

  // Custom fish
  customRow: { width: '100%', flexDirection: 'row', gap: 10, marginTop: 8 },
  customInput: {
    flex: 1, backgroundColor: SURF, borderRadius: 12,
    borderWidth: 1, borderColor: BOR,
    paddingHorizontal: 14, paddingVertical: 11,
    color: TP, fontSize: 14,
  },
  customBtn:     { backgroundColor: TEAL, borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  customBtnOff:  { backgroundColor: ELEV },
  customBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: BOR, backgroundColor: BG,
  },
  startBtn:          { backgroundColor: TEAL, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  startBtnText:      { color: '#fff', fontSize: 16, fontWeight: '800' },
  startDisabled:     { backgroundColor: SURF, borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: BOR },
  startDisabledText: { color: TS, fontSize: 14, fontWeight: '600' },
})