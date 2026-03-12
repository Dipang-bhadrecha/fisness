/**
 * app/(dashboard)/index.tsx — Smart Dashboard Entry
 *
 * This screen runs after login for ALL returning users.
 * It replaces the hardcoded `/(owner)/home` redirect.
 *
 * Logic:
 *   1. Load entities from backend via entityStore.loadEntities()
 *   2. If exactly 1 entity → skip My Businesses, route straight to dashboard
 *   3. If 2+ entities → show "My Businesses" picker screen
 *   4. On entity select → route to that entity's dashboard
 *
 * This is the ONLY routing decision point. All other dashboards just render.
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
import { theme } from '../../constants/theme'
import { useAuthStore } from '../../store/authStore'
import {
    DASHBOARD_ROUTES,
    ENTITY_EMOJIS,
    Entity,
    useEntityStore,
} from '../../store/entityStore'

// ─── Route helper ─────────────────────────────────────────────────────────────

function routeToDashboard(entity: Entity) {
  const route = DASHBOARD_ROUTES[entity.type]
  router.replace(route as any)
}

// ─── Entity Card ──────────────────────────────────────────────────────────────

function EntityCard({
  entity,
  onPress,
}: {
  entity: Entity
  onPress: () => void
}) {
  const emoji = ENTITY_EMOJIS[entity.type]

  return (
    <TouchableOpacity style={s.entityCard} onPress={onPress} activeOpacity={0.8}>
      {/* Accent bar */}
      <View style={[s.accentBar, { backgroundColor: entity.accent }]} />

      <View style={s.entityCardInner}>
        {/* Icon */}
        <View style={[s.entityIconWrap, { backgroundColor: entity.accent + '18' }]}>
          <Text style={s.entityEmoji}>{emoji}</Text>
        </View>

        {/* Text */}
        <View style={s.entityText}>
          <Text style={s.entityLabel}>{entity.label}</Text>
          <Text style={s.entitySublabel}>{entity.sublabel}</Text>
        </View>

        {/* Role badge */}
        <View style={[s.roleBadge, {
          backgroundColor: entity.role === 'owner' ? '#22c55e18' : '#0891b218',
        }]}>
          <Text style={[s.roleText, {
            color: entity.role === 'owner' ? '#059669' : '#0891b2',
          }]}>
            {entity.role === 'owner' ? 'Owner' : 'Manager'}
          </Text>
        </View>

        {/* Arrow */}
        <Text style={[s.entityArrow, { color: entity.accent }]}>→</Text>
      </View>
    </TouchableOpacity>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DashboardEntryScreen() {
  const { token } = useAuthStore()
  const { entities, activeEntity, isLoaded, isLoading, loadError, loadEntities, setActiveEntity } =
    useEntityStore()

  const [hasRouted, setHasRouted] = useState(false)

  useEffect(() => {
    if (token && !isLoaded && !isLoading) {
      loadEntities(token)
    }
  }, [token])

  useEffect(() => {
    // Auto-route if exactly 1 entity — user never sees this screen
    if (isLoaded && !hasRouted && entities.length === 1) {
      setHasRouted(true)
      setActiveEntity(entities[0])
      routeToDashboard(entities[0])
    }
  }, [isLoaded, entities])

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading || (!isLoaded && !loadError)) {
    return (
      <View style={s.loadingScreen}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={s.loadingText}>Loading your workspace...</Text>
      </View>
    )
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <View style={s.loadingScreen}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <Text style={s.errorEmoji}>⚠️</Text>
        <Text style={s.errorText}>{loadError}</Text>
        <TouchableOpacity
          style={s.retryBtn}
          onPress={() => token && loadEntities(token)}
        >
          <Text style={s.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ── No entities (edge case: new user who finished setup but has nothing) ──
  if (entities.length === 0) {
    return (
      <View style={s.loadingScreen}>
        <Text style={s.errorEmoji}>🐟</Text>
        <Text style={s.errorText}>No workspace found. Please complete setup.</Text>
        <TouchableOpacity
          style={s.retryBtn}
          onPress={() => router.replace('/(setup)/role' as any)}
        >
          <Text style={s.retryBtnText}>Go to Setup</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ── Single entity: show brief splash then auto-route (handled in useEffect) ──
  if (entities.length === 1) {
    return (
      <View style={s.loadingScreen}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <Text style={s.entityRouteEmoji}>{ENTITY_EMOJIS[entities[0].type]}</Text>
        <Text style={s.entityRouteLabel}>{entities[0].label}</Text>
        <ActivityIndicator color={entities[0].accent} size="small" style={{ marginTop: 16 }} />
      </View>
    )
  }

  // ── Multi-entity: show "My Businesses" picker ───────────────────────────
  const handleEntitySelect = (entity: Entity) => {
    setActiveEntity(entity)
    routeToDashboard(entity)
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerEmoji}>🐟</Text>
          <View>
            <Text style={s.headerTitle}>My Businesses</Text>
            <Text style={s.headerSub}>Choose which context to open</Text>
          </View>
        </View>

        {/* Entity List */}
        <ScrollView
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.listHint}>
            {entities.length} workspace{entities.length > 1 ? 's' : ''} linked to your account
          </Text>

          {entities.map((entity) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              onPress={() => handleEntitySelect(entity)}
            />
          ))}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },

  loadingScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  errorEmoji: { fontSize: 48 },
  errorText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  retryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  entityRouteEmoji: { fontSize: 56 },
  entityRouteLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerEmoji: { fontSize: 36 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary },
  headerSub: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },

  list: { padding: 16, gap: 12 },
  listHint: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  entityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accentBar: { width: 5 },
  entityCardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  entityIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entityEmoji: { fontSize: 24 },
  entityText: { flex: 1 },
  entityLabel: { fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary },
  entitySublabel: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 3 },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: { fontSize: 11, fontWeight: '700' },
  entityArrow: { fontSize: 18, fontWeight: '700' },
})