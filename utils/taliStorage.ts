/**
 * utils/taliStorage.ts
 *
 * AsyncStorage-based tali (session) persistence.
 * Added: updateTaliBillNo — assigns a real bill number to a PENDING tali
 *        when the company owner opens it for the first time.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { FishSessionData } from '../types'

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const TALI_LIST_KEY = 'fishness_tali_list'
const TALI_KEY      = (id: string) => `fishness_tali_${id}`

// ─── Types ────────────────────────────────────────────────────────────────────
export type TaliStatus = 'PENDING_PRICE' | 'PRICED' | 'CONFIRMED'

export interface SavedFishEntry {
  fishId: string
  fishName: string
  fishNameGujarati: string
  counts: number
  totalKg: number
  bucketWeight: number
  pricePerKg: number | null
  totalAmount: number | null
}

export interface SavedTali {
  id: string
  billNo: string          // 'PENDING' until company owner opens, then real number
  sessionId: string
  serverSessionId: string | null
  boatName: string
  boatReg: string
  ownerPhone: string
  ownerName: string
  companyId: string
  companyName: string
  date: string
  month: string
  fishEntries: SavedFishEntry[]
  totalKg: number
  grandTotal: number | null
  status: TaliStatus
  createdAt: string
  updatedAt: string
}

// ─── ID generator ─────────────────────────────────────────────────────────────
function generateTaliId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `TALI-${date}-${rand}`
}

function getMonth(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

// ─── Save a new tali when session ends ────────────────────────────────────────
export async function saveTali(params: {
  sessionId: string
  serverSessionId: string | null
  billNo: string
  boatName: string
  boatReg: string
  ownerPhone: string
  ownerName: string
  companyId: string
  companyName: string
  fishData: FishSessionData[]
  getFishMeta: (fishId: string) => { name: string; nameGujarati: string }
}): Promise<SavedTali> {
  const now = new Date().toISOString()
  const id  = generateTaliId()

  const fishEntries: SavedFishEntry[] = params.fishData
    .filter(fd => fd.totalKg > 0)
    .map(fd => {
      const { name, nameGujarati } = params.getFishMeta(fd.fishId)
      const counts = fd.entries.reduce((s, e) => s + e.counts.length, 0)
      return {
        fishId:           fd.fishId,
        fishName:         name,
        fishNameGujarati: nameGujarati,
        counts,
        totalKg:          fd.totalKg,
        bucketWeight:     fd.bucketWeight,
        pricePerKg:       null,
        totalAmount:      null,
      }
    })

  const totalKg = fishEntries.reduce((s, f) => s + f.totalKg, 0)

  const tali: SavedTali = {
    id,
    billNo:          params.billNo,
    sessionId:       params.sessionId,
    serverSessionId: params.serverSessionId,
    boatName:        params.boatName,
    boatReg:         params.boatReg,
    ownerPhone:      params.ownerPhone,
    ownerName:       params.ownerName,
    companyId:       params.companyId,
    companyName:     params.companyName,
    date:            now,
    month:           getMonth(now),
    fishEntries,
    totalKg,
    grandTotal:      null,
    status:          'PENDING_PRICE',
    createdAt:       now,
    updatedAt:       now,
  }

  await AsyncStorage.setItem(TALI_KEY(id), JSON.stringify(tali))

  const existing = await getTaliIdList()
  await AsyncStorage.setItem(TALI_LIST_KEY, JSON.stringify([id, ...existing]))

  return tali
}

// ─── Load all tali ids ────────────────────────────────────────────────────────
async function getTaliIdList(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(TALI_LIST_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// ─── Load all talis (for list screen) ────────────────────────────────────────
export async function loadAllTalis(): Promise<SavedTali[]> {
  try {
    const ids = await getTaliIdList()
    const results = await Promise.all(
      ids.map(async id => {
        try {
          const raw = await AsyncStorage.getItem(TALI_KEY(id))
          return raw ? (JSON.parse(raw) as SavedTali) : null
        } catch {
          return null
        }
      })
    )
    return results.filter(Boolean) as SavedTali[]
  } catch {
    return []
  }
}

// ─── Load single tali by id ───────────────────────────────────────────────────
export async function loadTali(id: string): Promise<SavedTali | null> {
  try {
    const raw = await AsyncStorage.getItem(TALI_KEY(id))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ─── Assign a real bill number to a PENDING tali ─────────────────────────────
// Called by tali-bill.tsx init when company owner opens a tali that was
// saved with billNo: 'PENDING' (because the tali taker had no template).
export async function updateTaliBillNo(
  id: string,
  billNo: string
): Promise<SavedTali | null> {
  try {
    const tali = await loadTali(id)
    if (!tali) return null
    const updated: SavedTali = {
      ...tali,
      billNo,
      updatedAt: new Date().toISOString(),
    }
    await AsyncStorage.setItem(TALI_KEY(id), JSON.stringify(updated))
    return updated
  } catch {
    return null
  }
}

// ─── Update tali prices (company owner fills prices) ─────────────────────────
export async function updateTaliPrices(
  id: string,
  prices: Record<string, number>
): Promise<SavedTali | null> {
  try {
    const tali = await loadTali(id)
    if (!tali) return null

    const updatedEntries = tali.fishEntries.map(fe => {
      const price = prices[fe.fishId]
      if (price !== undefined && price > 0) {
        return {
          ...fe,
          pricePerKg:  price,
          totalAmount: Math.round(fe.totalKg * price),
        }
      }
      return fe
    })

    const allPriced  = updatedEntries.every(fe => fe.pricePerKg !== null)
    const grandTotal = allPriced
      ? updatedEntries.reduce((s, fe) => s + (fe.totalAmount ?? 0), 0)
      : null

    const updated: SavedTali = {
      ...tali,
      fishEntries: updatedEntries,
      grandTotal,
      status:    allPriced ? 'PRICED' : 'PENDING_PRICE',
      updatedAt: new Date().toISOString(),
    }

    await AsyncStorage.setItem(TALI_KEY(id), JSON.stringify(updated))
    return updated
  } catch {
    return null
  }
}

// ─── Confirm tali (lock it) ───────────────────────────────────────────────────
export async function confirmTali(id: string): Promise<SavedTali | null> {
  try {
    const tali = await loadTali(id)
    if (!tali) return null

    const updated: SavedTali = {
      ...tali,
      status:    'CONFIRMED',
      updatedAt: new Date().toISOString(),
    }

    await AsyncStorage.setItem(TALI_KEY(id), JSON.stringify(updated))
    return updated
  } catch {
    return null
  }
}

// ─── Delete a tali ────────────────────────────────────────────────────────────
export async function deleteTali(id: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(TALI_KEY(id))
    const ids = await getTaliIdList()
    await AsyncStorage.setItem(TALI_LIST_KEY, JSON.stringify(ids.filter(i => i !== id)))
  } catch {}
}

// ─── Update owner phone on a tali ────────────────────────────────────────────
export async function updateTaliOwnerPhone(id: string, phone: string): Promise<void> {
  try {
    const tali = await loadTali(id)
    if (!tali) return
    const updated = { ...tali, ownerPhone: phone, updatedAt: new Date().toISOString() }
    await AsyncStorage.setItem(TALI_KEY(id), JSON.stringify(updated))
  } catch {}
}