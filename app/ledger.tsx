/**
 * app/ledger.tsx — Ledger Screen (Rebuilt)
 *
 * Tabs:
 *   Overview  → season totals + per-boat P&L
 *   Income    → tali/selling entries, filterable
 *   Expenses  → all expense entries by category, boat, month, trip
 *
 * Filters: Boat · Month · Trip
 *
 * Expense categories match add-expense.tsx:
 *   Season Advance, Diesel, Crew Kharchi, Grocery,
 *   Gas Cylinder, Net Repair, New Net, Maintenance, Ice, Other
 *
 * TODO: Replace mock data with:
 *   GET /api/v1/ledger/summary
 *   GET /api/v1/ledger/expenses?boatId=&month=&tripId=
 *   GET /api/v1/ledger/income?boatId=&month=
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

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG   = '#080F1A'
const SURF = '#0D1B2E'
const ELEV = '#132640'
const BOR  = 'rgba(0,194,203,0.1)'
const TP   = '#F0F4F8'
const TS   = '#8BA3BC'
const TM   = '#3D5A73'
const TEAL = '#0891b2'
const GREEN = '#10b981'
const RED   = '#ef4444'
const AMBER = '#f59e0b'

// ─── Types ────────────────────────────────────────────────────────────────────
type LedgerTab = 'overview' | 'income' | 'expenses'

type ExpenseCategoryId =
  | 'season_advance' | 'diesel' | 'crew_kharchi' | 'grocery'
  | 'gas_cylinder' | 'fishing_net_repair' | 'fishing_net_new'
  | 'maintenance' | 'ice' | 'other'

interface Expense {
  id: string
  boatId: string
  boatName: string
  category: ExpenseCategoryId
  amount: number
  note?: string
  date: string
  trip?: string
  month: string // 'Mar 2026'
}

interface Income {
  id: string
  boatId: string
  boatName: string
  type: 'tali' | 'selling'
  amount: number
  description: string
  date: string
  trip?: string
  month: string
}

interface BoatSummary {
  id: string
  name: string
  reg: string
  trips: number
  income: number
  expenses: number
}

// ─── Category config ──────────────────────────────────────────────────────────
const CAT: Record<ExpenseCategoryId, { label: string; emoji: string; color: string }> = {
  season_advance:     { label: 'Season Advance',  emoji: '💰', color: '#f59e0b' },
  diesel:             { label: 'Diesel',          emoji: '⛽', color: '#3b82f6' },
  crew_kharchi:       { label: 'Crew Kharchi',    emoji: '👥', color: '#8b5cf6' },
  grocery:            { label: 'Grocery',         emoji: '🛒', color: '#10b981' },
  gas_cylinder:       { label: 'Gas Cylinder',    emoji: '🔵', color: '#06b6d4' },
  fishing_net_repair: { label: 'Net Repair',      emoji: '🔧', color: '#d97706' },
  fishing_net_new:    { label: 'New Fishing Net', emoji: '🪢', color: '#0891b2' },
  maintenance:        { label: 'Maintenance',     emoji: '🛠️', color: '#64748b' },
  ice:                { label: 'Ice',             emoji: '🧊', color: '#38bdf8' },
  other:              { label: 'Other',           emoji: '📦', color: '#6b7280' },
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const BOATS_LIST = [
  { id: 'all', name: 'All Boats', reg: '' },
  { id: '1',   name: 'Jai Mataji', reg: 'GJ-VR-1042' },
  { id: '2',   name: 'Sea Star',   reg: 'GJ-VR-2201' },
]

const MONTHS_LIST = ['All', 'Mar 2026', 'Feb 2026', 'Jan 2026', 'Dec 2025']

const BOAT_SUMMARIES: BoatSummary[] = [
  { id: '1', name: 'Jai Mataji', reg: 'GJ-VR-1042', trips: 12, income: 2100000, expenses: 710000 },
  { id: '2', name: 'Sea Star',   reg: 'GJ-VR-2201', trips: 13, income: 1840000, expenses: 620000 },
]

const MOCK_EXPENSES: Expense[] = [
  { id: 'e1',  boatId: '1', boatName: 'Jai Mataji', category: 'season_advance',     amount: 500000, note: 'Start of season',  date: '01 Dec 2025', trip: undefined,   month: 'Dec 2025' },
  { id: 'e2',  boatId: '1', boatName: 'Jai Mataji', category: 'diesel',             amount: 120000, note: 'Veraval port',     date: '15 Jan 2026', trip: 'Trip #10',  month: 'Jan 2026' },
  { id: 'e3',  boatId: '1', boatName: 'Jai Mataji', category: 'crew_kharchi',       amount: 500000, note: 'Full crew',        date: '20 Jan 2026', trip: undefined,   month: 'Jan 2026' },
  { id: 'e4',  boatId: '1', boatName: 'Jai Mataji', category: 'grocery',            amount: 100000, note: 'Monthly grocery',  date: '01 Feb 2026', trip: 'Trip #11',  month: 'Feb 2026' },
  { id: 'e5',  boatId: '1', boatName: 'Jai Mataji', category: 'gas_cylinder',       amount: 5000,   note: '2 cylinders',     date: '05 Feb 2026', trip: 'Trip #11',  month: 'Feb 2026' },
  { id: 'e6',  boatId: '1', boatName: 'Jai Mataji', category: 'fishing_net_repair', amount: 40000,  note: 'Net damaged',     date: '10 Feb 2026', trip: 'Trip #11',  month: 'Feb 2026' },
  { id: 'e7',  boatId: '1', boatName: 'Jai Mataji', category: 'fishing_net_new',    amount: 200000, note: 'New nylon net',   date: '01 Mar 2026', trip: undefined,   month: 'Mar 2026' },
  { id: 'e8',  boatId: '2', boatName: 'Sea Star',   category: 'season_advance',     amount: 500000, note: 'Start of season', date: '01 Dec 2025', trip: undefined,   month: 'Dec 2025' },
  { id: 'e9',  boatId: '2', boatName: 'Sea Star',   category: 'diesel',             amount: 110000, note: 'Okha port',       date: '12 Jan 2026', trip: 'Trip #9',   month: 'Jan 2026' },
  { id: 'e10', boatId: '2', boatName: 'Sea Star',   category: 'maintenance',        amount: 300000, note: 'Engine overhaul', date: '20 Mar 2026', trip: undefined,   month: 'Mar 2026' },
  { id: 'e11', boatId: '2', boatName: 'Sea Star',   category: 'ice',                amount: 15000,  note: '3 tonnes',        date: '25 Feb 2026', trip: 'Trip #12',  month: 'Feb 2026' },
]

const MOCK_INCOME: Income[] = [
  { id: 'i1', boatId: '1', boatName: 'Jai Mataji', type: 'tali', amount: 184000,  description: 'Pomfret & Shrimp — Goshiya',  date: '08 Mar 2026', trip: 'Trip #13', month: 'Mar 2026' },
  { id: 'i2', boatId: '1', boatName: 'Jai Mataji', type: 'tali', amount: 312000,  description: 'Kingfish — Goshiya Sea Foods', date: '22 Feb 2026', trip: 'Trip #12', month: 'Feb 2026' },
  { id: 'i3', boatId: '1', boatName: 'Jai Mataji', type: 'tali', amount: 278000,  description: 'Mixed catch — Goshiya',        date: '10 Jan 2026', trip: 'Trip #10', month: 'Jan 2026' },
  { id: 'i4', boatId: '2', boatName: 'Sea Star',   type: 'tali', amount: 196000,  description: 'Shrimp & Crab — Veraval Co.',  date: '12 Mar 2026', trip: 'Trip #13', month: 'Mar 2026' },
  { id: 'i5', boatId: '2', boatName: 'Sea Star',   type: 'tali', amount: 245000,  description: 'Pomfret — Veraval Co.',        date: '05 Feb 2026', trip: 'Trip #11', month: 'Feb 2026' },
  { id: 'i6', boatId: '2', boatName: 'Sea Star',   type: 'tali', amount: 188000,  description: 'Mixed catch',                  date: '18 Jan 2026', trip: 'Trip #9',  month: 'Jan 2026' },
]

const fmt      = (n: number) => `₹${n.toLocaleString('en-IN')}`
const fmtShort = (n: number) =>
  n >= 10000000 ? `₹${(n / 10000000).toFixed(1)}Cr`
  : n >= 100000  ? `₹${(n / 100000).toFixed(1)}L`
  : n >= 1000    ? `₹${(n / 1000).toFixed(0)}K`
  : `₹${n}`

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function LedgerScreen() {
  const [activeTab, setActiveTab] = useState<LedgerTab>('overview')

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => router.canGoBack() ? router.back() : null}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Ledger</Text>
            <Text style={s.headerSub}>Season 2025–26</Text>
          </View>
          <TouchableOpacity style={s.exportBtn}>
            <Ionicons name="share-outline" size={18} color="#fff" />
            <Text style={s.exportTxt}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={s.tabRow}>
          {(['overview', 'income', 'expenses'] as LedgerTab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[s.tab, activeTab === tab && s.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[s.tabLabel, activeTab === tab && s.tabLabelActive]}>
                {tab === 'overview' ? '📊 Overview' : tab === 'income' ? '💰 Income' : '💸 Expenses'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'income'   && <IncomeTab />}
        {activeTab === 'expenses' && <ExpensesTab />}

        <AppTabBar activeTab="ledger" />
      </SafeAreaView>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab() {
  const totalIncome   = BOAT_SUMMARIES.reduce((s, b) => s + b.income, 0)
  const totalExpenses = BOAT_SUMMARIES.reduce((s, b) => s + b.expenses, 0)
  const totalProfit   = totalIncome - totalExpenses

  // Category totals across all boats
  const categoryTotals = Object.keys(CAT).map(catId => {
    const total = MOCK_EXPENSES
      .filter(e => e.category === catId)
      .reduce((s, e) => s + e.amount, 0)
    return { catId: catId as ExpenseCategoryId, total }
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ov.scroll}>

      {/* Season total banner */}
      <View style={ov.totalCard}>
        <Text style={ov.totalLabel}>SEASON 2025–26</Text>
        <Text style={ov.totalProfit}>{fmtShort(totalProfit)}</Text>
        <Text style={ov.totalSub}>Net Profit</Text>
        <View style={ov.totalRow}>
          <View style={ov.totalItem}>
            <Text style={[ov.totalItemVal, { color: GREEN }]}>{fmtShort(totalIncome)}</Text>
            <Text style={ov.totalItemLabel}>Income</Text>
          </View>
          <View style={ov.totalDivider} />
          <View style={ov.totalItem}>
            <Text style={[ov.totalItemVal, { color: RED }]}>{fmtShort(totalExpenses)}</Text>
            <Text style={ov.totalItemLabel}>Expenses</Text>
          </View>
          <View style={ov.totalDivider} />
          <View style={ov.totalItem}>
            <Text style={[ov.totalItemVal, { color: AMBER }]}>
              {BOAT_SUMMARIES.reduce((s, b) => s + b.trips, 0)}
            </Text>
            <Text style={ov.totalItemLabel}>Trips</Text>
          </View>
        </View>
      </View>

      {/* Per boat */}
      <Text style={ov.sectionTitle}>PER BOAT</Text>
      {BOAT_SUMMARIES.map(boat => {
        const profit = boat.income - boat.expenses
        return (
          <View key={boat.id} style={ov.boatCard}>
            <View style={ov.boatTop}>
              <View>
                <Text style={ov.boatName}>{boat.name}</Text>
                <Text style={ov.boatMeta}>{boat.reg} · {boat.trips} trips</Text>
              </View>
              <Text style={[ov.boatProfit, { color: profit > 0 ? GREEN : RED }]}>
                {fmtShort(profit)}
              </Text>
            </View>
            {/* Income vs expense bar */}
            <View style={ov.barTrack}>
              <View style={[ov.barIncome,  { flex: boat.income }]} />
              <View style={[ov.barExpense, { flex: boat.expenses }]} />
            </View>
            <View style={ov.boatBottom}>
              <Text style={ov.boatIncomeTxt}>↑ {fmtShort(boat.income)} income</Text>
              <Text style={ov.boatExpenseTxt}>↓ {fmtShort(boat.expenses)} expenses</Text>
            </View>
            {/* Mini category breakdown */}
            <View style={ov.catBreakdown}>
              {Object.keys(CAT).map(catId => {
                const catTotal = MOCK_EXPENSES
                  .filter(e => e.boatId === boat.id && e.category === catId)
                  .reduce((s, e) => s + e.amount, 0)
                if (catTotal === 0) return null
                const cfg = CAT[catId as ExpenseCategoryId]
                return (
                  <View key={catId} style={ov.catRow}>
                    <Text style={ov.catEmoji}>{cfg.emoji}</Text>
                    <Text style={ov.catLabel}>{cfg.label}</Text>
                    <Text style={[ov.catAmount, { color: RED }]}>−{fmtShort(catTotal)}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )
      })}

      {/* Expense category summary */}
      <Text style={ov.sectionTitle}>EXPENSE BREAKDOWN (ALL BOATS)</Text>
      <View style={ov.catSummaryCard}>
        {categoryTotals.map(({ catId, total }) => {
          const cfg = CAT[catId]
          const pct = Math.round((total / totalExpenses) * 100)
          return (
            <View key={catId}>
              <View style={ov.catSummaryRow}>
                <Text style={ov.catSummaryEmoji}>{cfg.emoji}</Text>
                <Text style={ov.catSummaryLabel}>{cfg.label}</Text>
                <View style={ov.catSummaryRight}>
                  <Text style={ov.catSummaryPct}>{pct}%</Text>
                  <Text style={[ov.catSummaryAmt, { color: RED }]}>−{fmtShort(total)}</Text>
                </View>
              </View>
              <View style={ov.catBar}>
                <View style={[ov.catBarFill, { width: `${pct}%` as any, backgroundColor: cfg.color }]} />
              </View>
            </View>
          )
        })}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  )
}

const ov = StyleSheet.create({
  scroll:       { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: TEAL, letterSpacing: 1.2, marginTop: 8 },

  totalCard:      { backgroundColor: SURF, borderRadius: 16, borderWidth: 1, borderColor: BOR, padding: 18, alignItems: 'center', gap: 4 },
  totalLabel:     { fontSize: 11, fontWeight: '700', color: TEAL, letterSpacing: 1 },
  totalProfit:    { fontSize: 32, fontWeight: '800', color: TP, marginTop: 4 },
  totalSub:       { fontSize: 12, color: TS },
  totalRow:       { flexDirection: 'row', marginTop: 12, width: '100%' },
  totalItem:      { flex: 1, alignItems: 'center' },
  totalItemVal:   { fontSize: 16, fontWeight: '800' },
  totalItemLabel: { fontSize: 11, color: TS, marginTop: 2 },
  totalDivider:   { width: 1, backgroundColor: BOR, marginVertical: 4 },

  boatCard:     { backgroundColor: SURF, borderRadius: 16, borderWidth: 1, borderColor: BOR, padding: 14, gap: 10 },
  boatTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  boatName:     { fontSize: 16, fontWeight: '800', color: TP },
  boatMeta:     { fontSize: 12, color: TS, marginTop: 2 },
  boatProfit:   { fontSize: 18, fontWeight: '800' },
  barTrack:     { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: ELEV },
  barIncome:    { backgroundColor: GREEN },
  barExpense:   { backgroundColor: RED },
  boatBottom:   { flexDirection: 'row', justifyContent: 'space-between' },
  boatIncomeTxt:{ fontSize: 11, color: GREEN, fontWeight: '600' },
  boatExpenseTxt:{ fontSize: 11, color: RED, fontWeight: '600' },

  catBreakdown: { borderTopWidth: 1, borderTopColor: BOR, paddingTop: 10, gap: 6 },
  catRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catEmoji:     { fontSize: 14, width: 20 },
  catLabel:     { flex: 1, fontSize: 12, color: TS },
  catAmount:    { fontSize: 12, fontWeight: '700' },

  catSummaryCard: { backgroundColor: SURF, borderRadius: 16, borderWidth: 1, borderColor: BOR, padding: 14, gap: 10 },
  catSummaryRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catSummaryEmoji:{ fontSize: 16, width: 24 },
  catSummaryLabel:{ flex: 1, fontSize: 13, color: TP, fontWeight: '600' },
  catSummaryRight:{ alignItems: 'flex-end', gap: 1 },
  catSummaryPct:  { fontSize: 11, color: TS },
  catSummaryAmt:  { fontSize: 13, fontWeight: '800' },
  catBar:         { height: 4, backgroundColor: ELEV, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  catBarFill:     { height: '100%', borderRadius: 2 },
})

// ═══════════════════════════════════════════════════════════════════════════════
// INCOME TAB
// ═══════════════════════════════════════════════════════════════════════════════
function IncomeTab() {
  const [filterBoat,  setFilterBoat]  = useState('all')
  const [filterMonth, setFilterMonth] = useState('All')

  const filtered = MOCK_INCOME.filter(i => {
    const boatMatch  = filterBoat === 'all'  || i.boatId === filterBoat
    const monthMatch = filterMonth === 'All' || i.month === filterMonth
    return boatMatch && monthMatch
  })

  const total = filtered.reduce((s, i) => s + i.amount, 0)

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={fi.scroll}>
      <FilterBar
        boats={BOATS_LIST} months={MONTHS_LIST}
        filterBoat={filterBoat} filterMonth={filterMonth}
        onBoatChange={setFilterBoat} onMonthChange={setFilterMonth}
        showTrip={false}
      />

      {/* Total banner */}
      <View style={[fi.totalBanner, { borderColor: GREEN + '30' }]}>
        <Text style={fi.totalLabel}>Total Income</Text>
        <Text style={[fi.totalVal, { color: GREEN }]}>{fmt(total)}</Text>
        <Text style={fi.totalSub}>{filtered.length} entries</Text>
      </View>

      {/* Income entries */}
      {filtered.map(inc => (
        <View key={inc.id} style={fi.card}>
          <View style={[fi.iconWrap, { backgroundColor: GREEN + '18' }]}>
            <Text style={fi.icon}>⚓</Text>
          </View>
          <View style={fi.body}>
            <Text style={fi.desc}>{inc.description}</Text>
            <View style={fi.meta}>
              <Text style={fi.metaBoat}>⛵ {inc.boatName}</Text>
              {inc.trip && <Text style={fi.metaTrip}> · {inc.trip}</Text>}
              <Text style={fi.metaDate}> · {inc.date}</Text>
            </View>
          </View>
          <Text style={[fi.amount, { color: GREEN }]}>+{fmtShort(inc.amount)}</Text>
        </View>
      ))}

      {filtered.length === 0 && <EmptyState label="No income entries found" />}
      <View style={{ height: 100 }} />
    </ScrollView>
  )
}

const fi = StyleSheet.create({
  scroll:      { padding: 16, gap: 10 },
  totalBanner: { backgroundColor: SURF, borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center', gap: 4 },
  totalLabel:  { fontSize: 11, fontWeight: '700', color: TS, letterSpacing: 0.8 },
  totalVal:    { fontSize: 28, fontWeight: '800' },
  totalSub:    { fontSize: 12, color: TM },
  card:        { flexDirection: 'row', alignItems: 'center', backgroundColor: SURF, borderRadius: 14, padding: 12, gap: 12, borderWidth: 1, borderColor: BOR },
  iconWrap:    { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  icon:        { fontSize: 20 },
  body:        { flex: 1, gap: 3 },
  desc:        { fontSize: 13, fontWeight: '700', color: TP },
  meta:        { flexDirection: 'row', flexWrap: 'wrap' },
  metaBoat:    { fontSize: 11, color: TEAL },
  metaTrip:    { fontSize: 11, color: TS },
  metaDate:    { fontSize: 11, color: TM },
  amount:      { fontSize: 14, fontWeight: '800' },
})

// ═══════════════════════════════════════════════════════════════════════════════
// EXPENSES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ExpensesTab() {
  const [filterBoat,     setFilterBoat]     = useState('all')
  const [filterMonth,    setFilterMonth]    = useState('All')
  const [filterCategory, setFilterCategory] = useState<ExpenseCategoryId | 'all'>('all')

  const filtered = MOCK_EXPENSES.filter(e => {
    const boatMatch = filterBoat === 'all' || e.boatId === filterBoat
    const monthMatch = filterMonth === 'All' || e.month === filterMonth
    const catMatch = filterCategory === 'all' || e.category === filterCategory
    return boatMatch && monthMatch && catMatch
  })

  const total = filtered.reduce((s, e) => s + e.amount, 0)

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ex.scroll}>
      <FilterBar
        boats={BOATS_LIST} months={MONTHS_LIST}
        filterBoat={filterBoat} filterMonth={filterMonth}
        onBoatChange={setFilterBoat} onMonthChange={setFilterMonth}
        showTrip={false}
      />

      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={ex.catChips}
      >
        <TouchableOpacity
          style={[ex.catChip, filterCategory === 'all' && ex.catChipActive]}
          onPress={() => setFilterCategory('all')}
        >
          <Text style={[ex.catChipTxt, filterCategory === 'all' && ex.catChipTxtActive]}>
            All
          </Text>
        </TouchableOpacity>
        {Object.entries(CAT).map(([catId, cfg]) => (
          <TouchableOpacity
            key={catId}
            style={[
              ex.catChip,
              filterCategory === catId && { borderColor: cfg.color, backgroundColor: cfg.color + '18' },
            ]}
            onPress={() => setFilterCategory(catId as ExpenseCategoryId)}
          >
            <Text style={ex.catChipEmoji}>{cfg.emoji}</Text>
            <Text style={[
              ex.catChipTxt,
              filterCategory === catId && { color: cfg.color, fontWeight: '700' },
            ]}>
              {cfg.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Total banner */}
      <View style={[fi.totalBanner, { borderColor: RED + '30' }]}>
        <Text style={fi.totalLabel}>Total Expenses</Text>
        <Text style={[fi.totalVal, { color: RED }]}>{fmt(total)}</Text>
        <Text style={fi.totalSub}>{filtered.length} entries</Text>
      </View>

      {/* Expense entries */}
      {filtered.map(exp => {
        const cfg = CAT[exp.category]
        return (
          <View key={exp.id} style={ex.card}>
            <View style={[ex.iconWrap, { backgroundColor: cfg.color + '18' }]}>
              <Text style={ex.icon}>{cfg.emoji}</Text>
            </View>
            <View style={ex.body}>
              <Text style={ex.catLabel}>{cfg.label}</Text>
              {exp.note && <Text style={ex.noteText}>{exp.note}</Text>}
              <View style={ex.meta}>
                <Text style={ex.metaBoat}>⛵ {exp.boatName}</Text>
                {exp.trip && <Text style={ex.metaTrip}> · {exp.trip}</Text>}
                <Text style={ex.metaDate}> · {exp.date}</Text>
              </View>
            </View>
            <Text style={[ex.amount, { color: RED }]}>−{fmtShort(exp.amount)}</Text>
          </View>
        )
      })}

      {filtered.length === 0 && <EmptyState label="No expenses found" />}

      {/* Add expense shortcut */}
      <TouchableOpacity
        style={ex.addBtn}
        onPress={() => router.push('/add-expense' as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={ex.addBtnText}>Add Expense</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  )
}

const ex = StyleSheet.create({
  scroll:          { padding: 16, gap: 10 },
  catChips:        { gap: 8, paddingBottom: 4 },
  catChip:         { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: SURF, borderWidth: 1.5, borderColor: BOR },
  catChipActive:   { borderColor: TEAL, backgroundColor: TEAL + '18' },
  catChipEmoji:    { fontSize: 13 },
  catChipTxt:      { fontSize: 12, color: TS, fontWeight: '600' },
  catChipTxtActive:{ color: TEAL, fontWeight: '700' },
  card:            { flexDirection: 'row', alignItems: 'center', backgroundColor: SURF, borderRadius: 14, padding: 12, gap: 12, borderWidth: 1, borderColor: BOR },
  iconWrap:        { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  icon:            { fontSize: 22 },
  body:            { flex: 1, gap: 3 },
  catLabel:        { fontSize: 13, fontWeight: '700', color: TP },
  noteText:        { fontSize: 12, color: TS },
  meta:            { flexDirection: 'row', flexWrap: 'wrap' },
  metaBoat:        { fontSize: 11, color: TEAL },
  metaTrip:        { fontSize: 11, color: TS },
  metaDate:        { fontSize: 11, color: TM },
  amount:          { fontSize: 14, fontWeight: '800' },
  addBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: TEAL, borderRadius: 14, paddingVertical: 14, marginTop: 4 },
  addBtnText:      { color: '#fff', fontSize: 15, fontWeight: '800' },
})

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED: Filter Bar
// ═══════════════════════════════════════════════════════════════════════════════
function FilterBar({
  boats, months, filterBoat, filterMonth,
  onBoatChange, onMonthChange, showTrip,
}: {
  boats: { id: string; name: string }[]
  months: string[]
  filterBoat: string
  filterMonth: string
  onBoatChange: (v: string) => void
  onMonthChange: (v: string) => void
  showTrip: boolean
}) {
  return (
    <View style={fb.wrap}>
      {/* Boat filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={fb.row}>
        {boats.map(b => (
          <TouchableOpacity
            key={b.id}
            style={[fb.chip, filterBoat === b.id && fb.chipActive]}
            onPress={() => onBoatChange(b.id)}
          >
            <Text style={[fb.chipTxt, filterBoat === b.id && fb.chipTxtActive]}>
              {b.id === 'all' ? '⛵ All Boats' : b.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Month filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={fb.row}>
        {months.map(m => (
          <TouchableOpacity
            key={m}
            style={[fb.chip, filterMonth === m && fb.chipActive]}
            onPress={() => onMonthChange(m)}
          >
            <Text style={[fb.chipTxt, filterMonth === m && fb.chipTxtActive]}>
              {m === 'All' ? '📅 All Months' : m}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const fb = StyleSheet.create({
  wrap:        { gap: 8 },
  row:         { gap: 8, paddingBottom: 2 },
  chip:        { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: SURF, borderWidth: 1.5, borderColor: BOR },
  chipActive:  { borderColor: TEAL, backgroundColor: TEAL + '18' },
  chipTxt:     { fontSize: 12, color: TS, fontWeight: '600' },
  chipTxtActive:{ color: TEAL, fontWeight: '700' },
})

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, gap: 8 }}>
      <Text style={{ fontSize: 36 }}>📭</Text>
      <Text style={{ fontSize: 14, color: TS }}>{label}</Text>
    </View>
  )
}

// ─── Base styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: BG },
  header:       { flexDirection: 'row', alignItems: 'center', backgroundColor: TEAL, paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  exportBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  exportTxt:    { color: '#fff', fontSize: 13, fontWeight: '700' },
  tabRow:       { flexDirection: 'row', backgroundColor: SURF, borderBottomWidth: 1, borderBottomColor: BOR },
  tab:          { flex: 1, alignItems: 'center', paddingVertical: 13, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:    { borderBottomColor: TEAL },
  tabLabel:     { fontSize: 12, fontWeight: '600', color: TS },
  tabLabelActive:{ color: TEAL, fontWeight: '800' },
})