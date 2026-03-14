import {
  createSession as apiCreateSession,
  endSession as apiEndSession,
  getMyCompanies,
  getRegisteredBoats,
} from '@/services/api'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
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
import { DeleteFishSheet } from '../components/tali/DeleteFishSheet'
import { FishTab } from '../components/tali/FishTab'
import { PauseBanner } from '../components/tali/PauseBanner'
import { TaliGrid } from '../components/tali/TaliGrid'
import { Button } from '../components/ui/Button'
import { FISH_CATEGORIES } from '../constants/fishTypes'
import { theme } from '../constants/theme'
import { useLanguage } from '../hooks/useLanguage'
import { useTaliSession } from '../hooks/useTaliSession'
import { useAuthStore } from '../store/authStore'
import { FishCategory } from '../types'
import { formatKg, generateSessionId } from '../utils/calculations'

interface PreSelectedFish {
  id: string
  name: string
  nameGujarati: string
  bucketWeight: number
}

export default function TaliScreen() {
  const { t } = useLanguage()
  const { token } = useAuthStore()

  const { boatId, boatName, companyId, companyName, selectedFish } =
    useLocalSearchParams<{
      boatId: string
      boatName: string
      companyId: string
      companyName: string
      selectedFish?: string
    }>()

  const parsedSelectedFish = useMemo<PreSelectedFish[]>(() => {
    if (!selectedFish) return []
    try { return JSON.parse(selectedFish) as PreSelectedFish[] }
    catch { return [] }
  }, [selectedFish])

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

  const addPreSelectedFish = (fish: PreSelectedFish[]) => {
    if (fish.length === 0) return
    fish.forEach(f => addFishToSession(f.id, f.bucketWeight))
  }

  useEffect(() => {
    if (session) return

    const startSession = async () => {
      if (boatId && boatName && companyId) {
        if (token) {
          try {
            const clientId = generateSessionId()
            const apiSession = await apiCreateSession(token, {
              companyId,
              registeredBoatId: boatId,
              clientId,
            })
            createSession(boatName, companyName ?? 'કંપની', apiSession.id)
            addPreSelectedFish(parsedSelectedFish)
            return
          } catch (_) {
            createSession(boatName, companyName ?? 'કંપની')
            addPreSelectedFish(parsedSelectedFish)
            return
          }
        } else {
          createSession(boatName, companyName ?? 'કંપની')
          addPreSelectedFish(parsedSelectedFish)
          return
        }
      }

      if (token) {
        try {
          const { owned, memberOf } = await getMyCompanies(token)
          const company = owned?.[0] ?? memberOf?.[0]
          if (company?.id) {
            const boats = await getRegisteredBoats(token, company.id)
            const boat = boats?.[0]
            if (boat?.id) {
              const clientId = generateSessionId()
              const apiSession = await apiCreateSession(token, {
                companyId: company.id,
                registeredBoatId: boat.id,
                clientId,
              })
              createSession(boat.name ?? 'બોટ - 1', company.name ?? 'કંપની', apiSession.id)
              addPreSelectedFish(parsedSelectedFish)
              return
            }
          }
        } catch (_) {}
      }
      createSession('બોટ - 1', 'કંપની')
      addPreSelectedFish(parsedSelectedFish)
    }

    startSession()
  }, [token, boatId, boatName, companyId, companyName])

  const [addFishVisible, setAddFishVisible]         = useState(false)
  const [bucketModalVisible, setBucketModalVisible] = useState(false)
  const [pendingFish, setPendingFish]               = useState<FishCategory | null>(null)
  const [partialModalVisible, setPartialModalVisible] = useState(false)
  const [partialInput, setPartialInput]             = useState('')
  const [deletingFish, setDeletingFish]             = useState<{
    id: string; name: string; nameGujarati: string
  } | null>(null)

  const handleFishSelected = (fish: FishCategory) => {
    setPendingFish(fish)
    setAddFishVisible(false)
    setBucketModalVisible(true)
  }

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
    const fd = session.fishData.find((f) => f.fishId === fishId)
    if (!fd) return
    const preset = FISH_CATEGORIES.find((f) => f.id === fishId)
    const name = preset?.name ?? (fishId.startsWith('custom_') ? fishId.replace('custom_', '').replace(/_/g, ' ') : fishId)
    const nameGujarati = preset?.nameGujarati ?? name
    setDeletingFish({ id: fishId, name, nameGujarati })
  }

  const handlePartialSave = () => {
    const weight = parseFloat(partialInput)
    if (isNaN(weight) || weight <= 0) {
      Alert.alert(t.common.error, t.tali.invalidWeight)
      return
    }
    setPartialWeight(session!.activeFishId, weight)
    setPartialModalVisible(false)
    setPartialInput('')
  }

  const handleEndSession = () => {
    Alert.alert(
      t.tali.endConfirmTitle,
      t.tali.endConfirmMsg,
      [
        { text: t.common.no, style: 'cancel' },
        {
          text: t.tali.endConfirmYes,
          style: 'destructive',
          onPress: async () => {
            if (session?.serverSessionId && token && session.fishData.length > 0) {
              try {
                const fishEntries = session.fishData.map((fd) => {
                  const preset = FISH_CATEGORIES.find((f) => f.id === fd.fishId)
                  const fishName = preset?.name ?? (fd.fishId.startsWith('custom_') ? fd.fishId.replace('custom_', '').replace(/_/g, ' ') : fd.fishId)
                  const fishNameGujarati = preset?.nameGujarati ?? fishName
                  return { fishId: fd.fishId, fishName, fishNameGujarati, bucketWeight: fd.bucketWeight, totalKg: fd.totalKg }
                })
                await apiEndSession(token, session.serverSessionId, fishEntries)
              } catch (_) {}
            }
            endSession()
            router.push('/bill')
          },
        },
      ]
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────
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
            <Text style={styles.headerTitle}>{t.tali.headerTitle}</Text>
            <Text style={styles.headerSub}>{session?.boatName ?? boatName ?? t.tali.headerSubtitle}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🐟</Text>
          <Text style={styles.emptyTitle}>{t.tali.emptyTitle}</Text>
          <Text style={styles.emptyText}>{t.tali.emptyText}</Text>
          <TouchableOpacity onPress={() => setAddFishVisible(true)} style={styles.emptyAddBtn}>
            <Text style={styles.emptyAddBtnText}>{t.tali.addFish}</Text>
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

  // ── Active session ─────────────────────────────────────────────────────────
  const activeFishData = session.fishData.find((fd) => fd.fishId === session.activeFishId)

  const activeFish = FISH_CATEGORIES.find((f) => f.id === session.activeFishId) ?? (() => {
    const customName = session.activeFishId.startsWith('custom_')
      ? session.activeFishId.replace('custom_', '').replace(/_/g, ' ')
      : session.activeFishId
    return { id: session.activeFishId, name: customName, nameGujarati: customName, bucketWeight: activeFishData?.bucketWeight ?? 25 }
  })()

  if (!activeFishData) return null

  const totalKgMap = Object.fromEntries(session.fishData.map((fd) => [fd.fishId, fd.totalKg]))

  const sessionCategories = session.fishData.map((fd) => {
    const preset = FISH_CATEGORIES.find((f) => f.id === fd.fishId)
    if (preset) return { ...preset, bucketWeight: fd.bucketWeight }
    const customName = fd.fishId.startsWith('custom_') ? fd.fishId.replace('custom_', '').replace(/_/g, ' ') : fd.fishId
    return { id: fd.fishId, name: customName, nameGujarati: customName, bucketWeight: fd.bucketWeight }
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
          <Text style={styles.headerTitle}>{t.tali.headerTitle}</Text>
          <Text style={styles.headerSub}>{session.boatName ?? t.tali.headerSubtitle}</Text>
        </View>
        <TouchableOpacity onPress={handleEndSession} style={styles.endBtn}>
          <Text style={styles.endBtnText}>{t.tali.endSession}</Text>
        </TouchableOpacity>
      </View>

      {/* Fish Tabs */}
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
          <Text style={styles.totalLabel}>{t.tali.totalLabel}</Text>
          <Text style={styles.totalValue}>{formatKg(activeFishData.totalKg)}</Text>
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
          style={[styles.countBtn, activeFishData.isPaused && styles.countBtnPaused]}
        >
          {activeFishData.isPaused ? (
            <>
              <Text style={styles.countBtnDeck}>{t.tali.paused}</Text>
              <Text style={styles.countBtnHint}>{t.tali.resumeHint}</Text>
            </>
          ) : (
            <>
              <Text style={styles.countBtnDeck}>
                {t.tali.deckLabel(activeFishData.currentDeck)}
              </Text>
              <Text style={styles.countBtnNumber}>
                {activeFishData.currentCount % 10 === 0 && activeFishData.currentCount > 0
                  ? 10
                  : activeFishData.currentCount % 10}
              </Text>
              <Text style={styles.countBtnHint}>{t.tali.tapHint}</Text>
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
            <Text style={styles.modalTitle}>{t.tali.partialTitle}</Text>
            <Text style={styles.modalSub}>
              {activeFish.nameGujarati} — છેલ્લા તૂટક વજનનો આંક
            </Text>
            <TextInput
              style={styles.modalInput}
              value={partialInput}
              onChangeText={setPartialInput}
              keyboardType="decimal-pad"
              placeholder={t.tali.partialPlaceholder}
              placeholderTextColor={theme.colors.textDisabled}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <Button
                label={t.common.cancel}
                variant="secondary"
                size="md"
                onPress={() => { setPartialModalVisible(false); setPartialInput('') }}
                style={{ flex: 1 }}
              />
              <Button
                label={t.common.save}
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

      {/* Delete Fish Sheet */}
      {deletingFish && (
        <DeleteFishSheet
          visible={true}
          fishId={deletingFish.id}
          fishName={deletingFish.name}
          fishNameGujarati={deletingFish.nameGujarati}
          onConfirm={() => { deleteFish(deletingFish.id); setDeletingFish(null) }}
          onCancel={() => setDeletingFish(null)}
        />
      )}

    </SafeAreaView>
  )
}

// ── ORIGINAL styles — unchanged from project ──────────────────────────────────
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
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[2],
    gap: theme.spacing[2],
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
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
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
    gap: theme.spacing[1],
    padding: theme.spacing[4],
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
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing[3],
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
    padding: theme.spacing[3],
    paddingBottom: theme.spacing[4],
    gap: theme.spacing[2],
  },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing[2],
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
    padding: theme.spacing[4],
    gap: theme.spacing[3],
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
    padding: theme.spacing[3],
    fontSize: theme.fontSize.xxl,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    minHeight: theme.touchTarget,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
})