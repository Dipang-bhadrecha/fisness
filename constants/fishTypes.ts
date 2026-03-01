import { FishCategory } from '../types'

export const FISH_CATEGORIES: FishCategory[] = [
  {
    id: 'jumbo',
    name: 'Jumbo',
    nameGujarati: 'જમ્બો',
    bucketWeight: 25,
  },
  {
    id: 'kolami',
    name: 'Kolami',
    nameGujarati: 'કોલમી',
    bucketWeight: 20,
  },
  {
    id: 'tiger',
    name: 'Tiger Prawns',
    nameGujarati: 'ટાઈગર',
    bucketWeight: 25,
  },
  {
    id: 'pomfret',
    name: 'Pomfret',
    nameGujarati: 'પાપલેટ',
    bucketWeight: 25,
  },
  {
    id: 'bhungar',
    name: 'Bhungar',
    nameGujarati: 'ભુંગર',
    bucketWeight: 20,
  },
  {
    id: 'flowers',
    name: 'Flowers',
    nameGujarati: 'ફ્લાવર',
    bucketWeight: 25,
  },
  {
    id: 'paplet',
    name: 'Small Pomfret',
    nameGujarati: 'નાનો પાપલેટ',
    bucketWeight: 20,
  },
]

export const DEFAULT_BUCKET_WEIGHT = 25
export const COUNTS_PER_DECK = 10