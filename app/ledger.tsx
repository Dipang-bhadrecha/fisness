/**
 * app/ledger.tsx — Ledger Screen with AppTabBar footer
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
const GREEN= '#059669'
const RED  = '#ef4444'

type LedgerTab = 'overview' | 'income' | 'expenses'

interface BoatSummary {
  boatName: string
  boatReg: string
  income: number
  expenses: number
  profit: number
  trips: number
}

interface Transaction {
  id: string
  date: string
  type: 'income' | 'expense'
  description: string
  boatName: string
  amount: number
}

const BOAT_SUMMARIES: BoatSummary[] = [
  { boatName: 'Jai Mataji', boatReg: 'GJ-VR-1042', income: 2100000, expenses: 710000, profit: 1390000, trips: 12 },
  { boatName: 'Sea Star',   boatReg: 'GJ-VR-2201', income: 1840000, expenses: 620000, profit: 1220000, trips: 13 },
]

const TRANSACTIONS: Transaction[] = [
  { id: '1', date: '08 Mar 2026', type: 'income',  description: 'Tali #47 — Pomfret & Shrimp', boatName: 'Jai Mataji', amount: 184000 },
  { id: '2', date: '07 Mar 2026', type: 'expense', description: 'Diesel refill — Veraval port',  boatName: 'Sea Star',   amount: 85000  },
  { id: '3', date: '05 Mar 2026', type: 'income',  description: 'Tali #46 — Shrimp',            boatName: 'Sea Star',   amount: 96000  },
  { id: '4', date: '03 Mar 2026', type: 'expense', description: 'Ice & provisions',               boatName: 'Jai Mataji', amount: 24000  },
  { id: '5', date: '01 Mar 2026', type: 'income',  description: 'Tali #45 — Pomfret',            boatName: 'Jai Mataji', amount: 218000 },
]

const fmt      = (n: number) => n.toLocaleString('en-IN')
const fmtShort = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`

function OverviewTab() {
  const totalIncome   = BOAT_SUMMARIES.reduce((s, b) => s + b.income, 0)
  const totalExpenses = BOAT_SUMMARIES.reduce((s, b) => s + b.expenses, 0)
  const totalProfit   = BOAT_SUMMARIES.reduce((s, b) => s + b.profit, 0)

  return (
    <ScrollView contentContainerStyle={{ gap: 12, padding: 16 }} showsVerticalScrollIndicator={false}>
      {/* Season summary */}
      <View style={ov.summaryCard}>
        <View style={ov.summaryRow}>
          <View style={ov.summaryItem}>
            <Text style={ov.summaryVal}>{fmtShort(totalIncome)}</Text>
            <Text style={ov.summaryLbl}>Income</Text>
          </View>
          <View style={ov.summaryDiv} />
          <View style={ov.summaryItem}>
            <Text style={[ov.summaryVal, { color: RED }]}>{fmtShort(totalExpenses)}</Text>
            <Text style={ov.summaryLbl}>Expenses</Text>
          </View>
          <View style={ov.summaryDiv} />
          <View style={ov.summaryItem}>
            <Text style={[ov.summaryVal, { color: GREEN }]}>{fmtShort(totalProfit)}</Text>
            <Text style={ov.summaryLbl}>Net Profit</Text>
          </View>
        </View>
      </View>

      {/* Per boat */}
      {BOAT_SUMMARIES.map(b => (
        <View key={b.boatReg} style={ov.boatCard}>
          <View style={ov.boatHeader}>
            <View>
              <Text style={ov.boatName}>{b.boatName}</Text>
              <Text style={ov.boatReg}>{b.boatReg} · {b.trips} trips</Text>
            </View>
            <Text style={[ov.boatProfit, { color: b.profit > 0 ? GREEN : RED }]}>
              {fmtShort(b.profit)}
            </Text>
          </View>
          <View style={ov.boatStats}>
            <View style={ov.boatStat}>
              <Text style={ov.boatStatVal}>{fmtShort(b.income)}</Text>
              <Text style={ov.boatStatLbl}>Income</Text>
            </View>
            <View style={ov.boatStatDiv} />
            <View style={ov.boatStat}>
              <Text style={[ov.boatStatVal, { color: RED }]}>{fmtShort(b.expenses)}</Text>
              <Text style={ov.boatStatLbl}>Expenses</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

function TransactionTab({ type }: { type: 'income' | 'expenses' }) {
  const txType = type === 'expenses' ? 'expense' : 'income'
  const txs = TRANSACTIONS.filter(t => t.type === txType)
  return (
    <ScrollView contentContainerStyle={{ gap: 8, padding: 16 }} showsVerticalScrollIndicator={false}>
      {txs.map(tx => (
        <View key={tx.id} style={tx2.row}>
          <View style={tx2.left}>
            <Text style={tx2.desc}>{tx.description}</Text>
            <Text style={tx2.meta}>{tx.boatName} · {tx.date}</Text>
          </View>
          <Text style={[tx2.amount, { color: tx.type === 'income' ? GREEN : RED }]}>
            {tx.type === 'income' ? '+' : '−'}{fmtShort(tx.amount)}
          </Text>
        </View>
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  )
}

export default function LedgerScreen() {
  const [activeTab, setActiveTab] = useState<LedgerTab>('overview')

  const TABS: { id: LedgerTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'overview',  label: 'Overview',  icon: 'bar-chart-outline' },
    { id: 'income',    label: 'Income',    icon: 'arrow-down-circle-outline' },
    { id: 'expenses',  label: 'Expenses',  icon: 'arrow-up-circle-outline' },
  ]

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe} edges={['top']}>

        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.canGoBack() ? router.back() : null}>
            <Ionicons name="arrow-back" size={20} color={TP} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Ledger</Text>
            <Text style={s.headerSub}>Season 2025–26</Text>
          </View>
          <TouchableOpacity style={s.exportBtn}>
            <Ionicons name="share-outline" size={18} color={TEAL} />
            <Text style={s.exportText}>Export</Text>
          </TouchableOpacity>
        </View>

        <View style={s.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[s.tab, activeTab === tab.id && s.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon} size={16} color={activeTab === tab.id ? TEAL : TS} />
              <Text style={[s.tabLabel, activeTab === tab.id && s.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flex: 1 }}>
          {activeTab === 'overview'  && <OverviewTab />}
          {activeTab === 'income'    && <TransactionTab type="income" />}
          {activeTab === 'expenses'  && <TransactionTab type="expenses" />}
        </View>

        <AppTabBar activeTab="ledger" />
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
  exportBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  exportText:   { fontSize: 13, color: TEAL, fontWeight: '700' },
  tabRow:       { flexDirection: 'row', backgroundColor: SURF, borderBottomWidth: 1, borderBottomColor: BOR },
  tab:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  tabActive:    { borderBottomWidth: 2, borderBottomColor: TEAL },
  tabLabel:     { fontSize: 13, fontWeight: '600', color: TS },
  tabLabelActive:{ color: TEAL, fontWeight: '700' },
})

const ov = StyleSheet.create({
  summaryCard: { backgroundColor: SURF, borderRadius: 14, borderWidth: 1, borderColor: BOR, padding: 16 },
  summaryRow:  { flexDirection: 'row' },
  summaryItem: { flex: 1, alignItems: 'center', gap: 3 },
  summaryVal:  { fontSize: 16, fontWeight: '800', color: TP },
  summaryLbl:  { fontSize: 10, color: TS },
  summaryDiv:  { width: 1, backgroundColor: BOR, marginVertical: 4 },
  boatCard:    { backgroundColor: SURF, borderRadius: 14, borderWidth: 1, borderColor: BOR, overflow: 'hidden' },
  boatHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  boatName:    { fontSize: 15, fontWeight: '800', color: TP },
  boatReg:     { fontSize: 11, color: TS, marginTop: 2 },
  boatProfit:  { fontSize: 18, fontWeight: '800' },
  boatStats:   { flexDirection: 'row', backgroundColor: ELEV, padding: 10 },
  boatStat:    { flex: 1, alignItems: 'center', gap: 2 },
  boatStatVal: { fontSize: 14, fontWeight: '700', color: TP },
  boatStatLbl: { fontSize: 10, color: TS },
  boatStatDiv: { width: 1, backgroundColor: BOR },
})

const tx2 = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', backgroundColor: SURF, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BOR },
  left:   { flex: 1, gap: 3 },
  desc:   { fontSize: 13, fontWeight: '600', color: TP },
  meta:   { fontSize: 11, color: TS },
  amount: { fontSize: 14, fontWeight: '800' },
})