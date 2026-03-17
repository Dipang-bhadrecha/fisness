/**
 * app/crew.tsx — Crew Roster Screen
 * - Tap card  → /crew-detail  (full detail + kharchi history)
 * - Tap ✏️    → /add-crew     (edit mode, pre-filled)
 * - Tap Add   → /add-crew     (new member)
 */

import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppTabBar } from '../components/shared/AppTabBar'

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
  phone: string
  joiningDate: string
  totalDays: number
  pagar: number   // monthly
  upad: number
  jama: number
  bahano: number
}

interface Boat {
  id: string
  name: string
  gujaratiName: string
  registration: string
  captain: string
  totalCrew: number
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const BOATS: Boat[] = [
  { id: '1', name: 'Jai Mataji', gujaratiName: 'જય માતાજી', registration: 'GJ-11-Bk-0369', captain: 'Ramesh Bhai', totalCrew: 7 },
  { id: '2', name: 'Sea Star',   gujaratiName: 'સી સ્ટાર',  registration: 'GJ-VR-2201',    captain: 'Suresh Kaka', totalCrew: 6 },
]

const CREW_BY_BOAT: Record<string, CrewMember[]> = {
  '1': [
    { id: '1', name: 'Suraj Tandel',   role: 'Pilot / Captain', aadhaar: '1234 5678 9001 1213', phone: '98765 43210', joiningDate: '03 - Jul - 2026', totalDays: 180, pagar: 15000, upad: 150000, jama: 119000, bahano: 30000 },
    { id: '2', name: 'Raju Makwana',   role: 'Khalasi',         aadhaar: '1234 5678 9001 1213', phone: '98765 43211', joiningDate: '03 - Jul - 2026', totalDays: 180, pagar: 10000, upad: 150000, jama: 119000, bahano: 25000 },
    { id: '3', name: 'Bharat Gohil',   role: 'Khalasi',         aadhaar: '1234 5678 9001 1213', phone: '98765 43212', joiningDate: '03 - Jul - 2026', totalDays: 180, pagar: 10000, upad: 150000, jama: 119000, bahano: 20000 },
    { id: '4', name: 'Kanji Patel',    role: 'Bhandari',        aadhaar: '1234 5678 9001 1213', phone: '98765 43213', joiningDate: '03 - Jul - 2026', totalDays: 180, pagar: 9000,  upad: 150000, jama: 119000, bahano: 15000 },
    { id: '5', name: 'Mahesh Solanki', role: 'Khalasi',         aadhaar: '1234 5678 9001 1213', phone: '98765 43214', joiningDate: '03 - Jul - 2026', totalDays: 180, pagar: 10000, upad: 150000, jama: 119000, bahano: 18000 },
    { id: '6', name: 'Dinesh Parmar',  role: 'Bhandari',        aadhaar: '1234 5678 9001 1213', phone: '98765 43215', joiningDate: '03 - Jul - 2026', totalDays: 180, pagar: 9000,  upad: 150000, jama: 119000, bahano: 12000 },
    { id: '7', name: 'Pravin Baria',   role: 'Khalasi',         aadhaar: '1234 5678 9001 1213', phone: '98765 43216', joiningDate: '03 - Jul - 2026', totalDays: 180, pagar: 10000, upad: 150000, jama: 119000, bahano: 10000 },
  ],
  '2': [
    { id: '8',  name: 'Vijay Rathod',  role: 'Pilot / Captain', aadhaar: '9876 5432 1001 1213', phone: '98765 43220', joiningDate: '15 - Jun - 2026', totalDays: 160, pagar: 15000, upad: 130000, jama: 100000, bahano: 28000 },
    { id: '9',  name: 'Amrit Chauhan', role: 'Khalasi',         aadhaar: '9876 5432 1001 1213', phone: '98765 43221', joiningDate: '15 - Jun - 2026', totalDays: 160, pagar: 10000, upad: 130000, jama: 100000, bahano: 22000 },
    { id: '10', name: 'Kiran Dabhi',   role: 'Bhandari',        aadhaar: '9876 5432 1001 1213', phone: '98765 43222', joiningDate: '15 - Jun - 2026', totalDays: 160, pagar: 9000,  upad: 130000, jama: 100000, bahano: 14000 },
  ],
}

const fmt = (n: number) => n.toLocaleString('en-IN')

// ─── Avatar ───────────────────────────────────────────────────────────────────
function CrewAvatar({ role }: { role: string }) {
  const isPilot = role.toLowerCase().includes('pilot') || role.toLowerCase().includes('captain')
  return (
    <View style={[av.wrap, { backgroundColor: isPilot ? TEAL + '25' : ELEV }]}>
      <Ionicons
        name={isPilot ? 'person-circle' : 'person'}
        size={isPilot ? 38 : 32}
        color={isPilot ? TEAL : TS}
      />
      <Text style={[av.roleLabel, { color: isPilot ? TEAL : TS }]}>
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
function CrewCard({
  member,
  boatId,
  boatName,
}: {
  member: CrewMember
  boatId: string
  boatName: string
}) {
  // Tap card → crew-detail
  const handlePress = () => {
    router.push({
      pathname: '/crew-detail',
      params: {
        memberId:   member.id,
        memberName: member.name,
        memberRole: member.role,
        boatId,
        boatName,
      },
    })
  }

  // Tap pencil → add-crew in edit mode
  const handleEdit = (e: any) => {
    e.stopPropagation()
    router.push({
      pathname: '/add-crew',
      params: {
        boatId,
        boatName,
        memberId:           member.id,
        prefillName:        member.name,
        prefillRole:        member.role,
        prefillAadhaar:     member.aadhaar,
        prefillPhone:       member.phone,
        prefillJoiningDate: member.joiningDate,
        prefillPagar:       String(member.pagar),
      },
    })
  }

  return (
    <TouchableOpacity style={cc.card} onPress={handlePress} activeOpacity={0.75}>
      {/* Left: avatar */}
      <CrewAvatar role={member.role} />

      {/* Right: details */}
      <View style={cc.details}>
        {/* Name + edit pencil */}
        <View style={cc.nameRow}>
          <Text style={cc.name}>{member.name}</Text>
          <TouchableOpacity
            style={cc.editBtn}
            onPress={handleEdit}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pencil-outline" size={13} color={TEAL} />
          </TouchableOpacity>
        </View>

        <Text style={cc.aadhaar}>Aadhaar card - {member.aadhaar}</Text>
        <Text style={cc.joining}>Joining Date - {member.joiningDate}</Text>

        {/* Financial row */}
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

        <Text style={cc.bottomName}>{member.name}</Text>
      </View>
    </TouchableOpacity>
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
  details:    { flex: 1, gap: 4 },
  nameRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name:       { fontSize: 14, fontWeight: '800', color: TP, flex: 1 },
  editBtn:    { width: 26, height: 26, borderRadius: 7, backgroundColor: TEAL + '20', alignItems: 'center', justifyContent: 'center' },
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

  const defaultBoatId = params.boatId ?? BOATS[0].id
  const [selectedBoatId, setSelectedBoatId] = useState(defaultBoatId)

  const boat = BOATS.find(b => b.id === selectedBoatId) ?? BOATS[0]
  const crew = CREW_BY_BOAT[selectedBoatId] ?? []

  const handleAddCrew = () => {
    router.push({
      pathname: '/add-crew',
      params: { boatId: boat.id, boatName: boat.name },
    })
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe} edges={['top']}>

        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => router.canGoBack() ? router.back() : null}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={TP} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Crew</Text>
            <Text style={s.headerSub}>{boat.name} · {crew.length} members</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={handleAddCrew} activeOpacity={0.75}>
            <Ionicons name="person-add-outline" size={18} color={TEAL} />
            <Text style={s.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* ── Boat selector tabs ── */}
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

        {/* ── Boat info card ── */}
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
        <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
          {crew.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="people-outline" size={48} color={TM} />
              <Text style={s.emptyTitle}>No crew added yet</Text>
              <Text style={s.emptySub}>Tap Add to register crew members</Text>
            </View>
          ) : (
            crew.map(member => (
              <CrewCard
                key={member.id}
                member={member}
                boatId={boat.id}
                boatName={boat.name}
              />
            ))
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

  header: {
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

  boatTabSection: { paddingHorizontal: 16, paddingTop: 8 },
  boatTabWrap:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  boatTab:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: ELEV, borderWidth: 1, borderColor: BOR },
  boatTabActive:  { backgroundColor: TEAL + '20', borderColor: TEAL },
  boatTabText:    { fontSize: 12, fontWeight: '600', color: TS },
  boatTabTextActive: { color: TEAL, fontWeight: '700' },

  boatCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: SURF, marginHorizontal: 16, marginVertical: 10,
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: BOR,
    borderLeftWidth: 4, borderLeftColor: TEAL,
  },
  boatCardLeft:     { gap: 3 },
  boatCardName:     { fontSize: 16, fontWeight: '800', color: TP },
  boatCardGuj:      { fontSize: 13, fontWeight: '600', color: TP, opacity: 0.8 },
  boatCardMeta:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  boatCardMetaText: { fontSize: 12, color: TS },
  boatCardReg:      { fontSize: 11, color: TEAL, fontWeight: '700', fontFamily: 'monospace' },
  boatCardRight:    { alignItems: 'center', gap: 2 },
  totalCrewNum:     { fontSize: 28, fontWeight: '800', color: TP },
  totalCrewLabel:   { fontSize: 11, color: TS },

  list:       { paddingHorizontal: 16, gap: 10, paddingTop: 4 },
  empty:      { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: TS },
  emptySub:   { fontSize: 12, color: TM },
})