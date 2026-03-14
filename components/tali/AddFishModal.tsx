/**
 * components/tali/AddFishModal.tsx
 *
 * Fish selection bottom sheet.
 * - NO images, NO emoji, NO kg
 * - Shows English name + Gujarati name only
 * - Full fish list from FISH_CATEGORIES with group filter tabs
 */

import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { FISH_CATEGORIES, FISH_GROUPS } from '../../constants/fishTypes'
import { theme } from '../../constants/theme'
import { useLanguage } from '../../hooks/useLanguage'
import { FishCategory } from '../../types'

interface AddFishModalProps {
  visible: boolean
  onClose: () => void
  onAddFish: (fish: FishCategory) => void
  alreadyAddedIds: string[]
}

function FishCard({ fish, onPress }: { fish: FishCategory; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.fishCard}>
      <Text style={styles.fishName} numberOfLines={1}>{fish.name}</Text>
      <Text style={styles.fishGuj} numberOfLines={1}>{fish.nameGujarati}</Text>
    </TouchableOpacity>
  )
}

export function AddFishModal({
  visible,
  onClose,
  onAddFish,
  alreadyAddedIds,
}: AddFishModalProps) {
  const { t } = useLanguage()
  const [search, setSearch]           = useState('')
  const [customName, setCustomName]   = useState('')
  const [activeGroup, setActiveGroup] = useState<string>('all')
  const translateY = useSharedValue(0)

  const filtered = FISH_CATEGORIES.filter((f) => {
    if (alreadyAddedIds.includes(f.id)) return false
    const matchGroup =
      activeGroup === 'all' ||
      (FISH_GROUPS.find(g => g.id === activeGroup)?.ids.includes(f.id) ?? false)
    const q = search.toLowerCase()
    const matchSearch =
      q === '' ||
      f.name.toLowerCase().includes(q) ||
      f.nameGujarati.includes(search)
    return matchGroup && matchSearch
  })

  const handleClose = () => {
    translateY.value = withSpring(0)
    setSearch('')
    setActiveGroup('all')
    onClose()
  }

  const handleSelect = (fish: FishCategory) => {
    onAddFish(fish)
    setSearch('')
    setActiveGroup('all')
    onClose()
  }

  const handleCustomAdd = () => {
    const trimmed = customName.trim()
    if (!trimmed) return
    const custom: FishCategory = {
      id: `custom_${trimmed.toLowerCase().replace(/\s+/g, '_')}`,
      name: trimmed,
      nameGujarati: trimmed,
      bucketWeight: 25,
    }
    onAddFish(custom)
    setCustomName('')
    onClose()
  }

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) translateY.value = e.translationY
    })
    .onEnd((e) => {
      if (e.translationY > 80) runOnJS(handleClose)()
      else translateY.value = withSpring(0)
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View style={[styles.sheet, animatedStyle]}>

                <GestureDetector gesture={panGesture}>
                  <View style={styles.handleArea}>
                    <View style={styles.handle} />
                  </View>
                </GestureDetector>

                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                  <Text style={styles.title}>{t.tali.addFishTitle}</Text>
                  <Text style={styles.subtitle}>Select a fish or enter a custom name</Text>

                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    placeholderTextColor={theme.colors.textDisabled}
                    value={search}
                    onChangeText={v => { setSearch(v); setActiveGroup('all') }}
                  />

                  {search === '' && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.groupRow}
                    >
                      <TouchableOpacity
                        style={[styles.groupChip, activeGroup === 'all' && styles.groupChipActive]}
                        onPress={() => setActiveGroup('all')}
                      >
                        <Text style={[styles.groupText, activeGroup === 'all' && styles.groupTextActive]}>
                          All
                        </Text>
                      </TouchableOpacity>
                      {FISH_GROUPS.map(g => (
                        <TouchableOpacity
                          key={g.id}
                          style={[styles.groupChip, activeGroup === g.id && styles.groupChipActive]}
                          onPress={() => setActiveGroup(g.id)}
                        >
                          <Text style={styles.groupEmoji}>{g.emoji}</Text>
                          <Text style={[styles.groupText, activeGroup === g.id && styles.groupTextActive]}>
                            {g.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}

                  <ScrollView
                    style={styles.grid}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {filtered.length === 0 ? (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                          {search ? `No fish found for "${search}"` : 'No more fish to add'}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.gridInner}>
                        {filtered.map((fish) => (
                          <FishCard
                            key={fish.id}
                            fish={fish}
                            onPress={() => handleSelect(fish)}
                          />
                        ))}
                      </View>
                    )}
                    <View style={{ height: 8 }} />
                  </ScrollView>

                  <View style={styles.customRow}>
                    <TextInput
                      style={styles.customInput}
                      placeholder="Enter custom fish name..."
                      placeholderTextColor={theme.colors.textDisabled}
                      value={customName}
                      onChangeText={setCustomName}
                      returnKeyType="done"
                      onSubmitEditing={handleCustomAdd}
                    />
                    <TouchableOpacity
                      style={[styles.addBtn, !customName.trim() && styles.addBtnDisabled]}
                      onPress={handleCustomAdd}
                      disabled={!customName.trim()}
                    >
                      <Text style={styles.addBtnText}>{t.tali.addBtn}</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                    <Text style={styles.cancelText}>{t.common.cancel}</Text>
                  </TouchableOpacity>

                </KeyboardAvoidingView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </GestureHandlerRootView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '92%',
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.borderStrong,
    borderRadius: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 14,
  },
  searchInput: {
    backgroundColor: theme.colors.elevated,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  groupRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 2,
  },
  groupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.colors.elevated,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  groupChipActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  groupEmoji: {
    fontSize: 13,
  },
  groupText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  groupTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  grid: {
    maxHeight: 280,
  },
  gridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fishCard: {
    width: '30%',
    backgroundColor: theme.colors.elevated,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fishName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  fishGuj: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textDisabled,
    textAlign: 'center',
  },
  customRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    backgroundColor: theme.colors.elevated,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 48,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: theme.colors.textInverse,
    fontWeight: '800',
    fontSize: 15,
  },
  cancelBtn: {
    marginTop: 10,
    alignItems: 'center',
    padding: 14,
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textInverse,
  },
})