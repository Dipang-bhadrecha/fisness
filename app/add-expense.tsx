/**
 * app/add-expense.tsx — Add Expense Screen
 *
 * Flow: Quick Action "Add Expense" → this screen
 *
 * User:
 *   1. Selects a boat (horizontal row)
 *   2. Selects expense category (grid)
 *   3. Enters amount + optional note
 *   4. Saves → goes to ledger
 *
 * Categories (from business context):
 *   Season Advance, Diesel, Crew (Kharchi), Grocery,
 *   Gas Cylinder, Fishing Net Repair, Fishing Net New,
 *   Maintenance, Ice, Other
 *
 * TODO: Replace mock boats with GET /api/v1/boats
 * TODO: POST /api/v1/expenses { boatId, category, amount, note, date }
 */

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
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

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG   = '#080F1A'
const SURF = '#0D1B2E'
const ELEV = '#132640'
const BOR  = 'rgba(0,194,203,0.1)'
const TP   = '#F0F4F8'
const TS   = '#8BA3BC'
const TM   = '#3D5A73'
const TEAL = '#0891b2'
const RED  = '#ef4444'

// ─── Mock boats — replace with API ───────────────────────────────────────────
const BOATS = [
  { id: '1', name: 'Jai Mataji',  gujarati: 'જય માતાજી', reg: 'GJ-VR-1042', status: 'active' as const },
  { id: '2', name: 'Sea Star',    gujarati: 'સી સ્ટાર',  reg: 'GJ-VR-2201', status: 'docked' as const },
  { id: '3', name: 'Deep Blue',   gujarati: 'ડીપ બ્લૂ',  reg: 'GJ-VR-3345', status: 'docked' as const },
]

// ─── Expense categories ───────────────────────────────────────────────────────
interface ExpenseCategory {
  id: string
  label: string
  labelGuj: string
  emoji: string
  color: string
}

const CATEGORIES: ExpenseCategory[] = [
  { id: 'season_advance',      label: 'Season Advance',     labelGuj: 'સીઝન એડવાન્સ',    emoji: '💰', color: '#f59e0b' },
  { id: 'diesel',              label: 'Diesel',             labelGuj: 'ડીઝલ',             emoji: '⛽', color: '#3b82f6' },
  { id: 'crew_kharchi',        label: 'Crew Kharchi',       labelGuj: 'ક્રૂ ખર્ચી',       emoji: '👥', color: '#8b5cf6' },
  { id: 'grocery',             label: 'Grocery',            labelGuj: 'ગ્રોસરી',          emoji: '🛒', color: '#10b981' },
  { id: 'gas_cylinder',        label: 'Gas Cylinder',       labelGuj: 'ગૅસ સિલિન્ડર',    emoji: '🔵', color: '#06b6d4' },
  { id: 'fishing_net_repair',  label: 'Net Repair',         labelGuj: 'જાળ રિપેર',        emoji: '🔧', color: '#d97706' },
  { id: 'fishing_net_new',     label: 'New Fishing Net',    labelGuj: 'નવી જાળ',          emoji: '🪢', color: '#0891b2' },
  { id: 'maintenance',         label: 'Maintenance',        labelGuj: 'મેન્ટેનન્સ',       emoji: '🛠️', color: '#64748b' },
  { id: 'ice',                 label: 'Ice',                labelGuj: 'બરફ',              emoji: '🧊', color: '#38bdf8' },
  { id: 'other',               label: 'Other',              labelGuj: 'અન્ય',             emoji: '📦', color: '#6b7280' },
]

const fmt = (n: number) => n.toLocaleString('en-IN')

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AddExpenseScreen() {
  const [selectedBoat,     setSelectedBoat]     = useState<string>(BOATS[0].id)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [amount,           setAmount]           = useState('')
  const [note,             setNote]             = useState('')
  const [saving,           setSaving]           = useState(false)

  const boat     = BOATS.find(b => b.id === selectedBoat)
  const category = CATEGORIES.find(c => c.id === selectedCategory)
  const isValid  = selectedBoat && selectedCategory && amount.trim().length > 0 && Number(amount) > 0

  const handleSave = async () => {
    if (!isValid || saving) return
    setSaving(true)

    try {
      // TODO: replace with real API
      // await createExpense(token, {
      //   boatId: selectedBoat,
      //   category: selectedCategory,
      //   amount: Number(amount),
      //   note: note.trim(),
      //   date: new Date().toISOString(),
      // })
      await new Promise(r => setTimeout(r, 600)) // simulate

      Alert.alert(
        'Expense Saved',
        `₹${fmt(Number(amount))} — ${category?.label} added for ${boat?.name}`,
        [{ text: 'OK', onPress: () => router.back() }]
      )
    } catch {
      Alert.alert('Error', 'Could not save expense. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >

          {/* ── Header ── */}
          <View style={s.header}>
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => router.canGoBack() ? router.back() : null}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={s.headerCenter}>
              <Text style={s.headerTitle}>Add Expense</Text>
              <Text style={s.headerSub}>Season 2025–26</Text>
            </View>
            {/* Save button in header */}
            <TouchableOpacity
              style={[s.saveBtn, !isValid && s.saveBtnOff]}
              onPress={handleSave}
              disabled={!isValid || saving}
              activeOpacity={0.8}
            >
              <Text style={s.saveBtnText}>{saving ? '...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
          >

            {/* ── Step 1: Select Boat ── */}
            <Text style={s.stepLabel}>1. SELECT BOAT</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.boatRow}
            >
              {BOATS.map(b => {
                const selected = selectedBoat === b.id
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[s.boatChip, selected && s.boatChipSelected]}
                    onPress={() => setSelectedBoat(b.id)}
                    activeOpacity={0.75}
                  >
                    <Text style={s.boatChipEmoji}>⛵</Text>
                    <View>
                      <Text style={[s.boatChipName, selected && s.boatChipNameSelected]}>
                        {b.name}
                      </Text>
                      <Text style={s.boatChipReg}>{b.reg}</Text>
                    </View>
                    {selected && (
                      <View style={s.boatChipCheck}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            {/* ── Step 2: Select Category ── */}
            <Text style={s.stepLabel}>2. EXPENSE CATEGORY</Text>
            <View style={s.categoryGrid}>
              {CATEGORIES.map(cat => {
                const selected = selectedCategory === cat.id
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      s.categoryCell,
                      selected && { borderColor: cat.color, backgroundColor: cat.color + '18' },
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.75}
                  >
                    <Text style={s.categoryEmoji}>{cat.emoji}</Text>
                    <Text style={[s.categoryLabel, selected && { color: cat.color }]}>
                      {cat.label}
                    </Text>
                    <Text style={s.categoryLabelGuj}>{cat.labelGuj}</Text>
                    {selected && (
                      <View style={[s.categoryCheck, { backgroundColor: cat.color }]}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* ── Step 3: Amount + Note ── */}
            <Text style={s.stepLabel}>3. AMOUNT & NOTE</Text>
            <View style={s.amountCard}>

              {/* Amount input */}
              <View style={s.amountRow}>
                <Text style={s.rupeeSymbol}>₹</Text>
                <TextInput
                  style={s.amountInput}
                  placeholder="0"
                  placeholderTextColor={TM}
                  value={amount}
                  onChangeText={t => setAmount(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
                {amount.length > 0 && (
                  <Text style={s.amountFormatted}>
                    ₹{fmt(Number(amount))}
                  </Text>
                )}
              </View>

              <View style={s.divider} />

              {/* Note input */}
              <TextInput
                style={s.noteInput}
                placeholder="Add a note (optional)..."
                placeholderTextColor={TM}
                value={note}
                onChangeText={setNote}
                returnKeyType="done"
                maxLength={100}
              />
            </View>

            {/* ── Summary preview ── */}
            {isValid && (
              <View style={s.summaryCard}>
                <Text style={s.summaryTitle}>Summary</Text>
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Boat</Text>
                  <Text style={s.summaryValue}>{boat?.name} · {boat?.reg}</Text>
                </View>
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Category</Text>
                  <Text style={s.summaryValue}>{category?.emoji} {category?.label}</Text>
                </View>
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Amount</Text>
                  <Text style={[s.summaryValue, { color: RED, fontWeight: '800' }]}>
                    − ₹{fmt(Number(amount))}
                  </Text>
                </View>
                {note.trim().length > 0 && (
                  <View style={s.summaryRow}>
                    <Text style={s.summaryLabel}>Note</Text>
                    <Text style={s.summaryValue}>{note}</Text>
                  </View>
                )}
              </View>
            )}

            {/* ── Save button ── */}
            <TouchableOpacity
              style={[s.saveLargeBtn, !isValid && s.saveLargeBtnOff]}
              onPress={handleSave}
              disabled={!isValid || saving}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={s.saveLargeBtnText}>
                {saving ? 'Saving...' : 'Save Expense'}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // Header
  header:       { flexDirection: 'row', alignItems: 'center', backgroundColor: TEAL, paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  saveBtn:      { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  saveBtnOff:   { opacity: 0.4 },
  saveBtnText:  { color: '#fff', fontWeight: '800', fontSize: 14 },

  scroll: { padding: 16, gap: 12 },

  // Step label
  stepLabel: { fontSize: 11, fontWeight: '700', color: TEAL, letterSpacing: 1.2, marginTop: 8, marginBottom: 10 },

  // Boat row
  boatRow: { gap: 10, paddingBottom: 4 },
  boatChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: SURF, borderRadius: 14, borderWidth: 1.5,
    borderColor: BOR, paddingHorizontal: 14, paddingVertical: 12,
  },
  boatChipSelected: { borderColor: TEAL, backgroundColor: TEAL + '15' },
  boatChipEmoji:    { fontSize: 22 },
  boatChipName:     { fontSize: 14, fontWeight: '700', color: TS },
  boatChipNameSelected: { color: TEAL },
  boatChipReg:      { fontSize: 11, color: TM, marginTop: 2, fontFamily: 'monospace' },
  boatChipCheck:    { width: 20, height: 20, borderRadius: 10, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },

  // Category grid
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCell: {
    width: '30%', flexGrow: 1,
    backgroundColor: SURF, borderRadius: 14, borderWidth: 1.5,
    borderColor: BOR, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8,
    gap: 5, position: 'relative',
  },
  categoryEmoji:    { fontSize: 26 },
  categoryLabel:    { fontSize: 12, fontWeight: '700', color: TP, textAlign: 'center' },
  categoryLabelGuj: { fontSize: 10, color: TM, textAlign: 'center' },
  categoryCheck:    { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  // Amount card
  amountCard: { backgroundColor: SURF, borderRadius: 16, borderWidth: 1, borderColor: BOR, padding: 16, gap: 4 },
  amountRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rupeeSymbol:{ fontSize: 28, fontWeight: '800', color: TS },
  amountInput:{ flex: 1, fontSize: 36, fontWeight: '800', color: TP, paddingVertical: 4 },
  amountFormatted: { fontSize: 13, color: TM, alignSelf: 'flex-end', paddingBottom: 8 },
  divider:    { height: 1, backgroundColor: BOR, marginVertical: 8 },
  noteInput:  { fontSize: 14, color: TP, paddingVertical: 8 },

  // Summary
  summaryCard:  { backgroundColor: SURF, borderRadius: 16, borderWidth: 1, borderColor: TEAL + '30', padding: 16, gap: 10 },
  summaryTitle: { fontSize: 12, fontWeight: '700', color: TEAL, letterSpacing: 0.8, marginBottom: 4 },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: TS },
  summaryValue: { fontSize: 13, fontWeight: '700', color: TP },

  // Large save button
  saveLargeBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: TEAL, borderRadius: 16, paddingVertical: 16, marginTop: 8 },
  saveLargeBtnOff: { opacity: 0.4 },
  saveLargeBtnText:{ color: '#fff', fontSize: 16, fontWeight: '800' },
})