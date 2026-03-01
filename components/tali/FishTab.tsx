import React from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native'
import { theme } from '../../constants/theme'
import { FishCategory } from '../../types'

interface FishTabProps {
  categories: FishCategory[]
  activeFishId: string
  onSelect: (fishId: string) => void
  onDelete?: (fishId: string) => void
  onAdd: () => void
  totalKgMap: Record<string, number>
}

export function FishTab({
  categories,
  activeFishId,
  onSelect,
  onDelete,
  onAdd,
  totalKgMap,
}: FishTabProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {categories.map((fish) => {
        const isActive = fish.id === activeFishId
        const totalKg = totalKgMap[fish.id] ?? 0

        return (
          <TouchableOpacity
            key={fish.id}
            onPress={() => onSelect(fish.id)}
            onLongPress={() => {
              if (categories.length <= 1) return
              onDelete?.(fish.id)
            }}
            delayLongPress={500}
            activeOpacity={0.75}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.tabEnglish, isActive && styles.tabEnglishActive]}>
              {fish.name}
            </Text>
            <Text style={[styles.tabName, isActive && styles.tabNameActive]}>
              {fish.nameGujarati}
            </Text>
            <Text style={[styles.tabKg, isActive && styles.tabKgActive]}>
              {totalKg > 0 ? `${totalKg.toFixed(1)}kg` : '—'}
            </Text>
          </TouchableOpacity>
        )
      })}

      {/* + Add button always at the end */}
      <TouchableOpacity onPress={onAdd} style={styles.addTab}>
        <Text style={styles.addTabIcon}>+</Text>
      </TouchableOpacity>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flexShrink: 0,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    maxHeight: 70,
  },
  container: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    gap: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    minWidth: 72,
    backgroundColor: theme.colors.elevated,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabEnglish: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textDisabled,
  },
  tabEnglishActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  tabName: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabNameActive: {
    color: theme.colors.textPrimary,
  },
  tabKg: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textDisabled,
    marginTop: 2,
  },
  tabKgActive: {
    color: theme.colors.textPrimary,
  },
  addTab: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  addTabIcon: {
    fontSize: 22,
    color: theme.colors.textSecondary,
    fontWeight: '300',
  },
})