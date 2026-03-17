/**
 * components/shared/BoatLedgerSheet.tsx
 *
 * Bottom sheet that slides up when user taps "Details" on any boat card.
 * Replaces boat-detail.tsx entirely.
 *
 * Usage:
 *   <BoatLedgerSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} boat={selectedBoat} />
 */

import { router } from 'expo-router'
import React from 'react'
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../../constants/theme'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BoatSheetData {
  id: string
  name: string
  nameGujarati?: string
  registrationNumber?: string
  status: 'active' | 'docked' | 'maintenance'
  captain?: string
  crewCount: number
  totalCatch: number
  totalExpense: number
  lastTripDate?: string
}

interface Props {
  visible: boolean
  onClose: () => void
  boat: BoatSheetData | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('en-IN')

const STATUS_CONFIG = {
  active:      { label: 'At Sea',      color: '#059669', bg: '#d1fae5', emoji: '🌊' },
  docked:      { label: 'Docked',      color: '#0891b2', bg: '#e0f2fe', emoji: '⚓' },
  maintenance: { label: 'In Repair',   color: '#d97706', bg: '#fef3c7', emoji: '🔧' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BoatLedgerSheet({ visible, onClose, boat }: Props) {
  if (!boat) return null

  const status = STATUS_CONFIG[boat.status] ?? STATUS_CONFIG.docked

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>

        {/* ── Handle ── */}
        <View style={s.handle} />

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.headerName}>{boat.name}</Text>
            {boat.nameGujarati ? (
              <Text style={s.headerGuj}>{boat.nameGujarati}</Text>
            ) : null}
          </View>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.7}>
            <Text style={s.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
        >

          {/* ── Boat Info Card ── */}
          <View style={s.infoCard}>
            <View style={s.infoRow}>
              <View style={s.boatIconWrap}>
                <Text style={s.boatEmoji}>⛵</Text>
              </View>
              <View style={s.infoMid}>
                {boat.registrationNumber ? (
                  <Text style={s.infoReg}>{boat.registrationNumber}</Text>
                ) : null}
                {boat.captain ? (
                  <Text style={s.infoCaptain}>👨‍✈️  {boat.captain}</Text>
                ) : null}
                <Text style={s.infoCrew}>👥  {boat.crewCount} crew members</Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: status.bg }]}>
                <Text style={s.statusEmoji}>{status.emoji}</Text>
                <Text style={[s.statusTxt, { color: status.color }]}>{status.label}</Text>
              </View>
            </View>
          </View>

          {/* ── Season Stats ── */}
          <Text style={s.sectionTitle}>SEASON 2025–26</Text>
          <View style={s.statsCard}>
            <View style={s.statItem}>
              <Text style={s.statVal}>{fmt(boat.totalCatch)}</Text>
              <Text style={s.statUnit}>kg</Text>
              <Text style={s.statLbl}>Total Catch</Text>
            </View>
            <View style={s.statDiv} />
            <View style={s.statItem}>
              <Text style={[s.statVal, { color: '#ef4444' }]}>₹{fmt(boat.totalExpense)}</Text>
              <Text style={s.statUnit}> </Text>
              <Text style={s.statLbl}>Expenses</Text>
            </View>
            <View style={s.statDiv} />
            <View style={s.statItem}>
              <Text style={s.statVal}>{boat.crewCount}</Text>
              <Text style={s.statUnit}> </Text>
              <Text style={s.statLbl}>Crew</Text>
            </View>
          </View>

          {/* ── Last Trip ── */}
          {boat.lastTripDate ? (
            <>
              <Text style={s.sectionTitle}>LAST ACTIVITY</Text>
              <View style={s.activityCard}>
                <Text style={s.activityEmoji}>📅</Text>
                <View>
                  <Text style={s.activityLabel}>Last Trip</Text>
                  <Text style={s.activityDate}>{boat.lastTripDate}</Text>
                </View>
              </View>
            </>
          ) : null}

          {/* ── Quick Actions ── */}
          <Text style={s.sectionTitle}>QUICK ACTIONS</Text>
          <View style={s.actionsGrid}>

            <TouchableOpacity
              style={s.actionBtn}
              activeOpacity={0.75}
              onPress={() => {
                onClose()
                router.push({
                  pathname: '/tali-fish-select',
                  params: { boatId: boat.id, boatName: boat.name },
                } as any)
              }}
            >
              <Text style={s.actionEmoji}>⚓</Text>
              <Text style={s.actionTxt}>Tali</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.actionBtn}
              activeOpacity={0.75}
              onPress={() => {
                onClose()
                router.push({
                  pathname: '/kharchi',
                  params: { boatId: boat.id, boatName: boat.name },
                } as any)
              }}
            >
              <Text style={s.actionEmoji}>💸</Text>
              <Text style={s.actionTxt}>Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.actionBtn}
              activeOpacity={0.75}
              onPress={() => {
                onClose()
                router.push({
                  pathname: '/crew',
                  params: { boatId: boat.id, boatName: boat.name },
                } as any)
              }}
            >
              <Text style={s.actionEmoji}>👥</Text>
              <Text style={s.actionTxt}>Crew</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.actionBtn}
              activeOpacity={0.75}
              onPress={() => {
                onClose()
                router.push('/ledger' as any)
              }}
            >
              <Text style={s.actionEmoji}>📒</Text>
              <Text style={s.actionTxt}>Ledger</Text>
            </TouchableOpacity>

          </View>

          {/* ── Close button at bottom ── */}
          <TouchableOpacity style={s.closeFullBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={s.closeFullTxt}>Close</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>

      </SafeAreaView>
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: theme.colors.background },

  handle:        { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, alignSelf: 'center', marginTop: 10, marginBottom: 2 },

  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  headerLeft:    { flex: 1 },
  headerName:    { fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary },
  headerGuj:     { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
  closeBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  closeTxt:      { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '700' },

  scroll:        { padding: 16, gap: 4 },

  sectionTitle:  { fontSize: 11, fontWeight: '700', color: theme.colors.textSecondary, letterSpacing: 1.2, marginTop: 16, marginBottom: 8 },

  // Boat info card
  infoCard:      { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.border },
  infoRow:       { flexDirection: 'row', alignItems: 'center', gap: 14 },
  boatIconWrap:  { width: 52, height: 52, borderRadius: 14, backgroundColor: theme.colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  boatEmoji:     { fontSize: 28 },
  infoMid:       { flex: 1, gap: 4 },
  infoReg:       { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, fontFamily: 'monospace' },
  infoCaptain:   { fontSize: 13, color: theme.colors.textSecondary },
  infoCrew:      { fontSize: 13, color: theme.colors.textSecondary },
  statusBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusEmoji:   { fontSize: 12 },
  statusTxt:     { fontSize: 12, fontWeight: '700' },

  // Season stats
  statsCard:     { backgroundColor: theme.colors.surface, borderRadius: 16, paddingVertical: 18, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center' },
  statItem:      { flex: 1, alignItems: 'center', gap: 2 },
  statVal:       { fontSize: 17, fontWeight: '800', color: theme.colors.textPrimary },
  statUnit:      { fontSize: 11, color: theme.colors.textSecondary, marginTop: -2 },
  statLbl:       { fontSize: 11, color: theme.colors.textSecondary },
  statDiv:       { width: 1, height: 40, backgroundColor: theme.colors.border },

  // Activity
  activityCard:  { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityEmoji: { fontSize: 24 },
  activityLabel: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' },
  activityDate:  { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 2 },

  // Actions grid
  actionsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn:     { width: '47%', backgroundColor: theme.colors.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', paddingVertical: 18, gap: 8 },
  actionEmoji:   { fontSize: 26 },
  actionTxt:     { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary },

  // Close button
  closeFullBtn:  { marginTop: 12, backgroundColor: theme.colors.surface, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  closeFullTxt:  { fontSize: 15, fontWeight: '700', color: theme.colors.textSecondary },
})