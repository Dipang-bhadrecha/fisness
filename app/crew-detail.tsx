/**
 * app/crew-detail.tsx — Crew Member Detail Screen
 *
 * Opened from: crew.tsx (tap on crew card)
 * Params: memberId, memberName, memberRole, boatId, boatName
 *
 * Shows: profile card, financial strip (Bahano/Pagar/Upad/Baaki),
 *        Summary tab + Kharchi History tab
 * Edit button → /add-crew (pre-filled edit mode)
 */

import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG     = '#080F1A'
const SURF   = '#0D1B2E'
const ELEV   = '#132640'
const BOR    = 'rgba(255,255,255,0.06)'
const BOR2   = 'rgba(255,255,255,0.10)'
const TP     = '#F0F4F8'
const TS     = '#8BA3BC'
const TM     = '#3D5A73'
const TEAL   = '#0891b2'
const GREEN  = '#059669'
const AMBER  = '#f59e0b'
const DANGER = '#ef4444'

// ─── Mock data — replace with GET /api/v1/crew/:memberId ─────────────────────
const MOCK_MEMBERS: Record<string, {
  id: string; name: string; role: string; aadhaar: string; phone: string
  joiningDate: string; bahano: number; pagar: number; attendedDays: number
  totalDaysJoined: number; tripsCompleted: number; upad: number; baaki: number
  status: 'active' | 'left'
}> = {
  '1':  { id: '1',  name: 'Suraj Tandel',   role: 'Pilot / Captain', aadhaar: '1234 5678 9011', phone: '98765 43210', joiningDate: '03 Jul 2026', bahano: 30000, pagar: 15000, attendedDays: 18, totalDaysJoined: 180, tripsCompleted: 12, upad: 41000,  baaki: -32000, status: 'active' },
  '2':  { id: '2',  name: 'Raju Makwana',   role: 'Khalasi',         aadhaar: '1234 5678 9012', phone: '98765 43211', joiningDate: '03 Jul 2026', bahano: 25000, pagar: 10000, attendedDays: 18, totalDaysJoined: 180, tripsCompleted: 12, upad: 35000,  baaki: -25000, status: 'active' },
  '3':  { id: '3',  name: 'Bharat Gohil',   role: 'Khalasi',         aadhaar: '1234 5678 9013', phone: '98765 43212', joiningDate: '03 Jul 2026', bahano: 20000, pagar: 10000, attendedDays: 18, totalDaysJoined: 180, tripsCompleted: 12, upad: 30000,  baaki: -20000, status: 'active' },
  '4':  { id: '4',  name: 'Kanji Patel',    role: 'Bhandari',        aadhaar: '1234 5678 9014', phone: '98765 43213', joiningDate: '03 Jul 2026', bahano: 15000, pagar: 9000,  attendedDays: 18, totalDaysJoined: 180, tripsCompleted: 12, upad: 25000,  baaki: -16000, status: 'active' },
  '5':  { id: '5',  name: 'Mahesh Solanki', role: 'Khalasi',         aadhaar: '1234 5678 9015', phone: '98765 43214', joiningDate: '03 Jul 2026', bahano: 18000, pagar: 10000, attendedDays: 18, totalDaysJoined: 180, tripsCompleted: 12, upad: 28000,  baaki: -18000, status: 'active' },
  '6':  { id: '6',  name: 'Dinesh Parmar',  role: 'Bhandari',        aadhaar: '1234 5678 9016', phone: '98765 43215', joiningDate: '03 Jul 2026', bahano: 12000, pagar: 9000,  attendedDays: 18, totalDaysJoined: 180, tripsCompleted: 12, upad: 22000,  baaki: -13000, status: 'active' },
  '7':  { id: '7',  name: 'Pravin Baria',   role: 'Khalasi',         aadhaar: '1234 5678 9017', phone: '98765 43216', joiningDate: '03 Jul 2026', bahano: 10000, pagar: 10000, attendedDays: 18, totalDaysJoined: 180, tripsCompleted: 12, upad: 20000,  baaki: -10000, status: 'active' },
  '8':  { id: '8',  name: 'Vijay Rathod',   role: 'Pilot / Captain', aadhaar: '9876 5432 1001', phone: '98765 43220', joiningDate: '15 Jun 2026', bahano: 28000, pagar: 15000, attendedDays: 16, totalDaysJoined: 160, tripsCompleted: 10, upad: 38000,  baaki: -23000, status: 'active' },
  '9':  { id: '9',  name: 'Amrit Chauhan',  role: 'Khalasi',         aadhaar: '9876 5432 1002', phone: '98765 43221', joiningDate: '15 Jun 2026', bahano: 22000, pagar: 10000, attendedDays: 16, totalDaysJoined: 160, tripsCompleted: 10, upad: 30000,  baaki: -20000, status: 'active' },
  '10': { id: '10', name: 'Kiran Dabhi',    role: 'Bhandari',        aadhaar: '9876 5432 1003', phone: '98765 43222', joiningDate: '15 Jun 2026', bahano: 14000, pagar: 9000,  attendedDays: 16, totalDaysJoined: 160, tripsCompleted: 10, upad: 22000,  baaki: -13000, status: 'active' },
}

const MOCK_KHARCHI: Record<string, { id: string; date: string; amount: number; reason: string; givenBy: string; trip: string }[]> = {
  '1': [
    { id: '1', date: '03 Jul 2026', amount: 5000,  reason: 'Joining Advance', givenBy: 'Rohan',  trip: 'Trip #1' },
    { id: '2', date: '10 Jul 2026', amount: 2000,  reason: 'Medicine',        givenBy: 'Vanraj', trip: 'Trip #1' },
    { id: '3', date: '18 Jul 2026', amount: 8000,  reason: 'Advance',         givenBy: 'Rohan',  trip: 'Trip #2' },
    { id: '4', date: '25 Jul 2026', amount: 3000,  reason: 'Food & Travel',   givenBy: 'Rohan',  trip: 'Trip #2' },
    { id: '5', date: '01 Aug 2026', amount: 10000, reason: 'Advance',         givenBy: 'Vanraj', trip: 'Trip #3' },
    { id: '6', date: '14 Aug 2026', amount: 8000,  reason: 'Personal need',   givenBy: 'Rohan',  trip: 'Trip #3' },
    { id: '7', date: '20 Aug 2026', amount: 5000,  reason: 'Advance',         givenBy: 'Rohan',  trip: 'Trip #4' },
  ],
}

const fmt = (n: number) => `₹ ${Math.abs(n).toLocaleString('en-IN')}`

// ─── Settle Modal ─────────────────────────────────────────────────────────────
function SettleModal({
  member, onClose, onConfirm,
}: {
  member: typeof MOCK_MEMBERS['1']
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={m.handle} />
          <Text style={m.title}>Settle Season?</Text>
          <Text style={m.sub}>Final payment for {member.name}</Text>

          <View style={m.row}>
            <Text style={m.rowLabel}>Total Salary Earned</Text>
            <Text style={m.rowVal}>{fmt(member.pagar * member.attendedDays)}</Text>
          </View>
          <View style={m.row}>
            <Text style={m.rowLabel}>Total Kharchi Given</Text>
            <Text style={[m.rowVal, { color: DANGER }]}>− {fmt(member.upad)}</Text>
          </View>
          <View style={m.divider} />
          <View style={m.row}>
            <Text style={[m.rowLabel, { fontWeight: '800', color: TP }]}>Pay Now</Text>
            <Text style={[m.rowVal, { color: GREEN, fontSize: 18, fontWeight: '800' }]}>
              {fmt(member.baaki)}
            </Text>
          </View>

          <View style={m.btnRow}>
            <TouchableOpacity style={m.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={m.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={m.confirmBtn} onPress={onConfirm} activeOpacity={0.85}>
              <Text style={m.confirmText}>Confirm Settlement</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const m = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: SURF, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, gap: 12 },
  handle:     { width: 40, height: 4, backgroundColor: BOR2, borderRadius: 2, alignSelf: 'center' },
  title:      { fontSize: 17, fontWeight: '800', color: TP },
  sub:        { fontSize: 13, color: TS },
  row:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel:   { fontSize: 13, color: TS },
  rowVal:     { fontSize: 14, fontWeight: '700', color: TP },
  divider:    { height: 1, backgroundColor: BOR },
  btnRow:     { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:  { flex: 1, paddingVertical: 13, alignItems: 'center', backgroundColor: ELEV, borderRadius: 12 },
  cancelText: { fontSize: 14, color: TS, fontWeight: '600' },
  confirmBtn: { flex: 2, paddingVertical: 13, alignItems: 'center', backgroundColor: TEAL, borderRadius: 12 },
  confirmText:{ fontSize: 14, color: '#fff', fontWeight: '700' },
})

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function CrewDetailScreen() {
  const { memberId, memberName, memberRole, boatId, boatName } =
    useLocalSearchParams<{
      memberId: string
      memberName: string
      memberRole: string
      boatId: string
      boatName: string
    }>()

  const [activeTab,     setActiveTab]     = useState<'summary' | 'history'>('summary')
  const [settleVisible, setSettleVisible] = useState(false)

  // Lookup member from mock (replace with API)
  const member  = MOCK_MEMBERS[memberId ?? '1'] ?? MOCK_MEMBERS['1']
  const history = MOCK_KHARCHI[memberId ?? ''] ?? []

  const displayName = memberName ?? member.name
  const displayRole = memberRole ?? member.role
  const displayBoat = boatName   ?? 'Jai Mataji'

  const totalKharchi = history.reduce((s, k) => s + k.amount, 0)

  // ── Edit → open add-crew prefilled ──────────────────────────────────────────
  const handleEdit = () => {
    router.push({
      pathname: '/add-crew',
      params: {
        boatId:             boatId ?? '',
        boatName:           displayBoat,
        memberId:           member.id,
        prefillName:        member.name,
        prefillRole:        member.role,
        prefillAadhaar:     member.aadhaar,
        prefillPhone:       member.phone,
        prefillJoiningDate: member.joiningDate,
        prefillPagar:       String(member.pagar),
      },
    })
  }

  const handleSettleConfirm = () => {
    // TODO: POST /api/v1/crew/:memberId/settle
    setSettleVisible(false)
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => router.canGoBack() ? router.back() : null}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color={TP} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>{displayName}</Text>
            <Text style={s.headerSub}>{displayBoat} · {displayRole}</Text>
          </View>
          <TouchableOpacity style={s.editBtn} onPress={handleEdit} activeOpacity={0.8}>
            <Ionicons name="pencil-outline" size={14} color={TEAL} />
            <Text style={s.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── Profile Card ── */}
        <View style={s.profileCard}>
          <View style={s.avatarCircle}>
            <Ionicons name="person" size={36} color={TM} />
          </View>
          <View style={s.profileInfo}>
            <View style={s.profileNameRow}>
              <Text style={s.profileName}>{displayName}</Text>
              <View style={[s.statusBadge, member.status === 'active' ? s.statusActive : s.statusLeft]}>
                <Text style={s.statusText}>{member.status === 'active' ? 'Active' : 'Left'}</Text>
              </View>
            </View>
            <Text style={s.profileRole}>{displayRole}</Text>
            <Text style={s.profileDetail}>📱  {member.phone}</Text>
            <Text style={s.profileDetail}>🪪  {member.aadhaar}</Text>
            <Text style={s.profileDetail}>📅  Joined {member.joiningDate}</Text>
          </View>
        </View>

        {/* ── Financial Strip ── */}
        <View style={s.finStrip}>
          <View style={s.finItem}>
            <Text style={s.finLabel}>Bahano</Text>
            <Text style={[s.finValue, { color: AMBER }]}>{fmt(member.bahano)}</Text>
            <Text style={s.finSub}>Season Advance</Text>
          </View>
          <View style={s.finDiv} />
          <View style={s.finItem}>
            <Text style={s.finLabel}>Pagar</Text>
            <Text style={s.finValue}>{fmt(member.pagar)}</Text>
            <Text style={s.finSub}>{member.attendedDays}d / 30d</Text>
          </View>
          <View style={s.finDiv} />
          <View style={s.finItem}>
            <Text style={s.finLabel}>Upad</Text>
            <Text style={[s.finValue, { color: DANGER }]}>{fmt(member.upad)}</Text>
            <Text style={s.finSub}>Total given</Text>
          </View>
          <View style={s.finDiv} />
          <View style={s.finItem}>
            <Text style={s.finLabel}>Baaki</Text>
            <Text style={[s.finValue, { color: GREEN }]}>{fmt(member.baaki)}</Text>
            <Text style={s.finSub}>Still owed</Text>
          </View>
        </View>

        {/* ── Tab Bar ── */}
        <View style={s.tabBar}>
          <TouchableOpacity
            style={[s.tab, activeTab === 'summary' && s.tabActive]}
            onPress={() => setActiveTab('summary')}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, activeTab === 'summary' && s.tabTextActive]}>Summary</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, activeTab === 'history' && s.tabActive]}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, activeTab === 'history' && s.tabTextActive]}>
              Kharchi History
            </Text>
            {history.length > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{history.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Scrollable Body ── */}
        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

          {activeTab === 'summary' ? (
            <>
              {/* Salary card */}
              <View style={s.card}>
                <Text style={s.cardTitle}>Salary Details</Text>
                <View style={s.cardRow}>
                  <Text style={s.cardLabel}>Monthly Pagar</Text>
                  <Text style={s.cardVal}>{fmt(member.pagar)}</Text>
                </View>
                <View style={s.cardRow}>
                  <Text style={s.cardLabel}>Days Attended</Text>
                  <Text style={s.cardVal}>{member.attendedDays} / {member.totalDaysJoined}</Text>
                </View>
                <View style={s.cardRow}>
                  <Text style={s.cardLabel}>Trips Completed</Text>
                  <Text style={s.cardVal}>{member.tripsCompleted}</Text>
                </View>
              </View>

              {/* Summary mini cards */}
              <View style={s.miniRow}>
                <View style={s.miniCard}>
                  <Text style={s.miniEmoji}>💰</Text>
                  <Text style={s.miniVal}>{fmt(member.bahano)}</Text>
                  <Text style={s.miniLbl}>Advance</Text>
                </View>
                <View style={s.miniCard}>
                  <Text style={s.miniEmoji}>📤</Text>
                  <Text style={[s.miniVal, { color: DANGER }]}>{fmt(member.upad)}</Text>
                  <Text style={s.miniLbl}>Total Upad</Text>
                </View>
                <View style={s.miniCard}>
                  <Text style={s.miniEmoji}>✅</Text>
                  <Text style={[s.miniVal, { color: GREEN }]}>{fmt(member.baaki)}</Text>
                  <Text style={s.miniLbl}>Baaki</Text>
                </View>
              </View>

              {/* Settle button */}
              <TouchableOpacity
                style={s.settleBtn}
                onPress={() => setSettleVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
                <Text style={s.settleBtnText}>Settle Season</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Total */}
              <View style={s.historyTotalRow}>
                <Text style={s.historyTotalLabel}>Total given</Text>
                <Text style={s.historyTotalVal}>{fmt(totalKharchi)}</Text>
              </View>

              {history.length === 0 ? (
                <View style={s.empty}>
                  <Ionicons name="receipt-outline" size={40} color={TM} />
                  <Text style={s.emptyText}>No kharchi recorded yet</Text>
                </View>
              ) : (
                history.map(k => (
                  <View key={k.id} style={s.kharchiCard}>
                    <View style={s.kharchiTop}>
                      <Text style={s.kharchiDate}>{k.date}</Text>
                      <Text style={s.kharchiAmount}>{fmt(k.amount)}</Text>
                    </View>
                    <Text style={s.kharchiTrip}>{k.trip}</Text>
                    <View style={s.kharchiBottom}>
                      <Text style={s.kharchiReason}>{k.reason}</Text>
                      <Text style={s.kharchiGiven}>given by {k.givenBy}</Text>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* ── Settle Modal ── */}
        {settleVisible && (
          <SettleModal
            member={member}
            onClose={() => setSettleVisible(false)}
            onConfirm={handleSettleConfirm}
          />
        )}

      </SafeAreaView>
    </>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    gap: 12, borderBottomWidth: 1, borderBottomColor: BOR,
    backgroundColor: TEAL,
  },
  backBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerSub:    { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  editBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  editBtnText:  { fontSize: 13, color: '#fff', fontWeight: '700' },

  // Profile card
  profileCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: SURF, margin: 12, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: BOR,
  },
  avatarCircle:   { width: 60, height: 60, borderRadius: 30, backgroundColor: ELEV, alignItems: 'center', justifyContent: 'center' },
  profileInfo:    { flex: 1, gap: 3 },
  profileNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileName:    { fontSize: 15, fontWeight: '800', color: TP, flex: 1 },
  profileRole:    { fontSize: 12, color: TS, marginBottom: 2 },
  profileDetail:  { fontSize: 12, color: TS },
  statusBadge:    { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusActive:   { backgroundColor: GREEN + '25' },
  statusLeft:     { backgroundColor: DANGER + '25' },
  statusText:     { fontSize: 10, fontWeight: '700', color: GREEN },

  // Financial strip
  finStrip: {
    flexDirection: 'row', backgroundColor: SURF,
    marginHorizontal: 12, borderRadius: 14,
    borderWidth: 1, borderColor: BOR, padding: 12,
  },
  finItem:  { flex: 1, alignItems: 'center', gap: 2 },
  finDiv:   { width: 1, backgroundColor: BOR, marginVertical: 4 },
  finLabel: { fontSize: 10, color: TS, fontWeight: '600' },
  finValue: { fontSize: 13, fontWeight: '800', color: TP },
  finSub:   { fontSize: 9, color: TM },

  // Tabs
  tabBar: {
    flexDirection: 'row', marginHorizontal: 12, marginTop: 12,
    backgroundColor: ELEV, borderRadius: 12, padding: 3,
  },
  tab:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 10 },
  tabActive:    { backgroundColor: SURF },
  tabText:      { fontSize: 13, fontWeight: '600', color: TM },
  tabTextActive:{ color: TP, fontWeight: '700' },
  badge:        { backgroundColor: TEAL, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  badgeText:    { fontSize: 10, color: '#fff', fontWeight: '700' },

  // Body
  body: { paddingHorizontal: 12, paddingTop: 12, gap: 10 },

  // Summary card
  card:      { backgroundColor: SURF, borderRadius: 14, borderWidth: 1, borderColor: BOR, padding: 14, gap: 8 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: TS, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: 13, color: TS },
  cardVal:   { fontSize: 13, fontWeight: '700', color: TP },

  // Mini cards
  miniRow:  { flexDirection: 'row', gap: 8 },
  miniCard: { flex: 1, backgroundColor: SURF, borderRadius: 12, borderWidth: 1, borderColor: BOR, padding: 10, alignItems: 'center', gap: 3 },
  miniEmoji:{ fontSize: 18 },
  miniVal:  { fontSize: 13, fontWeight: '800', color: TP },
  miniLbl:  { fontSize: 10, color: TM, textAlign: 'center' },

  // Settle
  settleBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: TEAL, borderRadius: 14, paddingVertical: 15 },
  settleBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  // Kharchi history
  historyTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  historyTotalLabel:{ fontSize: 12, color: TS, fontWeight: '600' },
  historyTotalVal:  { fontSize: 15, fontWeight: '800', color: TP },
  kharchiCard: {
    backgroundColor: SURF, borderRadius: 14, borderWidth: 1, borderColor: BOR, padding: 12, gap: 4,
  },
  kharchiTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kharchiDate:   { fontSize: 12, color: TS },
  kharchiAmount: { fontSize: 15, fontWeight: '800', color: TP },
  kharchiTrip:   { fontSize: 11, color: TEAL, fontWeight: '600' },
  kharchiBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kharchiReason: { fontSize: 12, color: TS },
  kharchiGiven:  { fontSize: 11, color: TM },

  empty:     { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 13, color: TM },
})