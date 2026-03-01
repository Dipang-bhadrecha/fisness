import React, { useState } from 'react'
import {
    Modal,
    StyleSheet,
    Text,
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

interface BucketWeightModalProps {
  visible: boolean
  fishName: string
  fishNameGujarati: string
  defaultWeight: number
  onConfirm: (weight: number) => void
  onCancel: () => void
}

export function BucketWeightModal({
  visible,
  fishName,
  fishNameGujarati,
  defaultWeight,
  onConfirm,
  onCancel,
}: BucketWeightModalProps) {
  const [display, setDisplay] = useState('0')
  const translateY = useSharedValue(0)

  const handleKey = (key: string) => {
    if (key === 'backspace') {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1))
      } else {
        setDisplay('0')
      }
      return
    }
    if (display.length >= 4) return
    if (display === '0') {
      setDisplay(key)
    } else {
      setDisplay(display + key)
    }
  }

  const handleConfirm = () => {
    const weight = parseInt(display, 10)
    if (!weight || weight <= 0) return
    onConfirm(weight)
    setDisplay('0')
  }

  const handleCancel = () => {
    setDisplay('0')
    translateY.value = withSpring(0)
    onCancel()
  }

  // Swipe down > 80px to close
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY
      }
    })
    .onEnd((e) => {
      if (e.translationY > 80) {
        runOnJS(handleCancel)()
      } else {
        translateY.value = withSpring(0)
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['backspace', '0', 'enter'],
  ]

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Tap outside overlay to close */}
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={styles.overlay}>

            {/* Stop taps on sheet from closing */}
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View style={[styles.sheet, animatedStyle]}>

                {/* Swipe handle */}
                <GestureDetector gesture={panGesture}>
                  <View style={styles.handleArea}>
                    <View style={styles.handle} />
                  </View>
                </GestureDetector>

                {/* Fish name */}
                <Text style={styles.fishName}>{fishName}</Text>
                <Text style={styles.fishGuj}>{fishNameGujarati}</Text>
                <Text style={styles.label}>દરેક ટોપલી કેટલા kg ની છે?</Text>

                {/* Display */}
                <View style={styles.displayRow}>
                  <View style={styles.displayBox}>
                    <Text style={styles.displayNumber}>{display}</Text>
                    <Text style={styles.displayUnit}>kg</Text>
                  </View>
                </View>

                {/* Numpad */}
                <View style={styles.numpad}>
                  {keys.map((row, ri) => (
                    <View key={ri} style={styles.numRow}>
                      {row.map((key) => {
                        const isEnter = key === 'enter'
                        const isBackspace = key === 'backspace'
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
                              isBackspace && styles.keyBackspace,
                            ]}
                          >
                            <Text
                              style={[
                                styles.keyText,
                                isEnter && styles.keyTextEnter,
                                isBackspace && styles.keyTextBackspace,
                              ]}
                            >
                              {isEnter ? 'Enter' : isBackspace ? '⌫' : key}
                            </Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  ))}
                </View>

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
    backgroundColor: '#f5f0e8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 12,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
  fishName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  fishGuj: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: -8,
  },
  label: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  displayRow: {
    marginVertical: 4,
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
  keyBackspace: {
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
  keyTextBackspace: {
    color: '#555',
    fontSize: 20,
  },
})