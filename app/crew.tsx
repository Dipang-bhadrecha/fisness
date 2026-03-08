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

// ── TEMP hardcoded crew — replace with API call later ─────────────────────────
// Real: GET /api/v1/companies/:companyId/registered-boats/:boatId/crew
const TEMP_CREW = [
  { id: '1', name: 'Suraj Tandel', role: 'Pilot / Caption', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', days: 180, pagar: 3000000, upad: 150000, jama: 119000 },
  { id: '2', name: 'Suraj Tandel', role: 'Pilot / Caption', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', days: 180, pagar: 3000000, upad: 150000, jama: 119000 },
  { id: '3', name: 'Suraj Tandel', role: 'Pilot / Caption', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', days: 180, pagar: 3000000, upad: 150000, jama: 119000 },
  { id: '4', name: 'Suraj Tandel', role: 'Pilot / Caption', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', days: 180, pagar: 3000000, upad: 150000, jama: 119000 },
  { id: '5', name: 'Suraj Tandel', role: 'Pilot / Caption', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', days: 180, pagar: 3000000, upad: 150000, jama: 119000 },
  { id: '6', name: 'Suraj Tandel', role: 'Pilot / Caption', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', days: 180, pagar: 3000000, upad: 150000, jama: 119000 },
  { id: '7', name: 'Suraj Tandel', role: 'Pilot / Caption', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', days: 180, pagar: 3000000, upad: 150000, jama: 119000 },
]

const fmt = (n: number) => `₹ ${n.toLocaleString('en-IN')}`

function CrewCard({ member }: { member: typeof TEMP_CREW[0] }) {
  return (
    <View style={s.card}>
      {/* Left: avatar + role */}
      <View style={s.cardLeft}>
        <View style={s.avatar}>
          <Text style={s.avatarEmoji}>👤</Text>
        </View>
        <Text style={s.roleLabel}>{member.role}</Text>
        <Text style={s.memberName}>{member.name}</Text>
      </View>

      {/* Right: details */}
      <View style={s.cardRight}>
        <Text style={s.detailName}>{member.name}</Text>
        <Text style={s.detailRow}>Aaadhar card - {member.aadhaar}</Text>
        <Text style={s.detailRow}>Joining Date - {member.joiningDate}</Text>

        <View style={s.statsRow}>
          <View style={s.statCol}>
            <Text style={s.statLabel}>Days - {member.days}</Text>
          </View>
          <View style={s.statColRight}>
            <Text style={s.statItem}>pagar - {fmt(member.pagar)}</Text>
            <Text style={s.statItem}>Upad - {fmt(member.upad)}</Text>
            <Text style={s.statItem}>jama - {fmt(member.jama)}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default function CrewScreen() {
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
          <Text style={s.headerTitle}>{boatName ?? 'Crew'}</Text>
          <Text style={s.headerSub}>GJ - 11 - Bk - 0369</Text>
        </View>
        <TouchableOpacity style={s.addBtn}>
          <Text style={s.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Crew List */}
      <ScrollView
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      >
        {TEMP_CREW.map(member => (
          <CrewCard key={member.id} member={member} />
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5B8DEF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    padding: 12,
    gap: 10,
  },
  card: {
    backgroundColor: '#D6E4F7',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#B8D0EE',
  },
  cardLeft: {
    alignItems: 'center',
    width: 72,
    gap: 6,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5B8DEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  roleLabel: {
    fontSize: 9,
    color: '#4A6A9C',
    textAlign: 'center',
    fontWeight: '600',
  },
  memberName: {
    fontSize: 10,
    color: '#2A4A7C',
    textAlign: 'center',
    fontWeight: '700',
  },
  cardRight: {
    flex: 1,
    gap: 3,
  },
  detailName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2A4A',
  },
  detailRow: {
    fontSize: 11,
    color: '#4A6A9C',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  statCol: {
    justifyContent: 'flex-start',
  },
  statColRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#4A6A9C',
    fontWeight: '600',
  },
  statItem: {
    fontSize: 11,
    color: '#2A4A7C',
    fontWeight: '600',
  },
})