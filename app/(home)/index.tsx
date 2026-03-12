/**
 * app/(home)/index.tsx — Universal Home Screen
 *
 * Reads homeVariant + activeContext from entityStore.
 * All 6 role combinations render here. No separate dashboard files.
 *
 * Layout:
 *   - Context switcher pill (only for dual-role variants)
 *   - Header (name, role badge)
 *   - Stats grid
 *   - Quick actions 2×2
 *   - Scrollable content
 *   - Fixed bottom tab bar (4 tabs, role-driven)
 */

import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../../store/authStore'
import {
    ActiveContext,
    Entity,
    HomeVariant,
    hasPerm,
    useEntityStore,
} from '../../store/entityStore'

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG    = '#080F1A'
const SURF  = '#0D1B2E'
const ELEV  = '#132640'
const BOR   = 'rgba(0,194,203,0.1)'
const TP    = '#F0F4F8'
const TS    = '#8BA3BC'
const TM    = '#3D5A73'
const BLUE  = '#1B7FBF'
const GREEN = '#059669'
const TEAL  = '#0891b2'
const ORAN  = '#d97706'

// ─── Permission keys ──────────────────────────────────────────────────────────
const P = {
  CREATE_TALI:          'CREATE_TALI',
  VIEW_TALI:            'VIEW_TALI',
  FILL_FISH_PRICE:      'FILL_FISH_PRICE',
  VIEW_BILL:            'VIEW_BILL',
  SEND_BILL:            'SEND_BILL',
  ADD_COMPANY_EXPENSE:  'ADD_COMPANY_EXPENSE',
  VIEW_COMPANY_EXPENSE: 'VIEW_COMPANY_EXPENSE',
  VIEW_EMPLOYEE_RECORDS:'VIEW_EMPLOYEE_RECORDS',
  MANAGE_EMPLOYEES:     'MANAGE_EMPLOYEES',
  VIEW_FINANCIAL_REPORT:'VIEW_FINANCIAL_REPORT',
  ADD_BOAT_EXPENSE:     'ADD_BOAT_EXPENSE',
  VIEW_BOAT_EXPENSE:    'VIEW_BOAT_EXPENSE',
}

// ─── Tab definitions per variant/context ─────────────────────────────────────
type Tab = { id: string; emoji: string; label: string; onPress: () => void }

function getBoatTabs(active: string): Tab[] {
  return [
    { id: 'home',   emoji: '🏠', label: 'Home',   onPress: () => {} },
    { id: 'tali',   emoji: '⚓', label: 'Tali',   onPress: () => router.push('/tali' as any) },
    { id: 'trips',  emoji: '📅', label: 'Trips',  onPress: () => router.push('/trips' as any) },
    { id: 'ledger', emoji: '📒', label: 'Ledger', onPress: () => router.push('/ledger' as any) },
    { id: 'profile',emoji: '👤', label: 'Profile',onPress: () => router.push('/profile' as any) },
  ]
}

function getCompanyTabs(active: string): Tab[] {
  return [
    { id: 'home',   emoji: '🏠', label: 'Home',   onPress: () => {} },
    { id: 'tali',   emoji: '⚓', label: 'Tali',   onPress: () => router.push('/tali' as any) },
    { id: 'bills',  emoji: '🧾', label: 'Bills',  onPress: () => {} },
    { id: 'boats',  emoji: '🚢', label: 'Boats',  onPress: () => {} },
    { id: 'profile',emoji: '👤', label: 'Profile',onPress: () => router.push('/profile' as any) },
  ]
}

function getManagerTabs(entity: Entity | null, active: string): Tab[] {
  const can = (p: string) => hasPerm(entity, p)
  const tabs: Tab[] = [{ id: 'home', emoji: '🏠', label: 'Home', onPress: () => {} }]
  if (can(P.CREATE_TALI))
    tabs.push({ id: 'tali', emoji: '⚓', label: 'Tali', onPress: () => router.push('/tali' as any) })
  if (can(P.ADD_COMPANY_EXPENSE) || can(P.ADD_BOAT_EXPENSE))
    tabs.push({ id: 'expenses', emoji: '💸', label: 'Expenses', onPress: () => {} })
  tabs.push({ id: 'profile', emoji: '👤', label: 'Profile', onPress: () => router.push('/profile' as any) })
  return tabs
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { token } = useAuthStore()
  const {
    homeVariant, activeContext, activeEntity, secondaryEntity,
    isLoaded, isLoading, loadError, loadEntities, setActiveContext,
  } = useEntityStore()

  const [activeTab, setActiveTab] = useState('home')

  useEffect(() => {
    if (token && !isLoaded && !isLoading) loadEntities(token)
  }, [token])

  if (isLoading || !isLoaded) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={TEAL} size="large" />
        <Text style={s.loadTxt}>Loading your workspace…</Text>
      </View>
    )
  }

  if (loadError) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 36 }}>⚠️</Text>
        <Text style={s.errTxt}>{loadError}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => token && loadEntities(token)}>
          <Text style={s.retryTxt}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const variant = homeVariant ?? 'BOAT_OWNER'
  const hasSwitcher =
    variant === 'BOAT_AND_COMPANY' ||
    variant === 'BOAT_AND_COMPANY_MANAGER' ||
    variant === 'BOAT_AND_BOAT_MANAGER'

  // Resolve which entity and tabs to show
  const ctx = activeContext === 'primary' ? activeEntity : secondaryEntity
  const tabs = resolveTabs(variant, activeContext, ctx, activeTab)

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe}>

        {/* Context switcher */}
        {hasSwitcher && (
          <ContextSwitcher
            variant={variant}
            activeContext={activeContext}
            primary={activeEntity}
            secondary={secondaryEntity}
            onSwitch={setActiveContext}
          />
        )}

        {/* Scrollable body */}
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <VariantBody
            variant={variant}
            activeContext={activeContext}
            primary={activeEntity}
            secondary={secondaryEntity}
          />
          <View style={{ height: 90 }} />
        </ScrollView>

        {/* Fixed bottom tab bar */}
        <BottomTabBar tabs={tabs} activeId={activeTab} onPress={(id, fn) => { setActiveTab(id); fn() }} />

      </SafeAreaView>
    </>
  )
}

// ─── Resolve tabs ─────────────────────────────────────────────────────────────
function resolveTabs(
  variant: HomeVariant,
  ctx: ActiveContext,
  entity: Entity | null,
  active: string,
): Tab[] {
  switch (variant) {
    case 'BOAT_OWNER':
      return getBoatTabs(active)
    case 'COMPANY_OWNER':
      return getCompanyTabs(active)
    case 'BOAT_AND_COMPANY':
      return ctx === 'primary' ? getCompanyTabs(active) : getBoatTabs(active)
    case 'BOAT_AND_COMPANY_MANAGER':
    case 'BOAT_AND_BOAT_MANAGER':
      return ctx === 'primary' ? getBoatTabs(active) : getManagerTabs(entity, active)
    case 'MANAGER_ONLY':
      return getManagerTabs(entity, active)
    default:
      return getBoatTabs(active)
  }
}

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
function BottomTabBar({
  tabs,
  activeId,
  onPress,
}: {
  tabs: Tab[]
  activeId: string
  onPress: (id: string, fn: () => void) => void
}) {
  return (
    <View style={tb.bar}>
      {tabs.map(tab => {
        const isActive = tab.id === activeId
        return (
          <TouchableOpacity
            key={tab.id}
            style={tb.item}
            onPress={() => onPress(tab.id, tab.onPress)}
            activeOpacity={0.7}
          >
            <Text style={[tb.emoji, isActive && tb.emojiActive]}>{tab.emoji}</Text>
            <Text style={[tb.label, isActive && tb.labelActive]}>{tab.label}</Text>
            {isActive && <View style={tb.dot} />}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const tb = StyleSheet.create({
  bar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: SURF,
    borderTopWidth: 1, borderTopColor: BOR,
    paddingTop: 10, paddingBottom: 28,
  },
  item:        { flex: 1, alignItems: 'center', gap: 3 },
  emoji:       { fontSize: 22, opacity: 0.45 },
  emojiActive: { opacity: 1 },
  label:       { fontSize: 10, fontWeight: '500', color: TM },
  labelActive: { color: TEAL, fontWeight: '700' },
  dot:         { width: 4, height: 4, borderRadius: 2, backgroundColor: TEAL, marginTop: 1 },
})

// ─── Context Switcher ─────────────────────────────────────────────────────────
function ContextSwitcher({
  variant, activeContext, primary, secondary, onSwitch,
}: {
  variant: HomeVariant
  activeContext: ActiveContext
  primary: Entity | null
  secondary: Entity | null
  onSwitch: (ctx: ActiveContext) => void
}) {
  const isPrimary = activeContext === 'primary'

  const primaryLabel =
    variant === 'BOAT_AND_COMPANY' ? (primary?.companyName ?? 'Company') : 'My Boat'

  const secondaryLabel =
    variant === 'BOAT_AND_COMPANY'
      ? 'My Boats'
      : variant === 'BOAT_AND_COMPANY_MANAGER'
      ? (secondary?.companyName ?? 'Company')
      : (secondary?.boatName ?? secondary?.label ?? 'Managed Boat')

  const accent = isPrimary ? (primary?.accent ?? BLUE) : (secondary?.accent ?? TEAL)

  return (
    <View style={cs.pill}>
      <TouchableOpacity
        style={[cs.tab, isPrimary && [cs.tabActive, { backgroundColor: accent + '22', borderColor: accent }]]}
        onPress={() => onSwitch('primary')}
      >
        <Text style={[cs.tabTxt, isPrimary && { color: accent, fontWeight: '800' }]}>{primaryLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[cs.tab, !isPrimary && [cs.tabActive, { backgroundColor: accent + '22', borderColor: accent }]]}
        onPress={() => onSwitch('secondary')}
      >
        <Text style={[cs.tabTxt, !isPrimary && { color: accent, fontWeight: '800' }]}>{secondaryLabel}</Text>
        {variant !== 'BOAT_AND_COMPANY' && (
          <View style={cs.badge}><Text style={cs.badgeTxt}>MGR</Text></View>
        )}
      </TouchableOpacity>
    </View>
  )
}

const cs = StyleSheet.create({
  pill: {
    flexDirection: 'row', backgroundColor: SURF,
    borderRadius: 14, borderWidth: 1, borderColor: BOR,
    padding: 4, marginHorizontal: 16, marginTop: 12, marginBottom: 4, gap: 4,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderColor: 'transparent',
  },
  tabActive: {},
  tabTxt:    { fontSize: 14, fontWeight: '600', color: TS },
  badge:     { backgroundColor: TEAL + '30', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  badgeTxt:  { fontSize: 9, fontWeight: '800', color: TEAL, letterSpacing: 0.5 },
})

// ─── Variant Body Router ──────────────────────────────────────────────────────
function VariantBody({
  variant, activeContext, primary, secondary,
}: {
  variant: HomeVariant
  activeContext: ActiveContext
  primary: Entity | null
  secondary: Entity | null
}) {
  switch (variant) {
    case 'BOAT_OWNER':
      return <BoatOwnerBody entity={primary} />
    case 'COMPANY_OWNER':
      return <CompanyOwnerBody entity={primary} />
    case 'BOAT_AND_COMPANY':
      return activeContext === 'primary'
        ? <CompanyOwnerBody entity={primary} />
        : <BoatOwnerBody entity={secondary} />
    case 'BOAT_AND_COMPANY_MANAGER':
      return activeContext === 'primary'
        ? <BoatOwnerBody entity={primary} />
        : <ManagerBody entity={secondary} managerType="company" />
    case 'BOAT_AND_BOAT_MANAGER':
      return activeContext === 'primary'
        ? <BoatOwnerBody entity={primary} />
        : <ManagerBody entity={secondary} managerType="boat" />
    case 'MANAGER_ONLY':
      return <ManagerOnlyBody primary={primary} secondary={secondary} />
    default:
      return <BoatOwnerBody entity={primary} />
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOAT OWNER BODY
// ═══════════════════════════════════════════════════════════════════════════════
function BoatOwnerBody({ entity }: { entity: Entity | null }) {
  const accent = entity?.accent ?? BLUE
  return (
    <>
      <HomeHeader
        title={entity?.label ?? 'My Fleet'}
        subtitle="Boat Owner · Personal"
        accent={accent}
        emoji="🚢"
      />
      <BoatStatsCard accent={accent} />
      <QuickActionsGrid accent={accent} actions={[
        { emoji: '⚓', label: 'Add Tali',    onPress: () => router.push('/tali' as any) },
        { emoji: '💸', label: 'Add Expense', onPress: () => router.push('/kharchi' as any) },
        { emoji: '👥', label: 'Add Kharchi', onPress: () => router.push('/crew' as any) },
        { emoji: '🚢', label: 'My Boats',    onPress: () => router.push('/boats' as any) },
      ]} />

      {/* Onboarding prompt if no boats set up yet */}
      {(!entity?.boatCount || entity.boatCount === 0) && entity?.id === 'personal_boats' && (
        <OnboardingPrompt
          emoji="🚢"
          title="Add your first boat"
          subtitle="Tap here to add your boat name and start tracking trips."
          accent={accent}
          onPress={() => router.push('/boats' as any)}
        />
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPANY OWNER BODY
// ═══════════════════════════════════════════════════════════════════════════════
function CompanyOwnerBody({ entity }: { entity: Entity | null }) {
  const accent = entity?.accent ?? GREEN
  const name   = entity?.companyName ?? entity?.label ?? 'My Company'
  const isNew  = entity?.id === 'my_company'

  return (
    <>
      <HomeHeader
        title={name}
        subtitle="Company Owner · Dango"
        accent={accent}
        emoji="🏢"
      />
      <CompanyStatsCard accent={accent} />
      <QuickActionsGrid accent={accent} actions={[
        { emoji: '⚓', label: 'New Tali',    onPress: () => router.push('/tali' as any) },
        { emoji: '🏷️', label: 'Fill Price',  onPress: () => {} },
        { emoji: '💸', label: 'Add Expense', onPress: () => {} },
        { emoji: '📤', label: 'Send Bill',   onPress: () => {} },
      ]} />

      {/* Onboarding prompt for new company owners */}
      {isNew && (
        <OnboardingPrompt
          emoji="🏢"
          title="Set up your company"
          subtitle="Add your company name and register your first boat."
          accent={accent}
          onPress={() => router.push('/profile' as any)}
        />
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MANAGER BODY (company or boat)
// ═══════════════════════════════════════════════════════════════════════════════
function ManagerBody({
  entity,
  managerType,
}: {
  entity: Entity | null
  managerType: 'company' | 'boat'
}) {
  const accent = entity?.accent ?? (managerType === 'company' ? TEAL : ORAN)
  const name   = entity?.companyName ?? entity?.boatName ?? entity?.label ?? 'My Workspace'
  const can    = (p: string) => hasPerm(entity, p)

  const actions = []
  if (can(P.CREATE_TALI))
    actions.push({ emoji: '⚓', label: 'Add Tali',    onPress: () => router.push('/tali' as any) })
  if (can(P.FILL_FISH_PRICE))
    actions.push({ emoji: '🏷️', label: 'Fill Price',  onPress: () => {} })
  if (can(P.ADD_COMPANY_EXPENSE) || can(P.ADD_BOAT_EXPENSE))
    actions.push({ emoji: '💸', label: 'Add Expense', onPress: () => {} })
  if (can(P.SEND_BILL))
    actions.push({ emoji: '📤', label: 'Send Bill',   onPress: () => {} })

  const isPending = entity?.id.includes('pending')

  return (
    <>
      {/* Manager header card */}
      <View style={[mb.card, { borderColor: accent + '30' }]}>
        <View style={[mb.badge, { backgroundColor: accent + '18' }]}>
          <Text style={[mb.badgeTxt, { color: accent }]}>
            {managerType === 'company' ? '👔 COMPANY MANAGER' : '⚓ BOAT MANAGER'}
          </Text>
        </View>
        <Text style={mb.name}>{name}</Text>
        {entity?.ownerName && <Text style={mb.owner}>Owner: {entity.ownerName}</Text>}
        <Text style={mb.note}>Your access is set by the owner</Text>
      </View>

      {isPending ? (
        <View style={mb.waitBox}>
          <Text style={mb.waitEmoji}>⏳</Text>
          <Text style={mb.waitTitle}>Waiting for connection</Text>
          <Text style={mb.waitSub}>Your owner needs to add you from their Access screen.</Text>
        </View>
      ) : (
        <>
          {/* Permission chips */}
          {entity && entity.permissions.length > 0 && (
            <View style={mb.permRow}>
              {entity.permissions.slice(0, 5).map(p => (
                <View key={p} style={[mb.permChip, { borderColor: accent + '40', backgroundColor: accent + '12' }]}>
                  <Text style={[mb.permTxt, { color: accent }]}>✓ {p.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          )}
          {actions.length > 0 && <QuickActionsGrid accent={accent} actions={actions} />}
        </>
      )}
    </>
  )
}

const mb = StyleSheet.create({
  card:     { margin: 16, padding: 18, backgroundColor: SURF, borderRadius: 16, borderWidth: 1, gap: 6 },
  badge:    { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 4 },
  badgeTxt: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  name:     { fontSize: 20, fontWeight: '800', color: TP },
  owner:    { fontSize: 13, color: TS },
  note:     { fontSize: 12, color: TM, marginTop: 4, fontStyle: 'italic' },
  permRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginHorizontal: 16, marginBottom: 8 },
  permChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  permTxt:  { fontSize: 10, fontWeight: '600' },
  waitBox:  { margin: 24, padding: 24, backgroundColor: SURF, borderRadius: 16, alignItems: 'center', gap: 10 },
  waitEmoji:{ fontSize: 40 },
  waitTitle:{ fontSize: 17, fontWeight: '800', color: TP },
  waitSub:  { fontSize: 13, color: TS, textAlign: 'center', lineHeight: 19 },
})

// ═══════════════════════════════════════════════════════════════════════════════
// MANAGER ONLY BODY
// ═══════════════════════════════════════════════════════════════════════════════
function ManagerOnlyBody({
  primary, secondary,
}: {
  primary: Entity | null
  secondary: Entity | null
}) {
  const { activeContext, setActiveContext } = useEntityStore()

  if (!secondary) {
    if (!primary) {
      return (
        <View style={s.center}>
          <Text style={{ fontSize: 40 }}>⏳</Text>
          <Text style={s.errTxt}>Waiting for owner to connect you.</Text>
        </View>
      )
    }
    return (
      <ManagerBody
        entity={primary}
        managerType={primary.type === 'MANAGER_BOAT' ? 'boat' : 'company'}
      />
    )
  }

  // Two manager contexts
  return (
    <>
      <View style={cs.pill}>
        <TouchableOpacity
          style={[cs.tab, activeContext === 'primary' && [cs.tabActive, { backgroundColor: primary!.accent + '20', borderColor: primary!.accent }]]}
          onPress={() => setActiveContext('primary')}
        >
          <Text style={[cs.tabTxt, activeContext === 'primary' && { color: primary!.accent, fontWeight: '800' }]}>
            {primary?.type === 'MANAGER_BOAT' ? primary?.boatName ?? 'Boat' : primary?.companyName ?? 'Company'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[cs.tab, activeContext === 'secondary' && [cs.tabActive, { backgroundColor: secondary.accent + '20', borderColor: secondary.accent }]]}
          onPress={() => setActiveContext('secondary')}
        >
          <Text style={[cs.tabTxt, activeContext === 'secondary' && { color: secondary.accent, fontWeight: '800' }]}>
            {secondary.type === 'MANAGER_BOAT' ? secondary.boatName ?? 'Boat' : secondary.companyName ?? 'Company'}
          </Text>
        </TouchableOpacity>
      </View>
      {activeContext === 'primary'
        ? <ManagerBody entity={primary} managerType={primary?.type === 'MANAGER_BOAT' ? 'boat' : 'company'} />
        : <ManagerBody entity={secondary} managerType={secondary.type === 'MANAGER_BOAT' ? 'boat' : 'company'} />
      }
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function HomeHeader({ title, subtitle, accent, emoji }: {
  title: string; subtitle: string; accent: string; emoji: string
}) {
  return (
    <View style={[hh.wrap, { borderBottomColor: accent + '20' }]}>
      <View style={hh.left}>
        <Text style={hh.sub}>{subtitle}</Text>
        <Text style={hh.title} numberOfLines={1}>{title}</Text>
      </View>
      <View style={[hh.icon, { backgroundColor: accent + '18' }]}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <TouchableOpacity style={hh.profile} onPress={() => router.push('/profile' as any)}>
        <Text style={{ fontSize: 18 }}>👤</Text>
      </TouchableOpacity>
    </View>
  )
}
const hh = StyleSheet.create({
  wrap:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 18, borderBottomWidth: 1, gap: 10 },
  left:    { flex: 1 },
  sub:     { fontSize: 11, color: TS, fontWeight: '600', letterSpacing: 0.3, marginBottom: 2 },
  title:   { fontSize: 22, fontWeight: '800', color: TP, letterSpacing: -0.4 },
  icon:    { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  profile: { width: 38, height: 38, borderRadius: 19, backgroundColor: SURF, borderWidth: 1, borderColor: BOR, alignItems: 'center', justifyContent: 'center' },
})

// ─── Compact Stats Card (replaces the 6-cell grid) ───────────────────────────
// Left column: 2 hero numbers (profit + catch). Right column: 3 small rows.
// Everything fits in one card, no scrolling needed.

function BoatStatsCard({ accent }: { accent: string }) {
  return (
    <View style={[sc.card, { backgroundColor: accent }]}>
      {/* Left column */}
      <View style={sc.left}>
        <View style={sc.leftTop}>
          <Text style={sc.leftLabel}>Total profit this year</Text>
          <Text style={sc.leftBig}>₹4,20,000</Text>
          <Text style={sc.leftGrowth}>+13%</Text>
        </View>
        <View style={sc.divider} />
        <View style={sc.leftBot}>
          <Text style={sc.leftLabel}>Total catch this year</Text>
          <Text style={sc.leftBig}>4,20,000 kg</Text>
          <Text style={sc.leftGrowth}>+8%</Text>
        </View>
      </View>

      {/* Right column */}
      <View style={sc.right}>
        <View style={sc.rightRow}>
          <Text style={sc.rightLabel}>Total Boats</Text>
          <Text style={sc.rightVal}>5</Text>
        </View>
        <View style={sc.rightDivider} />
        <View style={sc.rightRow}>
          <Text style={sc.rightLabel}>Season Advance</Text>
          <Text style={sc.rightVal}>7,20,000</Text>
        </View>
        <View style={sc.rightDivider} />
        <View style={sc.rightRow}>
          <Text style={sc.rightLabel}>Maintenance</Text>
          <Text style={sc.rightVal}>1,50,000</Text>
        </View>
        <View style={sc.rightDivider} />
        <View style={sc.rightRow}>
          <Text style={sc.rightLabel}>Diesel</Text>
          <Text style={[sc.rightVal, sc.rightValHighlight]}>1,00,000 ltr</Text>
        </View>
      </View>
    </View>
  )
}

function CompanyStatsCard({ accent }: { accent: string }) {
  return (
    <View style={[sc.card, { backgroundColor: accent }]}>
      <View style={sc.left}>
        <View style={sc.leftTop}>
          <Text style={sc.leftLabel}>Total bills this year</Text>
          <Text style={sc.leftBig}>₹62,00,000</Text>
          <Text style={sc.leftGrowth}>+18%</Text>
        </View>
        <View style={sc.divider} />
        <View style={sc.leftBot}>
          <Text style={sc.leftLabel}>Fish received this year</Text>
          <Text style={sc.leftBig}>84,000 kg</Text>
          <Text style={sc.leftGrowth}>+11%</Text>
        </View>
      </View>
      <View style={sc.right}>
        <View style={sc.rightRow}>
          <Text style={sc.rightLabel}>Active Boats</Text>
          <Text style={sc.rightVal}>22</Text>
        </View>
        <View style={sc.rightDivider} />
        <View style={sc.rightRow}>
          <Text style={sc.rightLabel}>Advance Given</Text>
          <Text style={sc.rightVal}>₹18,00,000</Text>
        </View>
        <View style={sc.rightDivider} />
        <View style={sc.rightRow}>
          <Text style={sc.rightLabel}>Company Exp</Text>
          <Text style={sc.rightVal}>₹4,20,000</Text>
        </View>
        <View style={sc.rightDivider} />
        <View style={sc.rightRow}>
          <Text style={sc.rightLabel}>Pending Sessions</Text>
          <Text style={[sc.rightVal, sc.rightValHighlight]}>3 unfilled</Text>
        </View>
      </View>
    </View>
  )
}

const sc = StyleSheet.create({
  card: {
    marginHorizontal: 16, marginTop: 14,
    borderRadius: 18, padding: 18,
    flexDirection: 'row', gap: 16,
    minHeight: 160,
  },

  // Left: two stacked hero numbers
  left:      { flex: 1.1, justifyContent: 'space-between' },
  leftTop:   { flex: 1, justifyContent: 'center', gap: 2 },
  leftBot:   { flex: 1, justifyContent: 'center', gap: 2 },
  leftLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  leftBig:   { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5, lineHeight: 26 },
  leftGrowth:{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  divider:   { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 8 },

  // Right: 4 compact rows
  right:            { flex: 0.9, justifyContent: 'space-between' },
  rightRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 },
  rightDivider:     { height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  rightLabel:       { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '500', flex: 1 },
  rightVal:         { fontSize: 13, color: '#fff', fontWeight: '700', textAlign: 'right' },
  rightValHighlight:{ color: '#FFD166', fontWeight: '800' },
})

function QuickActionsGrid({ actions, accent }: {
  actions: { emoji: string; label: string; onPress: () => void }[]
  accent: string
}) {
  const padded = [...actions]
  while (padded.length < 4) padded.push({ emoji: '➕', label: 'More', onPress: () => {} })
  return (
    <View style={qa.wrap}>
      <Text style={[qa.title, { color: accent }]}>QUICK ACTIONS</Text>
      <View style={qa.grid}>
        {padded.slice(0, 4).map((a, i) => (
          <TouchableOpacity key={i} style={qa.cell} onPress={a.onPress} activeOpacity={0.75}>
            <View style={[qa.icon, { backgroundColor: accent + '18' }]}>
              <Text style={{ fontSize: 26 }}>{a.emoji}</Text>
            </View>
            <Text style={qa.label}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
const qa = StyleSheet.create({
  wrap:  { marginHorizontal: 16, marginTop: 20 },
  title: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10, color: TM },
  grid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell:  { width: '47%', backgroundColor: SURF, borderRadius: 14, borderWidth: 1, borderColor: BOR, padding: 16, alignItems: 'center', gap: 8 },
  icon:  { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: TP, textAlign: 'center' },
})

function OnboardingPrompt({ emoji, title, subtitle, accent, onPress }: {
  emoji: string; title: string; subtitle: string; accent: string; onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[op.wrap, { borderColor: accent + '40', backgroundColor: accent + '08' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[op.title, { color: accent }]}>{title}</Text>
        <Text style={op.sub}>{subtitle}</Text>
      </View>
      <Text style={[{ fontSize: 20, color: accent }]}>›</Text>
    </TouchableOpacity>
  )
}
const op = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 12, margin: 16, padding: 16, borderRadius: 14, borderWidth: 1 },
  title: { fontSize: 14, fontWeight: '800' },
  sub:   { fontSize: 12, color: TS, marginTop: 2, lineHeight: 17 },
})

// ─── Base styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: BG },
  scroll:      { flex: 1 },
  scrollContent: {},
  center:      { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  loadTxt:     { color: TS, fontSize: 14 },
  errTxt:      { color: TS, fontSize: 14, textAlign: 'center' },
  retryBtn:    { backgroundColor: TEAL, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryTxt:    { color: '#fff', fontWeight: '700', fontSize: 15 },
})