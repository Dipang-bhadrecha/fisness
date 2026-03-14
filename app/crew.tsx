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
import { darkTheme, lightTheme } from '../constants/theme'
import { useThemeStore } from '../store/themeStore'

// ─────────────────────────────────────────────────────────────────────────────
const TEMP_BOATS = [
  { id: '1', name: 'Bravo',   registration: 'GJ-01' },
  { id: '2', name: 'Alpha',   registration: 'GJ-02' },
  { id: '3', name: 'Charlie', registration: 'GJ-03' },
  { id: '4', name: 'Delta',   registration: 'GJ-04' },
  { id: '5', name: 'Echo',    registration: 'GJ-05' },
]

const TEMP_CREW = [
  { id: '1', name: 'Suraj Tandel',   role: 'Pilot / Captain', date: '03 Jul 2026', amount: 30000 },
  { id: '2', name: 'Raju Makwana',   role: 'Sailor',          date: '03 Jul 2026', amount: 25000 },
  { id: '3', name: 'Bharat Gohil',   role: 'Sailor',          date: '03 Jul 2026', amount: 20000 },
  { id: '4', name: 'Kanji Patel',    role: 'Helper',          date: '03 Jul 2026', amount: 15000 },
  { id: '5', name: 'Mahesh Solanki', role: 'Engineer',        date: '03 Jul 2026', amount: 18000 },
  { id: '6', name: 'Dinesh Parmar',  role: 'Cook',            date: '03 Jul 2026', amount: 12000 },
  { id: '7', name: 'Pravin Baria',   role: 'Deck Hand',       date: '03 Jul 2026', amount: 10000 },
]

const MAX_CREW  = 7
const OCEAN     = '#0077B6'
const OCEAN_DK  = '#005F92'
const fmt = (n: number) => `₹ ${n.toLocaleString('en-IN')}`

// ─────────────────────────────────────────────────────────────────────────────
export default function CrewScreen() {
  const { boatId, boatName } = useLocalSearchParams<{
    boatId: string; boatName: string; companyId: string
  }>()

  const [selectedBoat, setSelectedBoat] = useState(boatName || 'Bravo')
  const [searchOpen, setSearchOpen]     = useState(false)
  const [searchText, setSearchText]     = useState('')

  const { mode } = useThemeStore()
  const theme = mode === 'dark' ? darkTheme : lightTheme
  const s = React.useMemo(() => makeStyles(theme), [theme])

  const q = searchText.toLowerCase().trim()
  const boats = q
    ? TEMP_BOATS.filter(b => b.name.toLowerCase().includes(q) || b.registration.toLowerCase().includes(q))
    : TEMP_BOATS
  const crew = (q
    ? TEMP_CREW.filter(m => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q))
    : TEMP_CREW
  ).slice(0, MAX_CREW)

  const total = TEMP_CREW.reduce((sum, m) => sum + m.amount, 0)

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.canGoBack() && router.back()}>
          <Text style={s.backIco}>←</Text>
        </TouchableOpacity>
        <View style={s.hCenter}>
          <Text style={s.hTitle}>Kharchi</Text>
          <Text style={s.hSub}>{selectedBoat}</Text>
        </View>
        <TouchableOpacity style={s.hIconBtn} onPress={() => { setSearchOpen(v => !v); setSearchText('') }}>
          <Text style={s.hIconTxt}>{searchOpen ? '✕' : '🔍'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.addBtn}>
          <Text style={s.addTxt}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search drop ── */}
      {searchOpen && (
        <View style={s.searchDrop}>
          <TextInput
            autoFocus
            style={s.searchInput}
            placeholder="Search boat or crew..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={s.searchX}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Everything scrolls together ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Total card */}
        <View style={s.totalCard}>
          <View>
            <Text style={s.totalLbl}>TOTAL KHARCHI</Text>
            <Text style={s.totalVal}>{fmt(total)}</Text>
          </View>
          <View style={s.totalPill}>
            <Text style={s.pillNum}>{TEMP_CREW.length}</Text>
            <Text style={s.pillSub}>crew</Text>
          </View>
        </View>

        {/* Boat chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.boatRow}
        >
          {boats.map(b => {
            const active = selectedBoat === b.name
            return (
              <TouchableOpacity
                key={b.id}
                style={[s.boatChip, active && s.boatChipOn]}
                onPress={() => setSelectedBoat(b.name)}
                activeOpacity={0.75}
              >
                <Text style={s.boatIco}>🚢</Text>
                <Text style={[s.boatNm, active && s.boatNmOn]}>{b.name}</Text>
                <Text style={[s.boatReg, active && s.boatRegOn]}>{b.registration}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Divider + count */}
        <View style={s.crewHeader}>
          <Text style={s.crewHeaderTxt}>CREW  ·  {selectedBoat}</Text>
          <Text style={s.crewHeaderCount}>{crew.length}/{MAX_CREW}</Text>
        </View>

        {/* Crew rows */}
        {crew.map((m, i) => (
          <TouchableOpacity
            key={m.id}
            style={s.crewRow}
            activeOpacity={0.72}
            onPress={() => router.push({
              pathname: '/crew-detail',
              params: { memberId: m.id, memberName: m.name, memberRole: m.role, boatId: boatId ?? '', boatName: selectedBoat },
            })}
          >
            {/* rank number */}
            <Text style={s.crewNum}>{i + 1}</Text>

            {/* avatar */}
            <View style={s.avatar}>
              <Text style={s.avatarIco}>👤</Text>
            </View>

            {/* info */}
            <View style={s.crewInfo}>
              <Text style={s.crewName}>{m.name}</Text>
              <Text style={s.crewRole}>{m.role}</Text>
            </View>

            {/* amount */}
            <View style={s.crewRight}>
              <Text style={s.crewAmt}>{fmt(m.amount)}</Text>
              <Text style={s.crewDate}>{m.date}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Empty slots */}
        {Array.from({ length: MAX_CREW - crew.length }).map((_, i) => (
          <View key={`e${i}`} style={s.emptyRow}>
            <Text style={s.emptyNum}>{crew.length + i + 1}</Text>
            <Text style={s.emptyTxt}>Empty slot</Text>
          </View>
        ))}

        <View style={{ height: 16 }} />
      </ScrollView>

    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
const makeStyles = (theme: typeof lightTheme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: OCEAN,
    paddingHorizontal: 14, paddingVertical: 11, gap: 8,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIco: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: -1 },
  hCenter: { flex: 1 },
  hTitle:  { fontSize: 17, fontWeight: '800', color: '#fff' },
  hSub:    { fontSize: 11, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  hIconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  hIconTxt: { fontSize: 15 },
  addBtn: {
    paddingHorizontal: 13, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  addTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Search drop
  searchDrop: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: OCEAN_DK,
    paddingHorizontal: 14, paddingVertical: 8, gap: 8,
  },
  searchInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7,
    color: '#fff', fontSize: 13,
  },
  searchX: { color: 'rgba(255,255,255,0.5)', fontSize: 16, paddingHorizontal: 4 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  // Total card
  totalCard: {
    backgroundColor: OCEAN,
    marginHorizontal: 12, marginTop: 12, marginBottom: 12,
    borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: OCEAN_DK,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 6,
  },
  totalLbl: { fontSize: 10, color: 'rgba(255,255,255,0.72)', fontWeight: '700', letterSpacing: 1 },
  totalVal: { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 2 },
  totalPill: {
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center',
  },
  pillNum: { fontSize: 22, fontWeight: '900', color: '#fff' },
  pillSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

  // Boat chips
  boatRow: { paddingHorizontal: 12, gap: 8, paddingBottom: 4 },
  boatChip: {
    width: 70, paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 10, alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border,
  },
  boatChipOn:  { backgroundColor: OCEAN, borderColor: OCEAN },
  boatIco:     { fontSize: 20, marginBottom: 3 },
  boatNm:      { fontSize: 11, fontWeight: '700', color: theme.colors.textPrimary },
  boatNmOn:    { color: '#fff' },
  boatReg:     { fontSize: 9, color: theme.colors.textSecondary, marginTop: 1 },
  boatRegOn:   { color: 'rgba(255,255,255,0.7)' },

  // Crew section header
  crewHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 12, marginTop: 14, marginBottom: 6,
  },
  crewHeaderTxt:   { fontSize: 11, fontWeight: '700', color: theme.colors.textSecondary, letterSpacing: 0.5 },
  crewHeaderCount: { fontSize: 11, fontWeight: '700', color: OCEAN },

  // Crew row
  crewRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 12, marginBottom: 5,
    borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 12,
    borderLeftWidth: 3, borderLeftColor: OCEAN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
    elevation: 2,
  },
  crewNum: {
    width: 20, fontSize: 11, fontWeight: '700',
    color: theme.colors.textMuted, textAlign: 'center', marginRight: 6,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  avatarIco: { fontSize: 16 },
  crewInfo:  { flex: 1 },
  crewName:  { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary },
  crewRole:  { fontSize: 11, color: theme.colors.textSecondary, marginTop: 1 },
  crewRight: { alignItems: 'flex-end' },
  crewAmt:   { fontSize: 13, fontWeight: '800', color: OCEAN },
  crewDate:  { fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 },

  // Empty row
  emptyRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 12, marginBottom: 5,
    borderRadius: 12, height: 58,
    borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.border,
    paddingHorizontal: 18, gap: 10,
  },
  emptyNum: { fontSize: 11, fontWeight: '700', color: theme.colors.border },
  emptyTxt: { fontSize: 12, color: theme.colors.textMuted, opacity: 0.6 },
})