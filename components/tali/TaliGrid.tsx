import React, { useState } from 'react'
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { theme } from '../../constants/theme'
import { WeightEntry } from '../../types'

interface TaliGridProps {
  entries: WeightEntry[]
  bucketWeight: number
  partialWeight: number | null
  onCustomEntry?: (weight: number) => void
}

export function TaliGrid({
  entries,
  bucketWeight,
  partialWeight,
  onCustomEntry,
}: TaliGridProps) {
  const [customModalVisible, setCustomModalVisible] = useState(false)
  const [customInput, setCustomInput] = useState('')

  // Find which deck+position is the NEXT tappable cell
  const lastDeckIndex = entries.length - 1
  const lastDeck = entries[lastDeckIndex]
  const nextCellPosition = lastDeck.counts.length // index of next empty cell in last deck

  const handleCellTap = () => {
    setCustomInput('0')
    setCustomModalVisible(true)
  }

  const handleConfirm = () => {
    const weight = parseFloat(customInput)
    if (!isNaN(weight) && weight > 0) {
      onCustomEntry?.(weight)
    }
    setCustomModalVisible(false)
    setCustomInput('')
  }

  const handleKey = (key: string) => {
    if (key === 'backspace') {
      setCustomInput((prev) =>
        prev.length > 1 ? prev.slice(0, -1) : '0'
      )
      return
    }
    if (customInput.length >= 4) return
    if (customInput === '0') {
      setCustomInput(key)
    } else {
      setCustomInput((prev) => prev + key)
    }
  }

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['backspace', '0', 'enter'],
  ]

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.container}
      >
        {entries.map((deck, deckIndex) => {
          const isLastDeck = deckIndex === lastDeckIndex

          return (
            <View key={deck.deckNumber} style={styles.column}>
              {/* Deck number header */}
              <Text style={styles.deckHeader}>{deck.deckNumber}</Text>

              {/* Filled count rows */}
              {deck.counts.map((weight, countIndex) => (
                <View key={countIndex} style={styles.cell}>
                  <Text
                    style={[
                      styles.cellText,
                      weight !== bucketWeight && styles.cellCustom,
                    ]}
                  >
                    {weight}
                  </Text>
                </View>
              ))}

              {/* Next tappable empty cell — only in last deck */}
              {isLastDeck && !deck.isComplete && (
                <TouchableOpacity
                  onPress={handleCellTap}
                  style={styles.cellTappable}
                  activeOpacity={0.6}
                >
                  <Text style={styles.cellTappableText}>+</Text>
                </TouchableOpacity>
              )}

              {/* Remaining empty dots */}
              {Array.from({
                length: Math.max(
                  0,
                  10 - deck.counts.length - (isLastDeck && !deck.isComplete ? 1 : 0)
                ),
              }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.cell}>
                  <Text style={styles.cellEmpty}>·</Text>
                </View>
              ))}

              {/* Deck total */}
              <View style={styles.deckTotal}>
                <Text style={styles.deckTotalText}>
                  {deck.counts.length > 0
                    ? deck.counts.reduce((s, c) => s + c, 0)
                    : '—'}
                </Text>
              </View>
            </View>
          )
        })}
      </ScrollView>

      {/* Custom weight numpad modal */}
      <Modal
        visible={customModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setCustomModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.sheet}
            onPress={() => { }}
          >
            <View style={styles.handle} />

            <Text style={styles.modalTitle}>વજન નાખો</Text>
            <Text style={styles.modalSub}>
              આ ટોપલી નું વજન (kg માં)
            </Text>

            {/* Display */}
            <View style={styles.displayBox}>
              <Text style={styles.displayNumber}>{customInput}</Text>
              <Text style={styles.displayUnit}>kg</Text>
            </View>

            {/* Numpad */}
            <View style={styles.numpad}>
              {keys.map((row, ri) => (
                <View key={ri} style={styles.numRow}>
                  {row.map((key) => {
                    const isEnter = key === 'enter'
                    const isBack = key === 'backspace'
                    return (
                      <TouchableOpacity
                        key={key}
                        onPress={() =>
                          isEnter ? handleConfirm() : handleKey(key)
                        }
                        activeOpacity={0.7}
                        style={[
                          styles.key,
                          isEnter && styles.keyEnter,
                          isBack && styles.keyBack,
                        ]}
                      >
                        <Text
                          style={[
                            styles.keyText,
                            isEnter && styles.keyTextEnter,
                            isBack && styles.keyTextBack,
                          ]}
                        >
                          {isEnter ? 'Enter' : isBack ? '⌫' : key}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing[3],
    flexDirection: 'row',
    gap: theme.spacing[1],
    alignItems: 'flex-start',
  },
  column: {
    width: 52,
    alignItems: 'center',
  },
  deckHeader: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing[1],
    letterSpacing: 1,
  },
  cell: {
    width: 48,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  cellText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  cellCustom: {
    color: theme.colors.gold,
    fontWeight: theme.fontWeight.bold,
  },
  cellTappable: {
    width: 48,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.sm,
  },
  cellTappableText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  cellEmpty: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
  deckTotal: {
    marginTop: theme.spacing[1],
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary,
    width: 48,
    alignItems: 'center',
    paddingTop: theme.spacing[1],
  },
  deckTotalText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },

  // ─────────────────────────────────────────────────
  // MODAL STYLES — Professional design system
  // ─────────────────────────────────────────────────

  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[8],
    gap: theme.spacing[3],
    ...theme.shadows.xl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.borderStrong,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing[2],
  },
  modalTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    fontFamily: theme.fontFamily.display,
  },
  modalSub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing[1],
    fontWeight: theme.fontWeight.regular,
  },
  displayBox: {
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  displayNumber: {
    fontSize: 48,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    fontFamily: theme.fontFamily.display,
  },
  displayUnit: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.semibold,
  },
  numpad: {
    gap: theme.spacing[2],
  },
  numRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  key: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 60,
    ...theme.shadows.sm,
  },
  keyEnter: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  keyBack: {
    backgroundColor: theme.colors.elevated,
    borderColor: theme.colors.border,
  },
  keyText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  keyTextEnter: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  keyTextBack: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xl,
  },
})