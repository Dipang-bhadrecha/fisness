import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../constants/theme'

// ── Temp data — replace with API: GET /api/v1/crew/:memberId ─────────────────
const TEMP_MEMBER = {
  id: '1',
  name: 'Suraj Tandel',
  role: 'Pilot / Captain',
  aadhaar: '1234 5678 9011',
  phone: '98765 43210',
  joiningDate: '03 Jul 2026',
  bahano: 30000,
  fixedSalary: 15000,
  attendedDays: 18,
  totalDaysJoined: 180,
  tripsCompleted: 12,
  pagar: 9000,
  projectedSalary: 90000,
  upad: 41000,
  baaki: -32000,
  boat: 'Alpha',
  status: 'active' as 'active' | 'left',
}

const TEMP_KHARCHI_HISTORY = [
  { id: '1', date: '03 Jul 2026', amount: 5000,  reason: 'Joining Advance', givenBy: 'Rohan',  trip: 'Trip #1' },
  { id: '2', date: '10 Jul 2026', amount: 2000,  reason: 'Medicine',        givenBy: 'Vanraj', trip: 'Trip #1' },
  { id: '3', date: '18 Jul 2026', amount: 8000,  reason: 'Advance',         givenBy: 'Rohan',  trip: 'Trip #2' },
  { id: '4', date: '25 Jul 2026', amount: 3000,  reason: 'Food & Travel',   givenBy: 'Rohan',  trip: 'Trip #2' },
  { id: '5', date: '01 Aug 2026', amount: 10000, reason: 'Advance',         givenBy: 'Vanraj', trip: 'Trip #3' },
  { id: '6', date: '14 Aug 2026', amount: 8000,  reason: 'Personal need',   givenBy: 'Rohan',  trip: 'Trip #3' },
  { id: '7', date: '20 Aug 2026', amount: 5000,  reason: 'Advance',         givenBy: 'Rohan',  trip: 'Trip #4' },
]

const fmt = (n?: number) => n ? `₹ ${n.toLocaleString('en-IN')}` : '₹ 0'

// ── Settle Season Confirmation Modal ─────────────────────────────────────────
function SettleModal({
  member,
  onClose,
  onConfirm,
}: {
  member: typeof TEMP_MEMBER
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={[m.sheet, { paddingBottom: 30 }]}>
          <View style={m.sheetHandle} />
          <Text style={m.sheetTitle}>Settle Season?</Text>
          <Text style={m.sheetSub}>Final payment for {member.name}</Text>

          <View style={settle.row}>
            <Text style={settle.label}>Total Salary Earned</Text>
            <Text style={settle.val}>{fmt(member.pagar)}</Text>
          </View>
          <View style={settle.row}>
            <Text style={settle.label}>Total Kharchi Given</Text>
            <Text style={[settle.val, { color: theme.colors.danger }]}>− {fmt(member.upad)}</Text>
          </View>
          <View style={settle.divider} />
          <View style={settle.row}>
            <Text style={[settle.label, { fontWeight: '800', color: theme.colors.textInverse }]}>Pay Now</Text>
            <Text style={[settle.val, { color: theme.colors.success, fontSize: 20, fontWeight: '800' }]}>
              {fmt(member.baaki)}
            </Text>
          </View>

          <View style={m.btnRow}>
            <TouchableOpacity style={m.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={m.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={m.saveBtn} onPress={onConfirm} activeOpacity={0.85}>
              <Text style={m.saveText}>Confirm Settlement</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function CrewDetailScreen() {
  const { memberId, memberName, memberRole, boatId, boatName } =
    useLocalSearchParams<{
      memberId: string
      memberName: string
      memberRole: string
      boatId: string
      boatName: string
    }>()

  const [activeTab, setActiveTab]     = useState<'summary' | 'history'>('summary')
  const [settleVisible, setSettleVisible] = useState(false)

  // Replace with: useMember(memberId)
  const member  = TEMP_MEMBER
  const history = TEMP_KHARCHI_HISTORY

  const handleSettleConfirm = () => {
    // TODO: POST /api/v1/crew/:memberId/settle
    console.log('Settle season for:', memberId)
    setSettleVisible(false)
  }

  const displayName = memberName ?? member.name
  const displayRole = memberRole ?? member.role
  const displayBoat = boatName   ?? member.boat

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>

      {/* ── Header ───────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.canGoBack() ? router.back() : null}
          activeOpacity={0.7}
        >
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{displayName}</Text>
          <Text style={s.headerSub}>{displayBoat} · {displayRole}</Text>
        </View>
        <TouchableOpacity style={s.editBtn} activeOpacity={0.7}>
          <Text style={s.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* ── Profile Card ─────────────────────────────────────── */}
      <View style={s.profileCard}>
        <View style={s.avatarCircle}>
          <Text style={s.avatarEmoji}>👤</Text>
        </View>
        <View style={s.profileInfo}>
          <Text style={s.profileName}>{displayName}</Text>
          <Text style={s.profileRole}>{displayRole}</Text>
          <Text style={s.profileDetail}>📱 {member.phone}</Text>
          <Text style={s.profileDetail}>🪪 {member.aadhaar}</Text>
          <Text style={s.profileDetail}>📅 Joined {member.joiningDate}</Text>
        </View>
        <View style={[s.statusBadge, member.status === 'active' ? s.statusActive : s.statusLeft]}>
          <Text style={s.statusText}>
            {member.status === 'active' ? 'Active' : 'Left'}
          </Text>
        </View>
      </View>

      {/* ── Financial Strip ──────────────────────────────────── */}
      <View style={s.finStrip}>
        <View style={s.finItem}>
          <Text style={s.finLabel}>Bahano</Text>
          <Text style={[s.finValue, { color: theme.colors.warning }]}>{fmt(member.bahano)}</Text>
          <Text style={s.finSub}>Season Advance</Text>
        </View>
        <View style={s.finDivider} />
        <View style={s.finItem}>
          <Text style={s.finLabel}>Pagar</Text>
          <Text style={s.finValue}>{fmt(member.pagar)}</Text>
          <Text style={s.finSub}>{member.attendedDays}d / 30d</Text>
        </View>
        <View style={s.finDivider} />
        <View style={s.finItem}>
          <Text style={s.finLabel}>Upad</Text>
          <Text style={[s.finValue, { color: theme.colors.danger }]}>{fmt(member.upad)}</Text>
          <Text style={s.finSub}>Total given</Text>
        </View>
        <View style={s.finDivider} />
        <View style={s.finItem}>
          <Text style={s.finLabel}>Baaki</Text>
          <Text style={[s.finValue, { color: theme.colors.success }]}>{fmt(member.baaki)}</Text>
          <Text style={s.finSub}>Still owed</Text>
        </View>
      </View>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <View style={s.tabBar}>
        <TouchableOpacity
          style={[s.tab, activeTab === 'summary' && s.tabActive]}
          onPress={() => setActiveTab('summary')}
          activeOpacity={0.8}
        >
          <Text style={[s.tabText, activeTab === 'summary' && s.tabTextActive]}>
            Summary
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, activeTab === 'history' && s.tabActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.8}
        >
          <Text style={[s.tabText, activeTab === 'history' && s.tabTextActive]}>
            Kharchi History
          </Text>
          <View style={s.countBadge}>
            <Text style={s.countBadgeText}>{history.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Content ───────────────────────────────── */}
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'summary' ? (
          <>
            {/* Salary Calculation */}
            <Text style={s.sectionTitle}>SALARY CALCULATION</Text>
            <View style={s.salaryCard}>
              <View style={s.salaryRow}>
                <Text style={s.salaryLabel}>Fixed Salary</Text>
                <Text style={s.salaryValue}>{fmt(member.fixedSalary)} / 30d</Text>
              </View>
              <View style={s.salaryRow}>
                <Text style={s.salaryLabel}>Days Attended</Text>
                <Text style={s.salaryValue}>{member.attendedDays} days</Text>
              </View>
              <View style={[s.salaryRow, { marginTop: 4 }]}>
                <Text style={[s.salaryLabel, { fontWeight: '700', color: theme.colors.textPrimary }]}>
                  Current Month Salary
                </Text>
                <Text style={[s.salaryValue, { color: theme.colors.primary, fontWeight: '800' }]}>
                  {fmt(member.pagar)}
                </Text>
              </View>
            </View>

            {/* Tenure & Projection */}
            <Text style={s.sectionTitle}>TENURE & PROJECTION</Text>
            <View style={s.salaryCard}>
              <View style={s.salaryRow}>
                <Text style={s.salaryLabel}>Trips Completed</Text>
                <Text style={s.salaryValue}>{member.tripsCompleted} trips</Text>
              </View>
              <View style={s.salaryRow}>
                <Text style={s.salaryLabel}>Total Days Joined</Text>
                <Text style={s.salaryValue}>{member.totalDaysJoined} days (~6 months)</Text>
              </View>
            </View>

            {/* Summary Stats */}
            <Text style={s.sectionTitle}>SEASON SUMMARY</Text>
            <View style={s.summaryRow}>
              <View style={s.summaryCard}>
                <Text style={s.summaryEmoji}>📅</Text>
                <Text style={s.summaryNum}>{member.totalDaysJoined}d</Text>
                <Text style={s.summarySub}>Days this season</Text>
              </View>
              <View style={s.summaryCard}>
                <Text style={s.summaryEmoji}>🚢</Text>
                <Text style={s.summaryNum}>{member.tripsCompleted}</Text>
                <Text style={s.summarySub}>Trips done</Text>
              </View>
              <View style={s.summaryCard}>
                <Text style={s.summaryEmoji}>💸</Text>
                <Text style={s.summaryNum}>{history.length}</Text>
                <Text style={s.summarySub}>Kharchi entries</Text>
              </View>
              <View style={s.summaryCard}>
                <Text style={s.summaryEmoji}>💰</Text>
                <Text style={s.summaryNum}>{fmt(member.upad)}</Text>
                <Text style={s.summarySub}>Total given</Text>
              </View>
            </View>

            {/* Settlement Preview */}
            <Text style={s.sectionTitle}>SETTLEMENT PREVIEW</Text>
            <View style={s.settlementCard}>
              <View style={s.settleRow}>
                <Text style={s.settleLabel}>Season Advance (Bahano)</Text>
                <Text style={[s.settleValue, { color: theme.colors.warning }]}>
                  − {fmt(member.bahano)}
                </Text>
              </View>
              <View style={s.settleRow}>
                <Text style={s.settleLabel}>Total Salary Earned</Text>
                <Text style={s.settleValue}>{fmt(member.pagar)}</Text>
              </View>
              <View style={s.settleRow}>
                <Text style={s.settleLabel}>Total Kharchi Given</Text>
                <Text style={[s.settleValue, { color: theme.colors.danger }]}>
                  − {fmt(member.upad)}
                </Text>
              </View>
              <View style={s.settleLine} />
              <View style={s.settleRow}>
                <Text style={[s.settleLabel, { fontWeight: '800', color: theme.colors.textPrimary }]}>
                  Balance to Pay
                </Text>
                <Text style={[s.settleValue, { color: theme.colors.success, fontSize: 18, fontWeight: '800' }]}>
                  {fmt(member.baaki)}
                </Text>
              </View>
              <TouchableOpacity
                style={s.settleBtn}
                onPress={() => setSettleVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={s.settleBtnText}>Mark Season as Settled</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* History Total */}
            <View style={s.historyTotalRow}>
              <Text style={s.historyTotalLabel}>Total given</Text>
              <Text style={s.historyTotalValue}>{fmt(member.upad)}</Text>
            </View>

            {/* Kharchi Entries */}
            {history.map((entry) => (
              <View key={entry.id} style={s.historyCard}>
                <View style={s.historyLeft}>
                  <Text style={s.historyDate}>{entry.date}</Text>
                  <Text style={s.historyTrip}>{entry.trip}</Text>
                  <Text style={s.historyBy}>given by {entry.givenBy}</Text>
                </View>
                <View style={s.historyRight}>
                  <Text style={s.historyAmount}>{fmt(entry.amount)}</Text>
                  <Text style={s.historyReason}>{entry.reason}</Text>
                </View>
              </View>
            ))}
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Modals ────────────────────────────────────────────── */}
      {settleVisible && (
        <SettleModal
          member={member}
          onClose={() => setSettleVisible(false)}
          onConfirm={handleSettleConfirm}
        />
      )}
    </SafeAreaView>
  )
}

// ── Main Styles ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: theme.colors.textInverse, fontSize: 18, fontWeight: '700' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.textInverse },
  headerSub: { fontSize: 12, color: theme.colors.textInverse, marginTop: 2 },
  editBtn: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  editBtnText: { color: theme.colors.textInverse, fontSize: 13, fontWeight: '700' },

  // Profile Card
  profileCard: {
    backgroundColor: theme.colors.surface, margin: 12, borderRadius: 16,
    padding: 14, flexDirection: 'row', gap: 12,
    borderWidth: 1, borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 30 },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary },
  profileRole: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 2 },
  profileDetail: { fontSize: 11, color: theme.colors.textSecondary },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  statusActive: {
    backgroundColor: 'rgba(29,209,161,0.15)',
    borderWidth: 1, borderColor: theme.colors.primaryDark,
  },
  statusLeft: {
    backgroundColor: 'rgba(224,123,84,0.15)',
    borderWidth: 1, borderColor: theme.colors.danger,
  },
  statusText: { fontSize: 11, fontWeight: '700', color: theme.colors.textPrimary },

  // Financial Strip
  finStrip: {
    backgroundColor: theme.colors.primaryDark,
    marginHorizontal: 12, borderRadius: 16,
    flexDirection: 'row', paddingVertical: 14,
  },
  finItem: { flex: 1, alignItems: 'center', gap: 3 },
  finLabel: { fontSize: 10, color: theme.colors.textInverse, fontWeight: '600' },
  finValue: { fontSize: 15, fontWeight: '800', color: theme.colors.textInverse },
  finSub:   { fontSize: 10, color: theme.colors.textSecondary, textAlign: 'center' },
  finDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 4 },

  // Tabs
  tabBar: {
    flexDirection: 'row', marginHorizontal: 12, marginTop: 12,
    backgroundColor: theme.colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden',
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  tabActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  tabTextActive: { color: theme.colors.textInverse },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2,
  },
  countBadgeText: { fontSize: 11, fontWeight: '700', color: theme.colors.textInverse },

  // Scroll Content
  scrollContent: { padding: 12, gap: 12 },

  // Section Title
  sectionTitle: {
    fontSize: 11, fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 0.5, marginTop: 4,
  },

  // Salary Card
  salaryCard: {
    backgroundColor: theme.colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: theme.colors.border,
    padding: 14, gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  salaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  salaryLabel: { fontSize: 13, color: theme.colors.textSecondary },
  salaryValue: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },

  // Summary Row
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: {
    flex: 1, backgroundColor: theme.colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: theme.colors.border,
    padding: 10, alignItems: 'center', gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryEmoji: { fontSize: 20 },
  summaryNum:   { fontSize: 13, fontWeight: '800', color: theme.colors.textPrimary },
  summarySub:   { fontSize: 10, color: theme.colors.textSecondary, textAlign: 'center' },

  // Settlement Card
  settlementCard: {
    backgroundColor: theme.colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: theme.colors.border,
    padding: 14, gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  settleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settleLabel: { fontSize: 13, color: theme.colors.textSecondary },
  settleValue: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary },
  settleLine:  { height: 1, backgroundColor: theme.colors.border },
  settleBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 12,
    paddingVertical: 13, alignItems: 'center', marginTop: 4,
  },
  settleBtnText: { color: theme.colors.textInverse, fontSize: 14, fontWeight: '700' },

  // Kharchi History
  historyTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  historyTotalLabel: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
  historyTotalValue: { fontSize: 15, fontWeight: '800', color: theme.colors.textPrimary },
  historyCard: {
    backgroundColor: theme.colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: theme.colors.border,
    padding: 14, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  historyLeft:  { gap: 3 },
  historyRight: { alignItems: 'flex-end', gap: 3 },
  historyDate:   { fontSize: 12, fontWeight: '700', color: theme.colors.textPrimary },
  historyTrip:   { fontSize: 11, color: theme.colors.primary, fontWeight: '600' },
  historyBy:     { fontSize: 10, color: theme.colors.textSecondary },
  historyAmount: { fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary },
  historyReason: { fontSize: 11, color: theme.colors.textSecondary },
})

// ── Modal Styles ──────────────────────────────────────────────────────────────
const m = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 44,
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: 'rgba(0,188,212,0.2)',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 4 },
  sheetSub:   { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 22 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, backgroundColor: theme.colors.background,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border,
  },
  cancelText: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: '700' },
  saveBtn: {
    flex: 2, backgroundColor: theme.colors.primary,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  saveText: { color: theme.colors.textInverse, fontSize: 15, fontWeight: '800' },
})

// ── Settle Modal Styles ───────────────────────────────────────────────────────
const settle = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  label: { fontSize: 13, color: theme.colors.textSecondary },
  val:   { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },
})