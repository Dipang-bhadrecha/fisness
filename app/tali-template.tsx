/**
 * app/tali-template.tsx — Tali Bill Template Builder
 *
 * Company owner designs their bill template (one-time setup).
 * Saved to AsyncStorage keyed by companyId.
 * Triggered automatically on first tali session if no template exists.
 *
 * Navigation:
 *   From company profile → router.push('/tali-template', { companyId, companyName })
 *   From tali-bill (no template) → router.push('/tali-template', { companyId, companyName, redirectAfter: 'tali-bill' })
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG    = '#0F1923'
const SURF  = '#162030'
const ELEV  = '#1E2D3E'
const BOR   = 'rgba(255,255,255,0.07)'
const BOR2  = 'rgba(255,255,255,0.13)'
const TP    = '#F0F4F8'
const TS    = '#8BA3BC'
const TM    = '#3D5A73'
const TEAL  = '#0891b2'
const GOLD  = '#C9A84C'
const PAPER = '#FEFDF8'

// ─── Template type ────────────────────────────────────────────────────────────
export interface TaliTemplate {
  companyId: string
  companyName: string
  companyNameGujarati: string
  tagline: string
  location: string
  phone: string
  blessing1: string
  blessing2: string
  billPrefix: string
  billCounter: number
  showLogo: boolean
  createdAt: string
}

export const TEMPLATE_KEY = (companyId: string) => `tali_template_${companyId}`

export async function loadTemplate(companyId: string): Promise<TaliTemplate | null> {
  try {
    const raw = await AsyncStorage.getItem(TEMPLATE_KEY(companyId))
    if (!raw) return null
    return JSON.parse(raw) as TaliTemplate
  } catch {
    return null
  }
}

export async function saveTemplate(template: TaliTemplate): Promise<void> {
  await AsyncStorage.setItem(TEMPLATE_KEY(template.companyId), JSON.stringify(template))
}

export function getNextBillNumber(template: TaliTemplate): string {
  const num = String(template.billCounter).padStart(3, '0')
  return `${template.billPrefix}-${num}`
}

// ─── Live Preview ─────────────────────────────────────────────────────────────
function LivePreview({ template }: { template: Partial<TaliTemplate> }) {
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <View style={pv.paper}>
      {/* Blessings */}
      <View style={pv.blessingsRow}>
        <Text style={pv.blessingText} numberOfLines={1}>
          {template.blessing1 || 'શ્રી ગણેશાય નમઃ'}
        </Text>
        <Text style={pv.blessingText} numberOfLines={1}>
          {template.blessing2 || 'જય અંબે'}
        </Text>
      </View>

      {/* Logo + Company header */}
      <View style={pv.headerRow}>
        {template.showLogo && (
          <View style={pv.logoBox}>
            <Text style={pv.logoPlaceholder}>LOGO</Text>
          </View>
        )}
        <View style={pv.headerCenter}>
          <Text style={pv.companyName} numberOfLines={1}>
            {template.companyName || 'તમારી કંપની'}
          </Text>
          <Text style={pv.tagline} numberOfLines={1}>
            {template.tagline || 'title for your company'}
          </Text>
          <Text style={pv.location} numberOfLines={1}>
            {template.location || 'સ્થળ / Location'}
          </Text>
          {template.phone ? (
            <Text style={pv.phone}>Mo. {template.phone}</Text>
          ) : null}
        </View>
      </View>

      {/* Bill meta */}
      <View style={pv.metaRow}>
        <Text style={pv.metaText}>
          No. {template.billPrefix || 'BILL'}-001
        </Text>
        <Text style={pv.metaText}>Date: {today}</Text>
      </View>

      {/* Boat info placeholder */}
      <View style={pv.boatRow}>
        <Text style={pv.boatText}>નામ: સુરેશ પ્રેમજી ગોસ઼ીયા</Text>
      </View>
      <View style={pv.boatRow}>
        <Text style={pv.boatText}>બોટ નામ: Paras</Text>
        <Text style={pv.boatText}>Boat reg. no: GJ 11 BK 1224</Text>
      </View>

      {/* Table header */}
      <View style={pv.tableHeader}>
        <Text style={[pv.th, { flex: 2 }]}>માલ ની જાત</Text>
        <Text style={[pv.th, { flex: 0.6, textAlign: 'center' }]}>નંગ</Text>
        <Text style={[pv.th, { flex: 1.2, textAlign: 'center' }]}>વજન{'\n'}કિલો ગ્રામ</Text>
        <Text style={[pv.th, { flex: 1.2, textAlign: 'center' }]}>ભાવ{'\n'}રૂ. પૈ.</Text>
        <Text style={[pv.th, { flex: 1.2, textAlign: 'center' }]}>રકમ{'\n'}રૂ. પૈ.</Text>
      </View>

      {/* Sample rows */}
      {['જંબો', 'સો. જંબો', 'મિડીયમ', ''].map((fish, i) => (
        <View key={i} style={pv.tableRow}>
          <Text style={[pv.td, { flex: 2 }]}>{fish}</Text>
          <Text style={[pv.td, { flex: 0.6, textAlign: 'center' }]}>{fish ? '10' : ''}</Text>
          <Text style={[pv.td, { flex: 1.2, textAlign: 'center' }]}>{fish ? '250' : ''}</Text>
          <Text style={[pv.td, { flex: 1.2, textAlign: 'center' }]}>{fish ? '200' : ''}</Text>
          <Text style={[pv.td, { flex: 1.2, textAlign: 'center' }]}>{fish ? '50000' : ''}</Text>
        </View>
      ))}

      {/* Total */}
      <View style={pv.totalRow}>
        <Text style={[pv.td, { flex: 5, textAlign: 'right', fontWeight: '700' }]}>
          રોટલ
        </Text>
        <Text style={[pv.td, { flex: 1.2, textAlign: 'center', fontWeight: '700' }]}>
          1,50,000
        </Text>
      </View>

      {/* Signature */}
      <View style={pv.signRow}>
        <Text style={pv.signLabel}>સહી / SIGNATURE</Text>
        <Text style={pv.signCompany}>{template.companyName || 'તમારી કંપની'}</Text>
      </View>
    </View>
  )
}

const pv = StyleSheet.create({
  paper: {
    backgroundColor: PAPER,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  blessingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f5f0e8',
  },
  blessingText: {
    fontSize: 8,
    color: '#5a4a2a',
    fontStyle: 'italic',
    maxWidth: '48%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    gap: 6,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: '#aaa',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  logoPlaceholder: {
    fontSize: 7,
    color: '#999',
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 8,
    color: '#444',
    textAlign: 'center',
  },
  location: {
    fontSize: 8,
    color: '#444',
    textAlign: 'center',
  },
  phone: {
    fontSize: 7,
    color: '#666',
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f5f0e8',
  },
  metaText: {
    fontSize: 8,
    color: '#333',
    fontWeight: '600',
  },
  boatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  boatText: {
    fontSize: 7,
    color: '#333',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e8e0d0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#bbb',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  th: {
    fontSize: 7,
    fontWeight: '800',
    color: '#222',
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    paddingVertical: 3,
    paddingHorizontal: 4,
    minHeight: 16,
  },
  td: {
    fontSize: 7,
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#bbb',
    paddingVertical: 3,
    paddingHorizontal: 4,
    backgroundColor: '#f0ece0',
  },
  signRow: {
    alignItems: 'center',
    padding: 8,
    gap: 2,
  },
  signLabel: {
    fontSize: 7,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signCompany: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1a1a1a',
  },
})

// ─── Field Component ──────────────────────────────────────────────────────────
function Field({
  label, hint, value, onChangeText, placeholder, maxLength, keyboardType,
}: {
  label: string
  hint?: string
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
  maxLength?: number
  keyboardType?: 'default' | 'phone-pad' | 'numeric'
}) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      {hint ? <Text style={f.hint}>{hint}</Text> : null}
      <TextInput
        style={f.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={TM}
        maxLength={maxLength}
        keyboardType={keyboardType ?? 'default'}
        returnKeyType="done"
      />
    </View>
  )
}

const f = StyleSheet.create({
  wrap:  { gap: 4 },
  label: { fontSize: 11, fontWeight: '700', color: TS, textTransform: 'uppercase', letterSpacing: 0.6 },
  hint:  { fontSize: 11, color: TM, marginTop: -2 },
  input: {
    height: 46,
    backgroundColor: ELEV,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BOR2,
    paddingHorizontal: 14,
    fontSize: 15,
    color: TP,
    fontWeight: '500',
  },
})

// ─── Section Header ────────────────────────────────────────────────────────────
function Section({ title, emoji }: { title: string; emoji: string }) {
  return (
    <View style={sec.wrap}>
      <Text style={sec.emoji}>{emoji}</Text>
      <Text style={sec.title}>{title}</Text>
    </View>
  )
}
const sec = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  emoji: { fontSize: 16 },
  title: { fontSize: 13, fontWeight: '800', color: GOLD, letterSpacing: 0.5 },
})

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TaliTemplateScreen() {
  const params = useLocalSearchParams<{
    companyId?: string
    companyName?: string
    redirectAfter?: string
  }>()

  const companyId   = params.companyId   ?? 'default'
  const redirectAfter = params.redirectAfter

  // Form state
  const [companyName,          setCompanyName]          = useState(params.companyName ?? '')
  const [companyNameGujarati,  setCompanyNameGujarati]  = useState('')
  const [tagline,              setTagline]              = useState('')
  const [location,             setLocation]             = useState('')
  const [phone,                setPhone]                = useState('')
  const [blessing1,            setBlessing1]            = useState('શ્રી ગણેશાય નમઃ')
  const [blessing2,            setBlessing2]            = useState('જય અંબે')
  const [billPrefix,           setBillPrefix]           = useState('BILL')
  const [billCounter,          setBillCounter]          = useState('1')
  const [showLogo,             setShowLogo]             = useState(true)
  const [saving,               setSaving]               = useState(false)
  const [previewVisible,       setPreviewVisible]       = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Load existing template if it exists
    loadTemplate(companyId).then(t => {
      if (!t) return
      setCompanyName(t.companyName)
      setCompanyNameGujarati(t.companyNameGujarati)
      setTagline(t.tagline)
      setLocation(t.location)
      setPhone(t.phone)
      setBlessing1(t.blessing1)
      setBlessing2(t.blessing2)
      setBillPrefix(t.billPrefix)
      setBillCounter(String(t.billCounter))
      setShowLogo(t.showLogo)
    })

    Animated.timing(fadeAnim, {
      toValue: 1, duration: 400, useNativeDriver: true,
    }).start()
  }, [])

  const currentTemplate: Partial<TaliTemplate> = {
    companyName,
    companyNameGujarati,
    tagline,
    location,
    phone,
    blessing1,
    blessing2,
    billPrefix,
    showLogo,
  }

  const isValid = companyName.trim().length >= 2 && billPrefix.trim().length >= 1

  const handleSave = async () => {
    if (!isValid || saving) return
    setSaving(true)
    try {
      const template: TaliTemplate = {
        companyId,
        companyName:         companyName.trim(),
        companyNameGujarati: companyNameGujarati.trim(),
        tagline:             tagline.trim(),
        location:            location.trim(),
        phone:               phone.trim(),
        blessing1:           blessing1.trim(),
        blessing2:           blessing2.trim(),
        billPrefix:          billPrefix.trim().toUpperCase(),
        billCounter:         Math.max(1, parseInt(billCounter) || 1),
        showLogo,
        createdAt:           new Date().toISOString(),
      }
      await saveTemplate(template)

      if (redirectAfter) {
        router.replace(`/${redirectAfter}` as any)
      } else {
        Alert.alert('✅ Template Saved', 'Your tali bill template is ready.', [
          { text: 'OK', onPress: () => router.back() },
        ])
      }
    } catch {
      Alert.alert('Error', 'Could not save template. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>બિલ ટેમ્પ્લેટ</Text>
          <Text style={s.headerSub}>Create Tali Bill Template</Text>
        </View>
        <TouchableOpacity
          style={[s.previewBtn]}
          onPress={() => setPreviewVisible(v => !v)}
          activeOpacity={0.8}
        >
          <Text style={s.previewBtnText}>{previewVisible ? 'Edit' : 'Preview'}</Text>
        </TouchableOpacity>
      </View>

      {previewVisible ? (
        /* ── Full Preview Mode ── */
        <ScrollView contentContainerStyle={s.previewScroll} showsVerticalScrollIndicator={false}>
          <Text style={s.previewNote}>👆 This is how your bill will look</Text>
          <View style={s.previewWrap}>
            <LivePreview template={currentTemplate} />
          </View>
          <TouchableOpacity
            style={[s.saveBtn, !isValid && s.saveBtnOff]}
            onPress={handleSave}
            disabled={!isValid || saving}
            activeOpacity={0.85}
          >
            <Text style={s.saveBtnText}>
              {saving ? 'સાચવી રહ્યા છીએ...' : '✓ Template સાચવો'}
            </Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        /* ── Edit Mode ── */
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* ── BLESSINGS ── */}
            <Section title="ઉપરના આશીર્વાદ (Blessings)" emoji="🙏" />
            <View style={s.card}>
              <View style={s.row2}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Blessing 1 (ડાબી)"
                    value={blessing1}
                    onChangeText={setBlessing1}
                    placeholder="શ્રી ગણેશાય નમઃ"
                    maxLength={40}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Blessing 2 (જમણી)"
                    value={blessing2}
                    onChangeText={setBlessing2}
                    placeholder="જય અંબે"
                    maxLength={40}
                  />
                </View>
              </View>
            </View>

            {/* ── COMPANY INFO ── */}
            <Section title="કંપની માહિતી (Company Info)" emoji="🏢" />
            <View style={s.card}>
              <Field
                label="Company Name *"
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="e.g. Goshiya Sea Foods"
                maxLength={60}
              />
              <View style={s.hr} />
              <Field
                label="ગુજરાતી નામ"
                hint="Gujarati company name (optional)"
                value={companyNameGujarati}
                onChangeText={setCompanyNameGujarati}
                placeholder="e.g. ગોસ઼ીયા સી ફૂડ્સ"
                maxLength={60}
              />
              <View style={s.hr} />
              <Field
                label="Tagline / Title"
                hint="Shown below company name"
                value={tagline}
                onChangeText={setTagline}
                placeholder="e.g. પ્રોપ્રા & ડેલ. ડીમ સ઼ભ્યારસ"
                maxLength={80}
              />
              <View style={s.hr} />
              <Field
                label="Location / Address"
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. માછીમારી બંદર, વેરાવળ"
                maxLength={80}
              />
              <View style={s.hr} />
              <Field
                label="Phone Number"
                value={phone}
                onChangeText={v => setPhone(v.replace(/\D/g, '').slice(0, 10))}
                placeholder="e.g. 9824966399"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {/* ── BILL NUMBER FORMAT ── */}
            <Section title="બિલ નંબર ફોર્મેટ (Bill Number)" emoji="🔢" />
            <View style={s.card}>
              <View style={s.row2}>
                <View style={{ flex: 1.4 }}>
                  <Field
                    label="Prefix *"
                    hint="e.g. BILL, INV, GSF"
                    value={billPrefix}
                    onChangeText={v => setBillPrefix(v.replace(/\s/g, '').toUpperCase())}
                    placeholder="BILL"
                    maxLength={6}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Start From"
                    hint="First bill number"
                    value={billCounter}
                    onChangeText={v => setBillCounter(v.replace(/\D/g, ''))}
                    placeholder="1"
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>
              <View style={s.hr} />
              {/* Preview of bill number */}
              <View style={s.billNumPreview}>
                <Text style={s.billNumLabel}>Bill number will look like:</Text>
                <View style={s.billNumBadge}>
                  <Text style={s.billNumText}>
                    {(billPrefix.trim() || 'BILL').toUpperCase()}-{String(parseInt(billCounter) || 1).padStart(3, '0')}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── LOGO ── */}
            <Section title="લોગો (Logo)" emoji="🖼️" />
            <View style={s.card}>
              <View style={s.toggleRow}>
                <View style={s.toggleLeft}>
                  <Text style={s.toggleLabel}>Show Logo Space</Text>
                  <Text style={s.toggleSub}>Reserve a space for your company logo on the bill</Text>
                </View>
                <TouchableOpacity
                  style={[s.toggle, showLogo && s.toggleOn]}
                  onPress={() => setShowLogo(v => !v)}
                  activeOpacity={0.8}
                >
                  <View style={[s.toggleThumb, showLogo && s.toggleThumbOn]} />
                </TouchableOpacity>
              </View>
              {showLogo && (
                <>
                  <View style={s.hr} />
                  <TouchableOpacity style={s.logoUploadBtn} activeOpacity={0.75}>
                    <Text style={s.logoUploadEmoji}>📤</Text>
                    <View>
                      <Text style={s.logoUploadTitle}>Upload Logo</Text>
                      <Text style={s.logoUploadSub}>PNG or JPG, square recommended</Text>
                    </View>
                    <Text style={s.logoUploadBadge}>Soon</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* ── Mini preview always visible at bottom of form ── */}
            <Section title="Preview" emoji="👁️" />
            <View style={s.miniPreviewWrap}>
              <LivePreview template={currentTemplate} />
            </View>

            {/* ── Save button ── */}
            <TouchableOpacity
              style={[s.saveBtn, !isValid && s.saveBtnOff]}
              onPress={handleSave}
              disabled={!isValid || saving}
              activeOpacity={0.85}
            >
              <Text style={s.saveBtnText}>
                {saving ? 'સાચવી રહ્યા છીએ...' : '✓ Template સાચવો અને ચાલુ રાખો'}
              </Text>
            </TouchableOpacity>

            {!isValid && (
              <Text style={s.validationHint}>
                * Company name અને Bill prefix ભરો
              </Text>
            )}

            <View style={{ height: 50 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SURF, borderBottomWidth: 1, borderBottomColor: BOR,
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: ELEV, alignItems: 'center', justifyContent: 'center' },
  backText:     { color: TP, fontSize: 18, fontWeight: '700' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 16, fontWeight: '800', color: TP },
  headerSub:    { fontSize: 11, color: TS, marginTop: 1 },
  previewBtn:   { backgroundColor: TEAL + '25', borderWidth: 1, borderColor: TEAL + '60', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  previewBtnText:{ fontSize: 13, color: TEAL, fontWeight: '700' },

  scroll:        { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  previewScroll: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },

  card: {
    backgroundColor: SURF, borderRadius: 14,
    borderWidth: 1, borderColor: BOR,
    paddingHorizontal: 14, paddingVertical: 12, gap: 12,
  },
  hr:   { height: 1, backgroundColor: BOR },
  row2: { flexDirection: 'row', gap: 10 },

  toggleRow:       { flexDirection: 'row', alignItems: 'center', gap: 14 },
  toggleLeft:      { flex: 1, gap: 2 },
  toggleLabel:     { fontSize: 14, fontWeight: '700', color: TP },
  toggleSub:       { fontSize: 11, color: TS },
  toggle:          { width: 48, height: 28, borderRadius: 14, backgroundColor: ELEV, borderWidth: 1, borderColor: BOR2, justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn:        { backgroundColor: TEAL + '30', borderColor: TEAL },
  toggleThumb:     { width: 22, height: 22, borderRadius: 11, backgroundColor: TS },
  toggleThumbOn:   { backgroundColor: TEAL, alignSelf: 'flex-end' },

  logoUploadBtn:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: ELEV, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: BOR2, padding: 14 },
  logoUploadEmoji:{ fontSize: 24 },
  logoUploadTitle:{ fontSize: 13, fontWeight: '700', color: TP },
  logoUploadSub:  { fontSize: 11, color: TS },
  logoUploadBadge:{ marginLeft: 'auto', fontSize: 10, color: GOLD, fontWeight: '700', backgroundColor: GOLD + '18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },

  billNumPreview: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  billNumLabel:   { fontSize: 12, color: TS },
  billNumBadge:   { backgroundColor: GOLD + '18', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: GOLD + '40' },
  billNumText:    { fontSize: 14, fontWeight: '800', color: GOLD, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  miniPreviewWrap: { transform: [{ scale: 0.85 }], transformOrigin: 'top left' as any, marginBottom: -40 },
  previewNote:     { fontSize: 12, color: TS, textAlign: 'center', fontStyle: 'italic' },
  previewWrap:     { borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: BOR2 },

  saveBtn:        { backgroundColor: TEAL, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnOff:     { backgroundColor: ELEV, borderWidth: 1, borderColor: BOR2 },
  saveBtnText:    { fontSize: 16, fontWeight: '800', color: '#fff' },
  validationHint: { fontSize: 12, color: '#ef4444', textAlign: 'center', marginTop: 4 },
})