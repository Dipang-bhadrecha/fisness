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
    padding: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'flex-start',
  },
  column: {
    width: 52,
    alignItems: 'center',
  },
  deckHeader: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
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
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  cellCustom: {
    color: theme.colors.pause,   // yellow — shows this is non-standard weight
    fontWeight: '800',
  },
  cellTappable: {
    width: 48,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}22`,
    borderRadius: 4,
  },
  cellTappableText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  cellEmpty: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textDisabled,
  },
  deckTotal: {
    marginTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary,
    width: 48,
    alignItems: 'center',
    paddingTop: 4,
  },
  deckTotalText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // Modal styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#f5f0e8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: -6,
  },
  displayBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e0d8cc',
    justifyContent: 'center',
  },
  displayNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  displayUnit: {
    fontSize: 18,
    color: '#888',
    fontWeight: '600',
  },
  numpad: {
    gap: 8,
  },
  numRow: {
    flexDirection: 'row',
    gap: 8,
  },
  key: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e8e0d0',
    minHeight: 60,
  },
  keyEnter: {
    backgroundColor: '#1c1408',
    borderColor: '#1c1408',
  },
  keyBack: {
    backgroundColor: '#ede8df',
    borderColor: '#ddd5c8',
  },
  keyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  keyTextEnter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  keyTextBack: {
    color: '#555',
    fontSize: 20,
  },
})