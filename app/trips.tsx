/**
 * app/trips.tsx — Trips Screen
 *
 * Accessible from the bottom tab bar (Trips tab).
 * Shows all fishing trips grouped by status: Active, Completed, Upcoming.
 *
 * Per trip card shows:
 *   - Boat name, trip number, dates
 *   - Status badge (At Sea / Completed / Scheduled)
 *   - Total catch (kg), crew count, expenses
 *   - Quick actions: View Tali, View Expenses
 *
 * TODO: Replace MOCK_TRIPS with GET /api/v1/trips
 */

import { router } from 'expo-router'
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
import { theme } from '../constants/theme'

// ── Types ──────────────────────────────────────────────────────────────────────
type TripStatus = 'at_sea' | 'completed' | 'scheduled'

interface Trip {
  id: string
  tripNumber: string
  boatName: string
  boatReg: string
  status: TripStatus
  departureDate: string
  returnDate?: string
  daysAtSea: number
  totalCatchKg: number
  totalExpenses: number
  crewCount: number
  captain: string
  fishBreakdown: { name: string; kg: number }[]
}

// ── Mock data — replace with API ───────────────────────────────────────────────
const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    tripNumber: 'Trip #14',
    boatName: 'Bravo',
    boatReg: 'GJ-01',
    status: 'at_sea',
    departureDate: '10 Mar 2026',
    returnDate: undefined,
    daysAtSea: 3,
    totalCatchKg: 0,
    totalExpenses: 45000,
    crewCount: 8,
    captain: 'Suraj Tandel',
    fishBreakdown: [],
  },
  {
    id: '2',
    tripNumber: 'Trip #13',
    boatName: 'Bravo',
    boatReg: 'GJ-01',
    status: 'completed',
    departureDate: '22 Feb 2026',
    returnDate: '05 Mar 2026',
    daysAtSea: 11,
    totalCatchKg: 3840,
    totalExpenses: 1,
    crewCount: 8,
    captain: 'Suraj Tandel',
    fishBreakdown: [
      { name: 'Pomfret', kg: 1200 },
      { name: 'Shrimp',  kg: 980  },
      { name: 'Surmai',  kg: 760  },
      { name: 'Other',   kg: 900  },
    ],
  },
  {
    id: '3',
    tripNumber: 'Trip #12',
    boatName: 'Alpha',
    boatReg: 'GJ-02',
    status: 'completed',
    departureDate: '05 Feb 2026',
    returnDate: '18 Feb 2026',
    daysAtSea: 13,
    totalCatchKg: 4200,
    totalExpenses: 1,
    crewCount: 7,
    captain: 'Raju Makwana',
    fishBreakdown: [
      { name: 'Pomfret', kg: 1800 },
      { name: 'Shrimp',  kg: 1400 },
      { name: 'Other',   kg: 1000 },
    ],
  },
  {
    id: '4',
    tripNumber: 'Trip #15',
    boatName: 'Alpha',
    boatReg: 'GJ-02',
    status: 'scheduled',
    departureDate: '20 Mar 2026',
    returnDate: undefined,
    daysAtSea: 0,
    totalCatchKg: 0,
    totalExpenses: 0,
    crewCount: 7,
    captain: 'Raju Makwana',
    fishBreakdown: [],
  },
  {
    id: '5',
    tripNumber: 'Trip #11',
    boatName: 'Charlie',
    boatReg: 'GJ-03',
    status: 'completed',
    departureDate: '10 Jan 2026',
    returnDate: '24 Jan 2026',
    daysAtSea: 14,
    totalCatchKg: 5100,
    totalExpenses: 1,
    crewCount: 9,
    captain: 'Bharat Gohil',
    fishBreakdown: [
      { name: 'Pomfret', kg: 2000 },
      { name: 'Surmai',  kg: 1500 },
      { name: 'Shrimp',  kg: 1000 },
      { name: 'Other',   kg: 600  },
    ],
  },
]

const STATUS_CONFIG: Record<TripStatus, { label: string; color: string; bg: string; emoji: string }> = {
  at_sea:    { label: 'At Sea',    color: '#22d3ee', bg: 'rgba(34,211,238,0.12)',  emoji: '🌊' },
  completed: { label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   emoji: '✅' },
  scheduled: { label: 'Scheduled', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  emoji: '📅' },
}

const fmt    = (n: number) => `₹ ${n.toLocaleString('en-IN')}`
const fmtKg  = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}t` : `${n} kg`

// ── Summary stats ──────────────────────────────────────────────────────────────
function SummaryBar({ trips }: { trips: Trip[] }) {
  const completed    = trips.filter(t => t.status === 'completed')
  const totalCatch   = completed.reduce((s, t) => s + t.totalCatchKg, 0)
  const atSea        = trips.filter(t => t.status === 'at_sea').length
  const scheduled    = trips.filter(t => t.status === 'scheduled').length

  return (
    <View style={s.summaryBar}>
      <View style={s.summaryItem}>
        <Text style={s.summaryValue}>{trips.length}</Text>
        <Text style={s.summaryLabel}>Total Trips</Text>
      </View>
      <View style={s.summaryDivider} />
      <View style={s.summaryItem}>
        <Text style={[s.summaryValue, { color: '#22d3ee' }]}>{atSea}</Text>
        <Text style={s.summaryLabel}>At Sea</Text>
      </View>
      <View style={s.summaryDivider} />
      <View style={s.summaryItem}>
        <Text style={[s.summaryValue, { color: '#22c55e' }]}>{fmtKg(totalCatch)}</Text>
        <Text style={s.summaryLabel}>Season Catch</Text>
      </View>
      <View style={s.summaryDivider} />
      <View style={s.summaryItem}>
        <Text style={[s.summaryValue, { color: '#f59e0b' }]}>{scheduled}</Text>
        <Text style={s.summaryLabel}>Scheduled</Text>
      </View>
    </View>
  )
}

// ── Trip card ──────────────────────────────────────────────────────────────────
function TripCard({ trip }: { trip: Trip }) {
  const cfg = STATUS_CONFIG[trip.status]
  const [expanded, setExpanded] = useState(false)

  return (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.85}
      onPress={() => setExpanded(e => !e)}
    >
      {/* Top row */}
      <View style={s.cardTop}>
        <View style={s.cardLeft}>
          <Text style={s.tripNumber}>{trip.tripNumber}</Text>
          <View style={s.boatRow}>
            <Text style={s.boatEmoji}>🚢</Text>
            <Text style={s.boatName}>{trip.boatName}</Text>
            <Text style={s.boatReg}>{trip.boatReg}</Text>
          </View>
        </View>
        <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={s.statusEmoji}>{cfg.emoji}</Text>
          <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Date row */}
      <View style={s.dateRow}>
        <Text style={s.dateLabel}>📅 Departed:</Text>
        <Text style={s.dateVal}>{trip.departureDate}</Text>
        {trip.returnDate && <>
          <Text style={s.dateSep}>→</Text>
          <Text style={s.dateVal}>{trip.returnDate}</Text>
        </>}
        {trip.status === 'at_sea' && (
          <View style={s.livePill}>
            <Text style={s.liveText}>🔴 {trip.daysAtSea}d</Text>
          </View>
        )}
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statVal}>{trip.status === 'at_sea' ? '—' : fmtKg(trip.totalCatchKg)}</Text>
          <Text style={s.statLabel}>Catch</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statVal}>{trip.crewCount}</Text>
          <Text style={s.statLabel}>Crew</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statVal}>{trip.captain.split(' ')[0]}</Text>
          <Text style={s.statLabel}>Captain</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statVal}>{trip.daysAtSea > 0 ? `${trip.daysAtSea}d` : '—'}</Text>
          <Text style={s.statLabel}>Duration</Text>
        </View>
      </View>

      {/* Expanded fish breakdown */}
      {expanded && trip.fishBreakdown.length > 0 && (
        <View style={s.breakdown}>
          <Text style={s.breakdownTitle}>Catch Breakdown</Text>
          {trip.fishBreakdown.map(f => (
            <View key={f.name} style={s.breakdownRow}>
              <Text style={s.breakdownFish}>{f.name}</Text>
              <View style={s.breakdownBar}>
                <View style={[
                  s.breakdownFill,
                  { width: `${(f.kg / trip.totalCatchKg) * 100}%` as any }
                ]} />
              </View>
              <Text style={s.breakdownKg}>{fmtKg(f.kg)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action buttons */}
      <View style={s.cardActions}>
        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => router.push({ pathname: '/tali', params: { boatName: trip.boatName } })}
        >
          <Text style={s.actionBtnText}>⚖️ Tali</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn}>
          <Text style={s.actionBtnText}>💸 Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn}>
          <Text style={s.actionBtnText}>👥 Crew</Text>
        </TouchableOpacity>
        {trip.fishBreakdown.length > 0 && (
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => setExpanded(e => !e)}
          >
            <Text style={s.actionBtnText}>{expanded ? '▲ Less' : '▼ Catch'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  )
}

// ── Filter tabs ────────────────────────────────────────────────────────────────
type FilterType = 'all' | TripStatus

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all',       label: 'All' },
  { id: 'at_sea',    label: '🌊 At Sea' },
  { id: 'completed', label: '✅ Done' },
  { id: 'scheduled', label: '📅 Scheduled' },
]

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function TripsScreen() {
  const [filter, setFilter]   = useState<FilterType>('all')
  const [search, setSearch]   = useState('')

  const filtered = MOCK_TRIPS.filter(t => {
    const matchFilter = filter === 'all' || t.status === filter
    const matchSearch = search.trim() === '' ||
      t.boatName.toLowerCase().includes(search.toLowerCase()) ||
      t.tripNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.captain.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  // Sort: at_sea first, then scheduled, then completed (newest first by id desc)
  const sorted = [...filtered].sort((a, b) => {
    const order: Record<TripStatus, number> = { at_sea: 0, scheduled: 1, completed: 2 }
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
    return Number(b.id) - Number(a.id)
  })

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
          <Text style={s.headerTitle}>Trips</Text>
          <Text style={s.headerSub}>{MOCK_TRIPS.length} total trips</Text>
        </View>
        <TouchableOpacity style={s.newBtn}>
          <Text style={s.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <SummaryBar trips={MOCK_TRIPS} />

      {/* Search */}
      <View style={s.searchRow}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search by boat, trip or captain..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={s.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[s.filterChip, filter === f.id && s.filterChipActive]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={[s.filterText, filter === f.id && s.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Trip list */}
      <ScrollView
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      >
        {sorted.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyEmoji}>⛵</Text>
            <Text style={s.emptyTitle}>No trips found</Text>
            <Text style={s.emptySub}>Try a different filter or search</Text>
          </View>
        ) : (
          sorted.map(trip => <TripCard key={trip.id} trip={trip} />)
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

    </SafeAreaView>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const BG   = theme.colors.background
const SURF = theme.colors.surface
const ELEV = theme.colors.elevated
const BOR  = theme.colors.border
const TP   = theme.colors.textPrimary
const TS   = theme.colors.textSecondary
const TM   = theme.colors.textMuted
const TEAL = theme.colors.primary

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: TEAL, paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  newBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  newBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Summary bar
  summaryBar: { flexDirection: 'row', backgroundColor: SURF, marginHorizontal: 12, marginTop: 12, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: BOR },
  summaryItem: { flex: 1, alignItems: 'center', gap: 3 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: TP },
  summaryLabel: { fontSize: 10, color: TS, fontWeight: '600' },
  summaryDivider: { width: 1, backgroundColor: BOR, marginVertical: 4 },

  // Search
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginTop: 12, backgroundColor: SURF, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: BOR },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 11, color: TP, fontSize: 14 },
  clearBtn: { color: TS, fontSize: 16, paddingLeft: 8 },

  // Filter chips
  filterRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: SURF, borderWidth: 1.5, borderColor: BOR },
  filterChipActive: { backgroundColor: TEAL + '20', borderColor: TEAL },
  filterText: { fontSize: 13, color: TS, fontWeight: '600' },
  filterTextActive: { color: TEAL, fontWeight: '700' },

  // List
  list: { paddingHorizontal: 12, gap: 10 },

  // Card
  card: { backgroundColor: SURF, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: BOR },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardLeft: { flex: 1 },
  tripNumber: { fontSize: 16, fontWeight: '800', color: TP, marginBottom: 4 },
  boatRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  boatEmoji: { fontSize: 13 },
  boatName: { fontSize: 13, fontWeight: '700', color: TEAL },
  boatReg: { fontSize: 11, color: TS },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
  statusEmoji: { fontSize: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },

  // Dates
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  dateLabel: { fontSize: 12, color: TS },
  dateVal: { fontSize: 12, color: TP, fontWeight: '600' },
  dateSep: { fontSize: 12, color: TM },
  livePill: { backgroundColor: 'rgba(239,68,68,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  liveText: { fontSize: 11, color: '#ef4444', fontWeight: '700' },

  // Stats
  statsRow: { flexDirection: 'row', backgroundColor: ELEV, borderRadius: 10, paddingVertical: 10, marginBottom: 10 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statVal: { fontSize: 13, fontWeight: '700', color: TP },
  statLabel: { fontSize: 10, color: TS },
  statDivider: { width: 1, backgroundColor: BOR, marginVertical: 4 },

  // Breakdown
  breakdown: { backgroundColor: ELEV, borderRadius: 10, padding: 12, marginBottom: 10, gap: 8 },
  breakdownTitle: { fontSize: 11, fontWeight: '700', color: TEAL, letterSpacing: 0.5, marginBottom: 2 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  breakdownFish: { width: 72, fontSize: 12, color: TS },
  breakdownBar: { flex: 1, height: 6, backgroundColor: BOR, borderRadius: 3, overflow: 'hidden' },
  breakdownFill: { height: '100%', backgroundColor: TEAL, borderRadius: 3 },
  breakdownKg: { width: 52, fontSize: 12, fontWeight: '700', color: TP, textAlign: 'right' },

  // Action buttons
  cardActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: ELEV, borderRadius: 20, borderWidth: 1, borderColor: BOR },
  actionBtnText: { fontSize: 12, color: TS, fontWeight: '600' },

  // Empty
  emptyBox: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: TP },
  emptySub: { fontSize: 14, color: TS },
})