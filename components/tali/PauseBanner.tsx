import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { theme } from '../../constants/theme'

interface PauseBannerProps {
  pausedAtCount: number
  onResume: () => void
}

export function PauseBanner({ pausedAtCount, onResume }: PauseBannerProps) {
  return (
    <View style={styles.banner}>
      <View>
        <Text style={styles.title}>⏸ તાલી અટકી છે</Text>
        <Text style={styles.subtitle}>
          છેલ્લો કાઉન્ટ: {pausedAtCount}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onResume}
        activeOpacity={0.75}
        style={styles.resumeBtn}
      >
        <Text style={styles.resumeText}>▶ ચાલુ કરો</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.colors.pauseBg,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.pause,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.pauseText,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.pauseText,
    marginTop: 2,
  },
  resumeBtn: {
    backgroundColor: theme.colors.pause,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    minHeight: 40,
    justifyContent: 'center',
  },
  resumeText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.pauseText,
  },
})