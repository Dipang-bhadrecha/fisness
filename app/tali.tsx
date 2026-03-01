import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AddFishModal } from '../components/tali/AddFishModal'
import { BucketWeightModal } from '../components/tali/BucketWeightModal'
import { FishTab } from '../components/tali/FishTab'
import { PauseBanner } from '../components/tali/PauseBanner'
import { TaliGrid } from '../components/tali/TaliGrid'
import { Button } from '../components/ui/Button'
import { FISH_CATEGORIES } from '../constants/fishTypes'
import { theme } from '../constants/theme'
import { useTaliSession } from '../hooks/useTaliSession'
import { FishCategory } from '../types'
import { formatKg } from '../utils/calculations'

export default function TaliScreen() {
const {
    session,
    createSession,
    addFishToSession,
    addCount,
    addCustomCount,
    pauseSession,
    resumeSession,
    setPartialWeight,
    setActiveFish,
    deleteFish,
    endSession,
  } = useTaliSession()

  useEffect(() => {
    if (!session) {
      createSession('બોટ - 1', 'કંપની')
    }
  }, [])

  const [addFishVisible, setAddFishVisible] = useState(false)
  const [bucketModalVisible, setBucketModalVisible] = useState(false)
  const [pendingFish, setPendingFish] = useState<FishCategory | null>(null)
  const [partialModalVisible, setPartialModalVisible] = useState(false)
  const [partialInput, setPartialInput] = useState('')

  // Step 1 — user picks fish from AddFishModal
  const handleFishSelected = (fish: FishCategory) => {
    setPendingFish(fish)
    setAddFishVisible(false)
    setBucketModalVisible(true)  // Step 2 — ask bucket weight
  }

  // Step 2 — user enters bucket weight, fish is added to session
  const handleBucketConfirm = (weight: number) => {
    if (!pendingFish) return
    addFishToSession(pendingFish.id, weight)
    setBucketModalVisible(false)
    setPendingFish(null)
  }

  const handleBucketCancel = () => {
    setBucketModalVisible(false)
    setPendingFish(null)
  }

  const handleDeleteFish = (fishId: string) => {
    if (!session || session.fishData.length <= 1) return
    Alert.alert(
      'માછલી કાઢો?',
      'આ માછલી ની બધી ગણતરી ભૂંસાઈ જશે.',
      [
        { text: 'ના', style: 'cancel' },
        {
          text: 'કાઢો',
          style: 'destructive',
          onPress: () => deleteFish(fishId),
        },
      ]
    )
  }

  const handlePartialSave = () => {
    const weight = parseFloat(partialInput)
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('ભૂલ', 'સાચું વજન નાખો')
      return
    }
    setPartialWeight(session!.activeFishId, weight)
    setPartialModalVisible(false)
    setPartialInput('')
  }

  const handleEndSession = () => {
    Alert.alert(
      'સેશન પૂરું કરો?',
      'શું તમે ખરેખર આ તાલી સેશન પૂરું કરવા માંગો છો?',
      [
        { text: 'ના', style: 'cancel' },
        {
          text: 'હા, પૂરું કરો',
          style: 'destructive',
          onPress: () => {
            endSession()
            router.push('/summary')
          },
        },
      ]
    )
  }

  // Empty state — no fish added yet
  if (!session || session.fishData.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : null}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>તાલી</Text>
            <Text style={styles.headerSub}>વજન સત્ર</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🐟</Text>
          <Text style={styles.emptyTitle}>માછલી ઉમેરો</Text>
          <Text style={styles.emptyText}>
            + બટન દબાવો અને પ્રથમ માછલી ઉમેરો
          </Text>
          <TouchableOpacity
            onPress={() => setAddFishVisible(true)}
            style={styles.emptyAddBtn}
          >
            <Text style={styles.emptyAddBtnText}>+ માછલી ઉમેરો</Text>
          </TouchableOpacity>
        </View>

        <AddFishModal
          visible={addFishVisible}
          onClose={() => setAddFishVisible(false)}
          onAddFish={handleFishSelected}
          alreadyAddedIds={session?.fishData.map((fd) => fd.fishId) ?? []}
        />

        {pendingFish && (
          <BucketWeightModal
            visible={bucketModalVisible}
            fishName={pendingFish.name}
            fishNameGujarati={pendingFish.nameGujarati}
            defaultWeight={pendingFish.bucketWeight}
            onConfirm={handleBucketConfirm}
            onCancel={handleBucketCancel}
          />
        )}
      </SafeAreaView>
    )
  }

  const activeFishData = session.fishData.find(
    (fd) => fd.fishId === session.activeFishId
  )

  const activeFish = FISH_CATEGORIES.find(
    (f) => f.id === session.activeFishId
  ) ?? (() => {
    const customName = session.activeFishId.startsWith('custom_')
      ? session.activeFishId.replace('custom_', '').replace(/_/g, ' ')
      : session.activeFishId
    return {
      id: session.activeFishId,
      name: customName,
      nameGujarati: customName,
      bucketWeight: activeFishData?.bucketWeight ?? 25,
    }
  })()

  if (!activeFishData) return null

  const totalKgMap = Object.fromEntries(
    session.fishData.map((fd) => [fd.fishId, fd.totalKg])
  )

  const sessionCategories = session.fishData.map((fd) => {
    const preset = FISH_CATEGORIES.find((f) => f.id === fd.fishId)
    if (preset) return { ...preset, bucketWeight: fd.bucketWeight }
    const customName = fd.fishId.startsWith('custom_')
      ? fd.fishId.replace('custom_', '').replace(/_/g, ' ')
      : fd.fishId
    return {
      id: fd.fishId,
      name: customName,
      nameGujarati: customName,
      bucketWeight: fd.bucketWeight,
    }
  })

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : null}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>તાલી</Text>
          <Text style={styles.headerSub}>વજન સત્ર</Text>
        </View>
        <TouchableOpacity onPress={handleEndSession} style={styles.endBtn}>
          <Text style={styles.endBtnText}>પૂરું</Text>
        </TouchableOpacity>
      </View>

      {/* Fish Tabs — with + at end */}
      <FishTab
        categories={sessionCategories}
        activeFishId={session.activeFishId}
        onSelect={setActiveFish}
        onDelete={handleDeleteFish}
        onAdd={() => setAddFishVisible(true)}
        totalKgMap={totalKgMap}
      />

      {/* Pause Banner */}
      {activeFishData.isPaused && (
        <PauseBanner
          pausedAtCount={activeFishData.pausedAtCount}
          onResume={() => resumeSession(session.activeFishId)}
        />
      )}

      {/* Tali Grid */}
<TaliGrid
        entries={activeFishData.entries}
        bucketWeight={activeFishData.bucketWeight}
        partialWeight={activeFishData.partialWeight}
        onCustomEntry={(weight) => addCustomCount(session.activeFishId, weight)}
      />

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>કુલ વજન</Text>
          <Text style={styles.totalValue}>
            {formatKg(activeFishData.totalKg)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (activeFishData.isPaused) {
              resumeSession(session.activeFishId)
            } else {
              addCount(session.activeFishId)
            }
          }}
          activeOpacity={0.7}
          style={[
            styles.countBtn,
            activeFishData.isPaused && styles.countBtnPaused,
          ]}
        >
          {activeFishData.isPaused ? (
            <>
              <Text style={styles.countBtnDeck}>⏸ અટકેલ છે</Text>
              <Text style={styles.countBtnHint}>ફરી ચાલુ કરવા ટેપ કરો</Text>
            </>
          ) : (
            <>
              <Text style={styles.countBtnDeck}>
                ટાળી {activeFishData.currentDeck}
              </Text>
              <Text style={styles.countBtnNumber}>
                {activeFishData.currentCount % 10 === 0 &&
                activeFishData.currentCount > 0
                  ? 10
                  : activeFishData.currentCount % 10}
              </Text>
              <Text style={styles.countBtnHint}>ટેપ કરો</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Partial Weight Modal */}
      <Modal
        visible={partialModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPartialModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>છેલ્લું વજન નાખો</Text>
            <Text style={styles.modalSub}>
              {activeFish.nameGujarati} — છેલ્લા તૂટક વજનનો આંક (દા.ત. 18)
            </Text>
            <TextInput
              style={styles.modalInput}
              value={partialInput}
              onChangeText={setPartialInput}
              keyboardType="decimal-pad"
              placeholder="જેમ કે 18"
              placeholderTextColor={theme.colors.textDisabled}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <Button
                label="રદ કરો"
                variant="secondary"
                size="md"
                onPress={() => {
                  setPartialModalVisible(false)
                  setPartialInput('')
                }}
                style={{ flex: 1 }}
              />
              <Button
                label="સાચવો"
                variant="primary"
                size="md"
                onPress={handlePartialSave}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Fish Modal */}
      <AddFishModal
        visible={addFishVisible}
        onClose={() => setAddFishVisible(false)}
        onAddFish={handleFishSelected}
        alreadyAddedIds={session.fishData.map((fd) => fd.fishId)}
      />

      {/* Bucket Weight Modal */}
      {pendingFish && (
        <BucketWeightModal
          visible={bucketModalVisible}
          fishName={pendingFish.name}
          fishNameGujarati={pendingFish.nameGujarati}
          defaultWeight={pendingFish.bucketWeight}
          onConfirm={handleBucketConfirm}
          onCancel={handleBucketCancel}
        />
      )}

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  headerSub: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  endBtn: {
    backgroundColor: theme.colors.danger,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  endBtnText: {
    color: '#fff',
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyAddBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
  },
  emptyAddBtnText: {
    color: '#fff',
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  bottomBar: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  countBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    gap: 4,
  },
  countBtnPaused: {
    backgroundColor: theme.colors.elevated,
    borderWidth: 2,
    borderColor: theme.colors.pause,
  },
  countBtnDeck: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  countBtnNumber: {
    fontSize: 64,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    lineHeight: 72,
  },
  countBtnHint: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  modalSub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  modalInput: {
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.xxl,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    minHeight: theme.touchTarget,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
})