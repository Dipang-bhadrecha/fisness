import React, { useState } from 'react'
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ApiRegisteredBoat } from '../../services/api'

type Props = {
  visible: boolean
  boats: ApiRegisteredBoat[]
  onClose: () => void
  onConfirm: (boat: ApiRegisteredBoat) => void
}

export function SelectBoatModal({ visible, boats, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState<ApiRegisteredBoat | null>(null)
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? boats.filter(b =>
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        (b.ownerName ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : boats

  const handleConfirm = () => {
    if (selected) {
      onConfirm(selected)
      setSelected(null)
      setQuery('')
    }
  }

  const handleClose = () => {
    setSelected(null)
    setQuery('')
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={s.container}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={handleClose} style={s.backBtn}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={s.label}>SELECT WHICH BOAT ARRIVED</Text>
            <Text style={s.title}>Select a Boat</Text>
          </View>
        </View>

        {/* Search */}
        <View style={s.searchBox}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search boat name..."
            placeholderTextColor="#4A6080"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={s.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={s.count}>{filtered.length} boats registered</Text>

        {/* Boat Grid */}
        <FlatList
          data={filtered}
          numColumns={3}
          keyExtractor={b => b.id}
          contentContainerStyle={s.grid}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <Text style={s.emptyText}>No boats found for "{query}"</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = selected?.id === item.id
            return (
              <TouchableOpacity
                style={[s.boatCard, isSelected && s.boatCardSelected]}
                onPress={() => setSelected(item)}
                activeOpacity={0.75}
              >
                {isSelected && (
                  <View style={s.checkBadge}>
                    <Text style={s.checkText}>✓</Text>
                  </View>
                )}
                <Text style={s.boatEmoji}>⛵</Text>
                <Text style={s.boatName}>{item.name}</Text>
                {item.nameGujarati ? (
                  <Text style={s.boatSub}>{item.nameGujarati}</Text>
                ) : item.ownerName ? (
                  <Text style={s.boatSub}>{item.ownerName}</Text>
                ) : null}
              </TouchableOpacity>
            )
          }}
        />

        {/* Confirm Button */}
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.confirmBtn, !selected && s.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={!selected}
            activeOpacity={0.85}
          >
            <Text style={[s.confirmText, !selected && s.confirmTextDisabled]}>
              {selected ? `Continue with ${selected.name} →` : 'Select a boat to continue'}
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </Modal>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1923',
  },
  header: {
    padding: 20,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1A2535',
    borderWidth: 1,
    borderColor: '#2A3A4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#94A3B8',
    fontSize: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A90E2',
    letterSpacing: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  searchBox: {
    marginHorizontal: 20,
    backgroundColor: '#1A2535',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3A4E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 14,
    paddingVertical: 13,
  },
  clearBtn: {
    color: '#64748B',
    fontSize: 16,
    paddingLeft: 8,
  },
  count: {
    marginHorizontal: 20,
    fontSize: 13,
    color: '#4A6080',
    marginBottom: 14,
  },
  grid: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#4A6080',
    fontSize: 14,
  },
  boatCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#1A2535',
    borderWidth: 1.5,
    borderColor: '#2A3A4E',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  boatCardSelected: {
    backgroundColor: '#162944',
    borderColor: '#4A90E2',
  },
  checkBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  boatEmoji: {
    fontSize: 28,
  },
  boatName: {
    fontWeight: '700',
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  boatSub: {
    fontSize: 10,
    color: '#4A6080',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
    backgroundColor: '#0F1923',
  },
  confirmBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#1A2535',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmTextDisabled: {
    color: '#4A6080',
  },
})