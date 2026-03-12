/**
 * app/(setup)/role-select.tsx
 *
 * THE ONLY SETUP SCREEN — replaces role.tsx + owner-type.tsx + company-setup.tsx
 *
 * Checkbox multi-select. User ticks 1 or more roles.
 * Continue button routes based on what they selected.
 *
 * ROUTING:
 *   boat_owner only              → quick-setup?role=boat_owner
 *   company_owner only           → quick-setup?role=company_owner
 *   boat_owner + company_owner   → quick-setup?role=both_owner
 *   manager_company only         → invite-code?type=company
 *   manager_boat only            → invite-code?type=boat
 *   both managers                → invite-code?type=both
 *   owner + manager combo        → quick-setup?role=...&managerType=...
 */

import { router } from 'expo-router'
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
import { SelectedRole, useEntityStore } from '../../store/entityStore'

type RoleId = 'boat_owner' | 'company_owner' | 'manager_company' | 'manager_boat'

interface RoleOption {
  id: RoleId
  emoji: string
  title: string
  subtitle: string
  tags: string[]
  accent: string
  group: 'owner' | 'manager'
}

const ROLES: RoleOption[] = [
  {
    id: 'boat_owner',
    emoji: '🚢',
    title: 'Boat Owner',
    subtitle: 'I own boats personally. Track trips, crew, expenses and catch for my fleet.',
    tags: ['Trip tracking', 'Crew kharchi', 'Fleet P&L'],
    accent: '#1B7FBF',
    group: 'owner',
  },
  {
    id: 'company_owner',
    emoji: '🏢',
    title: 'Company Owner (Dango)',
    subtitle: 'I run a fishing company. Boats come to me for tali, bills and ledger.',
    tags: ['Tali sessions', 'Bill generation', 'Season ledger'],
    accent: '#059669',
    group: 'owner',
  },
  {
    id: 'manager_company',
    emoji: '👔',
    title: 'Manager — Company',
    subtitle: 'I work at a fishing company on behalf of the owner.',
    tags: ['Tali', 'Expenses', 'Bills (if permitted)'],
    accent: '#0891b2',
    group: 'manager',
  },
  {
    id: 'manager_boat',
    emoji: '⚓',
    title: 'Manager — Boat',
    subtitle: 'I manage boats on behalf of a boat owner.',
    tags: ['Boat expenses', 'Crew', 'Tali (if permitted)'],
    accent: '#d97706',
    group: 'manager',
  },
]

function getRoute(selected: Set<RoleId>): string {
  const hasBoat    = selected.has('boat_owner')
  const hasCompany = selected.has('company_owner')
  const hasMgrCo   = selected.has('manager_company')
  const hasMgrBoat = selected.has('manager_boat')
  const hasOwner   = hasBoat || hasCompany
  const hasMgr     = hasMgrCo || hasMgrBoat

  let ownerRole = ''
  if (hasBoat && hasCompany) ownerRole = 'both_owner'
  else if (hasBoat)          ownerRole = 'boat_owner'
  else if (hasCompany)       ownerRole = 'company_owner'

  let mgrType = ''
  if (hasMgrCo && hasMgrBoat) mgrType = 'both'
  else if (hasMgrCo)           mgrType = 'company'
  else if (hasMgrBoat)         mgrType = 'boat'

  if (hasOwner && hasMgr) return `/(setup)/quick-setup?role=${ownerRole}&managerType=${mgrType}`
  if (hasOwner)            return `/(setup)/quick-setup?role=${ownerRole}`
  if (hasMgr)              return `/(setup)/invite-code?type=${mgrType}`
  return ''
}

function getContinueLabel(selected: Set<RoleId>): string {
  if (selected.size === 0) return 'Select at least one role'
  const names = [...selected].map(id => {
    const r = ROLES.find(x => x.id === id)!
    return r.id === 'manager_company' ? 'Mgr (Co)' :
           r.id === 'manager_boat'    ? 'Mgr (Boat)' :
           r.title.split(' ')[0]
  })
  return `Continue as ${names.join(' + ')} →`
}

export default function RoleSelectScreen() {
  const [selected, setSelected] = useState<Set<RoleId>>(new Set())
  const { setSelectedRoles } = useEntityStore()

  const toggle = (id: RoleId) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const ownerRoles   = ROLES.filter(r => r.group === 'owner')
  const managerRoles = ROLES.filter(r => r.group === 'manager')
  const showMgrNote  = selected.has('manager_company') || selected.has('manager_boat')

  const handleContinue = () => {
    if (selected.size === 0) return
    // Save selected roles to store BEFORE navigating
    setSelectedRoles([...selected] as SelectedRole[])
    const route = getRoute(selected)
    if (route) router.push(route as any)
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#080F1A" />
      <View style={s.bg}>
        <View style={s.blob1} />
        <View style={s.blob2} />

        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={s.header}>
              <Text style={s.fish}>🐟</Text>
              <Text style={s.title}>What describes{'\n'}you?</Text>
              <Text style={s.subtitle}>Tick all that apply. You can have more than one role.</Text>
            </View>

            {/* Owner group */}
            <Text style={s.groupLabel}>I OWN SOMETHING</Text>
            <View style={s.group}>
              {ownerRoles.map((role, i) => (
                <RoleRow
                  key={role.id}
                  role={role}
                  checked={selected.has(role.id)}
                  onToggle={() => toggle(role.id)}
                  divider={i < ownerRoles.length - 1}
                />
              ))}
            </View>

            {/* Manager group */}
            <Text style={[s.groupLabel, { marginTop: 20 }]}>I WORK FOR SOMEONE</Text>
            <View style={s.group}>
              {managerRoles.map((role, i) => (
                <RoleRow
                  key={role.id}
                  role={role}
                  checked={selected.has(role.id)}
                  onToggle={() => toggle(role.id)}
                  divider={i < managerRoles.length - 1}
                />
              ))}
            </View>

            {/* Manager note */}
            {showMgrNote && (
              <View style={s.note}>
                <Text style={s.noteEmoji}>💡</Text>
                <Text style={s.noteText}>
                  Manager roles need an invite code from your owner. You'll enter it on the next screen.
                </Text>
              </View>
            )}

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Sticky bottom */}
          <View style={s.bottom}>
            {/* Selection chips */}
            {selected.size > 0 && (
              <View style={s.chips}>
                {[...selected].map(id => {
                  const r = ROLES.find(x => x.id === id)!
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[s.chip, { backgroundColor: r.accent + '20', borderColor: r.accent + '40' }]}
                      onPress={() => toggle(id)}
                    >
                      <Text style={s.chipEmoji}>{r.emoji}</Text>
                      <Text style={[s.chipText, { color: r.accent }]}>
                        {r.id === 'manager_company' ? 'Mgr (Co)' :
                         r.id === 'manager_boat' ? 'Mgr (Boat)' :
                         r.title.split(' ')[0]}
                      </Text>
                      <Text style={[s.chipX, { color: r.accent }]}>✕</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}

            <TouchableOpacity
              style={[s.btn, selected.size === 0 && s.btnOff]}
              onPress={handleContinue}
              disabled={selected.size === 0}
              activeOpacity={0.85}
            >
              <Text style={[s.btnText, selected.size === 0 && s.btnTextOff]}>
                {getContinueLabel(selected)}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </>
  )
}

// ─── Role Row ─────────────────────────────────────────────────────────────────

function RoleRow({
  role, checked, onToggle, divider,
}: {
  role: RoleOption
  checked: boolean
  onToggle: () => void
  divider: boolean
}) {
  return (
    <TouchableOpacity
      style={[s.row, divider && s.rowDivider, checked && { backgroundColor: role.accent + '0C' }]}
      onPress={onToggle}
      activeOpacity={0.75}
    >
      <View style={[s.icon, { backgroundColor: checked ? role.accent + '22' : 'rgba(255,255,255,0.06)' }]}>
        <Text style={{ fontSize: 22 }}>{role.emoji}</Text>
      </View>

      <View style={s.text}>
        <Text style={[s.rowTitle, checked && { color: role.accent }]}>{role.title}</Text>
        <Text style={s.rowSub} numberOfLines={2}>{role.subtitle}</Text>
        <View style={s.tags}>
          {role.tags.map(t => (
            <View key={t} style={[
              s.tag,
              checked
                ? { backgroundColor: role.accent + '18', borderColor: role.accent + '30' }
                : { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'transparent' },
            ]}>
              <Text style={[s.tagText, checked && { color: role.accent }]}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Checkbox */}
      <View style={[
        s.cb,
        checked
          ? { backgroundColor: role.accent, borderColor: role.accent }
          : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.18)' },
      ]}>
        {checked && <Text style={s.tick}>✓</Text>}
      </View>
    </TouchableOpacity>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  bg:    { flex: 1, backgroundColor: '#080F1A' },
  blob1: { position: 'absolute', top: -80,  right: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(0,194,203,0.06)' },
  blob2: { position: 'absolute', bottom: 60, left: -80, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(124,58,237,0.05)' },
  safe:  { flex: 1 },
  scroll: { paddingHorizontal: 18, paddingTop: 28, gap: 12 },

  header: { gap: 8, marginBottom: 6 },
  fish:   { fontSize: 34 },
  title:  { fontSize: 30, fontWeight: '800', color: '#F0F4F8', letterSpacing: -0.5, lineHeight: 36 },
  subtitle: { fontSize: 14, color: '#8BA3BC', lineHeight: 20 },

  groupLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: '#3D5A73' },
  group: {
    backgroundColor: '#0D1B2E',
    borderRadius: 18, borderWidth: 1,
    borderColor: 'rgba(0,194,203,0.1)', overflow: 'hidden',
  },

  row:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  icon:     { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  text:     { flex: 1, gap: 3 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: '#F0F4F8' },
  rowSub:   { fontSize: 12, color: '#8BA3BC', lineHeight: 17 },
  tags:     { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5 },
  tag:      { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  tagText:  { fontSize: 10, fontWeight: '600', color: '#3D5A73' },

  cb:   { width: 24, height: 24, borderRadius: 7, borderWidth: 2, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  tick: { color: '#fff', fontSize: 13, fontWeight: '800' },

  note:      { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(8,145,178,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(8,145,178,0.25)', padding: 12 },
  noteEmoji: { fontSize: 16 },
  noteText:  { flex: 1, fontSize: 12, color: '#7BC8D8', lineHeight: 18 },

  bottom:  { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(8,15,26,0.97)', borderTopWidth: 1, borderTopColor: 'rgba(0,194,203,0.1)', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 32, gap: 10 },
  chips:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  chipEmoji: { fontSize: 13 },
  chipText:  { fontSize: 12, fontWeight: '700' },
  chipX:     { fontSize: 10, fontWeight: '800', marginLeft: 2 },

  btn:        { height: 54, borderRadius: 14, backgroundColor: '#00C2CB', alignItems: 'center', justifyContent: 'center' },
  btnOff:     { backgroundColor: 'rgba(0,194,203,0.12)' },
  btnText:    { fontSize: 15, fontWeight: '800', color: '#080F1A' },
  btnTextOff: { color: 'rgba(0,194,203,0.35)' },
})