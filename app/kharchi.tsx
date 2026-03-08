import { router, useLocalSearchParams } from 'expo-router'
import React from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../constants/theme'

// ── TEMP hardcoded kharchi — replace with API call later ──────────────────────
// Real: GET /api/v1/companies/:companyId/registered-boats/:boatId/kharchi
const TEMP_KHARCHI = [
  { id: '1', crewName: 'Suraj Tandel', role: 'Pilot', amount: 5000,  date: '03 Jul 2026', note: 'Advance' },
  { id: '2', crewName: 'Raju Makwana', role: 'Sailor', amount: 2500, date: '05 Jul 2026', note: 'Medicine' },
  { id: '3', crewName: 'Bharat Gohil', role: 'Sailor', amount: 1200, date: '07 Jul 2026', note: 'Food' },
  { id: '4', crewName: 'Kanji Patel',  role: 'Helper', amount: 800,  date: '08 Jul 2026', note: 'Travel' },
]

const fmt = (n: number) => `₹ ${n.toLocaleString('en-IN')}`
const total = TEMP_KHARCHI.reduce((sum, k) => sum + k.amount, 0)

function KharchiCard({ item }: { item: typeof TEMP_KHARCHI[0] }) {
  return (
    <View style={s.card}>
      <View style={s.cardLeft}>
        <View style={s.avatar}>
          <Text style={s.avatarEmoji}>👤</Text>
        </View>
        <Text style={s.roleLabel}>{item.role}</Text>
      </View>

      <View style={s.cardMid}>
        <Text style={s.crewName}>{item.crewName}</Text>
        <Text style={s.noteText}>{item.note}</Text>
        <Text style={s.dateText}>{item.date}</Text>
      </View>

      <View style={s.cardRight}>
        <Text style={s.amount}>{fmt(item.amount)}</Text>
      </View>
    </View>
  )
}

export default function KharchiScreen() {
  const { boatId, boatName, companyId } = useLocalSearchParams<{
    boatId: string
    boatName: string
    companyId: string
  }>()

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.canGoBack() ? router.back() : null}
        >
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Kharchi</Text>
          <Text style={s.headerSub}>{boatName ?? 'Crew Expenses'}</Text>
        </View>
        <TouchableOpacity style={s.addBtn}>
          <Text style={s.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Total Summary */}
      <View style={s.totalCard}>
        <Text style={s.totalLabel}>Total Kharchi</Text>
        <Text style={s.totalValue}>{fmt(total)}</Text>
        <Text style={s.totalSub}>{TEMP_KHARCHI.length} entries</Text>
      </View>

      {/* Kharchi List */}
      <ScrollView
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      >
        {TEMP_KHARCHI.map(item => (
          <KharchiCard key={item.id} item={item} />
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  totalCard: {
    margin: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  totalSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  list: {
    padding: 12,
    gap: 10,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardLeft: {
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  roleLabel: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  cardMid: {
    flex: 1,
    gap: 2,
  },
  crewName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  noteText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  dateText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primary,
  },
})