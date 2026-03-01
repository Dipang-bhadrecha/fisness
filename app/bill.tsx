import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { theme } from '../constants/theme'

export default function BillScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>બિલ — જલ્દી આવે છે</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
  },
})