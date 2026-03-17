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

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect } from 'react'
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
import { AppTabBar } from '../../components/shared/AppTabBar'
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
const AMBER = '#f59e0b'

// ─── Boat card action button icons ────────────────────────────────────────────
const CARD_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  tali:    'scale-outline',
  expense: 'wallet-outline',
  crew:    'people-outline',
  details: 'chevron-forward',
}

const BOAT_STATUS = {
  active: { label: 'At Sea', color: '#10b981', bg: 'rgba(16,185,129,0.16)' },
  docked: { label: 'Docked', color: '#60a5fa', bg: 'rgba(96,165,250,0.16)' },
  repair: { label: 'Repair', color: '#f59e0b', bg: 'rgba(245,158,11,0.16)' },
} as const

const HOME_BOATS = [
  {
    id: '1',
    name: 'Jai Mataji',
    gujaratiName: 'જય માતાજી',
    registration: 'GJ-VR-1042',
    status: 'active' as const,
    catchKg: 12400,
    expense: 85000,
    crew: 8,
    captain: 'Ramesh Bhai',
    lastTrip: '12 Mar 2026',
    location: 'Okha',
  },
  {
    id: '2',
    name: 'Sea Star',
    gujaratiName: 'સી સ્ટાર',
    registration: 'GJ-VR-2201',
    status: 'docked' as const,
    catchKg: 9800,
    expense: 62000,
    crew: 6,
    captain: 'Suresh Kaka',
    lastTrip: '10 Mar 2026',
    location: 'Veraval',
  },
  {
    id: '3',
    name: 'Jai Mataji',
    gujaratiName: 'જય માતાજી',
    registration: 'GJ-VR-1042',
    status: 'active' as const,
    catchKg: 12400,
    expense: 85000,
    crew: 8,
    captain: 'Ramesh Bhai',
    lastTrip: '12 Mar 2026',
    location: 'Okha',
  },
  {
    id: '4',
    name: 'Sea Star',
    gujaratiName: 'સી સ્ટાર',
    registration: 'GJ-VR-2201',
    status: 'docked' as const,
    catchKg: 9800,
    expense: 62000,
    crew: 6,
    captain: 'Suresh Kaka',
    lastTrip: '10 Mar 2026',
    location: 'Veraval',
  },
]

const fmt = (n: number) => n.toLocaleString('en-IN')

// ─── Permission keys ──────────────────────────────────────────────────────────
const P = {
  CREATE_TALI:           'CREATE_TALI',
  VIEW_TALI:             'VIEW_TALI',
  FILL_FISH_PRICE:       'FILL_FISH_PRICE',
  VIEW_BILL:             'VIEW_BILL',
  SEND_BILL:             'SEND_BILL',
  ADD_COMPANY_EXPENSE:   'ADD_COMPANY_EXPENSE',
  VIEW_COMPANY_EXPENSE:  'VIEW_COMPANY_EXPENSE',
  VIEW_EMPLOYEE_RECORDS: 'VIEW_EMPLOYEE_RECORDS',
  MANAGE_EMPLOYEES:      'MANAGE_EMPLOYEES',
  VIEW_FINANCIAL_REPORT: 'VIEW_FINANCIAL_REPORT',
  ADD_BOAT_EXPENSE:      'ADD_BOAT_EXPENSE',
  VIEW_BOAT_EXPENSE:     'VIEW_BOAT_EXPENSE',
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { token } = useAuthStore()
  const {
    homeVariant, activeContext, activeEntity, secondaryEntity,
    isLoaded, isLoading, loadError, loadEntities, setActiveContext,
  } = useEntityStore()

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

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe}>

        {hasSwitcher && (
          <ContextSwitcher
            variant={variant}
            activeContext={activeContext}
            primary={activeEntity}
            secondary={secondaryEntity}
            onSwitch={setActiveContext}
          />
        )}

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

        <AppTabBar activeTab="home" />

      </SafeAreaView>
    </>
  )
}

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
  const isPrimary      = activeContext === 'primary'
  const primaryLabel   = variant === 'BOAT_AND_COMPANY' ? (primary?.companyName ?? 'Company') : 'My Boat'
  const secondaryLabel =
    variant === 'BOAT_AND_COMPANY'          ? 'My Boats'
    : variant === 'BOAT_AND_COMPANY_MANAGER' ? (secondary?.companyName ?? 'Company')
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
  const boats  = entity?.id === 'personal_boats' && (!entity?.boatCount || entity.boatCount === 0)
    ? []
    : HOME_BOATS

  return (
    <>
      <HomeHeader subtitle="Boat Owner · Personal" accent={accent} />
      <QuickActionsGrid singleRow accent={accent} actions={[
        { icon: 'scale-outline',  label: 'Add\nTali',    onPress: () => router.push('/tali-fish-select' as any) },
        { icon: 'wallet-outline', label: 'Add\nExpense', onPress: () => router.push('/add-expense' as any) },
        { icon: 'people-outline', label: 'Add\nKharchi', onPress: () => router.push('/crew' as any) },
      ]} />

      {boats.length > 0 && <BoatListSection boats={boats} accent={accent} />}

      {boats.length === 0 && (!entity?.boatCount || entity.boatCount === 0) && entity?.id === 'personal_boats' && (
        <OnboardingPrompt
          emoji="🚢"
          title="Add your first boat"
          subtitle="Tap here to add your boat name and start tracking trips."
          accent={accent}
          onPress={() => {}}
        />
      )}
    </>
  )
}

function BoatListSection({ boats, accent }: { boats: typeof HOME_BOATS; accent: string }) {
  return (
    <View style={bl.wrap}>
      <View style={bl.header}>
        <Text style={[bl.title, { color: accent }]}>MY BOATS</Text>
      </View>
      <View style={bl.list}>
        {boats.map(boat => (
          <BoatOwnerBoatCard key={boat.id} boat={boat} accent={accent} />
        ))}
      </View>
    </View>
  )
}

// ─── Boat Card ────────────────────────────────────────────────────────────────
// Details → /boat-detail   Tali → /tali-fish-select directly (no modal)
// ─────────────────────────────────────────────────────────────────────────────
function BoatOwnerBoatCard({ boat, accent }: { boat: (typeof HOME_BOATS)[number]; accent: string }) {
  const status = BOAT_STATUS[boat.status]

  return (
    <View style={[bcard.card, { overflow: 'hidden' }]}>
      <View style={[bcard.accentBar, { backgroundColor: status.color }]} />
      <View style={bcard.inner}>

        {/* Top: avatar + names + status badge */}
        <View style={bcard.topRow}>
          <View style={bcard.iconWrap}>
            <Text style={bcard.icon}>⛵</Text>
          </View>
          <View style={bcard.info}>
            <Text style={bcard.name}>{boat.name}</Text>
            <Text style={bcard.gujName}>{boat.gujaratiName}</Text>
          </View>
          <View style={[bcard.badge, { backgroundColor: status.bg }]}>
            <View style={[bcard.badgeDot, { backgroundColor: status.color }]} />
            <Text style={[bcard.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Reg + captain + location */}
        <View style={bcard.metaInfoRow}>
          <View style={bcard.metaInfoLeft}>
            <Text style={bcard.reg}>{boat.registration}</Text>
            <View style={bcard.ownerRow}>
              <Ionicons name="person-circle-outline" size={13} color={TS} />
              <Text style={bcard.owner}>{boat.captain}</Text>
            </View>
          </View>
          <View style={bcard.locationBadge}>
            <Ionicons name="location-sharp" size={12} color={TS} />
            <Text style={bcard.locationText}>Location · {boat.location}</Text>
          </View>
        </View>

        {/* Last trip */}
        <View style={bcard.lastTripRow}>
          <Ionicons name="calendar-outline" size={12} color={TM} />
          <Text style={bcard.metaDate}>Last trip: {boat.lastTrip}</Text>
        </View>

        {/* Action buttons */}
        <View style={bcard.actionsRow}>

          {/* Tali — goes directly to tali-fish-select, no modal */}
          <TouchableOpacity
            style={bcard.actionBtn}
            activeOpacity={0.75}
            onPress={() => router.push({
              pathname: '/tali-fish-select',
              params: { boatId: boat.id, boatName: boat.name },
            } as any)}
          >
            <Ionicons name={CARD_ICONS.tali} size={17} color={TS} />
            <Text style={bcard.actionLabel}>Tali</Text>
          </TouchableOpacity>

          {/* Expense */}
          <TouchableOpacity
            style={bcard.actionBtn}
            activeOpacity={0.75}
            onPress={() => router.push('/ledger' as any)}
          >
            <Ionicons name={CARD_ICONS.expense} size={17} color={TS} />
            <Text style={bcard.actionLabel}>Expense</Text>
          </TouchableOpacity>

          {/* Crew */}
          <TouchableOpacity
            style={bcard.actionBtn}
            activeOpacity={0.75}
            onPress={() => router.push({
              pathname: '/crew',
              params: { boatId: boat.id, boatName: boat.name },
            } as any)}
          >
            <Ionicons name={CARD_ICONS.crew} size={17} color={TS} />
            <Text style={bcard.actionLabel}>Crew</Text>
          </TouchableOpacity>

          {/* Details → /boat-detail */}
          <TouchableOpacity
            style={[bcard.detailBtn, { backgroundColor: accent + '18', borderColor: accent + '50' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/ledger' as any)}
          >
            <Ionicons name={CARD_ICONS.details} size={17} color={accent} />
            <Text style={[bcard.detailText, { color: accent }]}>Details</Text>
          </TouchableOpacity>

        </View>

      </View>{/* closes bcard.inner */}
    </View>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPANY OWNER BODY
// ═══════════════════════════════════════════════════════════════════════════════
function CompanyOwnerBody({ entity }: { entity: Entity | null }) {
  const accent = entity?.accent ?? GREEN
  const isNew  = entity?.id === 'my_company'

  return (
    <>
      <HomeHeader subtitle="Company Owner · Dango" accent={accent} />
      <CompanyStatsCard accent={accent} />
      <QuickActionsGrid accent={accent} actions={[
        { icon: 'scale-outline',    label: 'New Tali',    onPress: () => router.push('/tali' as any) },
        { icon: 'pricetag-outline', label: 'Fill Price',  onPress: () => {} },
        { icon: 'wallet-outline',   label: 'Add Expense', onPress: () => {} },
        { icon: 'send-outline',     label: 'Send Bill',   onPress: () => {} },
      ]} />
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
// MANAGER BODY
// ═══════════════════════════════════════════════════════════════════════════════
function ManagerBody({ entity, managerType }: { entity: Entity | null; managerType: 'company' | 'boat' }) {
  const accent = entity?.accent ?? (managerType === 'company' ? TEAL : ORAN)
  const name   = entity?.companyName ?? entity?.boatName ?? entity?.label ?? 'My Workspace'
  const can    = (p: string) => hasPerm(entity, p)

  const actions: { icon: string; label: string; onPress: () => void }[] = []
  if (can(P.CREATE_TALI))
    actions.push({ icon: 'scale-outline',    label: 'Add Tali',    onPress: () => router.push('/tali' as any) })
  if (can(P.FILL_FISH_PRICE))
    actions.push({ icon: 'pricetag-outline', label: 'Fill Price',  onPress: () => {} })
  if (can(P.ADD_COMPANY_EXPENSE) || can(P.ADD_BOAT_EXPENSE))
    actions.push({ icon: 'wallet-outline',   label: 'Add Expense', onPress: () => {} })
  if (can(P.SEND_BILL))
    actions.push({ icon: 'send-outline',     label: 'Send Bill',   onPress: () => {} })

  const isPending = entity?.id.includes('pending')

  return (
    <>
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
function ManagerOnlyBody({ primary, secondary }: { primary: Entity | null; secondary: Entity | null }) {
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

function HomeHeader({ subtitle, accent }: { subtitle: string; accent: string }) {
  const { user } = useAuthStore()
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <View style={[hh.wrap, { borderBottomColor: accent + '20' }]}>
      <View style={hh.left}>
        <Text style={hh.sub}>{subtitle}</Text>
        <Text style={hh.title} numberOfLines={1}>Hi, {firstName} 👋</Text>
      </View>
      <TouchableOpacity
        style={[hh.icon, { backgroundColor: accent + '18' }]}
        activeOpacity={0.8}
        onPress={() => router.push('/profile' as any)}
      >
        <Ionicons name="person-outline" size={20} color={TP} />
      </TouchableOpacity>
    </View>
  )
}

const hh = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 18, borderBottomWidth: 1, gap: 10 },
  left:  { flex: 1 },
  sub:   { fontSize: 11, color: TS, fontWeight: '600', letterSpacing: 0.3, marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '800', color: TP, letterSpacing: -0.4 },
  icon:  { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
})

function BoatStatsCard({ accent }: { accent: string }) {
  return (
    <View style={[sc.card, { backgroundColor: accent }]}>
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
  left:             { flex: 1.1, justifyContent: 'space-between' },
  leftTop:          { flex: 1, justifyContent: 'center', gap: 2 },
  leftBot:          { flex: 1, justifyContent: 'center', gap: 2 },
  leftLabel:        { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  leftBig:          { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5, lineHeight: 26 },
  leftGrowth:       { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  divider:          { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 8 },
  right:            { flex: 0.9, justifyContent: 'space-between' },
  rightRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 },
  rightDivider:     { height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  rightLabel:       { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '500', flex: 1 },
  rightVal:         { fontSize: 13, color: '#fff', fontWeight: '700', textAlign: 'right' },
  rightValHighlight:{ color: '#FFD166', fontWeight: '800' },
})

function QuickActionsGrid({ actions, accent, singleRow = false }: {
  actions: { icon: string; label: string; onPress: () => void }[]
  accent: string
  singleRow?: boolean
}) {
  return (
    <View style={qa.wrap}>
      <Text style={[qa.title, { color: accent }]}>QUICK ACTIONS</Text>
      <View style={[qa.grid, singleRow && qa.gridSingleRow]}>
        {actions.map((a, i) => (
          <TouchableOpacity
            key={i}
            style={[qa.cell, singleRow ? qa.cellSingleRow : qa.cellRegular]}
            onPress={a.onPress}
            activeOpacity={0.75}
          >
            <View style={[qa.iconWrap, { backgroundColor: accent + '18' }]}>
              <Ionicons name={a.icon as keyof typeof Ionicons.glyphMap} size={26} color={accent} />
            </View>
            <Text style={qa.label}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const qa = StyleSheet.create({
  wrap:          { marginHorizontal: 16, marginTop: 20 },
  title:         { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10, color: TM },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridSingleRow: { flexWrap: 'nowrap' },
  cell:          { backgroundColor: SURF, borderRadius: 14, borderWidth: 1, borderColor: BOR, padding: 14, alignItems: 'center', gap: 8 },
  cellRegular:   { width: '47%' },
  cellSingleRow: { flex: 1, minWidth: 0 },
  iconWrap:      { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  label:         { fontSize: 13, fontWeight: '700', color: TP, textAlign: 'center', lineHeight: 18 },
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
      <Text style={{ fontSize: 20, color: accent }}>›</Text>
    </TouchableOpacity>
  )
}

const op = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 12, margin: 16, padding: 16, borderRadius: 14, borderWidth: 1 },
  title: { fontSize: 14, fontWeight: '800' },
  sub:   { fontSize: 12, color: TS, marginTop: 2, lineHeight: 17 },
})

const bl = StyleSheet.create({
  wrap:   { marginHorizontal: 16, marginTop: 20, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title:  { fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  link:   { fontSize: 12, fontWeight: '700' },
  list:   { gap: 12 },
})

// ─── Boat card styles ─────────────────────────────────────────────────────────
const bcard = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: SURF,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  accentBar: { width: 4 },
  inner:     { flex: 1, padding: 14, gap: 10 },

  topRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap:  { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(8,145,178,0.15)', alignItems: 'center', justifyContent: 'center' },
  icon:      { fontSize: 26 },
  info:      { flex: 1, gap: 1 },
  name:      { fontSize: 17, fontWeight: '800', color: TP, letterSpacing: -0.3 },
  gujName:   { fontSize: 15, fontWeight: '700', color: TP, opacity: 0.85 },
  badge:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  badgeDot:  { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '800' },

  metaInfoRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaInfoLeft:  { gap: 3 },
  reg:           { fontSize: 12, color: TEAL, fontWeight: '700', fontFamily: 'monospace' },
  ownerRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  owner:         { fontSize: 12, color: TS, fontWeight: '600' },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#1E2D3D' },
  locationText:  { fontSize: 13, fontWeight: '800', color: TP, letterSpacing: 0.2 },

  lastTripRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaDate:    { fontSize: 11, color: TM, fontWeight: '500' },

  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 5, backgroundColor: ELEV, borderRadius: 10, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  actionLabel:  { fontSize: 12, fontWeight: '700', color: TS },
  alertDot: {
    position: 'absolute', top: -4, right: -6,
    minWidth: 14, height: 14, borderRadius: 7,
    backgroundColor: AMBER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2,
  },
  alertDotText: { fontSize: 9, fontWeight: '800', color: '#000' },
  detailBtn: {
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1,
  },
  detailText: { fontSize: 12, fontWeight: '800' },
})

// ─── Base styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: BG },
  scroll:        { flex: 1 },
  scrollContent: {},
  center:        { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  loadTxt:       { color: TS, fontSize: 14 },
  errTxt:        { color: TS, fontSize: 14, textAlign: 'center' },
  retryBtn:      { backgroundColor: TEAL, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryTxt:      { color: '#fff', fontWeight: '700', fontSize: 15 },
})