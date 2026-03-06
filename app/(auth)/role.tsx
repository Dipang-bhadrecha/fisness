import { router } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../../constants/theme'
import { useLanguage } from '../../hooks/useLanguage'

const ROLE_IDS = ['boat_owner', 'boat_manager', 'supplier', 'mehtaji'] as const
type RoleId = typeof ROLE_IDS[number]

const ROLE_EMOJIS: Record<RoleId, string> = {
  boat_owner: '⚓', boat_manager: '🧭', supplier: '🏭', mehtaji: '📋',
}

export default function RoleScreen() {
  const { t } = useLanguage()
  const [selected, setSelected] = useState<RoleId | null>(null)

  const getRoleTitle = (id: RoleId) => {
    const map: Record<RoleId, string> = {
      boat_owner: t.role.boatOwner, boat_manager: t.role.boatManager,
      supplier: t.role.supplier, mehtaji: t.role.mehtaji,
    }
    return map[id]
  }
  const getRoleSub = (id: RoleId) => {
    const map: Record<RoleId, string> = {
      boat_owner: t.role.boatOwnerSub, boat_manager: t.role.boatManagerSub,
      supplier: t.role.supplierSub, mehtaji: t.role.mehtajiSub,
    }
    return map[id]
  }

  const handleContinue = () => {
    if (!selected) return
    router.replace('/(owner)/home' as any) // TODO: route per role
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <View style={s.bg}>
        <View style={s.bgCircle1} />
        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            <View style={s.header}>
              <Text style={s.headerLabel}>{t.role.headerLabel}</Text>
              <Text style={s.headerTitle}>{t.role.headerTitle}</Text>
              <Text style={s.headerSub}>{t.role.headerSubtitle}</Text>
            </View>

            <View style={s.roleList}>
              {ROLE_IDS.map((id) => {
                const isSelected = selected === id
                return (
                  <TouchableOpacity key={id} style={[s.roleCard, isSelected && s.roleCardSelected]} onPress={() => setSelected(id)} activeOpacity={0.8}>
                    <View style={[s.roleIconBox, isSelected && s.roleIconBoxSelected]}>
                      <Text style={s.roleEmoji}>{ROLE_EMOJIS[id]}</Text>
                    </View>
                    <View style={s.roleText}>
                      <Text style={[s.roleTitle, isSelected && s.roleTitleSelected]}>{getRoleTitle(id)}</Text>
                      <Text style={s.roleSub}>{getRoleSub(id)}</Text>
                    </View>
                    <View style={[s.roleArrow, isSelected && s.roleArrowSelected]}>
                      <Text style={s.roleArrowText}>{isSelected ? '✓' : '›'}</Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>

            <TouchableOpacity style={[s.ctaBtn, !selected && s.ctaBtnDisabled]} onPress={handleContinue} activeOpacity={0.85} disabled={!selected}>
              <View style={[s.ctaBtnInner, !selected && s.ctaBtnInnerDisabled]}>
                <Text style={[s.ctaBtnText, !selected && s.ctaBtnTextMuted]}>
                  {selected
                    ? `${getRoleTitle(selected)} ${t.role.continuePrefix} →`
                    : t.role.continuePlaceholder}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  )
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0a1628' },
  bgCircle1: { position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(13,122,95,0.1)' },
  safe: { flex: 1 },
  scroll: { padding: 24, gap: 24 },
  header: { gap: 8, paddingTop: 16 },
  headerLabel: { fontSize: 12, color: theme.colors.primaryLight, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  headerTitle: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -0.5, lineHeight: 42 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 22, marginTop: 4 },
  roleList: { gap: 10 },
  roleCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', padding: 16, minHeight: 80 },
  roleCardSelected: { backgroundColor: 'rgba(13,122,95,0.12)', borderColor: theme.colors.primary },
  roleIconBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  roleIconBoxSelected: { backgroundColor: theme.colors.primary },
  roleEmoji: { fontSize: 26 },
  roleText: { flex: 1, gap: 4 },
  roleTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  roleTitleSelected: { color: theme.colors.primaryLight },
  roleSub: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  roleArrow: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  roleArrowSelected: { backgroundColor: theme.colors.primary },
  roleArrowText: { fontSize: 18, color: '#fff', fontWeight: '700' },
  ctaBtn: { borderRadius: 16, shadowColor: '#0d7a5f', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10, marginTop: 8 },
  ctaBtnDisabled: { shadowOpacity: 0, elevation: 0 },
  ctaBtnInner: { height: 68, backgroundColor: theme.colors.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.primaryLight },
  ctaBtnInnerDisabled: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' },
  ctaBtnText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  ctaBtnTextMuted: { color: 'rgba(255,255,255,0.2)' },
})