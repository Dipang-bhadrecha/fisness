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
import { theme } from '../../constants/theme'
import { FishCategory } from '../../types'

const PRESET_FISH: FishCategory[] = [
  { id: 'jumbo', name: 'Jumbo', nameGujarati: 'જમ્બો', bucketWeight: 25 },
  { id: 'pomfret', name: 'Pomfret', nameGujarati: 'પોંફ્રેટ', bucketWeight: 25 },
  { id: 'bhungar', name: 'Bhungar', nameGujarati: 'ભૂંગળ', bucketWeight: 20 },
  { id: 'narsinga', name: 'Narsinga', nameGujarati: 'નર્સિંગ', bucketWeight: 20 },
  { id: 'white', name: 'White', nameGujarati: 'સફેદ', bucketWeight: 20 },
  { id: 'prati', name: 'Prati', nameGujarati: 'પ્રતિ', bucketWeight: 20 },
  { id: 'squid', name: 'Squid', nameGujarati: 'સ્ક્વિડ', bucketWeight: 20 },
  { id: 'crab', name: 'Crab', nameGujarati: 'એકકડો', bucketWeight: 15 },
  { id: 'prawns_l', name: 'Prawns L', nameGujarati: 'ઝીંગા મોટા', bucketWeight: 25 },
  { id: 'prawns_s', name: 'Prawns S', nameGujarati: 'ઝીંગા નાના', bucketWeight: 20 },
  { id: 'kolami', name: 'Kolami', nameGujarati: 'કોળામી', bucketWeight: 20 },
  { id: 'tiger', name: 'Tiger Prawns', nameGujarati: 'ટાઈગર', bucketWeight: 25 },
  { id: 'flowers', name: 'Flowers', nameGujarati: 'ફ્લાવર', bucketWeight: 25 },
]

interface AddFishModalProps {
  visible: boolean
  onClose: () => void
  onAddFish: (fish: FishCategory) => void
  alreadyAddedIds: string[]
}

export function AddFishModal({
  visible,
  onClose,
  onAddFish,
  alreadyAddedIds,
}: AddFishModalProps) {
  const [search, setSearch] = useState('')
  const [customName, setCustomName] = useState('')

  // Swipe-down gesture values
  const translateY = useSharedValue(0)

  const filtered = PRESET_FISH.filter((f) => {
    if (alreadyAddedIds.includes(f.id)) return false
    const q = search.toLowerCase()
    return (
      f.name.toLowerCase().includes(q) ||
      f.nameGujarati.includes(search)
    )
  })

  const handleSelect = (fish: FishCategory) => {
    if (alreadyAddedIds.includes(fish.id)) return
    onAddFish(fish)
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

  const handleClose = () => {
    translateY.value = withSpring(0)
    onClose()
  }

  // Pan gesture: drag down > 80px → close
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY
      }
    })
    .onEnd((e) => {
      if (e.translationY > 80) {
        runOnJS(handleClose)()
      } else {
        translateY.value = withSpring(0)
      }
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
        {/* Tap dark overlay to close */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>

            {/* Stop taps on sheet from closing */}
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View style={[styles.sheetWrapper, animatedStyle]}>

                {/* Swipe handle area — gesture applied here */}
                <GestureDetector gesture={panGesture}>
                  <View style={styles.handleArea}>
                    <View style={styles.handle} />
                  </View>
                </GestureDetector>

                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                  <Text style={styles.title}>Add Fish</Text>
                  <Text style={styles.subtitle}>Choose from list or type custom name</Text>

                  {/* Search */}
                  <TextInput
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search... (bhungar, prawn, ઝીંગા...)"
                    placeholderTextColor="#aaa"
                  />

                  {/* Fish Grid */}
                  <ScrollView style={styles.grid} showsVerticalScrollIndicator={false}>
                    <View style={styles.gridInner}>
                      {filtered.map((fish) => {
                        const added = alreadyAddedIds.includes(fish.id)
                        return (
                          <TouchableOpacity
                            key={fish.id}
                            onPress={() => handleSelect(fish)}
                            style={[styles.fishCard, added && styles.fishCardAdded]}
                            disabled={added}
                          >
                            {added && <Text style={styles.addedTag}>✓</Text>}
                            <Text style={[styles.fishName, added && styles.fishNameAdded]}>
                              {fish.name}
                            </Text>
                            <Text style={[styles.fishGuj, added && styles.fishGujAdded]}>
                              {fish.nameGujarati}
                            </Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  </ScrollView>

                  {/* Custom Fish Input */}
                  <View style={styles.customRow}>
                    <TextInput
                      style={styles.customInput}
                      value={customName}
                      onChangeText={setCustomName}
                      placeholder="Custom fish name..."
                      placeholderTextColor="#aaa"
                    />
                    <TouchableOpacity
                      onPress={handleCustomAdd}
                      disabled={!customName.trim()}
                      style={[
                        styles.addBtn,
                        !customName.trim() && styles.addBtnDisabled,
                      ]}
                    >
                      <Text style={styles.addBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Cancel */}
                  <TouchableOpacity onPress={handleClose} style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Cancel</Text>
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
  sheetWrapper: {
    backgroundColor: '#f5f0e8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  grid: {
    maxHeight: 280,
  },
  gridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fishCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e0d0',
    position: 'relative',
  },
  fishCardAdded: {
    backgroundColor: '#e8f5e9',
    borderColor: theme.colors.primary,
    opacity: 0.6,
  },
  fishName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  fishNameAdded: {
    color: theme.colors.primary,
  },
  fishGuj: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
  },
  fishGujAdded: {
    color: theme.colors.primary,
  },
  addedTag: {
    position: 'absolute',
    top: 6,
    right: 8,
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  customRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  cancelBtn: {
    marginTop: 12,
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#1c1408',
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#faf6ee',
  },
})