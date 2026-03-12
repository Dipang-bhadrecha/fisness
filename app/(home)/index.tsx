/**
 * app/(home)/index.tsx  — The Universal Home Screen
 *
 * Reads homeVariant + activeContext from entityStore.
 * Renders one of 6 configurations. No separate files per role.
 *
 * Variants:
 *   BOAT_OWNER               → Boat stats, blue accent
 *   COMPANY_OWNER            → Company stats, green accent
 *   BOAT_AND_COMPANY         → Context switcher: Company (default) ↔ My Boats
 *   BOAT_AND_COMPANY_MANAGER → Context switcher: My Boat ↔ Company (manager, permission-gated)
 *   BOAT_AND_BOAT_MANAGER    → Context switcher: My Boat ↔ Managed Boat (permission-gated)
 *   MANAGER_ONLY             → Manager dashboard (permission-gated or waiting screen)
 */

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
import { useAuthStore } from '../../store/authStore'
import {
    ActiveContext,
    Entity,
    HomeVariant,
    hasPerm,
    useEntityStore,
} from '../../store/entityStore'

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  bg:     '#080F1A',
  surf:   '#0D1B2E',
  elev:   '#132640',
  border: 'rgba(0,194,203,0.1)',
  tp:     '#F0F4F8',
  ts:     '#8BA3BC',
  tm:     '#3D5A73',
  BLUE:   '#1B7FBF',
  GREEN:  '#059669',
  TEAL:   '#0891b2',
  ORANGE: '#d97706',
  PURPLE: '#7c3aed',
}

// ─── Permission constants ─────────────────────────────────────────────────────
const P = {
  CREATE_TALI:          'CREATE_TALI',
  VIEW_TALI:            'VIEW_TALI',
  FILL_FISH_PRICE:      'FILL_FISH_PRICE',
  VIEW_BILL:            'VIEW_BILL',
  CREATE_BILL:          'CREATE_BILL',
  SEND_BILL:            'SEND_BILL',
  ADD_COMPANY_EXPENSE:  'ADD_COMPANY_EXPENSE',
  VIEW_COMPANY_EXPENSE: 'VIEW_COMPANY_EXPENSE',
  VIEW_EMPLOYEE_RECORDS:'VIEW_EMPLOYEE_RECORDS',
  MANAGE_EMPLOYEES:     'MANAGE_EMPLOYEES',
  VIEW_FINANCIAL_REPORT:'VIEW_FINANCIAL_REPORT',
  VIEW_MEMBERS:         'VIEW_MEMBERS',
  ADD_BOAT_EXPENSE:     'ADD_BOAT_EXPENSE',
  VIEW_BOAT_EXPENSE:    'VIEW_BOAT_EXPENSE',
}

// ─── Temp stats (replace with API calls per variant) ─────────────────────────
const BOAT_STATS = [
  { label: 'Net Profit',    value: '₹4,20,000', sub: 'this season',   emoji: '💰' },
  { label: 'Total Catch',   value: '18,400 kg', sub: 'this season',   emoji: '🐟' },
  { label: 'Total Boats',   value: '5',         sub: 'active',        emoji: '🚢' },
  { label: 'Advance Due',   value: '₹80,000',   sub: 'outstanding',   emoji: '📋' },
  { label: 'Diesel',        value: '12,400 L',  sub: 'this season',   emoji: '⛽' },
  { label: 'Maintenance',   value: '₹32,000',   sub: 'this season',   emoji: '🔧' },
]
const CO_STATS = [
  { label: 'Fish Received', value: '84,000 kg', sub: 'this season',   emoji: '🐟' },
  { label: 'Bills Generated',value: '₹62L',     sub: 'this season',   emoji: '🧾' },
  { label: 'Advance Given', value: '₹18L',      sub: 'to boat owners',emoji: '💸' },
  { label: 'Pending',       value: '3',         sub: 'sessions unpaid',emoji: '⏳' },
  { label: 'Company Exp',   value: '₹4,20,000', sub: 'this season',   emoji: '🏢' },
  { label: 'Active Boats',  value: '22',        sub: 'registered',    emoji: '⚓' },
]

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { token } = useAuthStore()
  const {
    homeVariant, activeContext, activeEntity, secondaryEntity,
    entities, isLoaded, isLoading, loadError,
    loadEntities, setActiveContext,
  } = useEntityStore()

  // Load entities on mount for returning users
  useEffect(() => {
    if (token && !isLoaded && !isLoading) loadEntities(token)
  }, [token])

  if (isLoading || !isLoaded) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.TEAL} size="large" />
        <Text style={s.loadText}>Loading your workspace…</Text>
      </View>
    )
  }

  if (loadError) {
    return (
      <View style={s.center}>
        <Text style={s.errorEmoji}>⚠️</Text>
        <Text style={s.errorText}>{loadError}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => token && loadEntities(token)}>
          <Text style={s.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const variant = homeVariant ?? 'BOAT_OWNER'

  // Does this variant need a context switcher?
  const hasSwitcher =
    variant === 'BOAT_AND_COMPANY' ||
    variant === 'BOAT_AND_COMPANY_MANAGER' ||
    variant === 'BOAT_AND_BOAT_MANAGER'

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Context Switcher ── */}
          {hasSwitcher && (
            <ContextSwitcher
              variant={variant}
              activeContext={activeContext}
              primary={activeEntity}
              secondary={secondaryEntity}
              onSwitch={setActiveContext}
            />
          )}

          {/* ── Render the correct variant ── */}
          <VariantContent
            variant={variant}
            activeContext={activeContext}
            primary={activeEntity}
            secondary={secondaryEntity}
          />

        </ScrollView>
      </SafeAreaView>
    </>
  )
}

// ─── Context Switcher Pill ────────────────────────────────────────────────────
function ContextSwitcher({
  variant,
  activeContext,
  primary,
  secondary,
  onSwitch,
}: {
  variant: HomeVariant
  activeContext: ActiveContext
  primary: Entity | null
  secondary: Entity | null
  onSwitch: (ctx: ActiveContext) => void
}) {
  const isPrimary = activeContext === 'primary'

  // Label helpers
  const primaryLabel =
    variant === 'BOAT_AND_COMPANY'
      ? (primary?.companyName ?? 'Company')
      : 'My Boat'

  const secondaryLabel =
    variant === 'BOAT_AND_COMPANY'
      ? 'My Boats'
      : variant === 'BOAT_AND_COMPANY_MANAGER'
      ? (secondary?.companyName ?? 'Company')
      : (secondary?.boatName ?? secondary?.label ?? 'Managed Boat')

  const activeAccent = isPrimary
    ? (primary?.accent ?? C.BLUE)
    : (secondary?.accent ?? C.TEAL)

  return (
    <View style={sw.pill}>
      <TouchableOpacity
        style={[sw.tab, isPrimary && [sw.tabActive, { backgroundColor: activeAccent + '22', borderColor: activeAccent }]]}
        onPress={() => onSwitch('primary')}
      >
        <Text style={[sw.tabText, isPrimary && { color: activeAccent, fontWeight: '800' }]}>
          {primaryLabel}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[sw.tab, !isPrimary && [sw.tabActive, { backgroundColor: activeAccent + '22', borderColor: activeAccent }]]}
        onPress={() => onSwitch('secondary')}
      >
        <Text style={[sw.tabText, !isPrimary && { color: activeAccent, fontWeight: '800' }]}>
          {secondaryLabel}
        </Text>
        {/* Manager badge */}
        {(variant === 'BOAT_AND_COMPANY_MANAGER' || variant === 'BOAT_AND_BOAT_MANAGER') && (
          <View style={sw.badge}><Text style={sw.badgeText}>MGR</Text></View>
        )}
      </TouchableOpacity>
    </View>
  )
}

const sw = StyleSheet.create({
  pill: {
    flexDirection: 'row', backgroundColor: C.surf,
    borderRadius: 14, borderWidth: 1, borderColor: C.border,
    padding: 4, marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    gap: 4,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 6,
    borderWidth: 1, borderColor: 'transparent',
  },
  tabActive: {},
  tabText: { fontSize: 14, fontWeight: '600', color: C.ts },
  badge: {
    backgroundColor: C.TEAL + '30', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: C.TEAL, letterSpacing: 0.5 },
})

// ─── Variant Content Router ───────────────────────────────────────────────────
function VariantContent({
  variant,
  activeContext,
  primary,
  secondary,
}: {
  variant: HomeVariant
  activeContext: ActiveContext
  primary: Entity | null
  secondary: Entity | null
}) {
  const ctx = activeContext === 'primary' ? primary : secondary

  switch (variant) {
    case 'BOAT_OWNER':
      return <BoatOwnerHome entity={primary} />

    case 'COMPANY_OWNER':
      return <CompanyOwnerHome entity={primary} />

    case 'BOAT_AND_COMPANY':
      // Primary = company (default), secondary = my boats
      return activeContext === 'primary'
        ? <CompanyOwnerHome entity={primary} />
        : <BoatOwnerHome entity={secondary} />

    case 'BOAT_AND_COMPANY_MANAGER':
      // Primary = my boat, secondary = managed company
      return activeContext === 'primary'
        ? <BoatOwnerHome entity={primary} />
        : <ManagerHome entity={secondary} managerType="company" />

    case 'BOAT_AND_BOAT_MANAGER':
      // Primary = my boat, secondary = managed boat
      return activeContext === 'primary'
        ? <BoatOwnerHome entity={primary} />
        : <ManagerHome entity={secondary} managerType="boat" />

    case 'MANAGER_ONLY':
      return <ManagerOnlyHome primary={primary} secondary={secondary} />

    default:
      return <BoatOwnerHome entity={primary} />
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 1 — BOAT OWNER
// ═══════════════════════════════════════════════════════════════════════════════
function BoatOwnerHome({ entity }: { entity: Entity | null }) {
  const accent = entity?.accent ?? C.BLUE

  return (
    <View style={s.variantWrap}>
      <HomeHeader
        title={entity?.label ?? 'My Fleet'}
        subtitle="Boat Owner · Personal"
        accent={accent}
        emoji="🚢"
      />

      <StatsGrid stats={BOAT_STATS} accent={accent} />

      <QuickActionsGrid
        accent={accent}
        actions={[
          { emoji: '⚓', label: 'Add Tali',    onPress: () => router.push('/tali' as any) },
          { emoji: '💸', label: 'Add Expense', onPress: () => router.push('/kharchi' as any) },
          { emoji: '👥', label: 'Add Kharchi', onPress: () => router.push('/crew' as any) },
          { emoji: '➕', label: 'More',        onPress: () => {} },
        ]}
      />

      <ManageSection
        accent={accent}
        rows={[
          { emoji: '📅', label: 'Trips',  sub: 'All your boat trips',   onPress: () => router.push('/trips' as any) },
          { emoji: '🚢', label: 'Boats',  sub: 'Fleet & maintenance',   onPress: () => router.push('/boats' as any) },
          { emoji: '👥', label: 'Crew',   sub: 'Members & kharchi',     onPress: () => router.push('/crew' as any) },
          { emoji: '📒', label: 'Ledger', sub: 'Income & expenses',     onPress: () => router.push('/ledger' as any) },
        ]}
      />
    </View>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 2 — COMPANY OWNER
// ═══════════════════════════════════════════════════════════════════════════════
function CompanyOwnerHome({ entity }: { entity: Entity | null }) {
  const accent = entity?.accent ?? C.GREEN
  const name   = entity?.companyName ?? entity?.label ?? 'My Company'

  return (
    <View style={s.variantWrap}>
      <HomeHeader
        title={name}
        subtitle="Company Owner · Dango"
        accent={accent}
        emoji="🏢"
      />

      <StatsGrid stats={CO_STATS} accent={accent} />

      <QuickActionsGrid
        accent={accent}
        actions={[
          { emoji: '⚓', label: 'New Tali',    onPress: () => router.push('/tali' as any) },
          { emoji: '🏷️', label: 'Fill Price',  onPress: () => {} },
          { emoji: '💸', label: 'Add Expense', onPress: () => {} },
          { emoji: '📤', label: 'Send Bill',   onPress: () => {} },
        ]}
      />

      <ManageSection
        accent={accent}
        rows={[
          { emoji: '📋', label: 'Sessions',         sub: 'All tali sessions',       onPress: () => {} },
          { emoji: '🧾', label: 'Bills',             sub: 'Generated & sent',        onPress: () => {} },
          { emoji: '⚓', label: 'Registered Boats',  sub: 'Boats at your company',   onPress: () => {} },
          { emoji: '👥', label: 'Employees',         sub: 'Staff & permissions',     onPress: () => router.push('/access' as any) },
        ]}
      />
    </View>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANTS 4 & 5 — MANAGER (Company or Boat)
// ═══════════════════════════════════════════════════════════════════════════════
function ManagerHome({
  entity,
  managerType,
}: {
  entity: Entity | null
  managerType: 'company' | 'boat'
}) {
  const accent = entity?.accent ?? (managerType === 'company' ? C.TEAL : C.ORANGE)
  const name   = entity?.companyName ?? entity?.boatName ?? entity?.label ?? 'My Workspace'

  const can = (perm: string) => hasPerm(entity, perm)

  // Build permitted quick actions
  const actions = []
  if (can(P.CREATE_TALI))
    actions.push({ emoji: '⚓', label: 'Add Tali',    onPress: () => router.push('/tali' as any) })
  if (can(P.FILL_FISH_PRICE))
    actions.push({ emoji: '🏷️', label: 'Fill Price',  onPress: () => {} })
  if (can(P.ADD_COMPANY_EXPENSE) || can(P.ADD_BOAT_EXPENSE))
    actions.push({ emoji: '💸', label: 'Add Expense', onPress: () => {} })
  if (can(P.SEND_BILL))
    actions.push({ emoji: '📤', label: 'Send Bill',   onPress: () => {} })

  // Build permitted manage rows
  const rows = []
  if (can(P.VIEW_TALI))
    rows.push({ emoji: '📋', label: 'Sessions',   sub: 'Tali sessions',        onPress: () => {} })
  if (can(P.VIEW_BILL))
    rows.push({ emoji: '🧾', label: 'Bills',      sub: 'Bills & receipts',     onPress: () => {} })
  if (can(P.VIEW_EMPLOYEE_RECORDS))
    rows.push({ emoji: '👥', label: 'Employees',  sub: 'Staff records',        onPress: () => router.push('/access' as any) })
  if (can(P.VIEW_COMPANY_EXPENSE) || can(P.VIEW_BOAT_EXPENSE))
    rows.push({ emoji: '💰', label: 'Expenses',   sub: 'Expense records',      onPress: () => {} })

  const hasNothing = actions.length === 0 && rows.length === 0

  return (
    <View style={s.variantWrap}>
      {/* Manager header card */}
      <View style={[s.mgrCard, { borderColor: accent + '30' }]}>
        <View style={[s.mgrBadge, { backgroundColor: accent + '18' }]}>
          <Text style={[s.mgrBadgeText, { color: accent }]}>
            {managerType === 'company' ? '👔 COMPANY MANAGER' : '⚓ BOAT MANAGER'}
          </Text>
        </View>
        <Text style={s.mgrName}>{name}</Text>
        {entity?.ownerName && (
          <Text style={s.mgrOwner}>Owner: {entity.ownerName}</Text>
        )}
        <Text style={s.mgrNote}>Your access is set by the owner</Text>
      </View>

      {/* Permission chips */}
      {entity && entity.permissions.length > 0 && (
        <View style={s.permRow}>
          {entity.permissions.slice(0, 5).map(p => (
            <View key={p} style={[s.permChip, { borderColor: accent + '40', backgroundColor: accent + '12' }]}>
              <Text style={[s.permChipText, { color: accent }]}>✓ {p.replace(/_/g, ' ')}</Text>
            </View>
          ))}
        </View>
      )}

      {hasNothing ? (
        <View style={s.noPermsBox}>
          <Text style={s.noPermsEmoji}>🔒</Text>
          <Text style={s.noPermsTitle}>No permissions granted yet</Text>
          <Text style={s.noPermsSub}>Ask your owner to grant you access from their Settings → Access.</Text>
        </View>
      ) : (
        <>
          {actions.length > 0 && (
            <QuickActionsGrid accent={accent} actions={actions} />
          )}
          {rows.length > 0 && (
            <ManageSection accent={accent} rows={rows} />
          )}
        </>
      )}
    </View>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 6 — MANAGER ONLY (no ownership)
// ═══════════════════════════════════════════════════════════════════════════════
function ManagerOnlyHome({
  primary,
  secondary,
}: {
  primary: Entity | null
  secondary: Entity | null
}) {
  const { activeContext, setActiveContext } = useEntityStore()

  // Only one entity
  if (!secondary) {
    // Waiting state
    if (!primary || (primary.permissions.length === 0 && primary.id.includes('pending'))) {
      return (
        <View style={s.variantWrap}>
          <View style={s.waitBox}>
            <Text style={s.waitEmoji}>⏳</Text>
            <Text style={s.waitTitle}>Waiting for your owner</Text>
            <Text style={s.waitSub}>
              Once your owner adds you from their Access Management screen, your dashboard will appear here.
            </Text>
            <View style={[s.waitHint, { borderColor: C.TEAL + '30' }]}>
              <Text style={s.waitHintText}>
                Tell your owner: Settings → Access → Add Member → your phone number
              </Text>
            </View>
          </View>
        </View>
      )
    }
    // Single manager context
    return (
      <ManagerHome
        entity={primary}
        managerType={primary.type === 'MANAGER_BOAT' ? 'boat' : 'company'}
      />
    )
  }

  // Two manager contexts — show mini switcher
  return (
    <View style={s.variantWrap}>
      {/* Mini context tabs */}
      <View style={sw.pill}>
        <TouchableOpacity
          style={[sw.tab, activeContext === 'primary' && [sw.tabActive, { backgroundColor: primary!.accent + '20', borderColor: primary!.accent }]]}
          onPress={() => setActiveContext('primary')}
        >
          <Text style={[sw.tabText, activeContext === 'primary' && { color: primary!.accent, fontWeight: '800' }]}>
            {primary?.type === 'MANAGER_BOAT' ? primary.boatName ?? 'Boat' : primary?.companyName ?? 'Company'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[sw.tab, activeContext === 'secondary' && [sw.tabActive, { backgroundColor: secondary.accent + '20', borderColor: secondary.accent }]]}
          onPress={() => setActiveContext('secondary')}
        >
          <Text style={[sw.tabText, activeContext === 'secondary' && { color: secondary.accent, fontWeight: '800' }]}>
            {secondary.type === 'MANAGER_BOAT' ? secondary.boatName ?? 'Boat' : secondary.companyName ?? 'Company'}
          </Text>
        </TouchableOpacity>
      </View>

      {activeContext === 'primary'
        ? <ManagerHome entity={primary} managerType={primary?.type === 'MANAGER_BOAT' ? 'boat' : 'company'} />
        : <ManagerHome entity={secondary} managerType={secondary.type === 'MANAGER_BOAT' ? 'boat' : 'company'} />
      }
    </View>
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
      <View style={[hh.iconBox, { backgroundColor: accent + '18' }]}>
        <Text style={hh.icon}>{emoji}</Text>
      </View>
      <TouchableOpacity
        style={hh.profileBtn}
        onPress={() => router.push('/profile' as any)}
      >
        <Text style={hh.profileIcon}>👤</Text>
      </TouchableOpacity>
    </View>
  )
}
const hh = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 18,
    borderBottomWidth: 1, gap: 10,
  },
  left:  { flex: 1 },
  sub:   { fontSize: 11, color: C.ts, fontWeight: '600', letterSpacing: 0.3, marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '800', color: C.tp, letterSpacing: -0.4 },
  iconBox: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22 },
  profileBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.surf, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  profileIcon: { fontSize: 18 },
})

function StatsGrid({ stats, accent }: {
  stats: { label: string; value: string; sub: string; emoji: string }[]
  accent: string
}) {
  return (
    <View style={sg.wrap}>
      <Text style={[sg.title, { color: accent }]}>THIS SEASON</Text>
      <View style={sg.grid}>
        {stats.map(stat => (
          <View key={stat.label} style={sg.cell}>
            <Text style={sg.emoji}>{stat.emoji}</Text>
            <Text style={[sg.value, { color: accent }]}>{stat.value}</Text>
            <Text style={sg.label}>{stat.label}</Text>
            <Text style={sg.sub}>{stat.sub}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
const sg = StyleSheet.create({
  wrap:  { marginHorizontal: 16, marginTop: 16 },
  title: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  grid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell:  {
    width: '47%', backgroundColor: C.surf,
    borderRadius: 14, borderWidth: 1, borderColor: C.border,
    padding: 14, gap: 3,
  },
  emoji: { fontSize: 20, marginBottom: 2 },
  value: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  label: { fontSize: 12, fontWeight: '700', color: C.tp },
  sub:   { fontSize: 11, color: C.ts },
})

function QuickActionsGrid({ actions, accent }: {
  actions: { emoji: string; label: string; onPress: () => void }[]
  accent: string
}) {
  // Pad to 4 for consistent 2x2 grid
  const padded = [...actions]
  while (padded.length < 4) padded.push({ emoji: '➕', label: 'More', onPress: () => {} })
  const grid = padded.slice(0, 4)

  return (
    <View style={qa.wrap}>
      <Text style={[qa.title, { color: accent }]}>QUICK ACTIONS</Text>
      <View style={qa.grid}>
        {grid.map((a, i) => (
          <TouchableOpacity key={i} style={qa.cell} onPress={a.onPress} activeOpacity={0.75}>
            <View style={[qa.iconBox, { backgroundColor: accent + '18' }]}>
              <Text style={qa.emoji}>{a.emoji}</Text>
            </View>
            <Text style={qa.label}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
const qa = StyleSheet.create({
  wrap:    { marginHorizontal: 16, marginTop: 20 },
  title:   { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  grid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell:    {
    width: '47%', backgroundColor: C.surf,
    borderRadius: 14, borderWidth: 1, borderColor: C.border,
    padding: 16, alignItems: 'center', gap: 8,
  },
  iconBox: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  emoji:   { fontSize: 26 },
  label:   { fontSize: 13, fontWeight: '700', color: C.tp, textAlign: 'center' },
})

function ManageSection({ rows, accent }: {
  rows: { emoji: string; label: string; sub: string; onPress: () => void }[]
  accent: string
}) {
  return (
    <View style={ms.wrap}>
      <Text style={[ms.title, { color: accent }]}>MANAGE</Text>
      <View style={ms.card}>
        {rows.map((row, i) => (
          <TouchableOpacity
            key={row.label}
            style={[ms.row, i < rows.length - 1 && ms.rowBorder]}
            onPress={row.onPress}
            activeOpacity={0.75}
          >
            <View style={[ms.icon, { backgroundColor: accent + '14' }]}>
              <Text style={{ fontSize: 18 }}>{row.emoji}</Text>
            </View>
            <View style={ms.text}>
              <Text style={ms.label}>{row.label}</Text>
              <Text style={ms.sub}>{row.sub}</Text>
            </View>
            <Text style={[ms.arrow, { color: accent }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
const ms = StyleSheet.create({
  wrap:      { marginHorizontal: 16, marginTop: 20, marginBottom: 24 },
  title:     { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10, color: C.ts },
  card:      { backgroundColor: C.surf, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  row:       { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  icon:      { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  text:      { flex: 1 },
  label:     { fontSize: 15, fontWeight: '700', color: C.tp },
  sub:       { fontSize: 12, color: C.ts, marginTop: 1 },
  arrow:     { fontSize: 22, fontWeight: '300' },
})

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.bg },
  scroll:      { flexGrow: 1 },
  center:      { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  loadText:    { color: C.ts, fontSize: 14 },
  errorEmoji:  { fontSize: 40 },
  errorText:   { color: C.ts, fontSize: 14, textAlign: 'center' },
  retryBtn:    { backgroundColor: C.TEAL, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText:   { color: '#fff', fontWeight: '700', fontSize: 15 },

  variantWrap: { flex: 1 },

  // Manager card
  mgrCard: {
    margin: 16, padding: 18, backgroundColor: C.surf,
    borderRadius: 16, borderWidth: 1, gap: 6,
  },
  mgrBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 4 },
  mgrBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  mgrName:  { fontSize: 20, fontWeight: '800', color: C.tp },
  mgrOwner: { fontSize: 13, color: C.ts },
  mgrNote:  { fontSize: 12, color: C.tm, marginTop: 4, fontStyle: 'italic' },

  permRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginHorizontal: 16, marginBottom: 8 },
  permChip:     { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  permChipText: { fontSize: 10, fontWeight: '600' },

  noPermsBox:   { margin: 16, padding: 24, backgroundColor: C.surf, borderRadius: 16, alignItems: 'center', gap: 10 },
  noPermsEmoji: { fontSize: 36 },
  noPermsTitle: { fontSize: 17, fontWeight: '800', color: C.tp },
  noPermsSub:   { fontSize: 13, color: C.ts, textAlign: 'center', lineHeight: 19 },

  // Manager only waiting
  waitBox:      { margin: 24, padding: 28, backgroundColor: C.surf, borderRadius: 20, alignItems: 'center', gap: 12 },
  waitEmoji:    { fontSize: 48 },
  waitTitle:    { fontSize: 20, fontWeight: '800', color: C.tp },
  waitSub:      { fontSize: 14, color: C.ts, textAlign: 'center', lineHeight: 20 },
  waitHint:     { marginTop: 8, padding: 14, borderRadius: 12, borderWidth: 1, backgroundColor: 'rgba(8,145,178,0.07)' },
  waitHintText: { fontSize: 12, color: C.TEAL, lineHeight: 18, textAlign: 'center' },
})