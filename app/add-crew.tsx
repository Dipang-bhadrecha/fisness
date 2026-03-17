/**
 * app/add-crew.tsx — Add / Edit Crew Member
 *
 * ADD mode : router.push('/add-crew', { boatId, boatName })
 * EDIT mode : router.push('/add-crew', { boatId, boatName, memberId,
 *               prefillName, prefillRole, prefillAadhaar,
 *               prefillPhone, prefillJoiningDate, prefillPagar })
 *
 * Roles  : Pilot / Captain · Khalasi · Bhandari   (3 only)
 * Pagar  : monthly  ₹ / month
 */

import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useRef, useState } from 'react'
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG      = '#080F1A'
const SURF    = '#0D1B2E'
const ELEV    = '#132640'
const BOR     = 'rgba(255,255,255,0.06)'
const BOR2    = 'rgba(255,255,255,0.10)'
const TP      = '#F0F4F8'
const TS      = '#8BA3BC'
const TM      = '#3D5A73'
const TEAL    = '#0891b2'
const GREEN   = '#059669'
const DANGER  = '#ef4444'
const PH      = '#3D5A73'   // placeholder

// ─── 3 Roles only ─────────────────────────────────────────────────────────────
const ROLES = [
  { id: 'pilot',    label: 'Pilot / Captain', icon: 'person-circle-outline' as const },
  { id: 'khalasi',  label: 'Khalasi',          icon: 'boat-outline'          as const },
  { id: 'bhandari', label: 'Bhandari',         icon: 'restaurant-outline'    as const },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtAadhaar = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 12)
  return d.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join(' ')
  )
}
const fmtPhone = (raw: string) => raw.replace(/\D/g, '').slice(0, 10)

// ─── Role Picker ──────────────────────────────────────────────────────────────
function RolePicker({ visible, selected, onSelect, onClose }: {
  visible: boolean; selected: string
  onSelect: (r: string) => void; onClose: () => void
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={rp.overlay} onPress={onClose}>
        <Pressable style={rp.sheet}>
          <View style={rp.handle} />
          <Text style={rp.title}>Select Role</Text>
          {ROLES.map(r => {
            const on = selected === r.label
            return (
              <TouchableOpacity
                key={r.id}
                style={[rp.row, on && rp.rowOn]}
                activeOpacity={0.75}
                onPress={() => { onSelect(r.label); onClose() }}
              >
                <View style={[rp.icon, on && { backgroundColor: TEAL + '30' }]}>
                  <Ionicons name={r.icon} size={20} color={on ? TEAL : TS} />
                </View>
                <Text style={[rp.label, on && { color: TEAL, fontWeight: '700' }]}>{r.label}</Text>
                {on && <Ionicons name="checkmark-circle" size={20} color={TEAL} style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            )
          })}
          <TouchableOpacity style={rp.cancel} onPress={onClose} activeOpacity={0.8}>
            <Text style={rp.cancelTxt}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
const rp = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: SURF, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  handle:  { width: 40, height: 4, backgroundColor: BOR2, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title:   { fontSize: 16, fontWeight: '800', color: TP, marginBottom: 8 },
  row:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 8, borderRadius: 10 },
  rowOn:   { backgroundColor: TEAL + '15' },
  icon:    { width: 36, height: 36, borderRadius: 10, backgroundColor: ELEV, alignItems: 'center', justifyContent: 'center' },
  label:   { fontSize: 15, color: TP, fontWeight: '500' },
  cancel:  { marginTop: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: ELEV, borderRadius: 12 },
  cancelTxt: { fontSize: 14, color: TS, fontWeight: '600' },
})

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string | null; children: React.ReactNode
}) {
  return (
    <View style={fi.wrap}>
      <View style={fi.row}>
        <Text style={fi.label}>{label}</Text>
        {required && <Text style={fi.req}> *</Text>}
      </View>
      {children}
      {!!error && <Text style={fi.err}>{error}</Text>}
    </View>
  )
}
const fi = StyleSheet.create({
  wrap:  { gap: 6 },
  row:   { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '700', color: TS, textTransform: 'uppercase', letterSpacing: 0.6 },
  req:   { fontSize: 12, color: TEAL, fontWeight: '800' },
  err:   { fontSize: 11, color: DANGER, marginTop: 2 },
})

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AddCrewScreen() {
  const p = useLocalSearchParams<{
    boatId?: string; boatName?: string; memberId?: string
    prefillName?: string; prefillRole?: string; prefillAadhaar?: string
    prefillPhone?: string; prefillJoiningDate?: string; prefillPagar?: string
  }>()

  const isEdit = !!p.memberId

  const [name,    setName]    = useState(p.prefillName        ?? '')
  const [role,    setRole]    = useState(p.prefillRole        ?? '')
  const [aadhaar, setAadhaar] = useState(p.prefillAadhaar     ?? '')
  const [phone,   setPhone]   = useState(p.prefillPhone       ?? '')
  const [date,    setDate]    = useState(p.prefillJoiningDate ?? '')
  const [pagar,   setPagar]   = useState(p.prefillPagar       ?? '')

  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [errors,     setErrors]     = useState<Record<string, string>>({})

  const aadhaarRef = useRef<TextInput>(null)
  const phoneRef   = useRef<TextInput>(null)
  const dateRef    = useRef<TextInput>(null)
  const pagarRef   = useRef<TextInput>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim())                        e.name    = 'Name is required'
    if (!role)                               e.role    = 'Please select a role'
    const raw = aadhaar.replace(/\s/g, '')
    if (raw && raw.length !== 12)            e.aadhaar = 'Aadhaar must be 12 digits'
    if (phone && phone.length !== 10)        e.phone   = 'Phone must be 10 digits'
    return e
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    try {
      // TODO isEdit
      //   ? PATCH /api/v1/crew/:memberId
      //   : POST  /api/v1/boats/:boatId/crew
      await new Promise(r => setTimeout(r, 800))
      router.back()
    } catch {
      setSaving(false)
    }
  }

  const canSave = name.trim().length >= 2 && role.length > 0

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={18} color={TP} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>{isEdit ? 'Edit Crew Member' : 'Add Crew Member'}</Text>
            {!!p.boatName && <Text style={s.headerSub}>⛵ {p.boatName}</Text>}
          </View>
          <TouchableOpacity
            style={[s.saveBtn, (!canSave || saving) && s.saveBtnOff]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!canSave || saving}
          >
            {saving
              ? <ActivityIndicator size={14} color="#fff" />
              : <Text style={s.saveBtnText}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* Avatar */}
            <View style={s.avatarRow}>
              <View style={s.avatarCircle}>
                <Ionicons name="person-outline" size={38} color={TM} />
              </View>
              <Text style={s.avatarHint}>Photo coming soon</Text>
            </View>

            {/* ── PERSONAL INFO ── */}
            <Text style={s.section}>PERSONAL INFO</Text>
            <View style={s.card}>

              <Field label="Full Name" required error={errors.name}>
                <TextInput
                  style={[s.input, !!errors.name && s.inputErr]}
                  placeholder="e.g. Suraj Tandel"
                  placeholderTextColor={PH}
                  value={name}
                  onChangeText={v => { setName(v); if (errors.name) setErrors(x => ({ ...x, name: '' })) }}
                  returnKeyType="next"
                  onSubmitEditing={() => aadhaarRef.current?.focus()}
                  autoCapitalize="words"
                />
              </Field>

              <View style={s.hr} />

              <Field label="Role" required error={errors.role}>
                <TouchableOpacity
                  style={[s.input, s.selectRow, !!errors.role && s.inputErr]}
                  onPress={() => setPickerOpen(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.selectTxt, !role && { color: PH }]}>
                    {role || 'Select a role…'}
                  </Text>
                  <Ionicons name="chevron-down" size={15} color={TS} />
                </TouchableOpacity>
              </Field>

            </View>

            {/* ── ID & CONTACT ── */}
            <Text style={s.section}>ID & CONTACT</Text>
            <View style={s.card}>

              <Field label="Aadhaar Card Number" error={errors.aadhaar}>
                <TextInput
                  ref={aadhaarRef}
                  style={[s.input, !!errors.aadhaar && s.inputErr]}
                  placeholder="1234 5678 9012"
                  placeholderTextColor={PH}
                  value={aadhaar}
                  onChangeText={v => {
                    setAadhaar(fmtAadhaar(v))
                    if (errors.aadhaar) setErrors(x => ({ ...x, aadhaar: '' }))
                  }}
                  keyboardType="number-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  maxLength={14}
                />
              </Field>

              <View style={s.hr} />

              <Field label="Phone Number" error={errors.phone}>
                <View style={s.prefixRow}>
                  <View style={s.prefixBox}>
                    <Text style={s.prefixTxt}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    ref={phoneRef}
                    style={[s.input, { flex: 1 }, !!errors.phone && s.inputErr]}
                    placeholder="98765 43210"
                    placeholderTextColor={PH}
                    value={phone}
                    onChangeText={v => {
                      setPhone(fmtPhone(v))
                      if (errors.phone) setErrors(x => ({ ...x, phone: '' }))
                    }}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => dateRef.current?.focus()}
                    maxLength={10}
                  />
                </View>
              </Field>

            </View>

            {/* ── EMPLOYMENT ── */}
            <Text style={s.section}>EMPLOYMENT</Text>
            <View style={s.card}>

              <Field label="Joining Date">
                <TextInput
                  ref={dateRef}
                  style={s.input}
                  placeholder="e.g. 03 - Jul - 2026"
                  placeholderTextColor={PH}
                  value={date}
                  onChangeText={setDate}
                  returnKeyType="next"
                  onSubmitEditing={() => pagarRef.current?.focus()}
                />
              </Field>

              <View style={s.hr} />

              {/* Monthly pagar */}
              <Field label="Pagar (₹ / month)">
                <View style={s.prefixRow}>
                  <View style={s.prefixBox}>
                    <Text style={[s.prefixTxt, { color: GREEN }]}>₹</Text>
                  </View>
                  <TextInput
                    ref={pagarRef}
                    style={[s.input, { flex: 1 }]}
                    placeholder="e.g. 15000"
                    placeholderTextColor={PH}
                    value={pagar}
                    onChangeText={v => setPagar(v.replace(/\D/g, ''))}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    onSubmitEditing={handleSave}
                  />
                </View>
              </Field>

            </View>

            {/* Bottom CTA */}
            <TouchableOpacity
              style={[s.cta, (!canSave || saving) && s.ctaOff]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={!canSave || saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Ionicons
                      name={isEdit ? 'checkmark-circle-outline' : 'person-add-outline'}
                      size={18} color="#fff"
                    />
                    <Text style={s.ctaTxt}>{isEdit ? 'Save Changes' : 'Add to Crew'}</Text>
                  </>
              }
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        <RolePicker
          visible={pickerOpen}
          selected={role}
          onSelect={r => { setRole(r); if (errors.role) setErrors(x => ({ ...x, role: '' })) }}
          onClose={() => setPickerOpen(false)}
        />

      </SafeAreaView>
    </>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    gap: 12, borderBottomWidth: 1, borderBottomColor: BOR,
  },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: ELEV, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: TP },
  headerSub:    { fontSize: 12, color: TS, marginTop: 1 },
  saveBtn:      { backgroundColor: TEAL, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, minWidth: 60, alignItems: 'center' },
  saveBtnOff:   { opacity: 0.4 },
  saveBtnText:  { fontSize: 13, fontWeight: '700', color: '#fff' },

  avatarRow:    { alignItems: 'center', paddingVertical: 20, gap: 6 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: ELEV, borderWidth: 2, borderColor: BOR2, alignItems: 'center', justifyContent: 'center' },
  avatarHint:   { fontSize: 11, color: TM },

  scroll:   { flex: 1 },
  content:  { paddingHorizontal: 16, paddingBottom: 16 },

  section:  { fontSize: 11, fontWeight: '700', color: TM, letterSpacing: 1, paddingTop: 16, paddingBottom: 6 },
  card:     { backgroundColor: SURF, borderRadius: 14, borderWidth: 1, borderColor: BOR, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  hr:       { height: 1, backgroundColor: BOR, marginVertical: 2 },

  input:     { height: 44, backgroundColor: ELEV, borderRadius: 10, borderWidth: 1, borderColor: BOR2, paddingHorizontal: 12, fontSize: 14, color: TP },
  inputErr:  { borderColor: DANGER + '90' },
  selectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectTxt: { fontSize: 14, color: TP },

  prefixRow: { flexDirection: 'row', gap: 8 },
  prefixBox: { height: 44, backgroundColor: ELEV, borderRadius: 10, borderWidth: 1, borderColor: BOR2, paddingHorizontal: 12, justifyContent: 'center' },
  prefixTxt: { fontSize: 13, color: TS, fontWeight: '600' },

  cta:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: TEAL, borderRadius: 14, paddingVertical: 16, marginTop: 22 },
  ctaOff: { opacity: 0.4 },
  ctaTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
})