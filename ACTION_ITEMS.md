# CRITICAL ACTION ITEMS - PRIORITY CHECKLIST

**Current Status**: 45/100 (Industry Grade)  
**Target**: 85/100 in 13 weeks  

---

## 🔴 CRITICAL (Do This Week)

### [ ] 1. Fix Unused Code
**File**: `hooks/useAsyncStorage.ts`  
**Action**: DELETE - this file is empty and imported nowhere  
**Time**: 5 minutes

```bash
rm hooks/useAsyncStorage.ts
# Remove any imports referencing it
```

---

### [ ] 2. Add Schema Validation (Zod)
**Impact**: Prevents invalid data in store, improves error messages  
**Time**: 2 hours

```bash
npm install zod zod-validation-error
```

**Create**: `utils/schemas.ts`
```typescript
import { z } from 'zod'

export const FishCategorySchema = z.object({
  id: z.string().min(1, 'Fish ID required'),
  name: z.string().min(1, 'Fish name required'),
  nameGujarati: z.string().min(1),
  bucketWeight: z.number().positive('Weight must be positive'),
})

export const BucketWeightSchema = z.number()
  .positive('Weight must be positive')
  .finite('Weight must be finite')
  .max(9999, 'Weight too large')

export const TaliSessionSchema = z.object({
  sessionId: z.string(),
  boatName: z.string().min(1),
  companyName: z.string().min(1),
  date: z.string().datetime(),
  fishData: z.array(z.object({
    fishId: z.string(),
    bucketWeight: z.number().positive(),
    entries: z.array(z.object({
      deckNumber: z.number().positive(),
      counts: z.array(z.number().positive()),
      isComplete: z.boolean(),
    })),
    totalKg: z.number().nonnegative(),
  })),
  activeFishId: z.string(),
  isActive: z.boolean(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().nullable(),
})
```

**Update**: `hooks/useTaliSession.ts`
```typescript
import { TaliSessionSchema } from '../utils/schemas'

const loadSavedSession = async () => {
  try {
    const saved = await AsyncStorage.getItem(SESSION_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // ✅ VALIDATE before loading
      const validated = TaliSessionSchema.parse(parsed)
      useTaliStore.setState({ session: validated })
    }
  } catch (error) {
    console.error('Failed to load session:', error)
    // Show error to user
    Alert.alert('Error', 'Could not load previous session')
  }
}
```

---

### [ ] 3. Add Error Boundary
**Impact**: Gracefully handle crashes, show user-friendly errors  
**Time**: 1.5 hours

**Create**: `components/ErrorBoundary.tsx`
```typescript
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { theme } from '../constants/theme'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service (Sentry)
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>⚠️ Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={this.handleReset}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.danger,
    marginBottom: theme.spacing.md,
  },
  message: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  buttonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
})
```

**Update**: `app/_layout.tsx`
```typescript
import { ErrorBoundary } from '../components/ErrorBoundary'

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        {/* existing code */}
      </SafeAreaProvider>
    </ErrorBoundary>
  )
}
```

---

### [ ] 4. Fix AsyncStorage Writes (Make Atomic)
**Impact**: Prevent data corruption from crashed writes  
**Time**: 1 hour

**Create**: `utils/storage.ts`
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TaliSessionSchema } from './schemas'
import { TaliSession } from '../types'

const SESSION_KEY = 'matsyakosh_active_session'

export class StorageError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message)
    this.name = 'StorageError'
  }
}

export async function saveSessionAtomic(session: TaliSession): Promise<void> {
  try {
    // 1. Validate data before writing
    const validated = TaliSessionSchema.parse(session)
    const serialized = JSON.stringify(validated)

    // 2. Write to storage
    await AsyncStorage.setItem(SESSION_KEY, serialized)

    // 3. Verify write succeeded
    const verification = await AsyncStorage.getItem(SESSION_KEY)
    if (!verification) {
      throw new Error('Storage verification failed')
    }

    // 4. Parse verification to ensure valid JSON
    JSON.parse(verification)

  } catch (error) {
    const originalError = error instanceof Error ? error : new Error(String(error))
    throw new StorageError('Failed to save session atomically', originalError)
  }
}

export async function loadSessionAtomic(): Promise<TaliSession | null> {
  try {
    const saved = await AsyncStorage.getItem(SESSION_KEY)
    if (!saved) return null

    const parsed = JSON.parse(saved)
    const validated = TaliSessionSchema.parse(parsed)
    return validated

  } catch (error) {
    // Log corruption but don't crash
    console.warn('Corrupted session data, starting fresh', error)
    // Optionally: await AsyncStorage.removeItem(SESSION_KEY)
    return null
  }
}

export async function deleteSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY)
  } catch (error) {
    throw new StorageError('Failed to delete session', 
      error instanceof Error ? error : undefined)
  }
}
```

**Update hooks**: `hooks/useTaliSession.ts`
```typescript
import { loadSessionAtomic, saveSessionAtomic } from '../utils/storage'

export function useTaliSession() {
  const store = useTaliStore()

  useEffect(() => {
    if (store.session) {
      // Use new atomic write
      saveSessionAtomic(store.session).catch(error => {
        console.error('Failed to persist session:', error)
        Alert.alert('Warning', 'Could not save session')
      })
    }
  }, [store.session])

  const loadSavedSession = async () => {
    try {
      const session = await loadSessionAtomic()
      if (session) {
        useTaliStore.setState({ session })
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }

  return {
    // ... rest of hook
    loadSavedSession,
  }
}
```

---

### [ ] 5. Set Up Testing Framework
**Impact**: Catch bugs before production, enable safe refactoring  
**Time**: 2 hours

```bash
npm install --save-dev vitest @testing-library/react-native @testing-library/jest-native
```

**Create**: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
  },
})
```

**Create**: `package.json` scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

**Create first test**: `utils/__tests__/calculations.test.ts`
```typescript
import { describe, it, expect } from 'vitest'
import { calculateTotalKg, calculateGrandTotal } from '../calculations'
import { WeightEntry } from '../../types'

describe('calculateTotalKg', () => {
  it('returns 250kg for one full deck (10 × 25kg)', () => {
    const entries: WeightEntry[] = [
      { deckNumber: 1, counts: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25], isComplete: true }
    ]
    expect(calculateTotalKg(entries, 25, null)).toBe(250)
  })

  it('returns 50kg for 2 counts of 25kg each', () => {
    const entries: WeightEntry[] = [
      { deckNumber: 1, counts: [25, 25], isComplete: false }
    ]
    expect(calculateTotalKg(entries, 25, null)).toBe(50)
  })

  it('handles partial weight correctly', () => {
    const entries: WeightEntry[] = [
      { deckNumber: 1, counts: [25, 25, 25], isComplete: false }
    ]
    // 2 full counts (50kg) + partial weight (15kg) = 65kg
    expect(calculateTotalKg(entries, 25, 15)).toBe(65)
  })

  it('returns 0 for empty entries', () => {
    const entries: WeightEntry[] = [
      { deckNumber: 1, counts: [], isComplete: false }
    ]
    expect(calculateTotalKg(entries, 25, null)).toBe(0)
  })

  it('prevents negative totals', () => {
    const entries: WeightEntry[] = []
    expect(calculateTotalKg(entries, 25, null)).toBeGreaterThanOrEqual(0)
  })
})

describe('calculateGrandTotal', () => {
  it('sums total kg across multiple fish', () => {
    const fishData = [
      { totalKg: 100, fishId: 'fish1' } as any,
      { totalKg: 150, fishId: 'fish2' } as any,
      { totalKg: 75, fishId: 'fish3' } as any,
    ]
    expect(calculateGrandTotal(fishData)).toBe(325)
  })

  it('returns 0 for empty list', () => {
    expect(calculateGrandTotal([])).toBe(0)
  })
})
```

**Run tests**:
```bash
npm run test
# You should see 5 passing tests
```

---

## 🟡 HIGH PRIORITY (Complete this month)

### [ ] 6. Break Down Large Components
**Files to refactor**:
- `app/tali.tsx` (545 lines)
- `components/tali/TaliGrid.tsx` (376 lines)
- `components/tali/AddFishModal.tsx` (324 lines)

**Strategy**: Split each into 3-4 smaller components

Example:
```typescript
// BEFORE: TaliGrid.tsx (376 lines)
// AFTER:
// - TaliGrid.tsx (100 lines - main container)
// - TaliGridColumn.tsx (80 lines - single deck column)
// - TaliGridCell.tsx (40 lines - single cell)
// - TaliGridNumpad.tsx (150 lines - custom weight modal logic)
```

---

### [ ] 7. Create Custom Domain Hooks
**Create**: `hooks/useFishSession.ts`
```typescript
import { useTaliStore } from '../store/taliStore'

export function useFishSession(fishId: string) {
  const store = useTaliStore()
  const session = store.session
  const fish = session?.fishData.find(f => f.fishId === fishId)

  return {
    fish,
    isActive: fish?.fishId === session?.activeFishId,
    isPaused: fish?.isPaused ?? false,
    addCount: () => store.addCount(fishId),
    addCustomCount: (weight: number) => store.addCustomCount(fishId, weight),
    pause: () => store.pauseSession(fishId),
    resume: () => store.resumeSession(fishId),
    setPartialWeight: (weight: number) => store.setPartialWeight(fishId, weight),
    delete: () => store.deleteFish(fishId),
  }
}
```

**Benefit**: Components don't need to know about store internals

---

### [ ] 8. Add Comprehensive Logging
**Create**: `utils/logging.ts`
```typescript
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: Record<string, unknown>
  error?: string
}

const logs: LogEntry[] = []

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => {
    log('debug', message, data)
  },
  info: (message: string, data?: Record<string, unknown>) => {
    log('info', message, data)
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    log('warn', message, data)
  },
  error: (message: string, error?: Error, data?: Record<string, unknown>) => {
    log('error', message, { ...data, errorMsg: error?.message })
  },
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  }
  
  logs.push(entry)
  
  // Console output in development
  if (__DEV__) {
    console[level](`[${entry.timestamp}] ${message}`, data)
  }
  
  // Send to monitoring service in production
  if (level === 'error' && !__DEV__) {
    sendToSentry(entry)
  }
  
  // Keep only last 500 logs in memory
  if (logs.length > 500) {
    logs.shift()
  }
}

export const exportLogs = (): string => {
  return JSON.stringify(logs, null, 2)
}
```

**Usage throughout app**:
```typescript
import { logger } from '../utils/logging'

logger.info('Session created', { boatName, companyName })
logger.error('Failed to save', error, { sessionId })
```

---

## ⚪ MEDIUM PRIORITY (Next quarter)

### [ ] 9. Implement Summary Screen (Week 4)
Replace placeholder with real summary:
```typescript
export default function SummaryScreen() {
  const { session } = useTaliSession()
  
  if (!session) return <Placeholder />
  
  const totalKg = calculateGrandTotal(session.fishData)
  
  return (
    <ScrollView style={styles.container}>
      <SessionMetadata boat={session.boatName} company={session.companyName} />
      <FishBreakdownTable fish={session.fishData} />
      <TotalRow totalKg={totalKg} />
      <ActionButtons onBill={() => generateBill(session)} />
    </ScrollView>
  )
}
```

---

### [ ] 10. Implement Bill Generation (Week 4)
Add price list & bill generation

---

### [ ] 11. Add Data Export (Week 5)
JSON, CSV, PDF export functionality

---

## 📊 Tracking Progress

Use this checklist to track your progress:

```
Week 1-2:
  [ ] Fix unused code
  [ ] Add Zod validation
  [ ] Add error boundary
  [ ] Fix AsyncStorage
  [ ] Set up testing

Week 3-4:
  [ ] Break down components
  [ ] Create custom hooks
  [ ] Add logging
  [ ] Write core tests

Week 5-6:
  [ ] Summary screen
  [ ] Bill generation
  [ ] Data export

Week 7+:
  [ ] Performance optimization
  [ ] Security hardening
  [ ] Accessibility
  [ ] Production deployment
```

---

## How to Use This Document

1. **Start with 🔴 CRITICAL items** (do this week)
2. Take each action item in order
3. Check the box when complete
4. Move to 🟡 HIGH PRIORITY items next
5. Share this document with your team

---

**Questions?** See the full `ARCHITECTURE_ASSESSMENT.md` for detailed explanations and code examples.
