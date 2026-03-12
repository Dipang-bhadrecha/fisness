import { Slot } from 'expo-router'
import { View } from 'react-native'
import { theme } from '../../constants/theme'

export default function BoatLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Slot />
    </View>
  )
}