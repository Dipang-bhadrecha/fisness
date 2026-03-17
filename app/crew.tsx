/**
 * app/crew.tsx — Crew Roster Screen
 *
 * Opened from:
 *   - Boat card Crew button (params: boatId, boatName)
 *   - Footer Crew tab (no params — shows all boats)
 *
 * Shows crew associated with the selected boat.
 * Matches the reference design: boat header + individual crew cards
 * with avatar, name, Aadhar, joining date, Days / Pagar / Upad / Jama.
 */

import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppTabBar } from '../components/shared/AppTabBar'

<<<<<<< HEAD
// ── TEMP boats ─────────────────────────────────────────
const TEMP_BOATS = [
  { id: '1', name: 'Bravo',   registration: 'GJ-01' },
  { id: '2', name: 'Alpha',   registration: 'GJ-02' },
  { id: '3', name: 'Charlie', registration: 'GJ-03' },
  { id: '4', name: 'Delta',   registration: 'GJ-04' },
  { id: '5', name: 'Echo',    registration: 'GJ-05' },
]

// ── TEMP hardcoded crew — replace with API call later ─────────────────────────
const TEMP_CREW = [
  { id: '1', name: 'Suraj Tandel',   role: 'Pilot / Caption', aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', bahano: 30000, attendedDays: 18, fixedSalary: 15000, totalDaysJoined: 180, tripsCompleted: 12, pagar: 9000,  projectedSalary: 90000, upad: 150000, jama: 119000 },
  { id: '2', name: 'Raju Makwana',   role: 'Sailor',          aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', bahano: 25000, attendedDays: 20, fixedSalary: 12000, totalDaysJoined: 180, tripsCompleted: 12, pagar: 8000,  projectedSalary: 72000, upad: 100000, jama: 80000  },
  { id: '3', name: 'Bharat Gohil',   role: 'Sailor',          aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', bahano: 20000, attendedDays: 15, fixedSalary: 10000, totalDaysJoined: 180, tripsCompleted: 12, pagar: 5000,  projectedSalary: 60000, upad: 75000,  jama: 50000  },
  { id: '4', name: 'Kanji Patel',    role: 'Helper',          aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', bahano: 15000, attendedDays: 10, fixedSalary: 8000,  totalDaysJoined: 180, tripsCompleted: 12, pagar: 2666, projectedSalary: 48000, upad: 50000,  jama: 25000  },
  { id: '5', name: 'Mahesh Solanki', role: 'Engineer',        aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', bahano: 18000, attendedDays: 18, fixedSalary: 15000, totalDaysJoined: 180, tripsCompleted: 12, pagar: 9000,  projectedSalary: 90000, upad: 150000, jama: 119000 },
  { id: '6', name: 'Dinesh Parmar',  role: 'Cook',            aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', bahano: 12000, attendedDays: 20, fixedSalary: 12000, totalDaysJoined: 180, tripsCompleted: 12, pagar: 8000,  projectedSalary: 72000, upad: 100000, jama: 80000  },
  { id: '7', name: 'Pravin Baria',   role: 'Deck Hand',       aadhaar: '123456789011213', joiningDate: '03 - Jul - 2026', bahano: 10000, attendedDays: 15, fixedSalary: 10000, totalDaysJoined: 180, tripsCompleted: 12, pagar: 5000,  projectedSalary: 60000, upad: 75000,  jama: 50000  },
]

const fmt = (n?: number) => n ? `₹ ${n.toLocaleString('en-IN')}` : '₹ 0'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`

// ── Inline Calendar ───────────────────────────────────────────────────────────
function InlineCalendar({
  selectedDate,
  onSelect,
  activeTheme,
}: {
  selectedDate: Date
  onSelect: (d: Date) => void
  activeTheme: typeof lightTheme
}) {
  const DAY_LABELS = ['S','M','T','W','T','F','S']

  const [viewYear,  setViewYear]  = useState(selectedDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth())

  const today = new Date()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const isSelected = (d: number) =>
    selectedDate.getDate() === d &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear

  const isToday = (d: number) =>
    today.getDate() === d &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear

  const P  = activeTheme.colors.primary
  const BG = activeTheme.colors.background
  const SF = activeTheme.colors.surface
  const TP = activeTheme.colors.textPrimary
  const TS = activeTheme.colors.textSecondary
  const BR = activeTheme.colors.border
=======
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface CrewMember {
  id: string
  name: string
  role: string
  aadhaar: string
  joiningDate: string
  totalDays: number
  pagar: number
  upad: number
  jama: number
  bahano: number   // advance given
}

interface Boat {
  id: string
  name: string
  gujaratiName: string
  registration: string
  captain: string
  totalCrew: number
}

// ─── Mock data per boat (replace with GET /api/v1/boats/:id/crew) ─────────────
const BOATS: Boat[] = [
  { id: '1', name: 'Jai Mataji', gujaratiName: 'જય માતાજી', registration: 'GJ-11-Bk-0369', captain: 'Ramesh Bhai', totalCrew: 7 },
  { id: '2', name: 'Sea Star',   gujaratiName: 'સી સ્ટાર',  registration: 'GJ-VR-2201',    captain: 'Suresh Kaka', totalCrew: 6 },
]

const CREW_BY_BOAT: Record<string, CrewMember[]> = {
  '1': [
    { id: '1', name: 'Suraj Tandel',   role: 'Pilot / Captain', aadhaar: '1234 5678 9001 1213', joiningDate: '03 - Jul - 2026', totalDays: 180, pagar: 3690,  upad: 150000, jama: 119000, bahano: 30000 },
    { id: '2', name: 'Raju Makwana',   role: 'Sailor',          aadhaar: '1234 5678 9001 1213', joiningDate: '03 - Jul - 2026', totalDays: 180, pagar: 3690,  upad: 150000, jama: 119000, bahano: 25000 },
    { id: '3', name: 'Bharat Gohil',   role: 'Sailor',          aadhaar: '1234 5678 9001 1213', joiningDate: '03 - Jul - 2026', totalDays: 180, pagar: 3660,  upad: 150000, jama: 119000, bahano: 20000 },
    { id: '4', name: 'Kanji Patel',    role: 'Helper',          aadhaar: '1234 5678 9001 1213', joiningDate: '03 - Jul - 2026', totalDays: 180, pagar: 3690,  upad: 150000, jama: 119000, bahano: 15000 },
    { id: '5', name: 'Mahesh Solanki', role: 'Engineer',        aadhaar: '1234 5678 9001 1213', joiningDate: '03 - Jul - 2026', totalDays: 180, pagar: 3690,  upad: 150000, jama: 119000, bahano: 18000 },
    { id: '6', name: 'Dinesh Parmar',  role: 'Cook',            aadhaar: '1234 5678 9001 1213', joiningDate: '03 - Jul - 2026', totalDays: 180, pagar: 3690,  upad: 150000, jama: 119000, bahano: 12000 },
    { id: '7', name: 'Pravin Baria',   role: 'Deck Hand',       aadhaar: '1234 5678 9001 1213', joiningDate: '03 - Jul - 2026', totalDays: 180, pagar: 3690,  upad: 150000, jama: 119000, bahano: 10000 },
  ],
  '2': [
    { id: '8', name: 'Vijay Rathod',   role: 'Pilot / Captain', aadhaar: '9876 5432 1001 1213', joiningDate: '15 - Jun - 2026', totalDays: 160, pagar: 3200,  upad: 130000, jama: 100000, bahano: 28000 },
    { id: '9', name: 'Amrit Chauhan',  role: 'Sailor',          aadhaar: '9876 5432 1001 1213', joiningDate: '15 - Jun - 2026', totalDays: 160, pagar: 3200,  upad: 130000, jama: 100000, bahano: 22000 },
    { id: '10', name: 'Kiran Dabhi',   role: 'Helper',          aadhaar: '9876 5432 1001 1213', joiningDate: '15 - Jun - 2026', totalDays: 160, pagar: 3200,  upad: 130000, jama: 100000, bahano: 14000 },
  ],
}

const fmt = (n: number) => n.toLocaleString('en-IN')
>>>>>>> designV.2

// ─── Avatar placeholder ───────────────────────────────────────────────────────
function CrewAvatar({ role }: { role: string }) {
  const isCaptain = role.toLowerCase().includes('pilot') || role.toLowerCase().includes('captain')
  return (
<<<<<<< HEAD
    <View style={{ backgroundColor: BG, borderRadius: 14, borderWidth: 1, borderColor: BR, overflow: 'hidden', marginBottom: 16 }}>
      {/* Month nav header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: P, paddingHorizontal: 14, paddingVertical: 10 }}>
        <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 22 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>
          {MONTHS[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 22 }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day-of-week headers */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 6, backgroundColor: SF }}>
        {DAY_LABELS.map((d, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: TS }}>
            {d}
          </Text>
        ))}
      </View>

      {/* Date grid */}
      <View style={{ paddingHorizontal: 4, paddingBottom: 8 }}>
        {Array.from({ length: cells.length / 7 }, (_, row) => (
          <View key={row} style={{ flexDirection: 'row' }}>
            {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
              const sel = day !== null && isSelected(day)
              const tod = day !== null && isToday(day)
              return (
                <TouchableOpacity
                  key={col}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 36,
                    margin: 1,
                    borderRadius: 8,
                    backgroundColor: sel ? P : tod ? `${P}28` : 'transparent',
                  }}
                  onPress={() => day !== null && onSelect(new Date(viewYear, viewMonth, day))}
                  activeOpacity={day !== null ? 0.7 : 1}
                  disabled={day === null}
                >
                  <Text style={{
                    fontSize: 13,
                    fontWeight: sel ? '800' : tod ? '700' : '400',
                    color: sel ? '#fff' : tod ? P : day !== null ? TP : 'transparent',
                  }}>
                    {day ?? ''}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        ))}
      </View>
    </View>
  )
}

// ── Give Kharchi Modal ────────────────────────────────────────────────────────
function AddKharchiModal({
  crew,
  onClose,
  onSave,
  activeTheme,
}: {
  crew: typeof TEMP_CREW
  onClose: () => void
  onSave: (crewId: string, amount: string, reason: string, date: string) => void
  activeTheme: typeof lightTheme
}) {
  const [selectedCrew, setSelectedCrew] = useState(crew[0]?.id ?? '')
  const [amount, setAmount]             = useState('')
  const [reason, setReason]             = useState('')
  const [selectedDay, setSelectedDay]   = useState(new Date())

  const isValid = selectedCrew.length > 0 && amount.trim().length > 0 && Number(amount) > 0

  const ms = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: activeTheme.colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 44,
      maxHeight: '92%',
    },
    handle: {
      width: 40, height: 4,
      backgroundColor: 'rgba(0,188,212,0.2)',
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: activeTheme.colors.textPrimary,
      marginBottom: 18,
    },
    label: {
      fontSize: 11,
      fontWeight: '700',
      color: activeTheme.colors.textPrimary,
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    crewScrollWrap: {
      marginBottom: 16,
    },
    crewChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: activeTheme.colors.border,
      backgroundColor: activeTheme.colors.background,
      marginRight: 8,
    },
    crewChipActive: {
      backgroundColor: activeTheme.colors.primary,
      borderColor: activeTheme.colors.primary,
    },
    crewChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: activeTheme.colors.textSecondary,
    },
    crewChipTextActive: {
      color: activeTheme.colors.textInverse,
    },
    input: {
      backgroundColor: activeTheme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: activeTheme.colors.border,
      padding: 14,
      color: activeTheme.colors.textPrimary,
      fontSize: 16,
      marginBottom: 16,
    },
    btnRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    cancelBtn: {
      flex: 1,
      backgroundColor: activeTheme.colors.background,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: activeTheme.colors.border,
    },
    cancelText: {
      color: activeTheme.colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    saveBtn: {
      flex: 2,
      backgroundColor: activeTheme.colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    saveBtnDisabled: { opacity: 0.35 },
    saveText: {
      color: activeTheme.colors.textInverse,
      fontSize: 15,
      fontWeight: '800',
    },
  })

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={ms.overlay}>
        <ScrollView
          style={ms.sheet}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={ms.handle} />

          <Text style={ms.title}>Give Kharchi</Text>

          {/* ── Crew Selector ── */}
          <Text style={ms.label}>SELECT CREW</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={ms.crewScrollWrap}
          >
            {crew.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[ms.crewChip, selectedCrew === m.id && ms.crewChipActive]}
                onPress={() => setSelectedCrew(m.id)}
                activeOpacity={0.7}
              >
                <Text style={[ms.crewChipText, selectedCrew === m.id && ms.crewChipTextActive]}>
                  {m.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Amount ── */}
          <Text style={ms.label}>AMOUNT (₹)</Text>
          <TextInput
            style={ms.input}
            placeholder="Enter amount"
            placeholderTextColor={activeTheme.colors.textDisabled}
            keyboardType="number-pad"
            value={amount}
            onChangeText={setAmount}
          />

          {/* ── Reason ── */}
          <Text style={ms.label}>REASON (OPTIONAL)</Text>
          <TextInput
            style={ms.input}
            placeholder="e.g. Advance, Medicine, Food..."
            placeholderTextColor={activeTheme.colors.textDisabled}
            value={reason}
            onChangeText={setReason}
          />

          {/* ── Date — inline calendar ── */}
          <Text style={ms.label}>DATE · {formatDate(selectedDay)}</Text>
          <InlineCalendar
            selectedDate={selectedDay}
            onSelect={setSelectedDay}
            activeTheme={activeTheme}
          />

          {/* ── Buttons ── */}
          <View style={ms.btnRow}>
            <TouchableOpacity style={ms.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={ms.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[ms.saveBtn, !isValid && ms.saveBtnDisabled]}
              onPress={() => isValid && onSave(selectedCrew, amount, reason, formatDate(selectedDay))}
              activeOpacity={0.85}
              disabled={!isValid}
            >
              <Text style={ms.saveText}>
                Give {amount ? `₹ ${Number(amount).toLocaleString('en-IN')}` : '₹ 0'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

// ── Crew Row ──────────────────────────────────────────────────────────────────
function CrewAdvanceRow({
  member,
  onPress,
  styles,
}: {
  member: typeof TEMP_CREW[0]
  onPress: () => void
  styles: any
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.crewRow}>
      <View style={styles.crewRowLeft}>
        <View style={styles.crewAvatar}>
          <Text style={styles.crewAvatarEmoji}>👤</Text>
        </View>
        <View style={styles.crewInfo}>
          <Text style={styles.crewName}>{member.name}</Text>
          <Text style={styles.crewRole}>{member.role}</Text>
        </View>
      </View>
      <View style={styles.crewRowRight}>
        <Text style={styles.crewAmount}>{fmt(member.bahano)}</Text>
        <Text style={styles.crewDate}>{member.joiningDate}</Text>
      </View>
    </TouchableOpacity>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function CrewScreen() {
  const { boatId, boatName } = useLocalSearchParams<{
    boatId: string
    boatName: string
    companyId: string
  }>()

  const [searchText, setSearchText]               = useState('')
  const [selectedBoat, setSelectedBoat]           = useState(boatName || 'Bravo')
  const [addKharchiVisible, setAddKharchiVisible] = useState(false)

  const { mode } = useThemeStore()
  const activeTheme = mode === 'dark' ? darkTheme : lightTheme
  const s = React.useMemo(() => createStyles(activeTheme), [activeTheme])

  const totalKharchi = TEMP_CREW.reduce((sum, m) => sum + (m.bahano || 0), 0)

  const filteredBoats = TEMP_BOATS.filter(boat =>
    boat.name.toLowerCase().includes(searchText.toLowerCase())
  )

  const filteredCrew = TEMP_CREW.filter(member =>
    member.name.toLowerCase().includes(searchText.toLowerCase()) ||
    selectedBoat.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleAddKharchi = (crewId: string, amount: string, reason: string, date: string) => {
    // TODO: POST /api/v1/crew/:crewId/kharchi  { amount, reason, date }
    console.log('Add kharchi:', { crewId, amount, reason, date })
    setAddKharchiVisible(false)
  }

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.canGoBack() ? router.back() : null}
        >
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Khalasi</Text>
          <Text style={s.headerSub}>{selectedBoat}</Text>
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => setAddKharchiVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={s.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* ── Total Card (compact horizontal) ── */}
      <View style={s.totalCard}>
        <View style={s.totalLeft}>
          <Text style={s.totalLabel}>TOTAL KHARCHI</Text>
          <Text style={s.totalValue}>{fmt(totalKharchi)}</Text>
        </View>
        <View style={s.totalRight}>
          <Text style={s.totalCrewNum}>{TEMP_CREW.length}</Text>
          <Text style={s.totalCrewLabel}>crew</Text>
        </View>
      </View>

      {/* ── Combined Search (boat + crew) ── */}
      <View style={s.searchContainer}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search boat or crew name..."
          placeholderTextColor={activeTheme.colors.textDisabled}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* ── Boat Tabs ── */}
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

      {/* ── Crew List ── */}
      <ScrollView
        contentContainerStyle={s.crewList}
        showsVerticalScrollIndicator={false}
      >
        {filteredCrew.map(member => (
          <CrewAdvanceRow
            key={member.id}
            member={member}
            styles={s}
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
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Give Kharchi Modal ── */}
      {addKharchiVisible && (
        <AddKharchiModal
          crew={filteredCrew.length > 0 ? filteredCrew : TEMP_CREW}
          activeTheme={activeTheme}
          onClose={() => setAddKharchiVisible(false)}
          onSave={handleAddKharchi}
        />
      )}
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const createStyles = (theme: typeof lightTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
=======
    <View style={[av.wrap, { backgroundColor: isCaptain ? TEAL + '25' : ELEV }]}>
      <Ionicons
        name={isCaptain ? 'person-circle' : 'person'}
        size={isCaptain ? 38 : 32}
        color={isCaptain ? TEAL : TS}
      />
      <Text style={[av.roleLabel, { color: isCaptain ? TEAL : TS }]}>
        {role.split('/')[0].trim()}
      </Text>
    </View>
  )
}

const av = StyleSheet.create({
  wrap:      { width: 72, alignItems: 'center', paddingTop: 4, gap: 4 },
  roleLabel: { fontSize: 9, fontWeight: '600', textAlign: 'center', lineHeight: 12 },
})

// ─── Crew Card ────────────────────────────────────────────────────────────────
function CrewCard({ member }: { member: CrewMember }) {
  return (
    <View style={cc.card}>
      {/* Left: avatar */}
      <CrewAvatar role={member.role} />

      {/* Right: details */}
      <View style={cc.details}>
        {/* Name + Aadhar + Joining */}
        <View style={cc.topSection}>
          <View style={cc.nameRow}>
            <Text style={cc.name}>{member.name}</Text>
          </View>
          <Text style={cc.aadhaar}>Aadhaar card - {member.aadhaar}</Text>
          <Text style={cc.joining}>Joining Date - {member.joiningDate}</Text>
        </View>

        {/* Financial row: Days | Pagar | Upad | Jama */}
        <View style={cc.finRow}>
          <View style={cc.finItem}>
            <Text style={cc.finLabel}>Days -</Text>
            <Text style={cc.finVal}>{member.totalDays}</Text>
          </View>
          <View style={cc.finItem}>
            <Text style={cc.finLabel}>pagar -</Text>
            <Text style={cc.finVal}>₹ {fmt(member.pagar)}</Text>
          </View>
          <View style={cc.finItem}>
            <Text style={cc.finLabel}>Upad -</Text>
            <Text style={[cc.finVal, { color: GREEN }]}>₹ {fmt(member.upad)}</Text>
          </View>
          <View style={cc.finItem}>
            <Text style={cc.finLabel}>Jama -</Text>
            <Text style={[cc.finVal, { color: AMBER }]}>₹ {fmt(member.jama)}</Text>
          </View>
        </View>

        {/* Bottom name label like reference image */}
        <Text style={cc.bottomName}>{member.name}</Text>
      </View>
    </View>
  )
}

const cc = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: SURF,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BOR,
    padding: 12,
    gap: 10,
  },
  details:    { flex: 1, gap: 6 },
  topSection: { gap: 2 },
  nameRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name:       { fontSize: 14, fontWeight: '800', color: TP },
  aadhaar:    { fontSize: 11, color: TS },
  joining:    { fontSize: 11, color: TS },
  finRow:     { gap: 2, marginTop: 2 },
  finItem:    { flexDirection: 'row', gap: 4, alignItems: 'center' },
  finLabel:   { fontSize: 11, color: TM, width: 52 },
  finVal:     { fontSize: 11, fontWeight: '700', color: TP },
  bottomName: { fontSize: 10, color: TM, marginTop: 2, fontStyle: 'italic' },
})

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function CrewScreen() {
  const params = useLocalSearchParams<{ boatId?: string; boatName?: string }>()

  // If opened from boat card — default to that boat, else first boat
  const defaultBoatId = params.boatId ?? BOATS[0].id
  const [selectedBoatId, setSelectedBoatId] = useState(defaultBoatId)

  const boat    = BOATS.find(b => b.id === selectedBoatId) ?? BOATS[0]
  const crew    = CREW_BY_BOAT[selectedBoatId] ?? []

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe} edges={['top']}>

        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.canGoBack() ? router.back() : null}>
            <Ionicons name="arrow-back" size={20} color={TP} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Crew</Text>
            <Text style={s.headerSub}>{boat.name} · {crew.length} members</Text>
          </View>
          <TouchableOpacity style={s.addBtn}>
            <Ionicons name="person-add-outline" size={18} color={TEAL} />
            <Text style={s.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* ── Boat selector tabs (if multiple boats) ── */}
        {BOATS.length > 1 && (
          <View style={s.boatTabSection}>
            <View style={s.boatTabWrap}>
              {BOATS.map(b => (
                <TouchableOpacity
                  key={b.id}
                  style={[s.boatTab, selectedBoatId === b.id && s.boatTabActive]}
                  onPress={() => setSelectedBoatId(b.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="boat-outline" size={13} color={selectedBoatId === b.id ? TEAL : TS} />
                  <Text style={[s.boatTabText, selectedBoatId === b.id && s.boatTabTextActive]}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Boat info header card ── */}
        <View style={s.boatCard}>
          <View style={s.boatCardLeft}>
            <Text style={s.boatCardName}>{boat.name}</Text>
            <Text style={s.boatCardGuj}>{boat.gujaratiName}</Text>
            <View style={s.boatCardMeta}>
              <Ionicons name="person-circle-outline" size={13} color={TS} />
              <Text style={s.boatCardMetaText}>{boat.captain}</Text>
            </View>
            <Text style={s.boatCardReg}>{boat.registration}</Text>
          </View>
          <View style={s.boatCardRight}>
            <Text style={s.totalCrewNum}>{boat.totalCrew}</Text>
            <Text style={s.totalCrewLabel}>total crew</Text>
          </View>
        </View>

        {/* ── Crew list ── */}
        <ScrollView
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        >
          {crew.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="people-outline" size={48} color={TM} />
              <Text style={s.emptyTitle}>No crew added yet</Text>
              <Text style={s.emptySub}>Tap Add to register crew members</Text>
            </View>
          ) : (
            crew.map(member => <CrewCard key={member.id} member={member} />)
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        <AppTabBar activeTab="crew" />
      </SafeAreaView>
    </>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
>>>>>>> designV.2

  header: {
<<<<<<< HEAD
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: {
    color: theme.colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
  },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textInverse,
  },
  headerSub: {
    fontSize: 12,
    color: theme.colors.textInverse,
    marginTop: 1,
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

  // Total Card — compact horizontal row
  totalCard: {
    backgroundColor: theme.colors.primaryDark,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 6,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLeft: { gap: 1 },
  totalLabel: {
    fontSize: 10,
    color: theme.colors.textInverse,
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textInverse,
  },
  totalRight: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  totalCrewNum: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textInverse,
  },
  totalCrewLabel: {
    fontSize: 10,
    color: theme.colors.textInverse,
    opacity: 0.8,
    fontWeight: '600',
  },

  // Combined Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
    color: theme.colors.primary,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },

  // Boat Tabs
  boatSelector: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  boatScroll: { flexGrow: 0 },
  boatOption: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 72,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  boatOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  boatIcon: { fontSize: 20, marginBottom: 2 },
  boatName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  boatNameActive: { color: theme.colors.textInverse },
  boatReg: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },

  // Crew List
  crewList: {
    paddingHorizontal: 12,
    paddingBottom: 8,
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
    gap: 10,
  },
  crewAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center', justifyContent: 'center',
  },
  crewAvatarEmoji: { fontSize: 18 },
  crewInfo: { flex: 1 },
  crewName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  crewRole: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  crewRowRight: { alignItems: 'flex-end', gap: 3 },
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
=======
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    gap: 12, borderBottomWidth: 1, borderBottomColor: BOR,
  },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: ELEV, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: TP },
  headerSub:    { fontSize: 12, color: TS, marginTop: 1 },
  addBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText:   { fontSize: 13, color: TEAL, fontWeight: '700' },

  // Boat selector tabs
  boatTabSection:  { paddingHorizontal: 16, paddingTop: 8 },
  boatTabWrap:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  boatTab:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: ELEV, borderWidth: 1, borderColor: BOR },
  boatTabActive:  { backgroundColor: TEAL + '20', borderColor: TEAL },
  boatTabText:    { fontSize: 12, fontWeight: '600', color: TS },
  boatTabTextActive: { color: TEAL, fontWeight: '700' },

  // Boat info card
  boatCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: SURF, marginHorizontal: 16, marginVertical: 10,
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: BOR,
    borderLeftWidth: 4, borderLeftColor: TEAL,
  },
  boatCardLeft:    { gap: 3 },
  boatCardName:    { fontSize: 16, fontWeight: '800', color: TP },
  boatCardGuj:     { fontSize: 13, fontWeight: '600', color: TP, opacity: 0.8 },
  boatCardMeta:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  boatCardMetaText:{ fontSize: 12, color: TS },
  boatCardReg:     { fontSize: 11, color: TEAL, fontWeight: '700', fontFamily: 'monospace' },
  boatCardRight:   { alignItems: 'center', gap: 2 },
  totalCrewNum:    { fontSize: 28, fontWeight: '800', color: TP },
  totalCrewLabel:  { fontSize: 11, color: TS },

  list:       { paddingHorizontal: 16, gap: 10, paddingTop: 4 },
  empty:      { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: TS },
  emptySub:   { fontSize: 12, color: TM },
})
>>>>>>> designV.2
