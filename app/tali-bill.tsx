/**
 * app/tali-bill.tsx — Tali Bill (Image capture + WhatsApp + Print)
 *
 * Always opened from tali-list with a taliId param.
 * tali.tsx now saves the tali to storage before routing to tali-list.
 *
 * Role-aware UI:
 *   - Boat owners / tali takers → see bill image + "Save Tali" button only
 *   - Company owners / FILL_FISH_PRICE managers → see full price fill UI
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system/legacy'
import * as Print from 'expo-print'
import { router, useLocalSearchParams } from 'expo-router'
import * as Sharing from 'expo-sharing'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ViewShot from 'react-native-view-shot'
import { useEntityStore } from '../store/entityStore'
import {
  SavedFishEntry,
  SavedTali,
  TaliStatus,
  confirmTali,
  loadTali,
  updateTaliBillNo,
  updateTaliOwnerPhone,
  updateTaliPrices,
} from '../utils/taliStorage'
import {
  TEMPLATE_KEY,
  TaliTemplate,
  getNextBillNumber,
  saveTemplate,
} from './tali-template'

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG     = '#0F1923'
const SURF   = '#162030'
const ELEV   = '#1E2D3E'
const BOR    = 'rgba(255,255,255,0.07)'
const TP     = '#F0F4F8'
const TS     = '#8BA3BC'
const TM     = '#3D5A73'
const TEAL   = '#0891b2'
const GREEN  = '#059669'
const AMBER  = '#f59e0b'
const PAPER  = '#FEFDF8'
const WA_GRN = '#25D366'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toKg(kg: number) {
  const k = Math.floor(kg)
  const g = Math.round((kg - k) * 1000)
  return { kilo: String(k), gram: g > 0 ? String(g) : '-' }
}

function fmtDate(isoStr: string) {
  return new Date(isoStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

// Fill prices is ONLY shown when tali-list explicitly passes canFillPrices='true'.
// Default is false — boat owners / tali takers never see price UI.
function useCanFillPrice(overrideParam?: string): boolean {
  const { activeEntity } = useEntityStore()

  // Explicit param from tali-list always wins
  if (overrideParam === 'true')  return true
  if (overrideParam === 'false') return false

  // No param passed — this means screen was opened outside normal flow.
  // Only allow if active entity is explicitly a company owner context.
  // Default to false to be safe — boat owners should never see fill prices.
  if (!activeEntity) return false
  if (activeEntity.type === 'COMPANY' && activeEntity.role === 'owner') return true
  // All other cases — NO
  return false
}

// ─── Physical Bill View ───────────────────────────────────────────────────────
function PhysicalBill({
  template,
  tali,
}: {
  template: TaliTemplate
  tali: SavedTali
}) {
  const allPriced  = tali.fishEntries.every(f => f.pricePerKg !== null)
  const grandTotal = tali.grandTotal

  return (
    <View style={bill.paper}>
      {/* Blessings */}
      <View style={bill.blessingsRow}>
        <Text style={bill.blessingTxt}>{template.blessing1}</Text>
        <Text style={bill.blessingTxt}>{template.blessing2}</Text>
      </View>

      {/* Company Header */}
      <View style={bill.companyHeader}>
        {template.showLogo && (
          <View style={bill.logoBox}>
            <Text style={bill.logoTxt}>LOGO</Text>
          </View>
        )}
        <View style={bill.companyCenter}>
          {template.phone          && <Text style={bill.companyPhone}>Mo. {template.phone}</Text>}
          <Text style={bill.companyName}>{template.companyName}</Text>
          {template.companyNameGujarati && <Text style={bill.companyGuj}>{template.companyNameGujarati}</Text>}
          {template.tagline        && <Text style={bill.companyTagline}>{template.tagline}</Text>}
          {template.location       && <Text style={bill.companyLocation}>{template.location}</Text>}
        </View>
      </View>

      {/* Bill meta */}
      <View style={bill.metaRow}>
        <Text style={bill.metaTxt}>No. {tali.billNo}</Text>
        <Text style={bill.metaTxt}>Date: {fmtDate(tali.date)}</Text>
      </View>

      {/* Boat info */}
      <View style={bill.infoRow}>
        <Text style={bill.infoTxt}>નામ: {tali.ownerName || tali.boatName}</Text>
      </View>
      <View style={[bill.infoRow, bill.infoRowBorder]}>
        <Text style={bill.infoTxt}>બોટ નામ: {tali.boatName}</Text>
        {tali.boatReg ? <Text style={bill.infoTxt}>Reg: {tali.boatReg}</Text> : null}
      </View>

      {/* Table Header */}
      <View style={bill.tableHeader}>
        <Text style={[bill.th, bill.cFish]}>માલ ની જાત</Text>
        <Text style={[bill.th, bill.cNang]}>નંગ</Text>
        <Text style={[bill.th, bill.cWeight]}>વજન{'\n'}કિ.  ગ્રા.</Text>
        <Text style={[bill.th, bill.cPrice]}>ભાવ{'\n'}રૂ.</Text>
        <Text style={[bill.th, bill.cAmount]}>રકમ{'\n'}રૂ.</Text>
      </View>

      {/* Fish rows */}
      {tali.fishEntries.map((fe, idx) => {
        const { kilo, gram } = toKg(fe.totalKg)
        return (
          <View key={fe.fishId} style={[bill.tableRow, idx % 2 === 0 && bill.tableRowAlt]}>
            <View style={bill.cFish}>
              <Text style={bill.tdBold}>{fe.fishNameGujarati}</Text>
              <Text style={bill.tdSub}>{fe.fishName}</Text>
            </View>
            <Text style={[bill.td, bill.cNang]}>{fe.counts}</Text>
            <Text style={[bill.td, bill.cWeight]}>{kilo}  {gram}</Text>
            <Text style={[bill.td, bill.cPrice]}>
              {fe.pricePerKg !== null ? `${fe.pricePerKg}` : '-'}
            </Text>
            <Text style={[bill.td, bill.cAmount]}>
              {fe.totalAmount !== null
                ? `${Math.round(fe.totalAmount).toLocaleString('en-IN')}`
                : '-'}
            </Text>
          </View>
        )
      })}

      {/* Filler rows */}
      {Array.from({ length: Math.max(0, 5 - tali.fishEntries.length) }).map((_, i) => (
        <View key={`filler-${i}`} style={[bill.tableRow, { minHeight: 26 }]}>
          {[bill.cFish, bill.cNang, bill.cWeight, bill.cPrice, bill.cAmount].map((col, j) => (
            <Text key={j} style={[bill.td, col]}> </Text>
          ))}
        </View>
      ))}

      {/* Total row */}
      <View style={bill.totalRow}>
        <Text style={[bill.thBold, bill.cFish]}>રોટલ</Text>
        <Text style={[bill.thBold, bill.cNang]}> </Text>
        <Text style={[bill.thBold, bill.cWeight]}> </Text>
        <Text style={[bill.thBold, bill.cPrice]}> </Text>
        <Text style={[bill.thBold, bill.cAmount]}>
          {grandTotal !== null ? `${Math.round(grandTotal).toLocaleString('en-IN')}` : '-'}
        </Text>
      </View>

      {!allPriced && (
        <View style={bill.pendingRow}>
          <Text style={bill.pendingTxt}>⏳ ભાવ ભર્યા પછી રોટલ દેખાશે</Text>
        </View>
      )}

      {/* Signature */}
      <View style={bill.signRow}>
        <View style={bill.signLine} />
        <Text style={bill.signLabel}>સહી / SIGNATURE</Text>
        <Text style={bill.signCompany}>{template.companyName}</Text>
        <Text style={bill.signPowered}>Fishness · Knowmadic</Text>
      </View>
    </View>
  )
}

const bill = StyleSheet.create({
  paper: {
    backgroundColor: PAPER,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#b0a090',
    overflow: 'hidden',
  },
  blessingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f5f0e6',
    borderBottomWidth: 1,
    borderBottomColor: '#d0c8b8',
  },
  blessingTxt: { fontSize: 10, color: '#5a4a2a', fontStyle: 'italic', maxWidth: '48%' },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#d0c8b8',
    gap: 8,
    backgroundColor: PAPER,
  },
  logoBox: {
    width: 52, height: 52, borderWidth: 1, borderColor: '#bbb',
    borderRadius: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee',
  },
  logoTxt: { fontSize: 8, color: '#999', fontWeight: '700' },
  companyCenter: { flex: 1, alignItems: 'center', gap: 1 },
  companyPhone:   { fontSize: 9,  color: '#555', alignSelf: 'flex-end' },
  companyName:    { fontSize: 18, fontWeight: '900', color: '#1a1a1a', textAlign: 'center', letterSpacing: 0.3 },
  companyGuj:     { fontSize: 11, color: '#333', textAlign: 'center' },
  companyTagline: { fontSize: 9,  color: '#555', textAlign: 'center' },
  companyLocation:{ fontSize: 9,  color: '#555', textAlign: 'center' },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f0ebe0',
    borderBottomWidth: 1,
    borderBottomColor: '#d0c8b8',
  },
  metaTxt: { fontSize: 10, color: '#333', fontWeight: '700' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d0c8b8',
  },
  infoRowBorder: { borderBottomWidth: 1.5, borderBottomColor: '#b8a888' },
  infoTxt: { fontSize: 10, color: '#222' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0d8c8',
    borderBottomWidth: 1.5,
    borderBottomColor: '#b8a888',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#d0c8b8',
    paddingVertical: 5,
    paddingHorizontal: 6,
    minHeight: 28,
  },
  tableRowAlt:  { backgroundColor: '#faf6ee' },
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#b8a888',
    paddingVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: '#ede5d0',
  },
  pendingRow: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff8e8',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0d8c8',
  },
  pendingTxt: { fontSize: 10, color: '#c08000', textAlign: 'center' },
  cFish:   { flex: 2.5 },
  cNang:   { flex: 0.8, textAlign: 'center' },
  cWeight: { flex: 1.4, textAlign: 'center' },
  cPrice:  { flex: 1.2, textAlign: 'center' },
  cAmount: { flex: 1.4, textAlign: 'right' },
  th:     { fontSize: 10, fontWeight: '800', color: '#222' },
  thBold: { fontSize: 11, fontWeight: '900', color: '#1a1a1a' },
  td:     { fontSize: 11, color: '#222' },
  tdBold: { fontSize: 11, fontWeight: '700', color: '#1a1a1a' },
  tdSub:  { fontSize: 9,  color: '#777' },
  signRow:    { padding: 14, alignItems: 'center', gap: 4, backgroundColor: PAPER },
  signLine:   { width: 140, height: 1, backgroundColor: '#999', marginBottom: 4 },
  signLabel:  { fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: 0.8 },
  signCompany:{ fontSize: 12, fontWeight: '800', color: '#1a1a1a' },
  signPowered:{ fontSize: 8,  color: '#aaa', marginTop: 2 },
})

// ─── Price Numpad ─────────────────────────────────────────────────────────────
function PriceNumpad({ visible, fish, onConfirm, onClose }: {
  visible: boolean
  fish: SavedFishEntry | null
  onConfirm: (fishId: string, price: number) => void
  onClose: () => void
}) {
  const [input, setInput] = useState('0')

  useEffect(() => {
    if (visible) setInput(fish?.pricePerKg ? String(fish.pricePerKg) : '0')
  }, [visible, fish])

  const handleKey = (key: string) => {
    if (key === '⌫') { setInput(p => p.length > 1 ? p.slice(0, -1) : '0'); return }
    if (input.length >= 6) return
    setInput(p => p === '0' ? key : p + key)
  }

  const handleConfirm = () => {
    const val = parseFloat(input)
    if (!val || val <= 0) return
    if (fish) onConfirm(fish.fishId, val)
    onClose()
  }

  const keys = [['1','2','3'],['4','5','6'],['7','8','9'],['⌫','0','✓']]
  if (!fish) return null

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={np.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={np.sheet}>
          <View style={np.handle} />
          <View style={np.fishInfo}>
            <Text style={np.fishGuj}>{fish.fishNameGujarati}</Text>
            <Text style={np.fishEn}>{fish.fishName}</Text>
            <Text style={np.fishKg}>{fish.totalKg.toFixed(1)} kg · {fish.counts} નંગ</Text>
          </View>
          <Text style={np.label}>ભાવ / Price per kg</Text>
          <View style={np.display}>
            <Text style={np.dRupee}>₹</Text>
            <Text style={np.dNum}>{input}</Text>
            <Text style={np.dUnit}>/kg</Text>
          </View>
          {parseFloat(input) > 0 && (
            <Text style={np.preview}>
              રકમ: ₹{Math.round(fish.totalKg * parseFloat(input)).toLocaleString('en-IN')}
            </Text>
          )}
          <View style={np.numpad}>
            {keys.map((row, ri) => (
              <View key={ri} style={np.row}>
                {row.map(key => {
                  const isOk   = key === '✓'
                  const isBack = key === '⌫'
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[np.key, isOk && np.keyOk, isBack && np.keyBack]}
                      onPress={() => isOk ? handleConfirm() : handleKey(key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[np.keyTxt, isOk && np.keyTxtOk]}>{key}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const np = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: SURF, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, gap: 12 },
  handle:  { width: 40, height: 4, backgroundColor: BOR, borderRadius: 2, alignSelf: 'center' },
  fishInfo:{ alignItems: 'center', gap: 2 },
  fishGuj: { fontSize: 20, fontWeight: '800', color: TP },
  fishEn:  { fontSize: 13, color: TS },
  fishKg:  { fontSize: 11, color: TEAL, fontWeight: '600', marginTop: 2 },
  label:   { fontSize: 11, color: TS, textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  display: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', backgroundColor: ELEV, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20, gap: 6 },
  dRupee:  { fontSize: 22, color: TS, fontWeight: '700' },
  dNum:    { fontSize: 48, fontWeight: '900', color: TP },
  dUnit:   { fontSize: 15, color: TS },
  preview: { fontSize: 14, color: GREEN, fontWeight: '700', textAlign: 'center' },
  numpad:  { gap: 8 },
  row:     { flexDirection: 'row', gap: 8 },
  key:     { flex: 1, backgroundColor: ELEV, borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', minHeight: 56 },
  keyOk:   { backgroundColor: TEAL },
  keyBack: { backgroundColor: '#1a2a3a' },
  keyTxt:  { fontSize: 22, fontWeight: '700', color: TP },
  keyTxtOk:{ color: '#fff', fontSize: 18, fontWeight: '800' },
})

// ─── Phone input modal ────────────────────────────────────────────────────────
function PhoneModal({ visible, current, onSave, onClose }: {
  visible: boolean
  current: string
  onSave: (phone: string) => void
  onClose: () => void
}) {
  const [phone, setPhone] = useState(current)
  useEffect(() => { if (visible) setPhone(current) }, [visible, current])

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={pm.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={pm.sheet}>
          <View style={pm.handle} />
          <Text style={pm.title}>Boat Owner's Number</Text>
          <Text style={pm.sub}>WhatsApp number to send this bill</Text>
          <View style={pm.inputRow}>
            <Text style={pm.prefix}>🇮🇳 +91</Text>
            <TextInput
              style={pm.input}
              value={phone}
              onChangeText={v => setPhone(v.replace(/\D/g, '').slice(0, 10))}
              keyboardType="phone-pad"
              placeholder="10-digit number"
              placeholderTextColor={TM}
              autoFocus
              maxLength={10}
            />
            {phone.length === 10 && <Text style={pm.check}>✓</Text>}
          </View>
          <TouchableOpacity
            style={[pm.btn, phone.length !== 10 && pm.btnOff]}
            onPress={() => {
              if (phone.length === 10) {
                onSave(phone)
                onClose()
              }
            }}
          >
            <Text style={pm.btnTxt}>💬 Save & Send on WhatsApp</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const pm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: SURF, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, gap: 14 },
  handle:  { width: 40, height: 4, backgroundColor: BOR, borderRadius: 2, alignSelf: 'center' },
  title:   { fontSize: 18, fontWeight: '800', color: TP },
  sub:     { fontSize: 13, color: TS, marginTop: -6 },
  inputRow:{ flexDirection: 'row', alignItems: 'center', backgroundColor: ELEV, borderRadius: 14, borderWidth: 1, borderColor: BOR, paddingHorizontal: 14, height: 54, gap: 10 },
  prefix:  { fontSize: 15, color: TS, fontWeight: '600' },
  input:   { flex: 1, fontSize: 18, fontWeight: '700', color: TP },
  check:   { fontSize: 16, color: GREEN, fontWeight: '800' },
  btn:     { backgroundColor: WA_GRN, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnOff:  { opacity: 0.4 },
  btnTxt:  { fontSize: 16, fontWeight: '800', color: '#fff' },
})

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<TaliStatus, { labelGu: string; color: string }> = {
  PENDING_PRICE: { labelGu: 'ભાવ ભર્યો નથી', color: AMBER },
  PRICED:        { labelGu: 'ભાવ ભર્યો',      color: TEAL  },
  CONFIRMED:     { labelGu: 'કન્ફર્મ',         color: GREEN },
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TaliBillScreen() {
  const params  = useLocalSearchParams<{
    taliId?:         string
    companyId?:      string
    boatName?:       string
    boatReg?:        string
    ownerName?:      string
    ownerPhone?:     string
    canFillPrices?:  string   // 'true' | 'false' — set by tali-list when routing
  }>()

  // canFill is determined by whoever opened this screen from tali-list
  // The param overrides entity-store checks so boat owners always get false
  const canFill = useCanFillPrice(params.canFillPrices)

  const [loading,      setLoading]    = useState(true)
  const [tali,         setTali]       = useState<SavedTali | null>(null)
  const [template,     setTemplate]   = useState<TaliTemplate | null>(null)
  const [selectedFish, setSelectedFish] = useState<SavedFishEntry | null>(null)
  const [numpadVis,    setNumpadVis]  = useState(false)
  const [phoneVis,     setPhoneVis]   = useState(false)
  const [anyFilled,    setAnyFilled]  = useState(false)
  const [allFilled,    setAllFilled]  = useState(false)
  const [saving,       setSaving]     = useState(false)
  const [confirming,   setConfirming] = useState(false)
  const [sharing,      setSharing]    = useState(false)
  const [sharingPdf,   setSharingPdf] = useState(false)
  const [printing,     setPrinting]   = useState(false)

  const billRef            = useRef<ViewShot>(null)
  const pendingRef         = useRef<Record<string, number>>({})
  const [pendingShareFormat, setPendingShareFormat] = useState<'image' | 'pdf'>('image')

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const companyId = params.companyId ?? 'default'

        // Load template
        const rawTmpl = await AsyncStorage.getItem(TEMPLATE_KEY(companyId))
        let tmpl: TaliTemplate | null = null
        if (rawTmpl) { tmpl = JSON.parse(rawTmpl); setTemplate(tmpl) }

        // Mode A: open existing tali from tali-list (always has taliId)
        if (params.taliId) {
          const loaded = await loadTali(params.taliId)
          if (loaded) {
            // If tali was saved with PENDING bill number and template now exists,
            // assign a real bill number now
            if (loaded.billNo === 'PENDING' && tmpl) {
              const billNo   = getNextBillNumber(tmpl)
              const updated  = { ...tmpl, billCounter: tmpl.billCounter + 1 }
              await saveTemplate(updated)
              setTemplate(updated)
              // Update the saved tali with the real bill number
              const patched = await updateTaliBillNo(loaded.id, billNo)
              if (patched) { setTali(patched); syncState(patched) }
              else          { setTali(loaded);  syncState(loaded) }
            } else {
              setTali(loaded)
              syncState(loaded)
            }
          }
          setLoading(false)
          return
        }

        // Mode B: no taliId — tali.tsx now saves the tali before routing to tali-list
        // so we should never arrive here without a taliId in normal flow.
        // Fallback: just show empty state
        setLoading(false)
      } catch (e) {
        console.error('TaliBill init error', e)
        setLoading(false)
      }
    }
    init()
  }, [])

  function syncState(t: SavedTali) {
    setAnyFilled(t.fishEntries.some(f => f.pricePerKg !== null))
    setAllFilled(t.fishEntries.length > 0 && t.fishEntries.every(f => f.pricePerKg !== null))
  }

  // ── Capture bill as image ──────────────────────────────────────────────────
  const captureBillImage = async (): Promise<string> => {
    if (!billRef.current?.capture) throw new Error('ViewShot not ready')
    const uri = await billRef.current.capture()
    return uri
  }

  // ── Share as IMAGE (PNG) ───────────────────────────────────────────────────
  // Captures the bill view → copies to stable cache → native share sheet
  // WhatsApp appears as a target → user picks contact → sends image
  const handleShareImage = async (phone?: string) => {
    if (!tali || !template) return

    const targetPhone = (phone ?? tali.ownerPhone ?? '').trim()
    if (!targetPhone) {
      // Store which format was pending so PhoneModal callback knows what to do
      setPendingShareFormat('image')
      setPhoneVis(true)
      return
    }

    const canShare = await Sharing.isAvailableAsync()
    if (!canShare) {
      Alert.alert('Sharing not available', 'Your device does not support sharing.')
      return
    }

    setSharing(true)
    try {
      const tempUri   = await captureBillImage()
      const stableUri = `${FileSystem.cacheDirectory}bill_${tali.billNo.replace(/-/g, '_')}.png`
      await FileSystem.copyAsync({ from: tempUri, to: stableUri })

      await Sharing.shareAsync(stableUri, {
        mimeType:    'image/png',
        dialogTitle: `Send bill image to ${tali.ownerName || tali.boatName} (+91 ${targetPhone})`,
        UTI:         'public.png',
      })
    } catch (e: any) {
      if (e?.message?.includes('dismissed') || e?.message?.includes('cancel')) return
      Alert.alert('Error', 'Could not share image. Please try again.')
      console.error('Image share error', e)
    } finally {
      setSharing(false)
    }
  }

  // ── Share as PDF ───────────────────────────────────────────────────────────
  // Captures the bill view as PNG → wraps it in an HTML page →
  // expo-print generates a PDF → native share sheet opens with the PDF
  // WhatsApp appears as a target → user picks contact → sends PDF
  const handleSharePdf = async (phone?: string) => {
    if (!tali || !template) return

    const targetPhone = (phone ?? tali.ownerPhone ?? '').trim()
    if (!targetPhone) {
      setPendingShareFormat('pdf')
      setPhoneVis(true)
      return
    }

    const canShare = await Sharing.isAvailableAsync()
    if (!canShare) {
      Alert.alert('Sharing not available', 'Your device does not support sharing.')
      return
    }

    setSharingPdf(true)
    try {
      // Step 1: capture bill as PNG image
      const tempUri   = await captureBillImage()
      const stableImg = `${FileSystem.cacheDirectory}bill_${tali.billNo.replace(/-/g, '_')}.png`
      await FileSystem.copyAsync({ from: tempUri, to: stableImg })

      // Step 2: read the image as base64 so we can embed it in HTML
      const base64 = await FileSystem.readAsStringAsync(stableImg, {
        encoding: FileSystem.EncodingType.Base64,
      })

      // Step 3: build a minimal HTML page that embeds the bill image
      // expo-print renders this HTML to a PDF file
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { background: #fff; }
              img  { width: 100%; height: auto; display: block; }
            </style>
          </head>
          <body>
            <img src="data:image/png;base64,${base64}" />
          </body>
        </html>
      `

      // Step 4: generate PDF from the HTML
      const { uri: pdfUri } = await Print.printToFileAsync({ html, base64: false })

      // Step 5: copy PDF to a stable named path
      const stablePdf = `${FileSystem.cacheDirectory}bill_${tali.billNo.replace(/-/g, '_')}.pdf`
      await FileSystem.copyAsync({ from: pdfUri, to: stablePdf })

      // Step 6: share the PDF — WhatsApp, Gmail, Drive etc. all appear as targets
      await Sharing.shareAsync(stablePdf, {
        mimeType:    'application/pdf',
        dialogTitle: `Send bill PDF to ${tali.ownerName || tali.boatName} (+91 ${targetPhone})`,
        UTI:         'com.adobe.pdf',
      })
    } catch (e: any) {
      if (e?.message?.includes('dismissed') || e?.message?.includes('cancel')) return
      Alert.alert('Error', 'Could not generate PDF. Please try again.')
      console.error('PDF share error', e)
    } finally {
      setSharingPdf(false)
    }
  }

  // ── Phone save callback ────────────────────────────────────────────────────
  // Called when user submits number in the PhoneModal.
  // Saves the phone then retries whichever share was pending.
  const handlePhoneSave = async (phone: string) => {
    if (!tali) return
    await updateTaliOwnerPhone(tali.id, phone)
    setTali(prev => prev ? { ...prev, ownerPhone: phone } : prev)
    if (pendingShareFormat === 'pdf') {
      handleSharePdf(phone)
    } else {
      handleShareImage(phone)
    }
  }

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = async () => {
    if (!tali || !template) return
    setPrinting(true)
    try {
      const imageUri = await captureBillImage()
      await Print.printAsync({ uri: imageUri })
    } catch (e) {
      Alert.alert('Error', 'Could not print. Make sure a printer is connected.')
      console.error('Print error', e)
    } finally {
      setPrinting(false)
    }
  }

  // ── Price confirm from numpad ──────────────────────────────────────────────
  const handlePriceConfirm = useCallback((fishId: string, price: number) => {
    setTali(prev => {
      if (!prev) return prev
      const entries = prev.fishEntries.map(fe =>
        fe.fishId === fishId
          ? { ...fe, pricePerKg: price, totalAmount: Math.round(fe.totalKg * price) }
          : fe
      )
      const all    = entries.every(f => f.pricePerKg !== null)
      const gTotal = all ? entries.reduce((s, f) => s + (f.totalAmount ?? 0), 0) : null
      const next   = { ...prev, fishEntries: entries, grandTotal: gTotal }
      syncState(next)
      return next
    })
    pendingRef.current[fishId] = price
    setAnyFilled(true)
  }, [])

  // ── Submit prices ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!tali || Object.keys(pendingRef.current).length === 0) return
    setSaving(true)
    try {
      const updated = await updateTaliPrices(tali.id, pendingRef.current)
      if (updated) { setTali(updated); syncState(updated); pendingRef.current = {} }
    } catch {
      Alert.alert('Error', 'Could not save prices.')
    } finally {
      setSaving(false)
    }
  }

  // ── Confirm tali ───────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!tali) return
    Alert.alert('Confirm Tali?', 'Once confirmed, prices cannot be changed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm', onPress: async () => {
          setConfirming(true)
          const updated = await confirmTali(tali.id)
          if (updated) { setTali(updated); syncState(updated) }
          setConfirming(false)
        },
      },
    ])
  }

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={TEAL} size="large" />
        <Text style={s.loadTxt}>બિલ તૈયાર થઈ રહ્યું છે...</Text>
      </View>
    )
  }

  if (!tali || !template) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 40 }}>📋</Text>
        <Text style={s.loadTxt}>No tali data found.</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => router.back()}>
          <Text style={s.retryTxt}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const statusCfg   = STATUS_CFG[tali.status]
  const isConfirmed = tali.status === 'CONFIRMED'
  const hasPending  = Object.keys(pendingRef.current).length > 0

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>તાળી બિલ</Text>
          <Text style={s.headerSub}>{tali.boatName} · {tali.billNo}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: statusCfg.color + '22' }]}>
          <Text style={[s.statusTxt, { color: statusCfg.color }]}>{statusCfg.labelGu}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ViewShot wraps the physical bill */}
        <ViewShot
          ref={billRef}
          options={{ format: 'png', quality: 1.0 }}
          style={s.billShadow}
        >
          <PhysicalBill template={template} tali={tali} />
        </ViewShot>

        {/* ── Price section — only shown to company owners / permitted managers ── */}
        {!isConfirmed && canFill && (
          <View style={s.priceCard}>
            <Text style={s.priceCardTitle}>ભાવ ભરો — Fill Prices</Text>
            <Text style={s.priceCardSub}>Tap any fish to enter price per kg</Text>

            {tali.fishEntries.map(fe => (
              <TouchableOpacity
                key={fe.fishId}
                style={[
                  s.priceRow,
                  fe.pricePerKg !== null && s.priceRowFilled,
                ]}
                onPress={() => {
                  setSelectedFish(fe)
                  setNumpadVis(true)
                }}
                activeOpacity={0.75}
              >
                <View style={s.priceLeft}>
                  <Text style={s.priceGu}>{fe.fishNameGujarati}</Text>
                  <Text style={s.priceEn}>{fe.fishName}</Text>
                  <Text style={s.priceKg}>{fe.totalKg.toFixed(1)} kg · {fe.counts} નંગ</Text>
                </View>
                <View style={[s.priceRight, fe.pricePerKg !== null && s.priceRightFilled]}>
                  {fe.pricePerKg !== null ? (
                    <>
                      <Text style={s.priceFilled}>₹{fe.pricePerKg}/kg</Text>
                      <Text style={s.priceAmt}>= ₹{Math.round(fe.totalAmount!).toLocaleString('en-IN')}</Text>
                    </>
                  ) : (
                    <Text style={s.priceEmpty}>Tap ▶</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {tali.grandTotal !== null && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>કુલ રોટલ</Text>
                <Text style={s.totalVal}>₹{Math.round(tali.grandTotal).toLocaleString('en-IN')}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── For boat owners & non-price-fillers: show saved info card ── */}
        {!isConfirmed && !canFill && (
          <View style={s.savedInfoCard}>
            <Text style={s.savedInfoIcon}>✅</Text>
            <Text style={s.savedInfoTitle}>Tali Saved</Text>
            <Text style={s.savedInfoSub}>
              This tali has been saved. The company owner will fill prices.
            </Text>
          </View>
        )}

        {isConfirmed && (
          <View style={s.confirmedCard}>
            <Text style={s.confirmedIcon}>✅</Text>
            <Text style={s.confirmedTitle}>Tali Confirmed</Text>
            {tali.grandTotal !== null && (
              <Text style={s.confirmedTotal}>
                ₹{Math.round(tali.grandTotal).toLocaleString('en-IN')}
              </Text>
            )}
          </View>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* ── Bottom Action Bar ── */}
      <View style={s.actionBar}>

        {/* Boat owner / tali taker — just "Save & Exit" button */}
        {!canFill && !isConfirmed && (
          <TouchableOpacity
            style={s.saveExitBtn}
            onPress={() => router.replace('/tali-list' as any)}
            activeOpacity={0.85}
          >
            <Text style={s.saveExitTxt}>✓ Save Tali</Text>
          </TouchableOpacity>
        )}

        {/* Company owner — Save Prices */}
        {canFill && !isConfirmed && anyFilled && (
          <TouchableOpacity
            style={[s.saveBtn, saving && s.btnOff]}
            onPress={handleSubmit}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.saveTxt}>Save Prices</Text>
            }
          </TouchableOpacity>
        )}

        {/* Company owner — Confirm */}
        {canFill && !isConfirmed && allFilled && !hasPending && (
          <TouchableOpacity
            style={[s.confirmBtn, confirming && s.btnOff]}
            onPress={handleConfirm}
            disabled={confirming}
            activeOpacity={0.85}
          >
            {confirming
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.confirmTxt}>✓ Confirm</Text>
            }
          </TouchableOpacity>
        )}

        {/* Print — after confirm */}
        {isConfirmed && (
          <TouchableOpacity
            style={[s.printBtn, printing && s.btnOff]}
            onPress={handlePrint}
            disabled={printing}
            activeOpacity={0.85}
          >
            {printing
              ? <ActivityIndicator color={TS} size="small" />
              : <Text style={s.printTxt}>🖨️ Print</Text>
            }
          </TouchableOpacity>
        )}

        {/* Send as Image — after confirm */}
        {isConfirmed && (
          <TouchableOpacity
            style={[s.waBtn, sharing && s.btnOff]}
            onPress={() => handleShareImage()}
            disabled={sharing || sharingPdf}
            activeOpacity={0.85}
          >
            {sharing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={s.waBtnInner}>
                <Text style={s.waTxt}>🖼️ Image</Text>
                <Text style={s.waPhone}>
                  {tali.ownerPhone ? `+91 ${tali.ownerPhone}` : 'Set number'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Send as PDF — after confirm */}
        {isConfirmed && (
          <TouchableOpacity
            style={[s.pdfBtn, sharingPdf && s.btnOff]}
            onPress={() => handleSharePdf()}
            disabled={sharing || sharingPdf}
            activeOpacity={0.85}
          >
            {sharingPdf ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={s.waBtnInner}>
                <Text style={s.pdfBtnTxt}>📄 PDF</Text>
                <Text style={s.waPhone}>
                  {tali.ownerPhone ? `+91 ${tali.ownerPhone}` : 'Set number'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

      </View>

      {/* Modals */}
      <PriceNumpad
        visible={numpadVis}
        fish={selectedFish}
        onConfirm={handlePriceConfirm}
        onClose={() => setNumpadVis(false)}
      />
      <PhoneModal
        visible={phoneVis}
        current={tali.ownerPhone}
        onSave={handlePhoneSave}
        onClose={() => setPhoneVis(false)}
      />

    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: BG },
  center:   { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadTxt:  { color: TS, fontSize: 14 },
  retryBtn: { backgroundColor: ELEV, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  retryTxt: { color: TS, fontWeight: '700' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SURF, borderBottomWidth: 1, borderBottomColor: BOR,
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: ELEV, alignItems: 'center', justifyContent: 'center' },
  backTxt:      { color: TP, fontSize: 18, fontWeight: '700' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 16, fontWeight: '800', color: TP },
  headerSub:    { fontSize: 11, color: TS, marginTop: 1 },
  statusBadge:  { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusTxt:    { fontSize: 11, fontWeight: '700' },

  scroll:     { padding: 14, gap: 14 },
  billShadow: {
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },

  // Price card
  priceCard:     { backgroundColor: SURF, borderRadius: 16, borderWidth: 1, borderColor: BOR, padding: 16, gap: 6 },
  priceCardTitle:{ fontSize: 14, fontWeight: '800', color: TP, marginBottom: 2 },
  priceCardSub:  { fontSize: 12, color: TS, marginBottom: 6 },
  priceRow:      { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 4, backgroundColor: ELEV, borderWidth: 1, borderColor: BOR },
  priceRowRO:    { opacity: 0.7 },
  priceRowFilled:{ borderColor: TEAL + '50', backgroundColor: TEAL + '0A' },
  priceLeft:     { flex: 1, gap: 2 },
  priceGu:       { fontSize: 14, fontWeight: '700', color: TP },
  priceEn:       { fontSize: 11, color: TS },
  priceKg:       { fontSize: 11, color: TEAL, fontWeight: '600', marginTop: 2 },
  priceRight:    { alignItems: 'flex-end', gap: 2, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: BOR, minWidth: 90 },
  priceRightFilled:{ backgroundColor: TEAL + '18' },
  priceFilled:   { fontSize: 14, fontWeight: '800', color: TEAL },
  priceAmt:      { fontSize: 11, color: TS },
  priceEmpty:    { fontSize: 12, color: TM, fontStyle: 'italic' },
  priceWait:     { fontSize: 13, color: TM, fontWeight: '600' },

  totalRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: BOR },
  totalLabel: { fontSize: 14, color: TS, fontWeight: '600' },
  totalVal:   { fontSize: 18, fontWeight: '900', color: GREEN },

  confirmedCard:  { backgroundColor: GREEN + '12', borderRadius: 16, borderWidth: 1, borderColor: GREEN + '40', padding: 20, alignItems: 'center', gap: 8 },
  confirmedIcon:  { fontSize: 40 },
  confirmedTitle: { fontSize: 17, fontWeight: '800', color: TP },
  confirmedTotal: { fontSize: 26, fontWeight: '900', color: GREEN, marginTop: 4 },

  // Action bar
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 8,
    padding: 14, paddingBottom: 28,
    backgroundColor: SURF,
    borderTopWidth: 1, borderTopColor: BOR,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 16,
  },
  exitBtn:  { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: BOR, backgroundColor: ELEV, alignItems: 'center', justifyContent: 'center' },
  exitTxt:  { fontSize: 14, color: TS, fontWeight: '600' },

  // Save & Exit — for boat owners / tali takers who cannot fill prices
  saveExitBtn: { flex: 1, backgroundColor: TEAL, borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  saveExitTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Saved info card — shown to boat owners instead of price section
  savedInfoCard: { backgroundColor: TEAL + '12', borderRadius: 16, borderWidth: 1, borderColor: TEAL + '40', padding: 20, alignItems: 'center', gap: 8 },
  savedInfoIcon: { fontSize: 36 },
  savedInfoTitle:{ fontSize: 17, fontWeight: '800', color: TP },
  savedInfoSub:  { fontSize: 13, color: TS, textAlign: 'center', lineHeight: 19 },

  saveBtn:   { flex: 1, backgroundColor: TEAL, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  saveTxt:   { fontSize: 14, fontWeight: '800', color: '#fff' },
  confirmBtn:{ flex: 1, backgroundColor: GREEN, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  confirmTxt:{ fontSize: 14, fontWeight: '800', color: '#fff' },
  btnOff:    { opacity: 0.5 },

  printBtn: { flex: 1, backgroundColor: ELEV, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BOR },
  printTxt: { fontSize: 14, fontWeight: '700', color: TS },

  waBtn: { flex: 1, backgroundColor: WA_GRN, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  waBtnInner: { alignItems: 'center', gap: 2 },
  waTxt:  { fontSize: 14, fontWeight: '800', color: '#fff' },
  waPhone:{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  pdfBtn: { flex: 1, backgroundColor: '#c0392b', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  pdfBtnTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },
})