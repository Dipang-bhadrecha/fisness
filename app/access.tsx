/**
 * app/access.tsx — Access Management
 *
 * Owner can:
 *   1. Invite someone by phone number
 *   2. Choose a preset role (Full Access / Manager / View Only / Custom)
 *   3. Toggle individual permissions
 *   4. See & manage existing members (edit permissions / remove)
 *
 * Backend TODOs:
 *   POST   /api/v1/invitations          — send invite
 *   GET    /api/v1/companies/:id/members — list members
 *   PATCH  /api/v1/memberships/:id/permissions — update perms
 *   DELETE /api/v1/memberships/:id      — remove member
 */

import { useTheme } from '@/store/themeStore'
import { router } from 'expo-router'
import React, { useMemo, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// ─── Permission definitions ────────────────────────────────────────────────────

type PermKey =
  | 'CREATE_TALI' | 'VIEW_TALI' | 'FILL_FISH_PRICE'
  | 'VIEW_BILL' | 'CREATE_BILL' | 'SEND_BILL'
  | 'ADD_COMPANY_EXPENSE' | 'VIEW_COMPANY_EXPENSE'
  | 'VIEW_EMPLOYEE_RECORDS' | 'MANAGE_EMPLOYEES'
  | 'VIEW_FINANCIAL_REPORT' | 'VIEW_MEMBERS'

type PermGroup = {
  group: string
  emoji: string
  items: { key: PermKey; label: string; sub: string; sensitive?: boolean }[]
}

const PERM_GROUPS: PermGroup[] = [
  {
    group: 'Tali',
    emoji: '⚖️',
    items: [
      { key: 'CREATE_TALI',     label: 'Add Tali',        sub: 'Start weight sessions' },
      { key: 'VIEW_TALI',       label: 'View Tali',       sub: 'See all tali records' },
      { key: 'FILL_FISH_PRICE', label: 'Fill Fish Price', sub: 'Enter price per kg', sensitive: true },
    ],
  },
  {
    group: 'Bills',
    emoji: '🧾',
    items: [
      { key: 'VIEW_BILL',   label: 'View Bills',   sub: 'See generated bills' },
      { key: 'CREATE_BILL', label: 'Create Bills', sub: 'Generate new bills', sensitive: true },
      { key: 'SEND_BILL',   label: 'Send Bills',   sub: 'Send via WhatsApp' },
    ],
  },
  {
    group: 'Expenses',
    emoji: '💸',
    items: [
      { key: 'ADD_COMPANY_EXPENSE',  label: 'Add Expense',  sub: 'Record company costs' },
      { key: 'VIEW_COMPANY_EXPENSE', label: 'View Expense', sub: 'See expense records' },
    ],
  },
  {
    group: 'Crew',
    emoji: '👥',
    items: [
      { key: 'VIEW_EMPLOYEE_RECORDS', label: 'View Crew Records', sub: 'See staff finances' },
      { key: 'MANAGE_EMPLOYEES',      label: 'Manage Crew',       sub: 'Add or edit crew', sensitive: true },
    ],
  },
  {
    group: 'Reports & Team',
    emoji: '📊',
    items: [
      { key: 'VIEW_FINANCIAL_REPORT', label: 'Financial Reports', sub: 'Profit/loss, insights', sensitive: true },
      { key: 'VIEW_MEMBERS',          label: 'View Members',      sub: 'See other managers' },
    ],
  },
]

// ─── Presets ────────────────────────────────────────────────────────────────

type Preset = 'full' | 'manager' | 'viewonly' | 'custom'

const PRESETS: { id: Preset; label: string; sub: string; emoji: string; color: string; perms: PermKey[] }[] = [
  {
    id: 'full',
    label: 'Full Access',
    sub: 'Everything — family / trusted partner',
    emoji: '🔓',
    color: '#EF4444',
    perms: ['CREATE_TALI','VIEW_TALI','FILL_FISH_PRICE','VIEW_BILL','CREATE_BILL','SEND_BILL','ADD_COMPANY_EXPENSE','VIEW_COMPANY_EXPENSE','VIEW_EMPLOYEE_RECORDS','MANAGE_EMPLOYEES','VIEW_FINANCIAL_REPORT','VIEW_MEMBERS'],
  },
  {
    id: 'manager',
    label: 'Manager',
    sub: 'Tali, expenses, bills — no financials',
    emoji: '🧭',
    color: '#00C2CB',
    perms: ['CREATE_TALI','VIEW_TALI','VIEW_BILL','CREATE_BILL','SEND_BILL','ADD_COMPANY_EXPENSE','VIEW_COMPANY_EXPENSE','VIEW_MEMBERS'],
  },
  {
    id: 'viewonly',
    label: 'View Only',
    sub: 'Can see everything, change nothing',
    emoji: '👁',
    color: '#8BA3BC',
    perms: ['VIEW_TALI','VIEW_BILL','VIEW_COMPANY_EXPENSE','VIEW_EMPLOYEE_RECORDS','VIEW_MEMBERS'],
  },
  {
    id: 'custom',
    label: 'Custom',
    sub: 'Pick permissions manually',
    emoji: '⚙️',
    color: '#C9A84C',
    perms: [],
  },
]

// ─── Temp member type ──────────────────────────────────────────────────────

type Member = {
  id: string
  name: string
  phone: string
  preset: Preset
  perms: PermKey[]
  status: 'active' | 'pending'
}

const TEMP_MEMBERS: Member[] = [
  { id: '1', name: 'Ramesh Patel',  phone: '9876543210', preset: 'manager',  perms: ['CREATE_TALI','VIEW_TALI','VIEW_BILL','ADD_COMPANY_EXPENSE'], status: 'active' },
  { id: '2', name: 'Suresh Doshi',  phone: '9123456780', preset: 'viewonly', perms: ['VIEW_TALI','VIEW_BILL'],                                     status: 'active' },
  { id: '3', name: 'Unknown',       phone: '9988776655', preset: 'custom',   perms: ['CREATE_TALI','VIEW_TALI'],                                   status: 'pending' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function AccessScreen() {
  const theme = useTheme()
  const s = useMemo(() => createStyles(theme), [theme])
  const [members, setMembers] = useState<Member[]>(TEMP_MEMBERS)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [editMember, setEditMember] = useState<Member | null>(null)

  const handleRemove = (id: string) => {
    Alert.alert('Remove Access', 'This person will lose all access immediately.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setMembers(m => m.filter(x => x.id !== id)),
      },
    ])
  }

  const handleSaveInvite = (phone: string, perms: PermKey[], preset: Preset) => {
    const newMember: Member = {
      id: Date.now().toString(),
      name: 'Unknown',
      phone,
      preset,
      perms,
      status: 'pending',
    }
    setMembers(m => [...m, newMember])
    setShowInviteModal(false)
    Alert.alert('Invite Sent', `An invite was sent to +91 ${phone}. They'll see it when they join.`)
  }

  const handleSaveEdit = (updated: Member) => {
    setMembers(m => m.map(x => x.id === updated.id ? updated : x))
    setEditMember(null)
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Access</Text>
          <Text style={s.headerSub}>Manage who can use your account</Text>
        </View>
        <TouchableOpacity style={s.inviteBtn} onPress={() => setShowInviteModal(true)}>
          <Text style={s.inviteBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Info banner */}
        <View style={s.infoBanner}>
          <Text style={s.infoEmoji}>🔐</Text>
          <Text style={s.infoText}>
            People you add can only see and do what you allow. You can change or remove access anytime.
          </Text>
        </View>

        {/* Members list */}
        <Text style={s.sectionLabel}>MEMBERS ({members.length})</Text>

        {members.map(member => (
          <MemberCard
            key={member.id}
            member={member}
            onEdit={() => setEditMember(member)}
            onRemove={() => handleRemove(member.id)}
          />
        ))}

        {members.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptyEmoji}>👥</Text>
            <Text style={s.emptyTitle}>No one added yet</Text>
            <Text style={s.emptySub}>Tap "+ Add" to invite someone</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Invite modal */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onSend={handleSaveInvite}
        />
      )}

      {/* Edit permissions modal */}
      {editMember && (
        <EditModal
          member={editMember}
          onClose={() => setEditMember(null)}
          onSave={handleSaveEdit}
        />
      )}
    </SafeAreaView>
  )
}

// ─── Member Card ──────────────────────────────────────────────────────────────

function MemberCard({ member, onEdit, onRemove }: { member: Member; onEdit: () => void; onRemove: () => void }) {
  const theme = useTheme()
  const s = useMemo(() => createStyles(theme), [theme])
  const preset = PRESETS.find(p => p.id === member.preset)
  const initials = member.name !== 'Unknown'
    ? member.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : member.phone.slice(-2)

  return (
    <View style={s.memberCard}>
      <View style={[s.memberAvatar, { backgroundColor: preset?.color ?? theme.colors.elevated }]}>
        <Text style={s.memberAvatarText}>{initials}</Text>
      </View>

      <View style={s.memberInfo}>
        <View style={s.memberNameRow}>
          <Text style={s.memberName}>{member.name !== 'Unknown' ? member.name : `+91 ${member.phone}`}</Text>
          {member.status === 'pending' && (
            <View style={s.pendingBadge}><Text style={s.pendingBadgeText}>Pending</Text></View>
          )}
        </View>
        {member.name !== 'Unknown' && (
          <Text style={s.memberPhone}>+91 {member.phone}</Text>
        )}
        <View style={s.presetBadge} >
          <Text style={[s.presetBadgeText, { color: preset?.color ?? theme.colors.textSecondary }]}>
            {preset?.emoji} {preset?.label}
          </Text>
        </View>
        <Text style={s.memberPermCount}>{member.perms.length} permissions</Text>
      </View>

      <View style={s.memberActions}>
        <TouchableOpacity style={s.memberEditBtn} onPress={onEdit}>
          <Text style={s.memberEditText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.memberRemoveBtn} onPress={onRemove}>
          <Text style={s.memberRemoveText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({ onClose, onSend }: {
  onClose: () => void
  onSend: (phone: string, perms: PermKey[], preset: Preset) => void
}) {
  const theme = useTheme()
  const m = useMemo(() => createModalStyles(theme), [theme])
  const [phone, setPhone] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<Preset>('manager')
  const [perms, setPerms] = useState<Set<PermKey>>(new Set(PRESETS[1].perms))
  const [step, setStep] = useState<'phone' | 'perms'>('phone')

  const handlePresetSelect = (preset: Preset) => {
    setSelectedPreset(preset)
    if (preset !== 'custom') {
      const found = PRESETS.find(p => p.id === preset)!
      setPerms(new Set(found.perms))
    }
  }

  const togglePerm = (key: PermKey) => {
    setSelectedPreset('custom')
    setPerms(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const isValid = phone.trim().length === 10

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={m.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={m.sheet}>
          <View style={m.handle} />

          {/* Modal header */}
          <View style={m.mHeader}>
            {step === 'perms' ? (
              <TouchableOpacity onPress={() => setStep('phone')} style={m.mBackBtn}>
                <Text style={m.mBackText}>←</Text>
              </TouchableOpacity>
            ) : <View style={{ width: 36 }} />}
            <Text style={m.mTitle}>{step === 'phone' ? 'Add Person' : 'Set Permissions'}</Text>
            <TouchableOpacity onPress={onClose} style={m.mCloseBtn}>
              <Text style={m.mCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={m.mScroll}>

            {step === 'phone' ? (
              <>
                {/* Phone input */}
                <Text style={m.mLabel}>PHONE NUMBER</Text>
                <View style={m.phoneBox}>
                  <Text style={m.phonePrefix}>+91</Text>
                  <TextInput
                    style={m.phoneInput}
                    value={phone}
                    onChangeText={v => setPhone(v.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor={theme.colors.textDisabled}
                    keyboardType="number-pad"
                    autoFocus
                    selectionColor={theme.colors.primary}
                  />
                  {phone.length === 10 && <Text style={m.phoneCheck}>✓</Text>}
                </View>

                {/* Preset picker */}
                <Text style={[m.mLabel, { marginTop: 20 }]}>ACCESS LEVEL</Text>
                <View style={m.presetGrid}>
                  {PRESETS.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      style={[m.presetCard, selectedPreset === p.id && { borderColor: p.color, backgroundColor: `${p.color}18` }]}
                      onPress={() => handlePresetSelect(p.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={m.presetEmoji}>{p.emoji}</Text>
                      <Text style={[m.presetLabel, selectedPreset === p.id && { color: p.color }]}>{p.label}</Text>
                      <Text style={m.presetSub}>{p.sub}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[m.nextBtn, !isValid && m.nextBtnOff]}
                  onPress={() => setStep('perms')}
                  disabled={!isValid}
                >
                  <Text style={[m.nextBtnText, !isValid && m.nextBtnTextOff]}>
                    Review Permissions →
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={m.reviewNote}>
                  Sending invite to <Text style={{ color: theme.colors.primary }}>+91 {phone}</Text>
                  {'\n'}Toggle to customise what they can do.
                </Text>

                {PERM_GROUPS.map(group => (
                  <View key={group.group} style={m.permGroup}>
                    <Text style={m.permGroupLabel}>{group.emoji} {group.group.toUpperCase()}</Text>
                    {group.items.map(item => (
                      <View key={item.key} style={m.permRow}>
                        <View style={m.permRowText}>
                          <View style={m.permLabelRow}>
                            <Text style={m.permLabel}>{item.label}</Text>
                            {item.sensitive && <View style={m.sensitiveBadge}><Text style={m.sensitiveBadgeText}>Sensitive</Text></View>}
                          </View>
                          <Text style={m.permSub}>{item.sub}</Text>
                        </View>
                        <Switch
                          value={perms.has(item.key)}
                          onValueChange={() => togglePerm(item.key)}
                          trackColor={{ false: theme.colors.elevated, true: `${theme.colors.primary}55` }}
                          thumbColor={perms.has(item.key) ? theme.colors.primary : theme.colors.textDisabled}
                        />
                      </View>
                    ))}
                  </View>
                ))}

                <View style={m.sendSummary}>
                  <Text style={m.sendSummaryText}>{perms.size} permissions selected</Text>
                </View>

                <TouchableOpacity
                  style={m.nextBtn}
                  onPress={() => onSend(phone, Array.from(perms), selectedPreset)}
                >
                  <Text style={m.nextBtnText}>Send Invite 🚀</Text>
                </TouchableOpacity>
              </>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ member, onClose, onSave }: {
  member: Member
  onClose: () => void
  onSave: (m: Member) => void
}) {
  const theme = useTheme()
  const m = useMemo(() => createModalStyles(theme), [theme])
  const [perms, setPerms] = useState<Set<PermKey>>(new Set(member.perms))
  const [selectedPreset, setSelectedPreset] = useState<Preset>(member.preset)

  const handlePresetSelect = (preset: Preset) => {
    setSelectedPreset(preset)
    if (preset !== 'custom') {
      const found = PRESETS.find(p => p.id === preset)!
      setPerms(new Set(found.perms))
    }
  }

  const togglePerm = (key: PermKey) => {
    setSelectedPreset('custom')
    setPerms(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={m.handle} />

          <View style={m.mHeader}>
            <View style={{ width: 36 }} />
            <View style={m.mTitleBlock}>
              <Text style={m.mTitle}>Edit Access</Text>
              <Text style={m.mTitleSub}>
                {member.name !== 'Unknown' ? member.name : `+91 ${member.phone}`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={m.mCloseBtn}>
              <Text style={m.mCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={m.mScroll}>

            {/* Preset picker */}
            <Text style={m.mLabel}>ACCESS LEVEL</Text>
            <View style={m.presetGrid}>
              {PRESETS.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[m.presetCard, selectedPreset === p.id && { borderColor: p.color, backgroundColor: `${p.color}18` }]}
                  onPress={() => handlePresetSelect(p.id)}
                  activeOpacity={0.8}
                >
                  <Text style={m.presetEmoji}>{p.emoji}</Text>
                  <Text style={[m.presetLabel, selectedPreset === p.id && { color: p.color }]}>{p.label}</Text>
                  <Text style={m.presetSub}>{p.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Permission toggles */}
            <Text style={[m.mLabel, { marginTop: 8 }]}>PERMISSIONS</Text>

            {PERM_GROUPS.map(group => (
              <View key={group.group} style={m.permGroup}>
                <Text style={m.permGroupLabel}>{group.emoji} {group.group.toUpperCase()}</Text>
                {group.items.map(item => (
                  <View key={item.key} style={m.permRow}>
                    <View style={m.permRowText}>
                      <View style={m.permLabelRow}>
                        <Text style={m.permLabel}>{item.label}</Text>
                        {item.sensitive && <View style={m.sensitiveBadge}><Text style={m.sensitiveBadgeText}>Sensitive</Text></View>}
                      </View>
                      <Text style={m.permSub}>{item.sub}</Text>
                    </View>
                    <Switch
                      value={perms.has(item.key)}
                      onValueChange={() => togglePerm(item.key)}
                      trackColor={{ false: theme.colors.elevated, true: `${theme.colors.primary}55` }}
                      thumbColor={perms.has(item.key) ? theme.colors.primary : theme.colors.textDisabled}
                    />
                  </View>
                ))}
              </View>
            ))}

            <TouchableOpacity
              style={m.nextBtn}
              onPress={() => onSave({ ...member, perms: Array.from(perms), preset: selectedPreset })}
            >
              <Text style={m.nextBtnText}>Save Changes</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(theme: ReturnType<typeof useTheme>) {
  const BG   = theme.colors.background
  const SURF = theme.colors.surface
  const ELEV = theme.colors.elevated
  const BOR  = theme.colors.border
  const TP   = theme.colors.textPrimary
  const TS   = theme.colors.textSecondary
  const TD   = theme.colors.textDisabled
  const TEAL = theme.colors.primary

  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SURF, borderBottomWidth: 1,
    borderBottomColor: BOR, paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: ELEV, borderWidth: 1, borderColor: BOR,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: TP, fontSize: 18, fontWeight: '700' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: TP, letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: TS, marginTop: 1 },
  inviteBtn: {
    backgroundColor: TEAL, paddingHorizontal: 14,
    paddingVertical: 9, borderRadius: 22,
  },
  inviteBtnText: { color: '#080F1A', fontSize: 13, fontWeight: '800' },

  scroll: { padding: 16, gap: 12 },

  infoBanner: {
    flexDirection: 'row', gap: 10,
    backgroundColor: 'rgba(0,194,203,0.06)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(0,194,203,0.15)',
    padding: 14, alignItems: 'flex-start',
  },
  infoEmoji: { fontSize: 15, marginTop: 1 },
  infoText: { flex: 1, fontSize: 13, color: TS, lineHeight: 19 },

  sectionLabel: {
    fontSize: 10, fontWeight: '800', color: TD,
    letterSpacing: 1.8, marginTop: 4, marginLeft: 2,
  },

  // Member card
  memberCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SURF, borderRadius: 16,
    borderWidth: 1, borderColor: BOR,
    padding: 14, gap: 12,
  },
  memberAvatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  memberAvatarText: { fontSize: 16, fontWeight: '800', color: '#080F1A' },
  memberInfo: { flex: 1, gap: 3 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberName: { fontSize: 14, fontWeight: '700', color: TP },
  pendingBadge: {
    backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
  },
  pendingBadgeText: { fontSize: 10, color: theme.colors.warning, fontWeight: '700' },
  memberPhone: { fontSize: 12, color: TS },
  presetBadge: { alignSelf: 'flex-start' },
  presetBadgeText: { fontSize: 11, fontWeight: '700' },
  memberPermCount: { fontSize: 11, color: TD },
  memberActions: { gap: 6, alignItems: 'center' },
  memberEditBtn: {
    backgroundColor: ELEV, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: BOR,
  },
  memberEditText: { fontSize: 12, color: TS, fontWeight: '600' },
  memberRemoveBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
  memberRemoveText: { fontSize: 12, color: theme.colors.danger, fontWeight: '700' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: TS },
  emptySub: { fontSize: 13, color: TD },
  })
}

// ─── Modal styles ─────────────────────────────────────────────────────────────

function createModalStyles(theme: ReturnType<typeof useTheme>) {
  const BG   = theme.colors.background
  const SURF = theme.colors.surface
  const ELEV = theme.colors.elevated
  const BOR  = theme.colors.border
  const TP   = theme.colors.textPrimary
  const TS   = theme.colors.textSecondary
  const TD   = theme.colors.textDisabled
  const TEAL = theme.colors.primary

  return StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: BG, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, borderWidth: 1,
    borderBottomWidth: 0, borderColor: BOR,
    maxHeight: '92%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: BOR, alignSelf: 'center', marginTop: 12,
  },
  mHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BOR,
  },
  mBackBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: ELEV, alignItems: 'center', justifyContent: 'center',
  },
  mBackText: { color: TP, fontSize: 18, fontWeight: '700' },
  mTitleBlock: { alignItems: 'center' },
  mTitle: { fontSize: 16, fontWeight: '800', color: TP },
  mTitleSub: { fontSize: 12, color: TS, marginTop: 2 },
  mCloseBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: ELEV, alignItems: 'center', justifyContent: 'center',
  },
  mCloseText: { color: TD, fontSize: 14, fontWeight: '700' },
  mScroll: { padding: 16, gap: 4, paddingBottom: 40 },

  mLabel: {
    fontSize: 10, fontWeight: '800', color: TD,
    letterSpacing: 1.8, marginBottom: 8, marginLeft: 2,
  },

  // Phone input
  phoneBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SURF, borderRadius: 14,
    borderWidth: 1.5, borderColor: BOR,
    paddingHorizontal: 14, gap: 8, minHeight: 54,
  },
  phonePrefix: { fontSize: 16, color: TS, fontWeight: '600' },
  phoneInput: { flex: 1, fontSize: 18, fontWeight: '700', color: TP, padding: 0 },
  phoneCheck: { fontSize: 18, color: TEAL },

  // Preset grid
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  presetCard: {
    width: '47.5%', backgroundColor: SURF,
    borderRadius: 14, borderWidth: 1.5, borderColor: BOR,
    padding: 12, gap: 4,
  },
  presetEmoji: { fontSize: 20 },
  presetLabel: { fontSize: 13, fontWeight: '800', color: TP },
  presetSub: { fontSize: 10, color: TD, lineHeight: 14 },

  reviewNote: {
    fontSize: 13, color: TS, lineHeight: 20,
    marginBottom: 16, textAlign: 'center',
  },

  // Permission groups
  permGroup: {
    backgroundColor: SURF, borderRadius: 14,
    borderWidth: 1, borderColor: BOR,
    overflow: 'hidden', marginBottom: 10,
  },
  permGroupLabel: {
    fontSize: 10, fontWeight: '800', color: TD,
    letterSpacing: 1.5, padding: 12, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: BOR,
  },
  permRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: BOR,
    gap: 8,
  },
  permRowText: { flex: 1, gap: 2 },
  permLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  permLabel: { fontSize: 14, fontWeight: '600', color: TP },
  permSub: { fontSize: 11, color: TS },
  sensitiveBadge: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
  sensitiveBadgeText: { fontSize: 9, color: theme.colors.danger, fontWeight: '700', letterSpacing: 0.3 },

  sendSummary: {
    alignItems: 'center', paddingVertical: 10,
  },
  sendSummaryText: { fontSize: 13, color: TEAL, fontWeight: '700' },

  nextBtn: {
    backgroundColor: TEAL, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 8,
  },
  nextBtnOff: { backgroundColor: ELEV },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: '#080F1A' },
  nextBtnTextOff: { color: TD },
  })
}
