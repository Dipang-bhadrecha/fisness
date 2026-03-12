/**
 * components/shared/EntitySwitcher.tsx
 *
 * Appears at the top of every dashboard home screen.
 * Shows the current entity name + chevron.
 * Tap → opens bottom sheet with all entities listed.
 * Tap any entity → setActiveEntity + route to that dashboard.
 *
 * Usage:
 *   <EntitySwitcher />
 *   Place inside any dashboard home screen's header area.
 */

import { router } from 'expo-router'
import React, { useState } from 'react'
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
import {
    DASHBOARD_ROUTES,
    ENTITY_EMOJIS,
    Entity,
    useEntityStore,
} from '../../store/entityStore'

function routeToDashboard(entity: Entity) {
  const route = DASHBOARD_ROUTES[entity.type]
  router.replace(route as any)
}

export function EntitySwitcher() {
  const { activeEntity, entities, setActiveEntity } = useEntityStore()
  const [sheetOpen, setSheetOpen] = useState(false)

  if (!activeEntity) return null

  const emoji = ENTITY_EMOJIS[activeEntity.type]
  const hasMultiple = entities.length > 1

  const handleSwitch = (entity: Entity) => {
    setSheetOpen(false)
    if (entity.id === activeEntity.id) return
    setActiveEntity(entity)
    // Small delay so modal closes before navigation
    setTimeout(() => routeToDashboard(entity), 150)
  }

  return (
    <>
      {/* ── Trigger Button ─────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[s.trigger, { borderColor: activeEntity.accent + '40' }]}
        onPress={() => hasMultiple && setSheetOpen(true)}
        activeOpacity={hasMultiple ? 0.75 : 1}
      >
        <View style={[s.triggerIcon, { backgroundColor: activeEntity.accent + '18' }]}>
          <Text style={s.triggerEmoji}>{emoji}</Text>
        </View>
        <View style={s.triggerText}>
          <Text style={[s.triggerLabel, { color: activeEntity.accent }]} numberOfLines={1}>
            {activeEntity.label}
          </Text>
          <Text style={s.triggerSub} numberOfLines={1}>{activeEntity.sublabel}</Text>
        </View>
        {hasMultiple && (
          <Text style={[s.chevron, { color: activeEntity.accent }]}>⌄</Text>
        )}
      </TouchableOpacity>

      {/* ── Bottom Sheet Modal ─────────────────────────────────────────────── */}
      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetOpen(false)}
      >
        <TouchableOpacity
          style={s.overlay}
          activeOpacity={1}
          onPress={() => setSheetOpen(false)}
        />
        <View style={s.sheet}>
          <SafeAreaView edges={['bottom']}>

            {/* Sheet Handle */}
            <View style={s.handle} />

            {/* Sheet Header */}
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Switch Context</Text>
              <TouchableOpacity onPress={() => setSheetOpen(false)} style={s.closeBtn}>
                <Text style={s.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Entity List */}
            <ScrollView contentContainerStyle={s.sheetList}>
              {entities.map((entity) => {
                const isActive = entity.id === activeEntity.id
                const emojiFor = ENTITY_EMOJIS[entity.type]

                return (
                  <TouchableOpacity
                    key={entity.id}
                    style={[
                      s.sheetCard,
                      isActive && s.sheetCardActive,
                      isActive && { borderColor: entity.accent },
                    ]}
                    onPress={() => handleSwitch(entity)}
                    activeOpacity={0.8}
                  >
                    <View style={[s.sheetIcon, { backgroundColor: entity.accent + '18' }]}>
                      <Text style={s.sheetEmoji}>{emojiFor}</Text>
                    </View>
                    <View style={s.sheetText}>
                      <Text style={s.sheetEntityLabel}>{entity.label}</Text>
                      <Text style={s.sheetEntitySub}>{entity.sublabel}</Text>
                    </View>
                    <View style={[s.sheetRoleBadge, {
                      backgroundColor: entity.role === 'owner' ? '#22c55e18' : '#0891b218',
                    }]}>
                      <Text style={[s.sheetRoleText, {
                        color: entity.role === 'owner' ? '#059669' : '#0891b2',
                      }]}>
                        {entity.role === 'owner' ? 'Owner' : 'Manager'}
                      </Text>
                    </View>
                    {isActive && (
                      <Text style={[s.activeCheck, { color: entity.accent }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

          </SafeAreaView>
        </View>
      </Modal>
    </>
  )
}

const s = StyleSheet.create({
  // ── Trigger ─────────────────────────────────────────────────────────────────
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    flex: 1,
  },
  triggerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerEmoji: { fontSize: 18 },
  triggerText: { flex: 1 },
  triggerLabel: { fontSize: 14, fontWeight: '800' },
  triggerSub: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 1 },
  chevron: { fontSize: 18, fontWeight: '700' },

  // ── Modal Overlay ────────────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  // ── Bottom Sheet ─────────────────────────────────────────────────────────────
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    maxHeight: '75%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '700' },

  sheetList: { padding: 16, gap: 10 },

  sheetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: 14,
    gap: 12,
  },
  sheetCardActive: {
    backgroundColor: theme.colors.surface,
  },
  sheetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetEmoji: { fontSize: 20 },
  sheetText: { flex: 1 },
  sheetEntityLabel: { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary },
  sheetEntitySub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  sheetRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sheetRoleText: { fontSize: 10, fontWeight: '700' },
  activeCheck: { fontSize: 18, fontWeight: '800' },
})