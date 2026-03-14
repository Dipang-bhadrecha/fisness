import { FishCategory } from '../types'

export const FISH_CATEGORIES: FishCategory[] = [
  // ── Prawns / Kolami group ─────────────────────────────────────────────────
  { id: 'jumbo',          name: 'Jumbo',            nameGujarati: 'જમ્બો',           bucketWeight: 25 },
  { id: 'so_jumbo',       name: 'So. Jumbo',        nameGujarati: 'સો. જમ્બો',        bucketWeight: 25 },
  { id: 'medium',         name: 'Medium',           nameGujarati: 'મિડીયમ',           bucketWeight: 25 },
  { id: 'lofu_medium',    name: 'Lofu Medium',      nameGujarati: 'લોફુ મિડીયમ',      bucketWeight: 25 },
  { id: 'tiger',          name: 'Tiger',            nameGujarati: 'ટાઈગર',            bucketWeight: 25 },
  { id: 's_tiger',        name: 'S Tiger',          nameGujarati: 'S ટાઈગર',          bucketWeight: 25 },
  { id: 'n_tiger',        name: 'N Tiger',          nameGujarati: 'N ટાઈગર',          bucketWeight: 25 },
  { id: 'taini',          name: 'Taini',            nameGujarati: 'ટાઈની',            bucketWeight: 20 },
  { id: 'kapsi',          name: 'Kapsi',            nameGujarati: 'કાપસી',            bucketWeight: 20 },
  { id: 'flower',         name: 'Flower',           nameGujarati: 'ફ્લાવર',           bucketWeight: 25 },
  { id: 'sl',             name: 'SL',               nameGujarati: 'SL',               bucketWeight: 20 },

  // ── Titan / Tittan group ──────────────────────────────────────────────────
  { id: 'titan_100',      name: '100 Titan',        nameGujarati: '૧૦૦ ટીટણ',        bucketWeight: 20 },
  { id: 'titan_300',      name: '300 Titan',        nameGujarati: '૩૦૦ ટીટણ',        bucketWeight: 20 },
  { id: 'lofu_titan',     name: 'Lofu Titan',       nameGujarati: 'લોફુ ટીટણ',       bucketWeight: 20 },
  { id: 'marela_titan',   name: 'Marela Titan',     nameGujarati: 'મરેલા ટીટણ',      bucketWeight: 20 },

  // ── Kolami group ──────────────────────────────────────────────────────────
  { id: 'lal_kolami',     name: 'Lal Kolami',       nameGujarati: 'લાલ કોળમી',       bucketWeight: 20 },
  { id: 'kolami',         name: 'Kolami',           nameGujarati: 'કોળમી',            bucketWeight: 20 },

  // ── Mid-size fish ─────────────────────────────────────────────────────────
  { id: 'narsinga',       name: 'Narsinga',         nameGujarati: 'નરસિંગા',          bucketWeight: 25 },
  { id: 'makul',          name: 'Makul',            nameGujarati: 'માકુળ',            bucketWeight: 25 },
  { id: 'dekki',          name: 'Dekki',            nameGujarati: 'ડેક્કી',           bucketWeight: 25 },

  // ── Goti / Shrimp group ───────────────────────────────────────────────────
  { id: 'goti',           name: 'Goti',             nameGujarati: 'ગોટી',             bucketWeight: 20 },
  { id: 'k_goti',         name: 'K Goti',           nameGujarati: 'K ગોટી',           bucketWeight: 20 },
  { id: 'sevani_o',       name: 'Sevani O',         nameGujarati: 'સેવણી O',          bucketWeight: 20 },
  { id: 'batan',          name: 'Batan',            nameGujarati: 'બટન',              bucketWeight: 20 },
  { id: 'lb_o',           name: 'LB O',             nameGujarati: 'LB O',             bucketWeight: 20 },
  { id: 'lb',             name: 'LB',               nameGujarati: 'LB',               bucketWeight: 20 },

  // ── Baga group ────────────────────────────────────────────────────────────
  { id: 'baga',           name: 'Baga',             nameGujarati: 'બગા',              bucketWeight: 25 },
  { id: 'r_baga',         name: 'R Baga',           nameGujarati: 'R બગા',            bucketWeight: 25 },

  // ── Pomfret / White fish ──────────────────────────────────────────────────
  { id: 'pomfret',        name: 'Pomfret',          nameGujarati: 'પાપલેટ',           bucketWeight: 25 },
  { id: 'white',          name: 'White',            nameGujarati: 'સફેદ',             bucketWeight: 25 },

  // ── Mixed catch fish ──────────────────────────────────────────────────────
  { id: 'surmai',         name: 'Surmai',           nameGujarati: 'સૂરમઈ',            bucketWeight: 25 },
  { id: 'rawas',          name: 'Rawas',            nameGujarati: 'રાવસ',             bucketWeight: 25 },
  { id: 'pomfret_black',  name: 'Black Pomfret',    nameGujarati: 'કાળો પાપલેટ',     bucketWeight: 25 },
  { id: 'bhungar',        name: 'Bhungar',          nameGujarati: 'ભુંગર',            bucketWeight: 20 },
  { id: 'crab',           name: 'Crab',             nameGujarati: 'ખેકડો',            bucketWeight: 20 },
  { id: 'squid',          name: 'Squid',            nameGujarati: 'સ્ક્વિડ',          bucketWeight: 20 },
  { id: 'ghol',           name: 'Ghol',             nameGujarati: 'ઘોળ',              bucketWeight: 25 },
  { id: 'dhedki',         name: 'Dhedki',           nameGujarati: 'ઢેઢકી',            bucketWeight: 20 },
  { id: 'tatura',         name: 'Tatura',           nameGujarati: 'તતૂરા',            bucketWeight: 20 },
  { id: 'papdi',          name: 'Papdi',            nameGujarati: 'પાપડી',            bucketWeight: 20 },
  { id: 'kanta',          name: 'Kanta',            nameGujarati: 'કાંટા',            bucketWeight: 20 },
  { id: 'mushi',          name: 'Mushi',            nameGujarati: 'મૂછ',              bucketWeight: 20 },
  { id: 'nalo',           name: 'Nalo',             nameGujarati: 'નળો',              bucketWeight: 20 },
  { id: 'tamdi',          name: 'Tamdi',            nameGujarati: 'તામ્ડી',           bucketWeight: 20 },
  { id: 'gorbu',          name: 'Gorbu',            nameGujarati: 'ગોર ભૂ',           bucketWeight: 25 },
  { id: 'vati',           name: 'Vati',             nameGujarati: 'વાટી',             bucketWeight: 20 },
  { id: 'davar',          name: 'Davar',            nameGujarati: 'ડાવર',             bucketWeight: 20 },
  { id: 'kansar',         name: 'Kansar',           nameGujarati: 'કાણસર',            bucketWeight: 20 },
  { id: 'pati',           name: 'Pati',             nameGujarati: 'પટ્ટી',            bucketWeight: 20 },
  { id: 'amar',           name: 'Amar',             nameGujarati: 'અમર',              bucketWeight: 20 },
  { id: 'bhomki',         name: 'Bhomki',           nameGujarati: 'ભોમ્કી',           bucketWeight: 20 },
  { id: 'prati',          name: 'Prati',            nameGujarati: 'પ્રતી',            bucketWeight: 20 },
  { id: 'turi',           name: 'Turi',             nameGujarati: 'તૂરી',             bucketWeight: 20 },
  { id: 'dhol',           name: 'Dhol',             nameGujarati: 'ઢોળ',              bucketWeight: 20 },
  { id: 'sumai',          name: 'Sumai',            nameGujarati: 'સૂમઈ',             bucketWeight: 25 },
  { id: 'kakra',          name: 'Kakra',            nameGujarati: 'કાકરા',            bucketWeight: 20 },
  { id: 'malvani',        name: 'Malvani',          nameGujarati: 'માળવણી',           bucketWeight: 20 },
  { id: 'vankam',         name: 'Vankam',           nameGujarati: 'વાંકમ',            bucketWeight: 20 },
  { id: 'pamplet',        name: 'Pamplet',          nameGujarati: 'પામ્પ્લેટ',        bucketWeight: 25 },
  { id: 'pandori',        name: 'Pandori',          nameGujarati: 'પાંડોરી',          bucketWeight: 20 },
  { id: 'khekdo',         name: 'Khekdo',           nameGujarati: 'ખેકડો',            bucketWeight: 20 },
  { id: 'paplet_so',      name: 'So. Paplet',       nameGujarati: 'સો. પાપ્લેટ',     bucketWeight: 25 },
  { id: 'ravan',          name: 'Ravan',            nameGujarati: 'રાવણ',             bucketWeight: 25 },
  { id: 'lobster',        name: 'Lobster',          nameGujarati: 'લૉબ્સ્ટર',        bucketWeight: 20 },
]

// ── Fish groups for the pre-selection screen ──────────────────────────────────
export const FISH_GROUPS = [
  {
    id: 'prawns',
    label: 'Prawns',
    labelGuj: 'ઝીંગા',
    emoji: '🦐',
    ids: ['jumbo', 'so_jumbo', 'medium', 'lofu_medium', 'tiger', 's_tiger', 'n_tiger', 'taini', 'kapsi', 'flower', 'sl'],
  },
  {
    id: 'titan',
    label: 'Titan',
    labelGuj: 'ટીટણ',
    emoji: '🐠',
    ids: ['titan_100', 'titan_300', 'lofu_titan', 'marela_titan'],
  },
  {
    id: 'kolami',
    label: 'Kolami',
    labelGuj: 'કોળમી',
    emoji: '🦑',
    ids: ['lal_kolami', 'kolami', 'narsinga', 'makul', 'dekki'],
  },
  {
    id: 'goti',
    label: 'Goti / Shrimp',
    labelGuj: 'ગોટી',
    emoji: '🍤',
    ids: ['goti', 'k_goti', 'sevani_o', 'batan', 'lb_o', 'lb', 'baga', 'r_baga'],
  },
  {
    id: 'fish',
    label: 'Fish',
    labelGuj: 'માછલી',
    emoji: '🐟',
    ids: ['pomfret', 'surmai', 'rawas', 'bhungar', 'ghol', 'gorbu', 'white', 'pomfret_black', 'crab', 'squid'],
  },
  {
    id: 'other',
    label: 'Other',
    labelGuj: 'અન્ય',
    emoji: '🐡',
    ids: ['dhedki', 'tatura', 'papdi', 'kanta', 'mushi', 'nalo', 'tamdi', 'vati', 'davar', 'kansar', 'pati', 'amar', 'bhomki', 'prati', 'turi', 'dhol', 'kakra', 'malvani', 'vankam', 'pamplet', 'pandori'],
  },
]

export const DEFAULT_BUCKET_WEIGHT = 25
export const COUNTS_PER_DECK = 10