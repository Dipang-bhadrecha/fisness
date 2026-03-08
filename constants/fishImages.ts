/**
 * Fish Image Map
 *
 * Each fish ID maps to its image in assets/fish/
 * You already have these files in your repo ✅
 *
 * BACKEND READY: When API is connected, swap any require()
 * with { uri: fishData.imageUrl } — no other changes needed.
 */

type FishImageSource = ReturnType<typeof require> | { uri: string } | null

const FISH_IMAGES: Record<string, FishImageSource> = {
  jumbo:    require('../assets/fish/jumbo.jpg'),
  pomfret:  require('../assets/fish/promphet.jpg'),
  bhungar:  require('../assets/fish/bhungar.jpg'),
  narsinga: require('../assets/fish/narsinga.jpg'),
  white:    require('../assets/fish/white.jpg'),
  prati:    require('../assets/fish/prati.jpg'),
  squid:    require('../assets/fish/squid.jpg'),
  crab:     require('../assets/fish/crab.jpg'),
  prawns_l: require('../assets/fish/prawns_l.jpg'),
  prawns_s: require('../assets/fish/prawns_s.jpg'),
  kolami:   require('../assets/fish/kolami.jpg'),
  tiger:    require('../assets/fish/tiger.jpg'),
  flowers:  require('../assets/fish/flowers.jpg'),
}

/**
 * Returns the image source for a given fish ID.
 * Returns null for custom fish (user typed) — shows no image.
 */
export function getFishImage(fishId: string): FishImageSource {
  if (fishId.startsWith('custom_')) return null
  return FISH_IMAGES[fishId] ?? null
}
