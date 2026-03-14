/**
 * app/boats.tsx — My Boats Screen (Boat Owner)
 *
 * PLACE AT: app/boats.tsx
 *
 * Features:
 *   - Fleet summary (total, at sea, season catch)
 *   - Search by name / registration
 *   - Per-boat actions: Tali, Expense, Crew, Details
 *   - "+ Add" button → bottom-sheet modal → POST /api/v1/boats
 */

import { ApiError } from '@/services/api'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../constants/theme'
import { useAuthStore } from '../store/authStore'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Boat {
  id: string
  name: string
  nameGujarati?: string
  registrationNumber?: string
  status: 'active' | 'docked' | 'maintenance'
  captain?: string
  crewCount: number
  totalCatch: number
  totalExpense: number
  lastTripDate?: string
}

// ─── Mock data — replace with API call to GET /api/v1/boats ──────────────────

const MOCK_BOATS: Boat[] = [
  {
    id: '1',
    name: 'Jai Mataji',
    nameGujarati: 'જય માતાજી',
    registrationNumber: 'GJ-VR-1042',
    status: 'active',
    captain: 'Ramesh Bhai',
    crewCount: 8,
    totalCatch: 12400,
    totalExpense: 85000,
    lastTripDate: '12 Mar 2026',
  },
  {
    id: '2',
    name: 'Sea Star',
    nameGujarati: 'સી સ્ટાર',
    registrationNumber: 'GJ-VR-2201',
    status: 'docked',
    captain: 'Suresh Kaka',
    crewCount: 6,
    totalCatch: 9800,
    totalExpense: 62000,
    lastTripDate: '10 Mar 2026',
  },
  {
    id: '3',
    name: 'Deep Blue',
    registrationNumber: 'GJ-VR-3345',
    status: 'maintenance',
    crewCount: 0,
    totalCatch: 4200,
    totalExpense: 120000,
    lastTripDate: '28 Feb 2026',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('en-IN')

const STATUS_CONFIG = {
  active:      { label: 'At Sea',  color: '#059669', bg: '#d1fae5' },
  docked:      { label: 'Docked',  color: '#1B7FBF', bg: '#dbeafe' },
  maintenance: { label: 'Repair',  color: '#d97706', bg: '#fef3c7' },
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD BOAT MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface AddBoatModalProps {
  visible: boolean
  onClose: () => void
  onBoatAdded: (boat: Boat) => void
}

function AddBoatModal({ visible, onClose, onBoatAdded }: AddBoatModalProps) {
  const { token } = useAuthStore()

  const [name, setName]       = useState('')
  const [nameGuj, setNameGuj] = useState('')
  const [regNum, setRegNum]   = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const isValid = name.trim().length >= 2

  const reset = () => {
    setName('')
    setNameGuj('')
    setRegNum('')
    setError(null)
    setSaving(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSave = async () => {
    if (!isValid || saving) return
    setError(null)
    setSaving(true)

    try {
      // ── Real API call ──────────────────────────────────────────────────────
      // Uncomment when backend POST /api/v1/boats is confirmed working:
      //
      // const created = await request<Boat>('/api/v1/boats', {
      //   method: 'POST',
      //   token: token!,
      //   body: JSON.stringify({
      //     name: name.trim(),
      //     nameGujarati: nameGuj.trim() || undefined,
      //     registrationNumber: regNum.trim() || undefined,
      //   }),
      // })
      // onBoatAdded(created)
      //
      // ── Mock for now ───────────────────────────────────────────────────────
      await new Promise(r => setTimeout(r, 800))
      const mockBoat: Boat = {
        id: Date.now().toString(),
        name: name.trim(),
        nameGujarati: nameGuj.trim() || undefined,
        registrationNumber: regNum.trim() || undefined,
        status: 'docked',
        crewCount: 0,
        totalCatch: 0,
        totalExpense: 0,
      }
      onBoatAdded(mockBoat)
      reset()
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not save boat. Please try again.'
      )
      setSaving(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={m.container}>

          {/* Header */}
          <View style={m.header}>
            <TouchableOpacity onPress={handleClose} style={m.cancelBtn}>
              <Text style={m.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={m.title}>Add Boat</Text>
            <TouchableOpacity
              style={[m.saveBtn, (!isValid || saving) && m.saveBtnOff]}
              onPress={handleSave}
              disabled={!isValid || saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={m.saveText}>Save</Text>
              }
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={m.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Hero */}
            <View style={m.hero}>
              <Text style={m.heroEmoji}>⛵</Text>
              <Text style={m.heroSub}>Enter your boat's details below</Text>
            </View>

            {/* Error banner */}
            {error && (
              <View style={m.errorBanner}>
                <Text style={m.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* Boat Name (required) */}
            <View style={m.fieldGroup}>
              <Text style={m.fieldLabel}>
                Boat Name <Text style={m.required}>*</Text>
              </Text>
              <TextInput
                style={[m.input, name.trim().length > 0 && m.inputFilled]}
                placeholder="e.g. Jai Mataji, Sea Star, Alpha"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={t => { setName(t); setError(null) }}
                autoFocus
                returnKeyType="next"
              />
              <Text style={m.fieldHint}>This name appears on all records and bills</Text>
            </View>

            {/* Gujarati Name (optional) */}
            <View style={m.fieldGroup}>
              <Text style={m.fieldLabel}>
                Gujarati Name <Text style={m.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={[m.input, nameGuj.trim().length > 0 && m.inputFilled]}
                placeholder="e.g. જય માતાજી"
                placeholderTextColor={theme.colors.textSecondary}
                value={nameGuj}
                onChangeText={setNameGuj}
                returnKeyType="next"
              />
              <Text style={m.fieldHint}>Shown alongside the English name</Text>
            </View>

            {/* Registration Number (optional) */}
            <View style={m.fieldGroup}>
              <Text style={m.fieldLabel}>
                Registration Number <Text style={m.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={[m.input, regNum.trim().length > 0 && m.inputFilled]}
                placeholder="e.g. GJ-VR-1042"
                placeholderTextColor={theme.colors.textSecondary}
                value={regNum}
                onChangeText={t => setRegNum(t.toUpperCase())}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <Text style={m.fieldHint}>Government registration / license plate</Text>
            </View>

            {/* What you can do next */}
            <View style={m.nextSteps}>
              <Text style={m.nextTitle}>After adding, you can:</Text>
              <Text style={m.nextItem}>⚓  Start recording Tali sessions for this boat</Text>
              <Text style={m.nextItem}>💸  Track expenses — diesel, maintenance, crew</Text>
              <Text style={m.nextItem}>👥  Add crew members and manage kharchi</Text>
            </View>

          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOAT CARD
// ═══════════════════════════════════════════════════════════════════════════════

function BoatCard({ boat }: { boat: Boat }) {
  const status = STATUS_CONFIG[boat.status]

  return (
    <View style={s.boatCard}>
      <View style={s.boatCardTop}>
        <View style={s.boatIconWrap}>
          <Text style={s.boatEmoji}>⛵</Text>
        </View>
        <View style={s.boatInfo}>
          <Text style={s.boatName}>{boat.name}</Text>
          {boat.nameGujarati     && <Text style={s.boatNameGuj}>{boat.nameGujarati}</Text>}
          {boat.registrationNumber && <Text style={s.boatReg}>{boat.registrationNumber}</Text>}
        </View>
        <View style={[s.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statValue}>{fmt(boat.totalCatch)} kg</Text>
          <Text style={s.statLabel}>Season Catch</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statValue}>₹{fmt(boat.totalExpense)}</Text>
          <Text style={s.statLabel}>Expenses</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statValue}>{boat.crewCount}</Text>
          <Text style={s.statLabel}>Crew</Text>
        </View>
      </View>

      {(boat.captain || boat.lastTripDate) && (
        <View style={s.metaRow}>
          {boat.captain      && <Text style={s.metaText}>👨‍✈️ {boat.captain}</Text>}
          {boat.lastTripDate && <Text style={s.metaText}>📅 Last: {boat.lastTripDate}</Text>}
        </View>
      )}

      <View style={s.actionRow}>
        <TouchableOpacity style={s.actionBtn}
          onPress={() => router.push({ pathname: '/tali',    params: { boatId: boat.id, boatName: boat.name } } as any)}>
          <Text style={s.actionBtnEmoji}>⚓</Text>
          <Text style={s.actionBtnText}>Tali</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn}
          onPress={() => router.push({ pathname: '/kharchi', params: { boatId: boat.id, boatName: boat.name } } as any)}>
          <Text style={s.actionBtnEmoji}>💸</Text>
          <Text style={s.actionBtnText}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn}
          onPress={() => router.push({ pathname: '/crew',    params: { boatId: boat.id, boatName: boat.name } } as any)}>
          <Text style={s.actionBtnEmoji}>👥</Text>
          <Text style={s.actionBtnText}>Crew</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.actionBtn, s.actionBtnPrimary]}
          onPress={() => router.push({
            pathname: '/boat-detail',
            params: {
              boatId:           boat.id,
              boatName:         boat.name,
              boatNameGujarati: boat.nameGujarati ?? '',
              registration:     boat.registrationNumber ?? '',
              status:           boat.status,
              captain:          boat.captain ?? '',
              crewCount:        String(boat.crewCount ?? 0),
            },
          } as any)}
        >
          <Text style={s.actionBtnEmoji}>📊</Text>
          <Text style={[s.actionBtnText, { color: theme.colors.primary }]}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

export default function BoatsScreen() {
  const [boats, setBoats]         = useState<Boat[]>(MOCK_BOATS)
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = search.trim()
    ? boats.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.registrationNumber ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : boats

  const totalCatch  = boats.reduce((s, b) => s + b.totalCatch, 0)
  const activeCount = boats.filter(b => b.status === 'active').length

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <SafeAreaView style={s.container} edges={['top']}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>My Boats</Text>
            <Text style={s.headerSub}>{boats.length} boats in your fleet</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
            <Text style={s.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Fleet summary */}
        <View style={s.summaryRow}>
          <View style={s.summaryItem}>
            <Text style={s.summaryValue}>{boats.length}</Text>
            <Text style={s.summaryLabel}>Total Boats</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryItem}>
            <Text style={[s.summaryValue, { color: '#059669' }]}>{activeCount}</Text>
            <Text style={s.summaryLabel}>At Sea</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryItem}>
            <Text style={s.summaryValue}>{fmt(totalCatch)} kg</Text>
            <Text style={s.summaryLabel}>Season Catch</Text>
          </View>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search boat name or registration..."
            placeholderTextColor={theme.colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={s.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Boat list */}
        <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyEmoji}>🚢</Text>
              <Text style={s.emptyTitle}>
                {search ? 'No boats found' : 'No boats yet'}
              </Text>
              <Text style={s.emptySub}>
                {search
                  ? 'Try a different search term'
                  : 'Tap "+ Add" above to register your first boat'}
              </Text>
              {!search && (
                <TouchableOpacity style={s.emptyBtn} onPress={() => setShowModal(true)}>
                  <Text style={s.emptyBtnText}>+ Add First Boat</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filtered.map(boat => <BoatCard key={boat.id} boat={boat} />)
          )}
          <View style={{ height: 32 }} />
        </ScrollView>

      </SafeAreaView>

      {/* Add Boat Modal */}
      <AddBoatModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onBoatAdded={boat => setBoats(prev => [boat, ...prev])}
      />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES — Screen
// ═══════════════════════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: theme.colors.background },

  header:       { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backText:     { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  addBtn:       { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  addBtnText:   { color: '#fff', fontSize: 13, fontWeight: '700' },

  summaryRow:     { flexDirection: 'row', backgroundColor: theme.colors.surface, marginHorizontal: 16, marginTop: 12, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: theme.colors.border },
  summaryItem:    { flex: 1, alignItems: 'center' },
  summaryValue:   { fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary },
  summaryLabel:   { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: theme.colors.border, marginVertical: 4 },

  searchWrap:  { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 4, backgroundColor: theme.colors.surface, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.colors.border },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 11, color: theme.colors.textPrimary, fontSize: 14 },
  clearBtn:    { fontSize: 14, color: theme.colors.textSecondary, padding: 4 },

  list: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },

  boatCard:     { backgroundColor: theme.colors.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  boatCardTop:  { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  boatIconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: theme.colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  boatEmoji:    { fontSize: 26 },
  boatInfo:     { flex: 1 },
  boatName:     { fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary },
  boatNameGuj:  { fontSize: 13, color: theme.colors.textSecondary, marginTop: 1 },
  boatReg:      { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2, fontFamily: 'monospace' },
  statusBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText:   { fontSize: 11, fontWeight: '700' },

  statsRow:    { flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingVertical: 10, paddingHorizontal: 14 },
  statItem:    { flex: 1, alignItems: 'center' },
  statValue:   { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary },
  statLabel:   { fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: theme.colors.border, marginVertical: 4 },

  metaRow:  { flexDirection: 'row', gap: 16, paddingHorizontal: 14, paddingBottom: 8 },
  metaText: { fontSize: 12, color: theme.colors.textSecondary },

  actionRow:        { flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingVertical: 8, paddingHorizontal: 8, gap: 4 },
  actionBtn:        { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, gap: 3 },
  actionBtnPrimary: { backgroundColor: theme.colors.primary + '12' },
  actionBtnEmoji:   { fontSize: 18 },
  actionBtnText:    { fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary },

  emptyBox:     { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyEmoji:   { fontSize: 56 },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 8 },
  emptySub:     { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', maxWidth: 240 },
  emptyBtn:     { marginTop: 16, backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
})

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES — Modal
// ═══════════════════════════════════════════════════════════════════════════════

const m = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  cancelBtn:  { paddingVertical: 6, paddingRight: 12 },
  cancelText: { fontSize: 15, color: theme.colors.textSecondary },
  title:      { fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary },
  saveBtn:    { backgroundColor: theme.colors.primary, paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20, minWidth: 64, alignItems: 'center' },
  saveBtnOff: { backgroundColor: theme.colors.border },
  saveText:   { color: '#fff', fontWeight: '700', fontSize: 14 },

  scroll: { padding: 20, gap: 4 },

  hero:      { alignItems: 'center', paddingVertical: 20 },
  heroEmoji: { fontSize: 56 },
  heroSub:   { fontSize: 14, color: theme.colors.textSecondary, marginTop: 8 },

  errorBanner: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 8 },
  errorText:   { fontSize: 13, color: '#dc2626' },

  fieldGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 6 },
  required:   { color: '#ef4444' },
  optional:   { fontSize: 12, fontWeight: '400', color: theme.colors.textSecondary },
  input:      { backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: theme.colors.textPrimary },
  inputFilled:{ borderColor: theme.colors.primary },
  fieldHint:  { fontSize: 12, color: theme.colors.textSecondary, marginTop: 5 },

  nextSteps: { marginTop: 12, backgroundColor: theme.colors.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, padding: 16, gap: 8 },
  nextTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  nextItem:  { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 20 },
})