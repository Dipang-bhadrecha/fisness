/**
 * app/trips.tsx — Trips Screen with AppTabBar footer
 */

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppTabBar } from '../components/shared/AppTabBar'

const BG   = '#080F1A'
const SURF = '#0D1B2E'
const ELEV = '#132640'
const BOR  = 'rgba(255,255,255,0.06)'
const TP   = '#F0F4F8'
const TS   = '#8BA3BC'
const TM   = '#3D5A73'
const TEAL = '#0891b2'

type TripStatus = 'at_sea' | 'completed' | 'scheduled'
type FilterType = 'all' | TripStatus

interface Trip {
  id: string
  tripNumber: string
  boatName: string
  boatReg: string
  status: TripStatus
  departureDate: string
  returnDate?: string
  daysAtSea: number
  catchKg: number
  crewCount: number
  expenses: number
  captain: string
}

const MOCK_TRIPS: Trip[] = [
  { id: '1', tripNumber: 'Trip #14', boatName: 'Jai Mataji', boatReg: 'GJ-VR-1042', status: 'at_sea',    departureDate: '10 Mar 2026', daysAtSea: 7,  catchKg: 0,    crewCount: 8, expenses: 45000,  captain: 'Ramesh Bhai' },
  { id: '2', tripNumber: 'Trip #13', boatName: 'Jai Mataji', boatReg: 'GJ-VR-1042', status: 'completed', departureDate: '22 Feb 2026', returnDate: '05 Mar 2026', daysAtSea: 11, catchKg: 3840, crewCount: 8, expenses: 118000, captain: 'Ramesh Bhai' },
  { id: '3', tripNumber: 'Trip #8',  boatName: 'Sea Star',   boatReg: 'GJ-VR-2201', status: 'completed', departureDate: '15 Feb 2026', returnDate: '25 Feb 2026', daysAtSea: 10, catchKg: 2910, crewCount: 6, expenses: 94000,  captain: 'Suresh Kaka' },
  { id: '4', tripNumber: 'Trip #15', boatName: 'Sea Star',   boatReg: 'GJ-VR-2201', status: 'scheduled', departureDate: '20 Mar 2026', daysAtSea: 0,  catchKg: 0,    crewCount: 6, expenses: 0,      captain: 'Suresh Kaka' },
]

const STATUS_CFG: Record<TripStatus, { label: string; color: string; bg: string }> = {
  at_sea:    { label: 'At Sea',    color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  completed: { label: 'Completed', color: TEAL,      bg: 'rgba(8,145,178,0.15)'  },
  scheduled: { label: 'Scheduled', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
}

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'at_sea', label: 'At Sea' },
  { id: 'completed', label: 'Completed' },
  { id: 'scheduled', label: 'Scheduled' },
]

const fmt = (n: number) => n.toLocaleString('en-IN')

function TripCard({ trip }: { trip: Trip }) {
  const cfg = STATUS_CFG[trip.status]
  return (
    <View style={c.card}>
      <View style={[c.accentBar, { backgroundColor: cfg.color }]} />
      <View style={c.inner}>
        <View style={c.topRow}>
          <View>
            <Text style={c.tripNum}>{trip.tripNumber}</Text>
            <Text style={c.boat}>{trip.boatName} · {trip.boatReg}</Text>
          </View>
          <View style={[c.badge, { backgroundColor: cfg.bg }]}>
            <View style={[c.badgeDot, { backgroundColor: cfg.color }]} />
            <Text style={[c.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        <View style={c.metaRow}>
          <Ionicons name="calendar-outline" size={12} color={TS} />
          <Text style={c.metaText}>{trip.departureDate}{trip.returnDate ? ` → ${trip.returnDate}` : ''}</Text>
          {trip.daysAtSea > 0 && <><Text style={c.metaSep}>·</Text><Text style={c.metaText}>{trip.daysAtSea} days</Text></>}
        </View>
        <View style={c.statsRow}>
          <View style={c.stat}>
            <Text style={c.statVal}>{trip.catchKg > 0 ? `${fmt(trip.catchKg)} kg` : '—'}</Text>
            <Text style={c.statLbl}>Catch</Text>
          </View>
          <View style={c.statDiv} />
          <View style={c.stat}>
            <Text style={c.statVal}>{trip.crewCount}</Text>
            <Text style={c.statLbl}>Crew</Text>
          </View>
          <View style={c.statDiv} />
          <View style={c.stat}>
            <Text style={c.statVal}>{trip.expenses > 0 ? `₹${fmt(trip.expenses)}` : '—'}</Text>
            <Text style={c.statLbl}>Expenses</Text>
          </View>
        </View>
        <View style={c.captainRow}>
          <Ionicons name="person-circle-outline" size={13} color={TS} />
          <Text style={c.captainText}>{trip.captain}</Text>
        </View>
      </View>
    </View>
  )
}

export default function TripsScreen() {
  const months = ['All', ...Array.from(new Set(MOCK_TRIPS.map(t => t.departureDate.slice(3))))]
  const boats = ['All', ...Array.from(new Set(MOCK_TRIPS.map(t => t.boatName)))]

  const [activeMonth, setActiveMonth] = useState('All')
  const [activeBoat, setActiveBoat] = useState('All')
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = MOCK_TRIPS
    .filter(t => activeMonth === 'All' || t.departureDate.slice(3) === activeMonth)
    .filter(t => activeBoat === 'All' || t.boatName === activeBoat)
    .filter(t => filter === 'all' || t.status === filter)
    .sort((a, b) => {
      const o: Record<TripStatus, number> = { at_sea: 0, scheduled: 1, completed: 2 }
      return o[a.status] - o[b.status]
    })

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.canGoBack() ? router.back() : null}>
            <Ionicons name="arrow-back" size={20} color={TP} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Trips</Text>
            <Text style={s.headerSub}>{filtered.length} records</Text>
          </View>
        </View>

        <View style={s.filterSection}>
          <View style={s.filterWrap}>
            {months.map(month => (
              <TouchableOpacity key={month} style={[s.chip, activeMonth === month && s.chipActive]} onPress={() => setActiveMonth(month)}>
                <Text style={[s.chipText, activeMonth === month && s.chipTextActive]}>{month}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.filterSection}>
          <View style={s.filterWrap}>
            {boats.map(boat => (
              <TouchableOpacity key={boat} style={[s.chip, activeBoat === boat && s.chipActive]} onPress={() => setActiveBoat(boat)}>
                <Text style={[s.chipText, activeBoat === boat && s.chipTextActive]}>{boat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.filterSection}>
          <View style={s.filterWrap}>
            {FILTERS.map(f => (
              <TouchableOpacity key={f.id} style={[s.chip, filter === f.id && s.chipActive]} onPress={() => setFilter(f.id)}>
                <Text style={[s.chipText, filter === f.id && s.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
          {filtered.length === 0
            ? <View style={s.empty}><Ionicons name="boat-outline" size={48} color={TM} /><Text style={s.emptyText}>No trips found</Text></View>
            : filtered.map(t => <TripCard key={t.id} trip={t} />)
          }
          <View style={{ height: 100 }} />
        </ScrollView>

        <AppTabBar activeTab="trips" />
      </SafeAreaView>
    </>
  )
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: BG },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: BOR },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: ELEV, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: TP },
  headerSub:    { fontSize: 12, color: TS, marginTop: 1 },
  filterSection:{ paddingHorizontal: 16, paddingTop: 8 },
  filterWrap:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: SURF, borderWidth: 1, borderColor: BOR },
  chipActive:   { backgroundColor: TEAL + '20', borderColor: TEAL },
  chipText:     { fontSize: 12, fontWeight: '600', color: TS },
  chipTextActive:{ color: TEAL, fontWeight: '700' },
  list:         { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  empty:        { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText:    { fontSize: 15, color: TS },
})

const c = StyleSheet.create({
  card:       { flexDirection: 'row', backgroundColor: SURF, borderRadius: 14, borderWidth: 1, borderColor: BOR, overflow: 'hidden' },
  accentBar:  { width: 4 },
  inner:      { flex: 1, padding: 14, gap: 8 },
  topRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tripNum:    { fontSize: 15, fontWeight: '800', color: TP },
  boat:       { fontSize: 12, color: TS, marginTop: 2 },
  badge:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 },
  badgeDot:   { width: 5, height: 5, borderRadius: 3 },
  badgeText:  { fontSize: 11, fontWeight: '700' },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText:   { fontSize: 11, color: TS },
  metaSep:    { fontSize: 11, color: TM },
  statsRow:   { flexDirection: 'row', backgroundColor: ELEV, borderRadius: 8, padding: 8 },
  stat:       { flex: 1, alignItems: 'center', gap: 2 },
  statVal:    { fontSize: 13, fontWeight: '700', color: TP },
  statLbl:    { fontSize: 9, color: TS },
  statDiv:    { width: 1, backgroundColor: BOR },
  captainRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  captainText:{ fontSize: 11, color: TS },
})
