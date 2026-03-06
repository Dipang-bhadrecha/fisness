import React from 'react'
import {
    Image,
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
import { getFishImage } from '../../constants/fishImages'
import { theme } from '../../constants/theme'
import { useLanguage } from '../../hooks/useLanguage'

interface DeleteFishSheetProps {
  visible: boolean
  fishName: string
  fishNameGujarati: string
  fishId: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteFishSheet({
  visible,
  fishName,
  fishNameGujarati,
  fishId,
  onConfirm,
  onCancel,
}: DeleteFishSheetProps) {
  const { t } = useLanguage()
  const translateY = useSharedValue(0)
  const image = getFishImage(fishId)

  const handleCancel = () => {
    translateY.value = withSpring(0)
    onCancel()
  }

  const handleConfirm = () => {
    translateY.value = withSpring(0)
    onConfirm()
  }

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) translateY.value = e.translationY
    })
    .onEnd((e) => {
      if (e.translationY > 60) runOnJS(handleCancel)()
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
      onRequestClose={handleCancel}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View style={[styles.sheet, animatedStyle]}>

                {/* Swipe handle */}
                <GestureDetector gesture={panGesture}>
                  <View style={styles.handleArea}>
                    <View style={styles.handle} />
                  </View>
                </GestureDetector>

                {/* Fish identity row */}
                <View style={styles.fishRow}>
                  {/* Fish image or fallback */}
                  <View style={styles.fishImageBox}>
                    {image ? (
                      <Image
                        source={image}
                        style={styles.fishImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.fishEmoji}>🐟</Text>
                    )}
                  </View>

                  <View style={styles.fishInfo}>
                    <Text style={styles.fishName}>{fishName}</Text>
                    <Text style={styles.fishGuj}>{fishNameGujarati}</Text>
                  </View>
                </View>

                {/* Warning message */}
                <View style={styles.warningBox}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.warningText}>
                    <Text style={styles.warningBold}>{fishName}</Text>
                    {' —'} {t.tali.deleteFishMsg}
                  </Text>
                </View>

                {/* Action buttons */}
                <View style={styles.buttons}>
                  {/* Cancel — prominent */}
                  <TouchableOpacity
                    onPress={handleCancel}
                    activeOpacity={0.8}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelText}>{t.common.cancel}</Text>
                  </TouchableOpacity>

                  {/* Delete — danger */}
                  <TouchableOpacity
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                    style={styles.deleteBtn}
                  >
                    <Text style={styles.deleteText}>🗑 {t.tali.deleteConfirm}</Text>
                  </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
  },

  // Fish identity
  fishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  fishImageBox: {
    width: 64,
    height: 48,
    borderRadius: 10,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fishImage: {
    width: 64,
    height: 48,
  },
  fishEmoji: {
    fontSize: 28,
  },
  fishInfo: {
    flex: 1,
  },
  fishName: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  fishGuj: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Warning
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(239,68,68,0.10)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  warningIcon: {
    fontSize: 18,
    lineHeight: 22,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  warningBold: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },

  // Buttons
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: theme.colors.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: theme.colors.danger,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
})