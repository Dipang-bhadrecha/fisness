/**
 * app/crew-detail.tsx — Crew Member Detail Screen
 *
 * "Edit" button in the header opens a pre-filled modal to update:
 *   - Name, Role, Phone, Aadhaar, Fixed Salary, Status (Active/Left)
 *
 * TODO when backend ready:
 *   PATCH /api/v1/crew/:memberId
 *   Body: { name?, role?, phone?, aadhaar?, fixedSalary?, status? }
 */

import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../constants/theme'

// ── Temp data — replace with API: GET /api/v1/crew/:memberId ─────────────────
const TEMP_MEMBER = {
  id: '1',
  name: 'Suraj Tandel',
  role: 'Pilot / Caption',
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

type Member = typeof TEMP_MEMBER

const CREW_ROLES = ['Pilot / Caption', 'Sailor', 'Helper', 'Engineer', 'Cook', 'Diver']

const fmt = (n?: number) => n ? `₹ ${n.toLocaleString('en-IN')}` : '₹ 0'

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT CREW MEMBER MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface EditCrewModalProps {
  visible: boolean
  member: Member
  onClose: () => void
  onSave: (updated: Partial<Member>) => void
}

function EditCrewModal({ visible, member, onClose, onSave }: EditCrewModalProps) {
  // Pre-fill with current values
  const [name, setName]               = useState(member.name)
  const [role, setRole]               = useState(member.role)
  const [phone, setPhone]             = useState(member.phone)
  const [aadhaar, setAadhaar]         = useState(member.aadhaar)
  const [fixedSalary, setFixedSalary] = useState(String(member.fixedSalary))
  const [status, setStatus]           = useState<'active' | 'left'>(member.status)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  // Re-sync if member prop changes (e.g. after first open)
  React.useEffect(() => {
    if (visible) {
      setName(member.name)
      setRole(member.role)
      setPhone(member.phone)
      setAadhaar(member.aadhaar)
      setFixedSalary(String(member.fixedSalary))
      setStatus(member.status)
      setError(null)
    }
  }, [visible, member])

  const isValid = name.trim().length >= 2 && role.trim().length > 0

  // Detect if anything actually changed
  const hasChanges =
    name.trim()    !== member.name        ||
    role.trim()    !== member.role        ||
    phone.trim()   !== member.phone       ||
    aadhaar.trim() !== member.aadhaar     ||
    Number(fixedSalary) !== member.fixedSalary ||
    status !== member.status

  const handleSave = async () => {
    if (!isValid || saving) return
    setError(null)
    setSaving(true)

    try {
      // ── TODO: Real API call ────────────────────────────────────────────────
      // await request(`/api/v1/crew/${member.id}`, {
      //   method: 'PATCH',
      //   token: token!,
      //   body: JSON.stringify({
      //     name: name.trim(),
      //     role: role.trim(),
      //     phone: phone.trim() || undefined,
      //     aadhaar: aadhaar.trim() || undefined,
      //     fixedSalary: Number(fixedSalary) || member.fixedSalary,
      //     status,
      //   }),
      // })
      //
      // ── Mock for now ───────────────────────────────────────────────────────
      await new Promise(r => setTimeout(r, 700))
      onSave({
        name: name.trim(),
        role: role.trim(),
        phone: phone.trim(),
        aadhaar: aadhaar.trim(),
        fixedSalary: Number(fixedSalary) || member.fixedSalary,
        status,
      })
      onClose()
    } catch {
      setError('Could not update. Please try again.')
      setSaving(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={e.container}>

          {/* Header */}
          <View style={e.header}>
            <TouchableOpacity onPress={onClose} style={e.cancelBtn}>
              <Text style={e.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={e.title}>Edit Member</Text>
            <TouchableOpacity
              style={[e.saveBtn, (!isValid || !hasChanges || saving) && e.saveBtnOff]}
              onPress={handleSave}
              disabled={!isValid || !hasChanges || saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={e.saveText}>Save</Text>
              }
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={e.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar hero */}
            <View style={e.hero}>
              <View style={e.avatarCircle}>
                <Text style={e.avatarEmoji}>👤</Text>
              </View>
              <Text style={e.heroName}>{member.name}</Text>
              <Text style={e.heroSub}>Editing crew member details</Text>
            </View>

            {/* Error */}
            {error && (
              <View style={e.errorBanner}>
                <Text style={e.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* ── Status toggle ── */}
            <View style={e.fieldGroup}>
              <Text style={e.fieldLabel}>Status</Text>
              <View style={e.statusRow}>
                <TouchableOpacity
                  style={[e.statusBtn, status === 'active' && e.statusBtnActive]}
                  onPress={() => setStatus('active')}
                >
                  <Text style={[e.statusBtnText, status === 'active' && e.statusBtnTextActive]}>
                    ✅  Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[e.statusBtn, status === 'left' && e.statusBtnLeft]}
                  onPress={() => setStatus('left')}
                >
                  <Text style={[e.statusBtnText, status === 'left' && e.statusBtnTextLeft]}>
                    🚪  Left
                  </Text>
                </TouchableOpacity>
              </View>
              {status === 'left' && (
                <Text style={e.statusHint}>
                  Marking as "Left" will stop salary calculations for this crew member.
                </Text>
              )}
            </View>

            {/* ── Name ── */}
            <View style={e.fieldGroup}>
              <Text style={e.fieldLabel}>Full Name <Text style={e.req}>*</Text></Text>
              <TextInput
                style={[e.input, name !== member.name && e.inputChanged]}
                placeholder="e.g. Suraj Tandel"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={t => { setName(t); setError(null) }}
                returnKeyType="next"
              />
            </View>

            {/* ── Role — quick chips + custom ── */}
            <View style={e.fieldGroup}>
              <Text style={e.fieldLabel}>Role / Position <Text style={e.req}>*</Text></Text>
              <View style={e.chipRow}>
                {CREW_ROLES.map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[e.chip, role === r && e.chipActive]}
                    onPress={() => setRole(r)}
                  >
                    <Text style={[e.chipText, role === r && e.chipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[e.input, { marginTop: 8 }, role !== member.role && e.inputChanged]}
                placeholder="Or type a custom role..."
                placeholderTextColor={theme.colors.textSecondary}
                value={role}
                onChangeText={setRole}
                returnKeyType="next"
              />
            </View>

            {/* ── Fixed Salary ── */}
            <View style={e.fieldGroup}>
              <Text style={e.fieldLabel}>Fixed Salary / Month</Text>
              <View style={[e.rupeeRow, Number(fixedSalary) !== member.fixedSalary && e.rupeeRowChanged]}>
                <Text style={e.rupeeSign}>₹</Text>
                <TextInput
                  style={e.inputRupee}
                  placeholder="e.g. 15000"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="number-pad"
                  value={fixedSalary}
                  onChangeText={setFixedSalary}
                  returnKeyType="next"
                />
              </View>
              <Text style={e.fieldHint}>Monthly salary for 30 days of work</Text>
            </View>

            {/* ── Phone ── */}
            <View style={e.fieldGroup}>
              <Text style={e.fieldLabel}>Phone Number</Text>
              <TextInput
                style={[e.input, phone !== member.phone && e.inputChanged]}
                placeholder="e.g. 98765 43210"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                returnKeyType="next"
              />
            </View>

            {/* ── Aadhaar ── */}
            <View style={e.fieldGroup}>
              <Text style={e.fieldLabel}>Aadhaar Number</Text>
              <TextInput
                style={[e.input, aadhaar !== member.aadhaar && e.inputChanged]}
                placeholder="e.g. 1234 5678 9012"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="number-pad"
                value={aadhaar}
                onChangeText={setAadhaar}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>

            {/* Change indicator */}
            {hasChanges && (
              <View style={e.changeBanner}>
                <Text style={e.changeText}>✏️  You have unsaved changes</Text>
              </View>
            )}

          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// GIVE KHARCHI MODAL
// ═══════════════════════════════════════════════════════════════════════════════

function KharchiModal({
  memberName,
  onClose,
  onSave,
}: {
  memberName: string
  onClose: () => void
  onSave: (amount: string, reason: string) => void
}) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const isValid = amount.trim().length > 0 && Number(amount) > 0

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={m.sheetHandle} />
          <Text style={m.sheetTitle}>Give Kharchi</Text>
          <Text style={m.sheetSub}>{memberName}</Text>
          <Text style={m.label}>Amount (₹)</Text>
          <TextInput
            style={m.input}
            placeholder="Enter amount"
            placeholderTextColor={theme.colors.textDisabled}
            keyboardType="number-pad"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={m.label}>Reason (optional)</Text>
          <TextInput
            style={m.input}
            placeholder="e.g. Advance, Medicine, Food..."
            placeholderTextColor={theme.colors.textDisabled}
            value={reason}
            onChangeText={setReason}
          />
          <View style={m.btnRow}>
            <TouchableOpacity style={m.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={m.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[m.saveBtn, !isValid && m.saveBtnDisabled]}
              onPress={() => isValid && onSave(amount, reason)}
              activeOpacity={0.85}
              disabled={!isValid}
            >
              <Text style={m.saveText}>Give {amount ? fmt(Number(amount)) : '₹ 0'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTLE SEASON MODAL
// ═══════════════════════════════════════════════════════════════════════════════

function SettleModal({
  member,
  onClose,
  onConfirm,
}: {
  member: Member
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

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

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
  const [kharchiVisible, setKharchiVisible] = useState(false)
  const [settleVisible,  setSettleVisible]  = useState(false)
  const [editVisible,    setEditVisible]    = useState(false)

  // Local member state — updated after Edit saves
  const [member, setMember] = useState<Member>({ ...TEMP_MEMBER })
  const history = TEMP_KHARCHI_HISTORY

  const handleGiveKharchi = (amount: string, reason: string) => {
    // TODO: POST /api/v1/crew/:memberId/kharchi  { amount, reason, date: today }
    console.log('Give kharchi:', { amount, reason, memberId })
    setKharchiVisible(false)
  }

  const handleSettleConfirm = () => {
    // TODO: POST /api/v1/crew/:memberId/settle
    console.log('Settle season for:', memberId)
    setSettleVisible(false)
  }

  // ✅ Apply edits locally — reflected immediately in the UI
  const handleEditSave = (updated: Partial<Member>) => {
    setMember(prev => ({ ...prev, ...updated }))
    setEditVisible(false)
  }

  // Use passed params or local state (local state wins after edit)
  const displayName = member.name
  const displayRole = member.role
  const displayBoat = boatName ?? member.boat

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
        {/* ✅ Edit button now opens the Edit modal */}
        <TouchableOpacity
          style={s.editBtn}
          activeOpacity={0.7}
          onPress={() => setEditVisible(true)}
        >
          <Text style={s.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

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
            <Text style={s.finValue}>₹ {(member.bahano / 1000).toFixed(0)}K</Text>
            <Text style={s.finSub}>Season Advance</Text>
          </View>
          <View style={s.finDivider} />
          <View style={s.finItem}>
            <Text style={s.finLabel}>Pagar</Text>
            <Text style={s.finValue}>₹ {(member.pagar / 1000).toFixed(0)}K</Text>
            <Text style={s.finSub}>{member.attendedDays}d / 30d</Text>
          </View>
          <View style={s.finDivider} />
          <View style={s.finItem}>
            <Text style={s.finLabel}>Upad</Text>
            <Text style={[s.finValue, { color: '#ff6b6b' }]}>₹ {(member.upad / 1000).toFixed(0)}K</Text>
            <Text style={s.finSub}>Total given</Text>
          </View>
          <View style={s.finDivider} />
          <View style={s.finItem}>
            <Text style={s.finLabel}>Baaki</Text>
            <Text style={[s.finValue, { color: member.baaki >= 0 ? '#51cf66' : '#ff6b6b' }]}>
              ₹ {(Math.abs(member.baaki) / 1000).toFixed(0)}K
            </Text>
            <Text style={s.finSub}>Still owed</Text>
          </View>
        </View>

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <View style={s.tabRow}>
          <TouchableOpacity
            style={[s.tab, activeTab === 'summary' && s.tabActive]}
            onPress={() => setActiveTab('summary')}
          >
            <Text style={[s.tabText, activeTab === 'summary' && s.tabTextActive]}>Summary</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, activeTab === 'history' && s.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[s.tabText, activeTab === 'history' && s.tabTextActive]}>
              Kharchi History
            </Text>
            <View style={s.tabBadge}>
              <Text style={s.tabBadgeText}>{history.length}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {activeTab === 'summary' ? (
          <>
            {/* Salary Calculation */}
            <Text style={s.sectionLabel}>SALARY CALCULATION</Text>
            <View style={s.infoCard}>
              <View style={s.infoRow}>
                <Text style={s.infoKey}>Fixed Salary</Text>
                <Text style={s.infoVal}>₹ {member.fixedSalary.toLocaleString('en-IN')} / 30d</Text>
              </View>
              <View style={s.infoRow}>
                <Text style={s.infoKey}>Days Attended</Text>
                <Text style={s.infoVal}>{member.attendedDays} days</Text>
              </View>
              <View style={[s.infoRow, s.infoRowHighlight]}>
                <Text style={s.infoKey}>Current Month Salary</Text>
                <Text style={[s.infoVal, { color: theme.colors.primary, fontWeight: '800' }]}>
                  ₹ {member.pagar.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Tenure & Projection */}
            <Text style={s.sectionLabel}>TENURE & PROJECTION</Text>
            <View style={s.infoCard}>
              <View style={s.infoRow}>
                <Text style={s.infoKey}>Trips Completed</Text>
                <Text style={s.infoVal}>{member.tripsCompleted} trips</Text>
              </View>
              <View style={s.infoRow}>
                <Text style={s.infoKey}>Total Days Joined</Text>
                <Text style={s.infoVal}>{member.totalDaysJoined} days (~{Math.round(member.totalDaysJoined / 30)} months)</Text>
              </View>
              <View style={s.infoRow}>
                <Text style={s.infoKey}>Projected Annual Salary</Text>
                <Text style={s.infoVal}>₹ {member.projectedSalary.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            {/* Season Settlement */}
            <View style={s.settleSection}>
              <TouchableOpacity
                style={s.settleBtn}
                onPress={() => setSettleVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={s.settleBtnText}>Mark Season as Settled</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={s.historyTotalRow}>
              <Text style={s.historyTotalLabel}>Total given</Text>
              <Text style={s.historyTotalValue}>{fmt(member.upad)}</Text>
            </View>
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
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom Give Kharchi Button ────────────────────────── */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={s.kharchiBtn}
          onPress={() => setKharchiVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={s.kharchiBtnText}>💰  Give Kharchi</Text>
        </TouchableOpacity>
      </View>

      {/* ── Modals ────────────────────────────────────────────── */}
      <EditCrewModal
        visible={editVisible}
        member={member}
        onClose={() => setEditVisible(false)}
        onSave={handleEditSave}
      />

      {kharchiVisible && (
        <KharchiModal
          memberName={displayName}
          onClose={() => setKharchiVisible(false)}
          onSave={handleGiveKharchi}
        />
      )}
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

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES — Screen
// ═══════════════════════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  backText: { color: theme.colors.textInverse, fontSize: 18, fontWeight: '700' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.textInverse },
  headerSub: { fontSize: 12, color: theme.colors.textInverse, marginTop: 2 },
  editBtn: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  editBtnText: { color: theme.colors.textInverse, fontSize: 13, fontWeight: '700' },

  profileCard: { backgroundColor: theme.colors.surface, margin: 12, borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: theme.colors.border, elevation: 2 },
  avatarCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 30 },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary },
  profileRole: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 2 },
  profileDetail: { fontSize: 11, color: theme.colors.textSecondary },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusActive: { backgroundColor: 'rgba(29,209,161,0.15)', borderWidth: 1, borderColor: theme.colors.primaryDark },
  statusLeft: { backgroundColor: 'rgba(224,123,84,0.15)', borderWidth: 1, borderColor: theme.colors.danger },
  statusText: { fontSize: 11, fontWeight: '700', color: theme.colors.textPrimary },

  finStrip: { backgroundColor: theme.colors.primaryDark, marginHorizontal: 12, borderRadius: 16, flexDirection: 'row', paddingVertical: 14 },
  finItem: { flex: 1, alignItems: 'center', gap: 3 },
  finLabel: { fontSize: 10, color: theme.colors.textInverse, fontWeight: '600' },
  finValue: { fontSize: 15, fontWeight: '800', color: theme.colors.textInverse },
  finSub: { fontSize: 9, color: 'rgba(255,255,255,0.6)' },
  finDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 6 },

  tabRow: { flexDirection: 'row', marginHorizontal: 12, marginTop: 12, backgroundColor: theme.colors.surface, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: theme.colors.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  tabActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary },
  tabTextActive: { color: '#fff' },
  tabBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  tabBadgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.primary, letterSpacing: 0.8, marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  infoCard: { marginHorizontal: 12, backgroundColor: theme.colors.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  infoRowHighlight: { backgroundColor: theme.colors.primary + '0a' },
  infoKey: { fontSize: 13, color: theme.colors.textSecondary },
  infoVal: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary },

  settleSection: { margin: 12, marginTop: 20 },
  settleBtn: { backgroundColor: theme.colors.surface, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.danger },
  settleBtnText: { color: theme.colors.danger, fontSize: 15, fontWeight: '700' },

  historyTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  historyTotalLabel: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
  historyTotalValue: { fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary },
  historyCard: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 12, marginBottom: 8, backgroundColor: theme.colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: theme.colors.border },
  historyLeft: { gap: 3 },
  historyDate: { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary },
  historyTrip: { fontSize: 11, color: theme.colors.primary },
  historyBy: { fontSize: 11, color: theme.colors.textSecondary },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyAmount: { fontSize: 15, fontWeight: '800', color: theme.colors.textPrimary },
  historyReason: { fontSize: 12, color: theme.colors.textSecondary },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.background, padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: theme.colors.border },
  kharchiBtn: { backgroundColor: theme.colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  kharchiBtnText: { color: theme.colors.textInverse, fontSize: 16, fontWeight: '800' },
})

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES — Edit Modal
// ═══════════════════════════════════════════════════════════════════════════════

const e = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  cancelBtn:  { paddingVertical: 6, paddingRight: 8 },
  cancelText: { fontSize: 15, color: theme.colors.textSecondary },
  title:      { fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary },
  saveBtn:    { backgroundColor: theme.colors.primary, paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20, minWidth: 56, alignItems: 'center' },
  saveBtnOff: { backgroundColor: theme.colors.border },
  saveText:   { color: '#fff', fontWeight: '700', fontSize: 14 },

  scroll: { padding: 20 },

  hero:       { alignItems: 'center', paddingVertical: 16, marginBottom: 8 },
  avatarCircle:{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji:{ fontSize: 34 },
  heroName:   { fontSize: 18, fontWeight: '800', color: theme.colors.textPrimary, marginTop: 10 },
  heroSub:    { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },

  errorBanner:  { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText:    { fontSize: 13, color: '#dc2626' },
  changeBanner: { backgroundColor: theme.colors.primary + '10', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 4 },
  changeText:   { fontSize: 13, color: theme.colors.primary, fontWeight: '600' },

  fieldGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 8 },
  req:        { color: '#ef4444' },
  fieldHint:  { fontSize: 12, color: theme.colors.textSecondary, marginTop: 5 },

  input:        { backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: theme.colors.textPrimary },
  inputChanged: { borderColor: theme.colors.primary },    // highlight changed fields

  rupeeRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, overflow: 'hidden' },
  rupeeRowChanged: { borderColor: theme.colors.primary },
  rupeeSign:       { fontSize: 18, color: theme.colors.textSecondary, marginRight: 6 },
  inputRupee:      { flex: 1, paddingVertical: 13, fontSize: 15, color: theme.colors.textPrimary },

  statusRow:          { flexDirection: 'row', gap: 10 },
  statusBtn:          { flex: 1, paddingVertical: 11, borderRadius: 12, borderWidth: 1.5, borderColor: theme.colors.border, alignItems: 'center', backgroundColor: theme.colors.surface },
  statusBtnActive:    { borderColor: '#059669', backgroundColor: '#d1fae5' },
  statusBtnLeft:      { borderColor: '#dc2626', backgroundColor: '#fee2e2' },
  statusBtnText:      { fontSize: 14, fontWeight: '700', color: theme.colors.textSecondary },
  statusBtnTextActive:{ color: '#059669' },
  statusBtnTextLeft:  { color: '#dc2626' },
  statusHint:         { fontSize: 12, color: '#dc2626', marginTop: 6 },

  chipRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:            { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  chipActive:      { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '15' },
  chipText:        { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '600' },
  chipTextActive:  { color: theme.colors.primary },
})

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES — Kharchi / Settle modals
// ═══════════════════════════════════════════════════════════════════════════════

const m = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 44 },
  sheetHandle:{ width: 40, height: 4, backgroundColor: 'rgba(0,188,212,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 4 },
  sheetSub:   { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 22 },
  label:      { fontSize: 11, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 8, letterSpacing: 0.5 },
  input:      { backgroundColor: theme.colors.background, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, padding: 14, color: theme.colors.textPrimary, fontSize: 16, marginBottom: 16 },
  btnRow:     { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn:  { flex: 1, backgroundColor: theme.colors.background, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  cancelText: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: '700' },
  saveBtn:    { flex: 2, backgroundColor: theme.colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.35 },
  saveText:   { color: theme.colors.textInverse, fontSize: 15, fontWeight: '800' },
})

const settle = StyleSheet.create({
  row:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label:   { fontSize: 13, color: theme.colors.textSecondary },
  val:     { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },
})