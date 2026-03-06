import { router } from 'expo-router'
import React, { useState } from 'react'
import {
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
import { FISH_CATEGORIES } from '../constants/fishTypes'
import { theme } from '../constants/theme'
import { useTaliSession } from '../hooks/useTaliSession'
import { BillLineItem } from '../types'
import {
  formatDate,
  formatKg,
  generateBillId
} from '../utils/calculations'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PriceEntry {
  fishId: string
  fishName: string
  fishNameGujarati: string
  totalKg: number
  pricePerKg: string // string while user edits
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFishMeta(fishId: string): { name: string; nameGujarati: string } {
  const preset = FISH_CATEGORIES.find((f) => f.id === fishId)
  if (preset) return { name: preset.name, nameGujarati: preset.nameGujarati }
  const customName = fishId.startsWith('custom_')
    ? fishId.replace('custom_', '').replace(/_/g, ' ')
    : fishId
  return { name: customName, nameGujarati: customName }
}

function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReceiptHeader({
  companyName,
  boatName,
  date,
  billId,
}: {
  companyName: string
  boatName: string
  date: string
  billId: string
}) {
  return (
    <View style={styles.receiptHeader}>
      {/* Watermark fish icon */}
      <Text style={styles.watermark}>🐟</Text>

      <View style={styles.receiptHeaderTop}>
        <Text style={styles.receiptCompany}>{companyName}</Text>
        <Text style={styles.receiptSubtitle}>માછીમારી રસીદ</Text>
        <Text style={styles.receiptSubtitleEn}>Fishing Receipt</Text>
      </View>

      <View style={styles.receiptDividerThick} />

      <View style={styles.receiptMeta}>
        <View style={styles.receiptMetaRow}>
          <Text style={styles.receiptMetaLabel}>બોટ / Boat</Text>
          <Text style={styles.receiptMetaValue}>{boatName}</Text>
        </View>
        <View style={styles.receiptMetaRow}>
          <Text style={styles.receiptMetaLabel}>તારીખ / Date</Text>
          <Text style={styles.receiptMetaValue}>{formatDate(date)}</Text>
        </View>
        <View style={styles.receiptMetaRow}>
          <Text style={styles.receiptMetaLabel}>બિલ નં / Bill No</Text>
          <Text style={styles.receiptMetaValue}>{billId}</Text>
        </View>
      </View>
    </View>
  )
}

function ReceiptTable({ items }: { items: BillLineItem[] }) {
  return (
    <View style={styles.tableContainer}>
      {/* Table header */}
      <View style={[styles.tableRow, styles.tableHeaderRow]}>
        <Text style={[styles.tableCell, styles.tableHeaderCell, { flex: 2.5 }]}>
          માછી / Fish
        </Text>
        <Text style={[styles.tableCell, styles.tableHeaderCell, styles.tableRight, { flex: 1.5 }]}>
          વજન
        </Text>
        <Text style={[styles.tableCell, styles.tableHeaderCell, styles.tableRight, { flex: 1.5 }]}>
          ₹/kg
        </Text>
        <Text style={[styles.tableCell, styles.tableHeaderCell, styles.tableRight, { flex: 2 }]}>
          રકમ
        </Text>
      </View>

      {/* Table rows */}
      {items.map((item, index) => (
        <View
          key={item.fishId}
          style={[
            styles.tableRow,
            index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
          ]}
        >
          <View style={{ flex: 2.5 }}>
            <Text style={styles.tableCellFishName}>{item.fishNameGujarati}</Text>
            <Text style={styles.tableCellFishSub}>{item.fishName}</Text>
          </View>
          <Text style={[styles.tableCell, styles.tableRight, { flex: 1.5 }]}>
            {item.totalKg.toFixed(1)}
          </Text>
          <Text style={[styles.tableCell, styles.tableRight, { flex: 1.5 }]}>
            {formatIndianNumber(item.pricePerKg)}
          </Text>
          <Text style={[styles.tableCell, styles.tableRight, styles.tableCellAmount, { flex: 2 }]}>
            {formatIndianNumber(item.totalAmount)}
          </Text>
        </View>
      ))}
    </View>
  )
}

function ReceiptTotals({
  subtotal,
  sellingCharge,
  finalTotal,
}: {
  subtotal: number
  sellingCharge: number
  finalTotal: number
}) {
  const chargePercent = subtotal > 0 ? ((sellingCharge / subtotal) * 100).toFixed(1) : '6'

  return (
    <View style={styles.totalsContainer}>
      <View style={styles.receiptDivider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>કુલ / Subtotal</Text>
        <Text style={styles.totalValue}>₹ {formatIndianNumber(subtotal)}</Text>
      </View>

      <View style={[styles.totalRow, styles.chargeRow]}>
        <View>
          <Text style={styles.chargeLabel}>વેચાણ ચાર્જ / Selling Charge</Text>
          <Text style={styles.chargePercent}>{chargePercent}% of subtotal</Text>
        </View>
        <Text style={styles.chargeValue}>- ₹ {formatIndianNumber(sellingCharge)}</Text>
      </View>

      <View style={styles.receiptDividerThick} />

      <View style={[styles.totalRow, styles.finalRow]}>
        <Text style={styles.finalLabel}>અંતિમ કુલ / Final Total</Text>
        <Text style={styles.finalValue}>₹ {formatIndianNumber(finalTotal)}</Text>
      </View>
    </View>
  )
}

function ReceiptFooter({ companyName }: { companyName: string }) {
  return (
    <View style={styles.receiptFooter}>
      <View style={styles.signatureBox}>
        <View style={styles.signatureLine} />
        <Text style={styles.signatureLabel}>સહી / Signature</Text>
        <Text style={styles.signatureCompany}>{companyName}</Text>
      </View>
      <View style={styles.poweredBy}>
        <Text style={styles.poweredByText}>Fishness</Text>
        <Text style={styles.poweredByDot}>·</Text>
        <Text style={styles.poweredByText}>Knowmadic</Text>
      </View>
    </View>
  )
}

// ─── Price Input Step ─────────────────────────────────────────────────────────

function PriceInputStep({
  entries,
  onUpdate,
  onGenerate,
  onBack,
}: {
  entries: PriceEntry[]
  onUpdate: (fishId: string, price: string) => void
  onGenerate: () => void
  onBack: () => void
}) {
  const allFilled = entries.every((e) => {
    const val = parseFloat(e.pricePerKg)
    return !isNaN(val) && val > 0
  })

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>બિલ બનાવો</Text>
          <Text style={styles.headerSub}>ભાવ નાખો • Enter Prices</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.priceInputList}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.priceInputHint}>
            દરેક માછી માટે ₹/kg ભાવ નાખો
          </Text>
          <Text style={styles.priceInputHintSub}>
            Enter price per kg for each fish
          </Text>

          {entries.map((entry) => (
            <View key={entry.fishId} style={styles.priceInputCard}>
              <View style={styles.priceInputLeft}>
                <Text style={styles.priceInputFishGu}>{entry.fishNameGujarati}</Text>
                <Text style={styles.priceInputFishEn}>{entry.fishName}</Text>
                <View style={styles.priceInputKgBadge}>
                  <Text style={styles.priceInputKgText}>{formatKg(entry.totalKg)}</Text>
                </View>
              </View>
              <View style={styles.priceInputRight}>
                <Text style={styles.priceInputCurrencySymbol}>₹</Text>
                <TextInput
                  style={styles.priceInputField}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.colors.textDisabled}
                  value={entry.pricePerKg}
                  onChangeText={(val) => onUpdate(entry.fishId, val)}
                  returnKeyType="done"
                  selectTextOnFocus
                />
                <Text style={styles.priceInputPerKg}>/kg</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.generateBtnContainer}>
          <TouchableOpacity
            style={[styles.generateBtn, !allFilled && styles.generateBtnDisabled]}
            onPress={onGenerate}
            disabled={!allFilled}
            activeOpacity={0.8}
          >
            <Text style={styles.generateBtnText}>📄  બિલ જુઓ • View Bill</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ─── Receipt View Step ─────────────────────────────────────────────────────────

function ReceiptView({
  billId,
  companyName,
  boatName,
  date,
  items,
  sellingChargeRate,
  onBack,
}: {
  billId: string
  companyName: string
  boatName: string
  date: string
  items: BillLineItem[]
  sellingChargeRate: number
  onBack: () => void
}) {
  const subtotal = items.reduce((sum, i) => sum + i.totalAmount, 0)
  const sellingCharge = Math.round(subtotal * sellingChargeRate)
  const finalTotal = subtotal - sellingCharge

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>બિલ</Text>
          <Text style={styles.headerSub}>{boatName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.receiptScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Receipt paper */}
        <View style={styles.receiptPaper}>
          <ReceiptHeader
            companyName={companyName}
            boatName={boatName}
            date={date}
            billId={billId}
          />

          <ReceiptTable items={items} />

          <ReceiptTotals
            subtotal={subtotal}
            sellingCharge={sellingCharge}
            finalTotal={finalTotal}
          />

          <ReceiptFooter companyName={companyName} />
        </View>

        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BillScreen() {
  const { session } = useTaliSession()

  const [step, setStep] = useState<'prices' | 'receipt'>('prices')
  const [billId] = useState(generateBillId())
  const [sellingChargeRate] = useState(0.06) // 6%

  // Build initial price entries from session fish data
  const [priceEntries, setPriceEntries] = useState<PriceEntry[]>(() => {
    if (!session) return []
    return session.fishData
      .filter((fd) => fd.totalKg > 0)
      .map((fd) => {
        const meta = getFishMeta(fd.fishId)
        return {
          fishId: fd.fishId,
          fishName: meta.name,
          fishNameGujarati: meta.nameGujarati,
          totalKg: fd.totalKg,
          pricePerKg: '',
        }
      })
  })

  const [billItems, setBillItems] = useState<BillLineItem[]>([])

  if (!session) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🐟</Text>
          <Text style={styles.emptyTitle}>કોઈ સત્ર નથી</Text>
          <Text style={styles.emptyText}>No active session found</Text>
          <TouchableOpacity
            style={styles.emptyBackBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.emptyBackBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  function handleUpdatePrice(fishId: string, price: string) {
    setPriceEntries((prev) =>
      prev.map((e) => (e.fishId === fishId ? { ...e, pricePerKg: price } : e))
    )
  }

  function handleGenerate() {
    const items: BillLineItem[] = priceEntries.map((e) => {
      const pricePerKg = parseFloat(e.pricePerKg) || 0
      return {
        fishId: e.fishId,
        fishName: e.fishName,
        fishNameGujarati: e.fishNameGujarati,
        totalKg: e.totalKg,
        pricePerKg,
        totalAmount: Math.round(e.totalKg * pricePerKg),
      }
    })
    setBillItems(items)
    setStep('receipt')
  }

  if (step === 'receipt') {
    return (
      <ReceiptView
        billId={billId}
        companyName={session.companyName}
        boatName={session.boatName}
        date={session.date}
        items={billItems}
        sellingChargeRate={sellingChargeRate}
        onBack={() => setStep('prices')}
      />
    )
  }

  return (
    <PriceInputStep
      entries={priceEntries}
      onUpdate={handleUpdatePrice}
      onGenerate={handleGenerate}
      onBack={() => router.back()}
    />
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  headerSub: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },

  // ── Empty State ──
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.xl,
  },
  emptyIcon: { fontSize: 64 },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  emptyBackBtn: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyBackBtnText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },

  // ── Price Input Step ──
  priceInputList: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  priceInputHint: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
    marginTop: theme.spacing.xs,
  },
  priceInputHintSub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  priceInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  priceInputLeft: {
    flex: 1,
    gap: 2,
  },
  priceInputFishGu: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  priceInputFishEn: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  priceInputKgBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  priceInputKgText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  priceInputRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    height: 52,
    gap: 4,
  },
  priceInputCurrencySymbol: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  priceInputField: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    minWidth: 72,
    textAlign: 'center',
    padding: 0,
  },
  priceInputPerKg: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  generateBtnContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  generateBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: theme.touchTarget + 4,
  },
  generateBtnDisabled: {
    opacity: 0.4,
  },
  generateBtnText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
  },

  // ── Receipt ──
  receiptScroll: {
    padding: theme.spacing.md,
  },
  receiptPaper: {
    backgroundColor: '#FDFAF4',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    // Paper shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },

  // Receipt Header
  receiptHeader: {
    backgroundColor: '#1c3a2a',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    right: -10,
    top: -10,
    fontSize: 120,
    opacity: 0.06,
  },
  receiptHeaderTop: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  receiptCompany: {
    fontSize: 22,
    fontWeight: '900',
    color: '#e8f5ef',
    textAlign: 'center',
    letterSpacing: 1,
  },
  receiptSubtitle: {
    fontSize: 13,
    color: '#7fcaa3',
    marginTop: 3,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  receiptSubtitleEn: {
    fontSize: 11,
    color: '#4a9070',
    marginTop: 1,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  receiptMeta: {
    gap: 6,
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptMetaLabel: {
    fontSize: 11,
    color: '#7fcaa3',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  receiptMetaValue: {
    fontSize: 13,
    color: '#e8f5ef',
    fontWeight: '700',
  },

  // Dividers
  receiptDividerThick: {
    height: 2,
    backgroundColor: '#0d7a5f',
    marginVertical: theme.spacing.sm,
    opacity: 0.4,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#d4c9b0',
    marginVertical: theme.spacing.sm,
  },

  // Table
  tableContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  tableHeaderRow: {
    borderBottomWidth: 2,
    borderBottomColor: '#c4b49a',
    marginBottom: 2,
  },
  tableRowEven: {
    backgroundColor: '#f5f0e6',
    borderRadius: 4,
  },
  tableRowOdd: {
    backgroundColor: 'transparent',
  },
  tableCell: {
    fontSize: 13,
    color: '#3a2d1a',
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 11,
    color: '#6b5a3e',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRight: {
    textAlign: 'right',
  },
  tableCellFishName: {
    fontSize: 14,
    color: '#1c3a2a',
    fontWeight: '800',
    paddingHorizontal: 4,
  },
  tableCellFishSub: {
    fontSize: 10,
    color: '#8a7a5e',
    paddingHorizontal: 4,
    marginTop: 1,
  },
  tableCellAmount: {
    fontWeight: '800',
    color: '#1c3a2a',
    fontSize: 14,
  },

  // Totals
  totalsContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 13,
    color: '#6b5a3e',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 14,
    color: '#3a2d1a',
    fontWeight: '700',
  },
  chargeRow: {
    alignItems: 'flex-start',
    paddingVertical: 8,
    backgroundColor: '#fff3f3',
    borderRadius: 6,
    paddingHorizontal: 8,
    marginVertical: 2,
  },
  chargeLabel: {
    fontSize: 13,
    color: '#c0392b',
    fontWeight: '700',
  },
  chargePercent: {
    fontSize: 10,
    color: '#e57373',
    marginTop: 1,
  },
  chargeValue: {
    fontSize: 14,
    color: '#c0392b',
    fontWeight: '800',
  },
  finalRow: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: 8,
    backgroundColor: '#1c3a2a',
    borderRadius: 8,
    marginTop: 4,
  },
  finalLabel: {
    fontSize: 14,
    color: '#7fcaa3',
    fontWeight: '700',
  },
  finalValue: {
    fontSize: 20,
    color: '#e8f5ef',
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Footer
  receiptFooter: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#d4c9b0',
    marginTop: theme.spacing.sm,
  },
  signatureBox: {
    alignItems: 'flex-end',
    gap: 4,
  },
  signatureLine: {
    width: 140,
    height: 1,
    backgroundColor: '#3a2d1a',
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#8a7a5e',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  signatureCompany: {
    fontSize: 12,
    color: '#3a2d1a',
    fontWeight: '700',
  },
  poweredBy: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: theme.spacing.xs,
  },
  poweredByText: {
    fontSize: 10,
    color: '#a09080',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  poweredByDot: {
    fontSize: 10,
    color: '#c4b49a',
  },
})