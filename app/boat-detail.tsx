/**
 * app/boat-detail.tsx — Boat Detail Screen
 *
 * Opened when user taps "Details" on any boat card in app/boats.tsx
 *
 * Receives params:
 *   boatId, boatName, boatNameGujarati?, registration?, status?,
 *   captain?, crewCount?, seasonCatch?, expenses?
 *
 * Four tabs:
 *   Overview   — key stats + season summary
 *   Trips      — all trips for this boat
 *   Crew       — crew roster with kharchi links
 *   Expenses   — expense breakdown
 *
 * TODO: Replace MOCK data with:
 *   GET /api/v1/boats/:boatId
 *   GET /api/v1/boats/:boatId/trips
 *   GET /api/v1/boats/:boatId/crew
 *   GET /api/v1/boats/:boatId/expenses
 */

import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../constants/theme'

// ── Types ──────────────────────────────────────────────────────────────────────
type BoatStatus = 'At Sea' | 'Docked' | 'Repair'
type DetailTab  = 'overview' | 'trips' | 'crew' | 'expenses'

// ── Mock data (replace with API) ───────────────────────────────────────────────
const MOCK_TRIPS = [
  { id: '1', number: 'Trip #14', status: 'at_sea',    departure: '10 Mar 2026', returnDate: undefined,      daysAtSea: 3,  catchKg: 0,    expenses: 45000 },
  { id: '2', number: 'Trip #13', status: 'completed', departure: '22 Feb 2026', returnDate: '05 Mar 2026',  daysAtSea: 11, catchKg: 3840, expenses: 118000 },
  { id: '3', number: 'Trip #12', status: 'completed', departure: '05 Feb 2026', returnDate: '18 Feb 2026',  daysAtSea: 13, catchKg: 4200, expenses: 132000 },
  { id: '4', number: 'Trip #11', status: 'completed', departure: '10 Jan 2026', returnDate: '24 Jan 2026',  daysAtSea: 14, catchKg: 5100, expenses: 145000 },
  { id: '5', number: 'Trip #10', status: 'completed', departure: '20 Dec 2025', returnDate: '03 Jan 2026',  daysAtSea: 14, catchKg: 4600, expenses: 138000 },
]

const MOCK_CREW = [
  { id: '1', name: 'Suraj Tandel',  role: 'Pilot / Captain', joiningDate: '03 Jul 2026', bahano: 30000, status: 'active' as const },
  { id: '2', name: 'Raju Makwana',  role: 'Sailor',          joiningDate: '03 Jul 2026', bahano: 25000, status: 'active' as const },
  { id: '3', name: 'Bharat Gohil',  role: 'Sailor',          joiningDate: '03 Jul 2026', bahano: 20000, status: 'active' as const },
  { id: '4', name: 'Kanji Patel',   role: 'Helper',          joiningDate: '03 Jul 2026', bahano: 15000, status: 'active' as const },
  { id: '5', name: 'Vanraj Solanki',role: 'Sailor',          joiningDate: '10 Jul 2026', bahano: 18000, status: 'active' as const },
  { id: '6', name: 'Mohan Koli',    role: 'Cook',            joiningDate: '03 Jul 2026', bahano: 12000, status: 'left'   as const },
]

const MOCK_EXPENSES = [
  { id: '1', date: '08 Mar 2026', category: 'Diesel',      description: 'Fuel refill — Veraval', amount: 85000, trip: 'Trip #14' },
  { id: '2', date: '07 Mar 2026', category: 'Ice',         description: '200 bags ice',           amount: 18000, trip: 'Trip #14' },
  { id: '3', date: '05 Mar 2026', category: 'Maintenance', description: 'Engine oil change',      amount: 12000, trip: undefined  },
  { id: '4', date: '02 Mar 2026', category: 'Provisions',  description: 'Food & water',           amount: 22000, trip: 'Trip #13' },
  { id: '5', date: '28 Feb 2026', category: 'Diesel',      description: 'Fuel refill',            amount: 78000, trip: 'Trip #13' },
  { id: '6', date: '25 Feb 2026', category: 'Net Repair',  description: 'Fishing net repair',     amount: 35000, trip: undefined  },
  { id: '7', date: '20 Feb 2026', category: 'Ice',         description: '180 bags ice',           amount: 16200, trip: 'Trip #12' },
]

const EXPENSE_EMOJI: Record<string, string> = {
  'Diesel': '⛽', 'Ice': '🧊', 'Maintenance': '🔧',
  'Provisions': '🍱', 'Net Repair': '🕸️', 'Crew': '👥', 'Other': '📦',
}

const STATUS_CONFIG: Record<BoatStatus, { color: string; bg: string; emoji: string }> = {
  'At Sea':  { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)',  emoji: '🌊' },
  'Docked':  { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   emoji: '⚓' },
  'Repair':  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  emoji: '🔧' },
}

const fmt     = (n: number) => `₹ ${n.toLocaleString('en-IN')}`
const fmtShort= (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`
const fmtKg   = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}t` : `${n} kg`

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ boatId, boatName, status, registration, captain, crewCount }: {
  boatId: string; boatName: string; status: BoatStatus
  registration: string; captain: string; crewCount: number
}) {
  const completedTrips = MOCK_TRIPS.filter(t => t.status === 'completed')
  const seasonCatch    = completedTrips.reduce((s, t) => s + t.catchKg, 0)
  const seasonExpenses = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0)
  const avgCatchPerTrip = completedTrips.length > 0
    ? Math.round(seasonCatch / completedTrips.length)
    : 0

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['Docked']

  // Expense breakdown by category
  const expenseByCategory = MOCK_EXPENSES.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {})
  const topCategories = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 32 }}>

      {/* Status + Info card */}
      <View style={ov.infoCard}>
        <View style={ov.infoRow}>
          <Text style={ov.infoLabel}>Status</Text>
          <View style={[ov.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={ov.statusEmoji}>{cfg.emoji}</Text>
            <Text style={[ov.statusText, { color: cfg.color }]}>{status}</Text>
          </View>
        </View>
        <View style={ov.divider} />
        <View style={ov.infoRow}>
          <Text style={ov.infoLabel}>Registration</Text>
          <Text style={ov.infoVal}>{registration || '—'}</Text>
        </View>
        <View style={ov.divider} />
        <View style={ov.infoRow}>
          <Text style={ov.infoLabel}>Captain</Text>
          <Text style={ov.infoVal}>{captain || '—'}</Text>
        </View>
        <View style={ov.divider} />
        <View style={ov.infoRow}>
          <Text style={ov.infoLabel}>Crew Size</Text>
          <Text style={ov.infoVal}>{crewCount} members</Text>
        </View>
      </View>

      {/* Season summary strip */}
      <Text style={ov.sectionLabel}>SEASON 2025–26</Text>
      <View style={ov.statsStrip}>
        <View style={ov.statItem}>
          <Text style={ov.statVal}>{MOCK_TRIPS.length}</Text>
          <Text style={ov.statLabel}>Trips</Text>
        </View>
        <View style={ov.statDivider} />
        <View style={ov.statItem}>
          <Text style={[ov.statVal, { color: '#22c55e' }]}>{fmtKg(seasonCatch)}</Text>
          <Text style={ov.statLabel}>Season Catch</Text>
        </View>
        <View style={ov.statDivider} />
        <View style={ov.statItem}>
          <Text style={[ov.statVal, { color: '#f59e0b' }]}>{fmtKg(avgCatchPerTrip)}</Text>
          <Text style={ov.statLabel}>Avg / Trip</Text>
        </View>
        <View style={ov.statDivider} />
        <View style={ov.statItem}>
          <Text style={[ov.statVal, { color: '#ef4444' }]}>{fmtShort(seasonExpenses)}</Text>
          <Text style={ov.statLabel}>Expenses</Text>
        </View>
      </View>

      {/* Last trip snapshot */}
      {MOCK_TRIPS[0] && (
        <>
          <Text style={ov.sectionLabel}>CURRENT / LAST TRIP</Text>
          <View style={ov.lastTripCard}>
            <View style={ov.lastTripLeft}>
              <Text style={ov.lastTripNumber}>{MOCK_TRIPS[0].number}</Text>
              <Text style={ov.lastTripDate}>📅 Departed: {MOCK_TRIPS[0].departure}</Text>
              {MOCK_TRIPS[0].returnDate && (
                <Text style={ov.lastTripDate}>🏁 Returned: {MOCK_TRIPS[0].returnDate}</Text>
              )}
              {MOCK_TRIPS[0].status === 'at_sea' && (
                <View style={ov.livePill}>
                  <Text style={ov.liveText}>🔴 Live · {MOCK_TRIPS[0].daysAtSea} days at sea</Text>
                </View>
              )}
            </View>
            <View style={ov.lastTripRight}>
              {MOCK_TRIPS[0].status === 'completed' ? (
                <>
                  <Text style={ov.lastTripCatch}>{fmtKg(MOCK_TRIPS[0].catchKg)}</Text>
                  <Text style={ov.lastTripCatchLabel}>Catch</Text>
                </>
              ) : (
                <>
                  <Text style={ov.lastTripCatch}>—</Text>
                  <Text style={ov.lastTripCatchLabel}>At Sea</Text>
                </>
              )}
            </View>
          </View>
        </>
      )}

      {/* Expense breakdown */}
      <Text style={ov.sectionLabel}>EXPENSE BREAKDOWN</Text>
      <View style={ov.expenseCard}>
        {topCategories.map(([cat, amt]) => (
          <View key={cat} style={ov.expenseRow}>
            <Text style={ov.expenseCatEmoji}>{EXPENSE_EMOJI[cat] ?? '📦'}</Text>
            <Text style={ov.expenseCat}>{cat}</Text>
            <View style={ov.expenseBarTrack}>
              <View style={[ov.expenseBarFill, {
                width: `${(amt / seasonExpenses) * 100}%` as any
              }]} />
            </View>
            <Text style={ov.expenseAmt}>{fmtShort(amt)}</Text>
          </View>
        ))}
        <View style={ov.expenseTotalRow}>
          <Text style={ov.expenseTotalLabel}>Total</Text>
          <Text style={ov.expenseTotalVal}>{fmt(seasonExpenses)}</Text>
        </View>
      </View>

      {/* Quick actions */}
      <Text style={ov.sectionLabel}>QUICK ACTIONS</Text>
      <View style={ov.actionGrid}>
        {[
          { emoji: '⚖️', label: 'Start Tali',  onPress: () => router.push({ pathname: '/tali', params: { boatId, boatName } }) },
          { emoji: '💸', label: 'Add Expense', onPress: () => {} },
          { emoji: '👥', label: 'Crew',        onPress: () => router.push({ pathname: '/crew', params: { boatId, boatName } }) },
          { emoji: '📊', label: 'Ledger',      onPress: () => router.push('/ledger' as any) },
        ].map(a => (
          <TouchableOpacity key={a.label} style={ov.actionBtn} onPress={a.onPress} activeOpacity={0.75}>
            <Text style={ov.actionEmoji}>{a.emoji}</Text>
            <Text style={ov.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRIPS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function TripsTab({ boatName }: { boatName: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 32 }}>
      <View style={tr.summaryRow}>
        <Text style={tr.summaryText}>
          {MOCK_TRIPS.length} trips · {MOCK_TRIPS.filter(t => t.status === 'completed').length} completed
        </Text>
      </View>
      {MOCK_TRIPS.map(trip => {
        const isAtSea = trip.status === 'at_sea'
        return (
          <View key={trip.id} style={tr.card}>
            <View style={tr.cardTop}>
              <View>
                <Text style={tr.tripNumber}>{trip.number}</Text>
                <Text style={tr.tripDate}>📅 {trip.departure}
                  {trip.returnDate ? ` → ${trip.returnDate}` : ''}
                </Text>
              </View>
              <View style={[tr.badge,
                isAtSea
                  ? { backgroundColor: 'rgba(34,211,238,0.12)' }
                  : { backgroundColor: 'rgba(34,197,94,0.12)' }
              ]}>
                <Text style={[tr.badgeText, { color: isAtSea ? '#22d3ee' : '#22c55e' }]}>
                  {isAtSea ? '🌊 At Sea' : '✅ Done'}
                </Text>
              </View>
            </View>
            <View style={tr.cardStats}>
              <View style={tr.statItem}>
                <Text style={tr.statVal}>{trip.daysAtSea > 0 ? `${trip.daysAtSea}d` : '—'}</Text>
                <Text style={tr.statLabel}>Duration</Text>
              </View>
              <View style={tr.statDivider} />
              <View style={tr.statItem}>
                <Text style={[tr.statVal, { color: '#22c55e' }]}>
                  {isAtSea ? '—' : fmtKg(trip.catchKg)}
                </Text>
                <Text style={tr.statLabel}>Catch</Text>
              </View>
              <View style={tr.statDivider} />
              <View style={tr.statItem}>
                <Text style={[tr.statVal, { color: '#ef4444' }]}>{fmtShort(trip.expenses)}</Text>
                <Text style={tr.statLabel}>Expenses</Text>
              </View>
            </View>
            <View style={tr.cardActions}>
              <TouchableOpacity style={tr.actionBtn}
                onPress={() => router.push({ pathname: '/tali', params: { boatName } })}>
                <Text style={tr.actionText}>⚖️ Tali</Text>
              </TouchableOpacity>
              <TouchableOpacity style={tr.actionBtn}>
                <Text style={tr.actionText}>💸 Expenses</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREW TAB
// ═══════════════════════════════════════════════════════════════════════════════
function CrewTab({ boatId, boatName }: { boatId: string; boatName: string }) {
  const active = MOCK_CREW.filter(c => c.status === 'active')
  const left   = MOCK_CREW.filter(c => c.status === 'left')
  const totalBahano = active.reduce((s, c) => s + c.bahano, 0)

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 32 }}>
      {/* Summary */}
      <View style={cr.summaryCard}>
        <View style={cr.summaryItem}>
          <Text style={cr.summaryVal}>{active.length}</Text>
          <Text style={cr.summaryLabel}>Active Crew</Text>
        </View>
        <View style={cr.summaryDivider} />
        <View style={cr.summaryItem}>
          <Text style={[cr.summaryVal, { color: '#f59e0b' }]}>{fmt(totalBahano)}</Text>
          <Text style={cr.summaryLabel}>Total Advance</Text>
        </View>
        <View style={cr.summaryDivider} />
        <View style={cr.summaryItem}>
          <Text style={[cr.summaryVal, { color: '#94a3b8' }]}>{left.length}</Text>
          <Text style={cr.summaryLabel}>Left</Text>
        </View>
      </View>

      {/* View full crew screen */}
      <TouchableOpacity
        style={cr.viewAllBtn}
        onPress={() => router.push({ pathname: '/crew', params: { boatId, boatName } })}
      >
        <Text style={cr.viewAllText}>👥  View Full Kharchi Screen →</Text>
      </TouchableOpacity>

      {/* Active crew */}
      <Text style={cr.sectionLabel}>ACTIVE</Text>
      {active.map(member => (
        <TouchableOpacity
          key={member.id}
          style={cr.memberCard}
          activeOpacity={0.75}
          onPress={() => router.push({
            pathname: '/crew-detail',
            params: { memberId: member.id, memberName: member.name, memberRole: member.role, boatId, boatName }
          })}
        >
          <View style={cr.memberAvatar}>
            <Text style={cr.memberAvatarEmoji}>👤</Text>
          </View>
          <View style={cr.memberInfo}>
            <Text style={cr.memberName}>{member.name}</Text>
            <Text style={cr.memberRole}>{member.role}</Text>
          </View>
          <View style={cr.memberRight}>
            <Text style={cr.memberBahano}>{fmt(member.bahano)}</Text>
            <Text style={cr.memberBahanoLabel}>Advance</Text>
          </View>
          <Text style={cr.memberArrow}>›</Text>
        </TouchableOpacity>
      ))}

      {/* Left crew */}
      {left.length > 0 && (
        <>
          <Text style={[cr.sectionLabel, { color: '#94a3b8' }]}>LEFT</Text>
          {left.map(member => (
            <View key={member.id} style={[cr.memberCard, cr.memberCardLeft]}>
              <View style={cr.memberAvatar}>
                <Text style={cr.memberAvatarEmoji}>👤</Text>
              </View>
              <View style={cr.memberInfo}>
                <Text style={[cr.memberName, { color: '#64748b' }]}>{member.name}</Text>
                <Text style={cr.memberRole}>{member.role}</Text>
              </View>
              <View style={cr.memberRight}>
                <Text style={[cr.memberBahano, { color: '#64748b' }]}>{fmt(member.bahano)}</Text>
                <Text style={cr.memberBahanoLabel}>Advance</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPENSES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ExpensesTab() {
  const total = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0)

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 32 }}>
      {/* Total */}
      <View style={ex.totalCard}>
        <Text style={ex.totalLabel}>TOTAL EXPENSES</Text>
        <Text style={ex.totalVal}>{fmt(total)}</Text>
        <Text style={ex.totalSub}>{MOCK_EXPENSES.length} entries this season</Text>
      </View>

      {/* Add expense */}
      <TouchableOpacity style={ex.addBtn}>
        <Text style={ex.addBtnText}>+ Add Expense</Text>
      </TouchableOpacity>

      {/* Expense list */}
      {MOCK_EXPENSES.map(exp => (
        <View key={exp.id} style={ex.expCard}>
          <View style={[ex.expIcon, { backgroundColor: theme.colors.elevated }]}>
            <Text style={ex.expEmoji}>{EXPENSE_EMOJI[exp.category] ?? '📦'}</Text>
          </View>
          <View style={ex.expBody}>
            <Text style={ex.expDesc}>{exp.description}</Text>
            <View style={ex.expMeta}>
              <Text style={ex.expCat}>{exp.category}</Text>
              {exp.trip && <Text style={ex.expTrip}>· {exp.trip}</Text>}
              <Text style={ex.expDate}>· {exp.date}</Text>
            </View>
          </View>
          <Text style={ex.expAmount}>{fmtShort(exp.amount)}</Text>
        </View>
      ))}
    </ScrollView>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function BoatDetailScreen() {
  const {
    boatId, boatName, boatNameGujarati, registration,
    status, captain, crewCount, seasonCatch, expenses,
  } = useLocalSearchParams<{
    boatId: string
    boatName: string
    boatNameGujarati?: string
    registration?: string
    status?: string
    captain?: string
    crewCount?: string
    seasonCatch?: string
    expenses?: string
  }>()

  const [activeTab, setActiveTab] = useState<DetailTab>('overview')

  // boats.tsx sends raw status: 'active' | 'docked' | 'maintenance'
  // Map to display status used in this screen
  const STATUS_MAP: Record<string, BoatStatus> = {
    active:      'At Sea',
    docked:      'Docked',
    maintenance: 'Repair',
    // also accept the display values directly in case they're passed that way
    'At Sea':    'At Sea',
    'Docked':    'Docked',
    'Repair':    'Repair',
  }
  const boatStatus   = STATUS_MAP[status ?? ''] ?? 'Docked'
  const cfg          = STATUS_CONFIG[boatStatus] ?? STATUS_CONFIG['Docked']

  const TABS: { id: DetailTab; label: string; emoji: string }[] = [
    { id: 'overview',  label: 'Overview',  emoji: '📊' },
    { id: 'trips',     label: 'Trips',     emoji: '🗺️' },
    { id: 'crew',      label: 'Crew',      emoji: '👥' },
    { id: 'expenses',  label: 'Expenses',  emoji: '💸' },
  ]

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.canGoBack() ? router.back() : null}
          activeOpacity={0.7}
        >
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{boatName ?? 'Boat'}</Text>
          {boatNameGujarati
            ? <Text style={s.headerSub}>{boatNameGujarati}</Text>
            : registration
              ? <Text style={s.headerSub}>{registration}</Text>
              : null
          }
        </View>
        <TouchableOpacity
          style={s.editBtn}
          onPress={() => {/* TODO: open edit boat modal */}}
          activeOpacity={0.7}
        >
          <Text style={s.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* ── Boat hero card ── */}
      <View style={s.heroCard}>
        <View style={s.heroLeft}>
          <View style={s.heroAvatar}>
            <Text style={s.heroEmoji}>⛵</Text>
          </View>
          <View>
            <Text style={s.heroName}>{boatName}</Text>
            {boatNameGujarati && <Text style={s.heroGujarati}>{boatNameGujarati}</Text>}
            <Text style={s.heroReg}>{registration ?? 'No registration'}</Text>
          </View>
        </View>
        <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={s.statusEmoji}>{cfg.emoji}</Text>
          <Text style={[s.statusText, { color: cfg.color }]}>{boatStatus}</Text>
        </View>
      </View>

      {/* ── Tabs ── */}
      <View style={s.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[s.tab, activeTab === tab.id && s.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={s.tabEmoji}>{tab.emoji}</Text>
            <Text style={[s.tabLabel, activeTab === tab.id && s.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Tab content ── */}
      <View style={s.tabContent}>
        {activeTab === 'overview' && (
          <OverviewTab
            boatId={boatId ?? ''}
            boatName={boatName ?? ''}
            status={boatStatus}
            registration={registration ?? ''}
            captain={captain ?? 'Suraj Tandel'}
            crewCount={Number(crewCount) || 8}
          />
        )}
        {activeTab === 'trips'    && <TripsTab    boatName={boatName ?? ''} />}
        {activeTab === 'crew'     && <CrewTab     boatId={boatId ?? ''} boatName={boatName ?? ''} />}
        {activeTab === 'expenses' && <ExpensesTab />}
      </View>

    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES — Screen shell
// ═══════════════════════════════════════════════════════════════════════════════
const BG   = theme.colors.background
const SURF = theme.colors.surface
const ELEV = theme.colors.elevated
const BOR  = theme.colors.border
const TP   = theme.colors.textPrimary
const TS   = theme.colors.textSecondary
const TEAL = theme.colors.primary

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: BG },

  header:       { flexDirection: 'row', alignItems: 'center', backgroundColor: TEAL, paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backText:     { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  editBtn:      { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  editBtnText:  { color: '#fff', fontSize: 13, fontWeight: '700' },

  heroCard:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: SURF, margin: 12, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: BOR },
  heroLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroAvatar:   { width: 56, height: 56, borderRadius: 28, backgroundColor: TEAL + '20', alignItems: 'center', justifyContent: 'center' },
  heroEmoji:    { fontSize: 28 },
  heroName:     { fontSize: 17, fontWeight: '800', color: TP },
  heroGujarati: { fontSize: 13, color: TS, marginTop: 2 },
  heroReg:      { fontSize: 12, color: TEAL, marginTop: 2, fontWeight: '600' },
  statusBadge:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 5 },
  statusEmoji:  { fontSize: 13 },
  statusText:   { fontSize: 13, fontWeight: '700' },

  tabRow:       { flexDirection: 'row', backgroundColor: SURF, borderBottomWidth: 1, borderBottomColor: BOR },
  tab:          { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 11, gap: 2 },
  tabActive:    { borderBottomWidth: 2.5, borderBottomColor: TEAL },
  tabEmoji:     { fontSize: 14 },
  tabLabel:     { fontSize: 11, fontWeight: '600', color: TS },
  tabLabelActive:{ color: TEAL, fontWeight: '800' },

  tabContent:   { flex: 1, paddingHorizontal: 12, paddingTop: 12 },
})

// ── Overview styles ────────────────────────────────────────────────────────────
const ov = StyleSheet.create({
  sectionLabel:     { fontSize: 11, fontWeight: '700', color: TEAL, letterSpacing: 0.8 },

  infoCard:         { backgroundColor: SURF, borderRadius: 14, borderWidth: 1, borderColor: BOR, overflow: 'hidden' },
  infoRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  infoLabel:        { fontSize: 13, color: TS },
  infoVal:          { fontSize: 13, fontWeight: '700', color: TP },
  divider:          { height: 1, backgroundColor: BOR, marginHorizontal: 16 },
  statusBadge:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5 },
  statusEmoji:      { fontSize: 12 },
  statusText:       { fontSize: 12, fontWeight: '700' },

  statsStrip:       { flexDirection: 'row', backgroundColor: SURF, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: BOR },
  statItem:         { flex: 1, alignItems: 'center', gap: 3 },
  statVal:          { fontSize: 16, fontWeight: '800', color: TP },
  statLabel:        { fontSize: 10, color: TS },
  statDivider:      { width: 1, backgroundColor: BOR, marginVertical: 4 },

  lastTripCard:     { backgroundColor: SURF, borderRadius: 14, padding: 14, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: BOR },
  lastTripLeft:     { gap: 5, flex: 1 },
  lastTripNumber:   { fontSize: 15, fontWeight: '800', color: TP },
  lastTripDate:     { fontSize: 12, color: TS },
  livePill:         { backgroundColor: 'rgba(239,68,68,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 },
  liveText:         { fontSize: 11, color: '#ef4444', fontWeight: '700' },
  lastTripRight:    { alignItems: 'flex-end', justifyContent: 'center', gap: 4 },
  lastTripCatch:    { fontSize: 20, fontWeight: '800', color: '#22c55e' },
  lastTripCatchLabel: { fontSize: 11, color: TS },

  expenseCard:      { backgroundColor: SURF, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BOR, gap: 10 },
  expenseRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expenseCatEmoji:  { fontSize: 16, width: 22 },
  expenseCat:       { width: 90, fontSize: 12, color: TS },
  expenseBarTrack:  { flex: 1, height: 6, backgroundColor: BOR, borderRadius: 3, overflow: 'hidden' },
  expenseBarFill:   { height: '100%', backgroundColor: TEAL, borderRadius: 3 },
  expenseAmt:       { width: 52, fontSize: 12, fontWeight: '700', color: TP, textAlign: 'right' },
  expenseTotalRow:  { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: BOR, paddingTop: 8, marginTop: 2 },
  expenseTotalLabel:{ fontSize: 13, fontWeight: '700', color: TP },
  expenseTotalVal:  { fontSize: 13, fontWeight: '800', color: '#ef4444' },

  actionGrid:       { flexDirection: 'row', gap: 10 },
  actionBtn:        { flex: 1, backgroundColor: SURF, borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: BOR },
  actionEmoji:      { fontSize: 22 },
  actionLabel:      { fontSize: 11, fontWeight: '700', color: TP },
})

// ── Trips tab styles ───────────────────────────────────────────────────────────
const tr = StyleSheet.create({
  summaryRow:   { flexDirection: 'row' },
  summaryText:  { fontSize: 12, color: TS },
  card:         { backgroundColor: SURF, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BOR, gap: 10 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tripNumber:   { fontSize: 15, fontWeight: '800', color: TP, marginBottom: 3 },
  tripDate:     { fontSize: 12, color: TS },
  badge:        { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText:    { fontSize: 12, fontWeight: '700' },
  cardStats:    { flexDirection: 'row', backgroundColor: ELEV, borderRadius: 10, paddingVertical: 10 },
  statItem:     { flex: 1, alignItems: 'center', gap: 2 },
  statVal:      { fontSize: 13, fontWeight: '700', color: TP },
  statLabel:    { fontSize: 10, color: TS },
  statDivider:  { width: 1, backgroundColor: BOR, marginVertical: 4 },
  cardActions:  { flexDirection: 'row', gap: 8 },
  actionBtn:    { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: ELEV, borderRadius: 20, borderWidth: 1, borderColor: BOR },
  actionText:   { fontSize: 12, color: TS, fontWeight: '600' },
})

// ── Crew tab styles ────────────────────────────────────────────────────────────
const cr = StyleSheet.create({
  summaryCard:    { flexDirection: 'row', backgroundColor: SURF, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: BOR },
  summaryItem:    { flex: 1, alignItems: 'center', gap: 3 },
  summaryVal:     { fontSize: 18, fontWeight: '800', color: TP },
  summaryLabel:   { fontSize: 10, color: TS },
  summaryDivider: { width: 1, backgroundColor: BOR, marginVertical: 6 },

  viewAllBtn:     { backgroundColor: TEAL + '15', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: TEAL + '40' },
  viewAllText:    { color: TEAL, fontWeight: '700', fontSize: 14 },

  sectionLabel:   { fontSize: 11, fontWeight: '700', color: TEAL, letterSpacing: 0.8 },

  memberCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: SURF, borderRadius: 12, padding: 12, gap: 10, borderWidth: 1, borderColor: BOR },
  memberCardLeft: { opacity: 0.55 },
  memberAvatar:   { width: 40, height: 40, borderRadius: 20, backgroundColor: ELEV, alignItems: 'center', justifyContent: 'center' },
  memberAvatarEmoji: { fontSize: 19 },
  memberInfo:     { flex: 1 },
  memberName:     { fontSize: 14, fontWeight: '700', color: TP },
  memberRole:     { fontSize: 12, color: TS, marginTop: 2 },
  memberRight:    { alignItems: 'flex-end' },
  memberBahano:   { fontSize: 14, fontWeight: '700', color: TEAL },
  memberBahanoLabel: { fontSize: 10, color: TS, marginTop: 2 },
  memberArrow:    { fontSize: 20, color: TS, marginLeft: 4 },
})

// ── Expenses tab styles ────────────────────────────────────────────────────────
const ex = StyleSheet.create({
  totalCard:     { backgroundColor: TEAL + '18', borderRadius: 14, padding: 16, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: TEAL + '30' },
  totalLabel:    { fontSize: 11, fontWeight: '700', color: TEAL, letterSpacing: 0.8 },
  totalVal:      { fontSize: 28, fontWeight: '800', color: '#ef4444' },
  totalSub:      { fontSize: 12, color: TS },

  addBtn:        { backgroundColor: SURF, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderColor: TEAL + '50' },
  addBtnText:    { color: TEAL, fontWeight: '700', fontSize: 14 },

  expCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: SURF, borderRadius: 12, padding: 12, gap: 10, borderWidth: 1, borderColor: BOR },
  expIcon:       { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  expEmoji:      { fontSize: 19 },
  expBody:       { flex: 1, gap: 4 },
  expDesc:       { fontSize: 13, fontWeight: '700', color: TP },
  expMeta:       { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  expCat:        { fontSize: 11, color: TS },
  expTrip:       { fontSize: 11, color: TEAL },
  expDate:       { fontSize: 11, color: TS },
  expAmount:     { fontSize: 14, fontWeight: '800', color: '#ef4444' },
})