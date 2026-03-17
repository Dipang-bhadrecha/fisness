/**
 * app/tali-bill.tsx — Tali Bill Template Screen
 *
 * Shown after boat owner ends a tali session.
 * Also shown when viewing any stored tali from the list.
 *
 * BOAT OWNER view:
 *   - Sees fish + kg in bill template format (based on image 4 / image 5 reference)
 *   - Price column exists but is EMPTY / greyed out (read-only)
 *   - Status badge: PENDING PRICE
 *   - Once company fills price → sees price with YELLOW highlight if changed
 *   - Can CONFIRM the tali → locks it forever
 *
 * COMPANY OWNER view:
 *   - Same template but price fields are EDITABLE inputs
 *   - Can submit price → pushes to boat owner
 *   - Can update price before boat owner confirms → shows as change
 *
 * Status flow:
 *   PENDING_PRICE → PRICED → CONFIRMED
 *
 * Params:
 *   taliId        — existing stored tali id (for view mode)
 *   role          — 'boat_owner' | 'company_owner'
 *   boatName
 *   companyName
 *   (from session if coming fresh after end session)
 */

import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
    Alert,
    KeyboardAvoidingView,
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
import { FISH_CATEGORIES } from '../constants/fishTypes'
import { useTaliSession } from '../hooks/useTaliSession'

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG    = '#080F1A'
const SURF  = '#0D1B2E'
const ELEV  = '#132640'
const BOR   = 'rgba(255,255,255,0.06)'
const TP    = '#F0F4F8'
const TS    = '#8BA3BC'
const TM    = '#3D5A73'
const TEAL  = '#0891b2'
const GREEN = '#059669'
const AMBER = '#f59e0b'
const PAPER = '#FDFAF4'  // receipt paper white

// ─── Types ────────────────────────────────────────────────────────────────────
type TaliStatus = 'PENDING_PRICE' | 'PRICED' | 'CONFIRMED'

interface FishRow {
  fishId: string
  fishName: string
  fishNameGujarati: string
  totalKg: number
  pricePerKg: number | null      // null = not filled yet
  previousPricePerKg: number | null  // set when company changes price after initial fill
  totalAmount: number | null
}

interface StoredTali {
  id: string
  boatName: string
  companyName: string
  date: string
  billNo: string
  status: TaliStatus
  fishRows: FishRow[]
  sellingChargeRate: number
  subtotal: number | null
  sellingCharge: number | null
  finalTotal: number | null
}

// ─── Mock stored tali (replace with API: GET /api/v1/tali/:id) ────────────────
function buildMockTali(
  boatName: string,
  companyName: string,
  fishRows: FishRow[],
  status: TaliStatus = 'PENDING_PRICE',
): StoredTali {
  const now    = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const billNo  = `BILL-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*9000)+1000}`

  const filled  = fishRows.filter(r => r.pricePerKg !== null)
  const subtotal = filled.length === fishRows.length
    ? fishRows.reduce((s, r) => s + (r.totalAmount ?? 0), 0)
    : null
  const rate    = 0.06
  const sc      = subtotal !== null ? Math.round(subtotal * rate) : null
  const final   = subtotal !== null && sc !== null ? subtotal - sc : null

  return { id: billNo, boatName, companyName, date: dateStr, billNo, status, fishRows, sellingChargeRate: rate, subtotal, sellingCharge: sc, finalTotal: final }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtNum = (n: number) => n.toLocaleString('en-IN')
const fmtKg  = (n: number) => n.toFixed(1)

function getFishMeta(fishId: string): { name: string; nameGujarati: string } {
  const p = FISH_CATEGORIES.find(f => f.id === fishId)
  if (p) return { name: p.name, nameGujarati: p.nameGujarati }
  const name = fishId.startsWith('custom_') ? fishId.replace('custom_', '').replace(/_/g,' ') : fishId
  return { name, nameGujarati: name }
}

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_CFG = {
  PENDING_PRICE: { label: 'Pending Price',  color: AMBER,  bg: 'rgba(245,158,11,0.15)'  },
  PRICED:        { label: 'Price Filled',   color: TEAL,   bg: 'rgba(8,145,178,0.15)'   },
  CONFIRMED:     { label: 'Confirmed',      color: GREEN,  bg: 'rgba(5,150,105,0.15)'   },
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function TaliBillScreen() {
  const { session } = useTaliSession()
  const params = useLocalSearchParams<{
    role?: string
    boatName?: string
    companyName?: string
    taliId?: string
  }>()

  const role        = (params.role ?? 'boat_owner') as 'boat_owner' | 'company_owner'
  const isBoatOwner = role === 'boat_owner'

  // Build initial tali from live session OR mock stored tali
  const [tali, setTali] = useState<StoredTali>(() => {
    const boatName    = params.boatName ?? session?.boatName    ?? 'Boat'
    const companyName = params.companyName ?? session?.companyName ?? 'Company'

    const rows: FishRow[] = (session?.fishData ?? [])
      .filter(fd => fd.totalKg > 0)
      .map(fd => {
        const meta = getFishMeta(fd.fishId)
        return {
          fishId:              fd.fishId,
          fishName:            meta.name,
          fishNameGujarati:    meta.nameGujarati,
          totalKg:             fd.totalKg,
          pricePerKg:          null,
          previousPricePerKg:  null,
          totalAmount:         null,
        }
      })

    // Demo: if company owner, pre-fill some prices to show the flow
    if (!isBoatOwner && rows.length > 0) {
      rows[0].pricePerKg   = 230
      rows[0].totalAmount  = Math.round(rows[0].totalKg * 230)
    }

    return buildMockTali(boatName, companyName, rows, isBoatOwner ? 'PENDING_PRICE' : 'PRICED')
  })

  // Editable price inputs (company owner only)
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    tali.fishRows.forEach(r => {
      map[r.fishId] = r.pricePerKg !== null ? String(r.pricePerKg) : ''
    })
    return map
  })

  // ── Company owner: submit prices ──────────────────────────────────────────
  function handleSubmitPrices() {
    const allFilled = tali.fishRows.every(r => {
      const v = parseFloat(priceInputs[r.fishId])
      return !isNaN(v) && v > 0
    })
    if (!allFilled) {
      Alert.alert('Missing prices', 'Please fill price for all fish before submitting.')
      return
    }

    const updatedRows: FishRow[] = tali.fishRows.map(r => {
      const newPrice   = parseFloat(priceInputs[r.fishId])
      const prevPrice  = r.pricePerKg  // existing price before this update
      const isChange   = prevPrice !== null && prevPrice !== newPrice
      return {
        ...r,
        previousPricePerKg: isChange ? prevPrice : null,
        pricePerKg:  newPrice,
        totalAmount: Math.round(r.totalKg * newPrice),
      }
    })

    const subtotal = updatedRows.reduce((s, r) => s + (r.totalAmount ?? 0), 0)
    const sc       = Math.round(subtotal * tali.sellingChargeRate)
    const final    = subtotal - sc

    setTali(prev => ({
      ...prev,
      status:       'PRICED',
      fishRows:     updatedRows,
      subtotal,
      sellingCharge: sc,
      finalTotal:   final,
    }))

    Alert.alert('Prices submitted', 'Boat owner has been notified to review and confirm.')
  }

  // ── Boat owner: confirm tali ───────────────────────────────────────────────
  function handleConfirm() {
    Alert.alert(
      'Confirm Tali?',
      'Once confirmed, this tali is locked and cannot be changed by either side.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setTali(prev => ({
              ...prev,
              status: 'CONFIRMED',
              // Clear previous price highlights after confirm
              fishRows: prev.fishRows.map(r => ({ ...r, previousPricePerKg: null })),
            }))
          },
        },
      ]
    )
  }

  const statusCfg   = STATUS_CFG[tali.status]
  const hasChanges  = tali.fishRows.some(r => r.previousPricePerKg !== null)
  const allPriced   = tali.fishRows.every(r => r.pricePerKg !== null)
  const isConfirmed = tali.status === 'CONFIRMED'

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.canGoBack() ? router.back() : null}>
            <Ionicons name="arrow-back" size={20} color={TP} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>તાળી બિલ · Tali Bill</Text>
            <Text style={s.headerSub}>{tali.boatName}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[s.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </View>

        {/* ── Change alert banner (boat owner sees if company updated price) ── */}
        {isBoatOwner && hasChanges && !isConfirmed && (
          <View style={s.changeBanner}>
            <Ionicons name="alert-circle" size={16} color={AMBER} />
            <Text style={s.changeBannerText}>
              Company updated prices — highlighted rows changed. Review and confirm.
            </Text>
          </View>
        )}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Receipt paper ── */}
            <View style={s.paper}>

              {/* Company header */}
              <View style={s.paperHeader}>
                <Text style={s.paperCompany}>{tali.companyName}</Text>
                <Text style={s.paperSubtitle}>માછીમારી રસીદ · FISHING RECEIPT</Text>
              </View>

              {/* Meta row */}
              <View style={s.paperMeta}>
                <View style={s.paperMetaRow}>
                  <Text style={s.paperMetaLabel}>બોટ / BOAT</Text>
                  <Text style={s.paperMetaValue}>{tali.boatName}</Text>
                </View>
                <View style={s.paperMetaRow}>
                  <Text style={s.paperMetaLabel}>તારીખ / DATE</Text>
                  <Text style={s.paperMetaValue}>{tali.date}</Text>
                </View>
                <View style={s.paperMetaRow}>
                  <Text style={s.paperMetaLabel}>બિલ નં / BILL NO</Text>
                  <Text style={s.paperMetaValue}>{tali.billNo}</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={s.paperDivider} />

              {/* Table header */}
              <View style={s.tableHeader}>
                <Text style={[s.tableHeaderCell, { flex: 2 }]}>માછી / FISH</Text>
                <Text style={[s.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>વજન</Text>
                <Text style={[s.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>₹/KG</Text>
                <Text style={[s.tableHeaderCell, { flex: 1.2, textAlign: 'right' }]}>રકમ</Text>
              </View>

              <View style={s.paperDivider} />

              {/* Fish rows */}
              {tali.fishRows.map((row, idx) => {
                const isChanged = row.previousPricePerKg !== null
                const isPending = row.pricePerKg === null

                return (
                  <View
                    key={row.fishId}
                    style={[
                      s.fishRow,
                      isChanged && s.fishRowChanged,
                      idx < tali.fishRows.length - 1 && s.fishRowBorder,
                    ]}
                  >
                    {/* Changed indicator */}
                    {isChanged && (
                      <View style={s.changeIndicator} />
                    )}

                    {/* Fish name */}
                    <View style={{ flex: 2 }}>
                      <Text style={s.fishNameGuj}>{row.fishNameGujarati}</Text>
                      <Text style={s.fishNameEn}>{row.fishName}</Text>
                      {/* Show old price if changed */}
                      {isChanged && (
                        <Text style={s.oldPrice}>
                          was ₹{row.previousPricePerKg}/kg
                        </Text>
                      )}
                    </View>

                    {/* Weight */}
                    <Text style={[s.fishCell, { flex: 1, textAlign: 'right' }]}>
                      {fmtKg(row.totalKg)}
                    </Text>

                    {/* Price per kg */}
                    {!isBoatOwner && !isConfirmed ? (
                      // Company owner: editable input
                      <View style={[s.priceInputWrap, { flex: 1 }]}>
                        <TextInput
                          style={s.priceInput}
                          value={priceInputs[row.fishId]}
                          onChangeText={v => setPriceInputs(prev => ({ ...prev, [row.fishId]: v }))}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={TM}
                          returnKeyType="done"
                        />
                      </View>
                    ) : (
                      // Boat owner / confirmed: read-only
                      <Text style={[
                        s.fishCell,
                        { flex: 1, textAlign: 'right' },
                        isPending && s.fishCellPending,
                        isChanged && s.fishCellChanged,
                      ]}>
                        {isPending ? '—' : fmtNum(row.pricePerKg!)}
                      </Text>
                    )}

                    {/* Total amount */}
                    <Text style={[
                      s.fishCell,
                      { flex: 1.2, textAlign: 'right', fontWeight: '700' },
                      isPending && s.fishCellPending,
                    ]}>
                      {row.totalAmount !== null ? fmtNum(row.totalAmount) : '—'}
                    </Text>
                  </View>
                )
              })}

              <View style={s.paperDivider} />

              {/* Totals — only show when prices are filled */}
              {allPriced && tali.subtotal !== null ? (
                <View style={s.totalsSection}>
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>કુલ / Subtotal</Text>
                    <Text style={s.totalValue}>₹ {fmtNum(tali.subtotal)}</Text>
                  </View>
                  <View style={[s.totalRow, s.chargeRow]}>
                    <View>
                      <Text style={s.chargeLabel}>વેચાણ ચાર્જ / Selling Charge</Text>
                      <Text style={s.chargePercent}>{(tali.sellingChargeRate * 100).toFixed(0)}% of subtotal</Text>
                    </View>
                    <Text style={s.chargeValue}>− ₹ {fmtNum(tali.sellingCharge!)}</Text>
                  </View>
                  <View style={s.paperDividerThick} />
                  <View style={[s.totalRow, s.finalRow]}>
                    <Text style={s.finalLabel}>અંતિમ કુલ / Final Total</Text>
                    <Text style={s.finalValue}>₹ {fmtNum(tali.finalTotal!)}</Text>
                  </View>
                </View>
              ) : (
                <View style={s.pendingTotals}>
                  <Ionicons name="time-outline" size={18} color={AMBER} />
                  <Text style={s.pendingTotalsText}>
                    Totals will appear once company fills all prices
                  </Text>
                </View>
              )}

              {/* Signature / footer */}
              <View style={s.paperFooter}>
                <View style={s.signatureBox}>
                  <View style={s.signatureLine} />
                  <Text style={s.signatureLabel}>સહી / SIGNATURE</Text>
                  <Text style={s.signatureCompany}>{tali.companyName}</Text>
                </View>
                <View style={s.poweredBy}>
                  <Text style={s.poweredByText}>Fishness · Knowmadic</Text>
                </View>
              </View>

            </View>

            {/* ── Confirmed stamp ── */}
            {isConfirmed && (
              <View style={s.confirmedStamp}>
                <Ionicons name="checkmark-circle" size={24} color={GREEN} />
                <Text style={s.confirmedText}>Tali Confirmed — Locked</Text>
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ── Bottom action bar ── */}
        {!isConfirmed && (
          <View style={s.actionBar}>
            {isBoatOwner ? (
              // Boat owner: can only confirm when priced
              tali.status === 'PRICED' ? (
                <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={s.confirmBtnText}>Confirm Tali</Text>
                </TouchableOpacity>
              ) : (
                <View style={s.waitingBar}>
                  <Ionicons name="time-outline" size={18} color={AMBER} />
                  <Text style={s.waitingText}>Waiting for company to fill prices…</Text>
                </View>
              )
            ) : (
              // Company owner: submit prices
              <TouchableOpacity style={s.submitBtn} onPress={handleSubmitPrices} activeOpacity={0.85}>
                <Ionicons name="send-outline" size={18} color="#fff" />
                <Text style={s.submitBtnText}>
                  {tali.status === 'PRICED' ? 'Update Prices' : 'Submit Prices to Boat Owner'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
    gap: 12,
    borderBottomWidth: 1, borderBottomColor: BOR,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: ELEV, alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 16, fontWeight: '800', color: TP },
  headerSub:    { fontSize: 12, color: TS, marginTop: 1 },
  statusBadge:  { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText:   { fontSize: 11, fontWeight: '800' },

  // Change banner
  changeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(245,158,11,0.3)',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  changeBannerText: { flex: 1, fontSize: 12, color: AMBER, fontWeight: '600', lineHeight: 17 },

  scroll: { padding: 16 },

  // Receipt paper
  paper: {
    backgroundColor: PAPER,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },

  // Paper header (dark green like existing bill.tsx)
  paperHeader: {
    backgroundColor: '#1c3a2a',
    paddingVertical: 20, paddingHorizontal: 20,
    alignItems: 'center', gap: 4,
  },
  paperCompany:  { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  paperSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: 1 },

  // Meta rows
  paperMeta: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10, gap: 6 },
  paperMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  paperMetaLabel: { fontSize: 11, color: '#555', fontWeight: '600' },
  paperMetaValue: { fontSize: 11, color: '#1c3a2a', fontWeight: '700' },

  // Dividers
  paperDivider:      { height: 1, backgroundColor: '#e0ddd6', marginHorizontal: 16 },
  paperDividerThick: { height: 2, backgroundColor: '#1c3a2a', marginHorizontal: 16, marginVertical: 6 },

  // Table
  tableHeader: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#f0ede5',
  },
  tableHeaderCell: { fontSize: 10, fontWeight: '700', color: '#555', letterSpacing: 0.5 },

  // Fish rows
  fishRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    position: 'relative',
  },
  fishRowBorder: { borderBottomWidth: 1, borderBottomColor: '#e8e4dc' },
  // Yellow highlight for changed price row
  fishRowChanged: { backgroundColor: 'rgba(245,158,11,0.08)' },
  // Left yellow bar on changed row
  changeIndicator: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 3, backgroundColor: AMBER,
  },

  fishNameGuj: { fontSize: 14, fontWeight: '800', color: '#1a1a1a' },
  fishNameEn:  { fontSize: 11, color: '#666', marginTop: 1 },
  oldPrice:    { fontSize: 10, color: AMBER, fontWeight: '600', marginTop: 2 },

  fishCell:        { fontSize: 13, color: '#1a1a1a' },
  fishCellPending: { color: '#aaa', fontStyle: 'italic' },
  fishCellChanged: { color: AMBER, fontWeight: '700' },

  // Editable price input (company owner)
  priceInputWrap: { alignItems: 'flex-end' },
  priceInput: {
    fontSize: 14, fontWeight: '700', color: '#1a1a1a',
    textAlign: 'right',
    borderBottomWidth: 1.5, borderBottomColor: TEAL,
    paddingVertical: 2, paddingHorizontal: 4,
    minWidth: 60,
  },

  // Totals section
  totalsSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, gap: 8 },
  totalRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel:{ fontSize: 13, color: '#333', fontWeight: '600' },
  totalValue:{ fontSize: 14, color: '#1a1a1a', fontWeight: '700' },
  chargeRow: { paddingVertical: 4 },
  chargeLabel:   { fontSize: 12, color: '#c0392b', fontWeight: '700' },
  chargePercent: { fontSize: 10, color: '#999' },
  chargeValue:   { fontSize: 13, color: '#c0392b', fontWeight: '700' },
  finalRow:  { paddingVertical: 6 },
  finalLabel:{ fontSize: 15, fontWeight: '800', color: '#1c3a2a' },
  finalValue:{ fontSize: 18, fontWeight: '800', color: '#1c3a2a' },

  // Pending totals placeholder
  pendingTotals: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 16,
  },
  pendingTotalsText: { fontSize: 12, color: AMBER, fontStyle: 'italic' },

  // Paper footer
  paperFooter: {
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20,
    alignItems: 'center', gap: 16,
    borderTopWidth: 1, borderTopColor: '#e0ddd6', marginTop: 8,
  },
  signatureBox:    { alignItems: 'center', gap: 4 },
  signatureLine:   { width: 120, height: 1, backgroundColor: '#999' },
  signatureLabel:  { fontSize: 10, color: '#666', letterSpacing: 0.5, marginTop: 4 },
  signatureCompany:{ fontSize: 12, fontWeight: '700', color: '#1a1a1a' },
  poweredBy:       {},
  poweredByText:   { fontSize: 10, color: '#aaa' },

  // Confirmed stamp
  confirmedStamp: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 16, padding: 12,
    backgroundColor: 'rgba(5,150,105,0.12)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(5,150,105,0.3)',
  },
  confirmedText: { fontSize: 14, fontWeight: '800', color: GREEN },

  // Bottom action bar
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 32,
    backgroundColor: SURF,
    borderTopWidth: 1, borderTopColor: BOR,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 16,
  },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: GREEN, borderRadius: 14, paddingVertical: 16,
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: TEAL, borderRadius: 14, paddingVertical: 16,
  },
  submitBtnText:  { color: '#fff', fontSize: 15, fontWeight: '800' },
  waitingBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
  },
  waitingText: { fontSize: 13, color: AMBER, fontWeight: '600' },
})