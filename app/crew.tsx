import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../constants/theme'

// ── TEMP boats ─────────────────────────────────────────
const TEMP_BOATS = [
  { id: '1', name: 'Bravo', registration: 'GJ-01' },
  { id: '2', name: 'Alpha', registration: 'GJ-02' },
  { id: '3', name: 'Charlie', registration: 'GJ-03' },
  { id: '4', name: 'Delta', registration: 'GJ-04' },
  { id: '5', name: 'Echo', registration: 'GJ-05' },
]

// ── TEMP hardcoded crew — replace with API call later ─────────────────────────
const TEMP_CREW = [
  { id: '1', name: 'Suraj Tandel', role: 'Pilot / Caption', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', bahano: 30000, attendedDays: 18, fixedSalary: 15000, totalDaysJoined: 180, tripsCompleted: 12, pagar: 9000, projectedSalary: 90000, upad: 150000, jama: 119000 },
  { id: '2', name: 'Raju Makwana', role: 'Sailor', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', bahano: 25000, attendedDays: 20, fixedSalary: 12000, totalDaysJoined: 180, tripsCompleted: 12, pagar: 8000, projectedSalary: 72000, upad: 100000, jama: 80000 },
  { id: '3', name: 'Bharat Gohil', role: 'Sailor', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', bahano: 20000, attendedDays: 15, fixedSalary: 10000, totalDaysJoined: 180, tripsCompleted: 12, pagar: 5000, projectedSalary: 60000, upad: 75000, jama: 50000 },
  { id: '4', name: 'Kanji Patel', role: 'Helper', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', bahano: 15000, attendedDays: 10, fixedSalary: 8000, totalDaysJoined: 180, tripsCompleted: 12, pagar: 2666, projectedSalary: 48000, upad: 50000, jama: 25000 },
  { id: '5', name: 'Suraj Tandel', role: 'Pilot / Caption', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', bahano: 30000, attendedDays: 18, fixedSalary: 15000, totalDaysJoined: 180, tripsCompleted: 12, pagar: 9000, projectedSalary: 90000, upad: 150000, jama: 119000 },
  { id: '6', name: 'Raju Makwana', role: 'Sailor', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', bahano: 25000, attendedDays: 20, fixedSalary: 12000, totalDaysJoined: 180, tripsCompleted: 12, pagar: 8000, projectedSalary: 72000, upad: 100000, jama: 80000 },
  { id: '7', name: 'Bharat Gohil', role: 'Sailor', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', bahano: 20000, attendedDays: 15, fixedSalary: 10000, totalDaysJoined: 180, tripsCompleted: 12, pagar: 5000, projectedSalary: 60000, upad: 75000, jama: 50000 },
]

const fmt = (n?: number) => n ? `₹ ${n.toLocaleString('en-IN')}` : '₹ 0'

function CrewAdvanceRow({ member, onPress }: { member: typeof TEMP_CREW[0]; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={s.crewRow}>
      <View style={s.crewRowLeft}>
        <View style={s.crewAvatar}>
          <Text style={s.crewAvatarEmoji}>👤</Text>
        </View>
        <View style={s.crewInfo}>
          <Text style={s.crewName}>{member.name}</Text>
          <Text style={s.crewRole}>{member.role}</Text>
        </View>
      </View>
      <View style={s.crewRowRight}>
        <Text style={s.crewAmount}>{fmt(member.bahano)}</Text>
        <Text style={s.crewDate}>{member.joiningDate}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function CrewScreen() {
  const { boatId, boatName } = useLocalSearchParams<{
    boatId: string
    boatName: string
    companyId: string
  }>()

  const [searchText, setSearchText] = useState('')
  const [boatSearchText, setBoatSearchText] = useState('')
  const [selectedBoat, setSelectedBoat] = useState(boatName || 'Bravo')

  const totalKharchi = TEMP_CREW.reduce((sum, member) => sum + (member.bahano || 0), 0)

  const filteredBoats = TEMP_BOATS.filter(boat =>
    boat.name.toLowerCase().includes(boatSearchText.toLowerCase())
  )

  const filteredCrew = TEMP_CREW.filter(member =>
    member.name.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.canGoBack() ? router.back() : null}
        >
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Kharchi</Text>
          <Text style={s.headerSub}>{selectedBoat}</Text>
        </View>
        <TouchableOpacity style={s.addBtn}>
          <Text style={s.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={s.totalCard}>
        <Text style={s.totalLabel}>TOTAL KHARCHI</Text>
        <Text style={s.totalValue}>{fmt(totalKharchi)}</Text>
        <Text style={s.totalSub}>{TEMP_CREW.length} entries</Text>
      </View>

      <View style={s.boatSelectorHeader}>
        <Text style={s.boatSearchLabel}>SELECT BOAT</Text>
        <View style={s.boatSearchContainer}>
          <Text style={s.boatSearchIcon}>🔍</Text>
          <TextInput
            style={s.boatSearchInput}
            placeholder="Search boat name..."
            placeholderTextColor={theme.colors.textDisabled}
            value={boatSearchText}
            onChangeText={setBoatSearchText}
          />
        </View>
      </View>

      <View style={s.boatSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.boatScroll}>
          {filteredBoats.map(boat => (
            <TouchableOpacity
              key={boat.id}
              style={[s.boatOption, selectedBoat === boat.name && s.boatOptionActive]}
              onPress={() => setSelectedBoat(boat.name)}
            >
              <Text style={s.boatIcon}>🚢</Text>
              <Text style={[s.boatName, selectedBoat === boat.name && s.boatNameActive]}>
                {boat.name}
              </Text>
              <Text style={s.boatReg}>{boat.registration}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={s.searchContainer}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search crew name..."
          placeholderTextColor={theme.colors.textDisabled}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={s.noteBox}>
        <Text style={s.noteText}>
          Note: This is the port to list all crew members on port
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={s.crewList}
        showsVerticalScrollIndicator={false}
      >
        {filteredCrew.map(member => (
          <CrewAdvanceRow
            key={member.id}
            member={member}
            onPress={() => router.push({
              pathname: '/crew-detail',
              params: {
                memberId: member.id,
                memberName: member.name,
                memberRole: member.role,
                boatId: boatId ?? '',
                boatName: boatName ?? '',
              },
            })}
          />
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
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: theme.colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textInverse,
  },
  headerSub: {
    fontSize: 13,
    color: theme.colors.textInverse,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addBtnText: {
    color: theme.colors.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
  totalCard: {
    backgroundColor: theme.colors.primaryDark,
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: theme.colors.textInverse,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.textInverse,
    marginTop: 6,
  },
  totalSub: {
    fontSize: 12,
    color: theme.colors.textInverse,
    marginTop: 4,
  },
  boatSelector: {
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  boatScroll: {
    flexGrow: 0,
  },
  boatOption: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  boatOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  boatIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  boatName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  boatNameActive: {
    color: theme.colors.textInverse,
  },
  boatReg: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  boatSelectorHeader: {
    marginHorizontal: 12,
    marginBottom: 10,
    gap: 10,
  },
  boatSearchLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  boatSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  boatSearchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: theme.colors.primary,
  },
  boatSearchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: theme.colors.primary,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  noteBox: {
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  noteText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  crewList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  crewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  crewRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  crewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewAvatarEmoji: {
    fontSize: 20,
  },
  crewInfo: {
    flex: 1,
  },
  crewName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  crewRole: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  crewRowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  crewAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  crewDate: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
})
