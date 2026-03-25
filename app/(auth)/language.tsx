import { useTheme } from '@/store/themeStore'
import React, { useMemo, useState } from 'react'
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Language } from '../../constants/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { coloredShadow, noShadow } from '../../utils/shadow'

type LangOption = {
  id: Language
  emoji: string
  name: string
  nameOther: string
  sample: string
}

const LANG_OPTIONS: LangOption[] = [
  {
    id: 'en',
    emoji: '🇬🇧',
    name: 'English',
    nameOther: 'ઇંગ્લિશ',
    sample: 'Tali · Bill · Expenses · Reports',
  },
  {
    id: 'gu',
    emoji: '🇮🇳',
    name: 'ગુજરાતી',
    nameOther: 'Gujarati',
    sample: 'તાલી · બિલ · ખર્ચ · રિપોર્ટ',
  },
]

export default function LanguageScreen() {
  const { setLanguage, language } = useLanguage()
  const theme = useTheme()
  const [selected, setSelected] = useState<Language>(language)
  const [saving, setSaving] = useState(false)

  const styles = useMemo(() => StyleSheet.create({
    bg: { flex: 1, backgroundColor: '#0a1628' },
    bgCircle1: {
      position: 'absolute', top: -80, right: -80,
      width: 280, height: 280, borderRadius: 140,
      backgroundColor: 'rgba(13,122,95,0.1)',
    },
    bgCircle2: {
      position: 'absolute', bottom: 100, left: -60,
      width: 200, height: 200, borderRadius: 100,
      backgroundColor: 'rgba(13,122,95,0.06)',
    },
    safe: { flex: 1 },
    container: {
      flex: 1, paddingHorizontal: 24, paddingBottom: 32,
      justifyContent: 'space-between',
    },
    logoSection: { alignItems: 'center', paddingTop: 40, paddingBottom: 8 },
    glowRing: {
      position: 'absolute', top: 28,
      width: 120, height: 120, borderRadius: 60,
      backgroundColor: 'rgba(13,122,95,0.08)',
      alignItems: 'center', justifyContent: 'center',
    },
    glowInner: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: 'rgba(13,122,95,0.1)',
    },
    fishEmoji: { fontSize: 52, marginBottom: 10 },
    appName: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
    middle: { flex: 1, justifyContent: 'center', gap: 28 },
    headingBlock: { alignItems: 'center', gap: 4 },
    headingEN: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
    headingGU: { fontSize: 22, fontWeight: '700', color: 'rgba(255,255,255,0.55)' },
    headingSub: {
      fontSize: 12, color: 'rgba(255,255,255,0.3)',
      textAlign: 'center', lineHeight: 20, marginTop: 8,
    },
    langList: { gap: 12 },
    langCard: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 20, borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.08)',
      padding: 18, minHeight: 90,
    },
    langCardSelected: {
      backgroundColor: 'rgba(13,122,95,0.14)',
      borderColor: theme.colors.primary,
    },
    langCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
    flagBox: {
      width: 56, height: 56, borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.06)',
      alignItems: 'center', justifyContent: 'center',
    },
    flagBoxSelected: { backgroundColor: 'rgba(13,122,95,0.25)' },
    flagEmoji: { fontSize: 28 },
    langNames: { flex: 1, gap: 2 },
    langName: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
    langNameSelected: { color: theme.colors.primaryLight },
    langNameOther: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
    langSample: { fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4, letterSpacing: 0.3 },
    langSampleSelected: { color: 'rgba(15,155,120,0.7)' },
    radio: {
      width: 26, height: 26, borderRadius: 13,
      borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center', justifyContent: 'center',
    },
    radioSelected: { borderColor: theme.colors.primary },
    radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary },
    bottom: { gap: 14 },
    ctaBtn: { borderRadius: 16 },
    ctaBtnInner: {
      height: 68, backgroundColor: theme.colors.primary,
      borderRadius: 16, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: theme.colors.primaryLight,
    },
    ctaBtnInnerDisabled: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderColor: 'rgba(255,255,255,0.08)',
    },
    ctaBtnText: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
    hintText: {
      fontSize: 12, color: 'rgba(255,255,255,0.25)',
      textAlign: 'center', lineHeight: 18,
    },
  }), [theme])

  const handleContinue = async () => {
    if (saving) return
    setSaving(true)
    await setLanguage(selected)
    
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <View style={styles.bg}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <SafeAreaView style={styles.safe}>
          <View style={styles.container}>

            {/* Top — fish + app name */}
            <View style={styles.logoSection}>
              <View style={styles.glowRing}>
                <View style={styles.glowInner} />
              </View>
              <Text style={styles.fishEmoji}>🐟</Text>
              <Text style={styles.appName}>Fishness</Text>
            </View>

            {/* Middle — language cards */}
            <View style={styles.middle}>
              <View style={styles.headingBlock}>
                <Text style={styles.headingEN}>Choose Language</Text>
                <Text style={styles.headingGU}>ભાષા પસંદ કરો</Text>
                <Text style={styles.headingSub}>
                  You can change this later in Settings
                  {'\n'}
                  તમે આ પછી Settings માં બદલી શકો છો
                </Text>
              </View>

              <View style={styles.langList}>
                {LANG_OPTIONS.map((opt) => {
                  const isSelected = selected === opt.id
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.langCard,
                        isSelected && styles.langCardSelected,
                      ]}
                      onPress={() => setSelected(opt.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.langCardLeft}>
                        <View style={[
                          styles.flagBox,
                          isSelected && styles.flagBoxSelected,
                        ]}>
                          <Text style={styles.flagEmoji}>{opt.emoji}</Text>
                        </View>
                        <View style={styles.langNames}>
                          <Text style={[
                            styles.langName,
                            isSelected && styles.langNameSelected,
                          ]}>
                            {opt.name}
                          </Text>
                          <Text style={styles.langNameOther}>{opt.nameOther}</Text>
                          <Text style={[
                            styles.langSample,
                            isSelected && styles.langSampleSelected,
                          ]}>
                            {opt.sample}
                          </Text>
                        </View>
                      </View>

                      <View style={[
                        styles.radio,
                        isSelected && styles.radioSelected,
                      ]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            {/* Bottom — continue button */}
            <View style={styles.bottom}>
              <TouchableOpacity
                style={[
                  styles.ctaBtn,
                  saving ? noShadow : coloredShadow('#0d7a5f', 8, 0.5, 20),
                ]}
                onPress={handleContinue}
                activeOpacity={0.85}
                disabled={saving}
              >
                <View style={[styles.ctaBtnInner, saving && styles.ctaBtnInnerDisabled]}>
                  <Text style={styles.ctaBtnText}>
                    {saving
                      ? '...'
                      : selected === 'gu'
                        ? 'આગળ વધો →'
                        : 'Continue →'}
                  </Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.hintText}>
                {selected === 'gu'
                  ? 'ભાષા પાછળથી Settings > Language માં બદલી શકાય'
                  : 'Language can be changed later in Settings > Language'}
              </Text>
            </View>

          </View>
        </SafeAreaView>
      </View>
    </>
  )
}
