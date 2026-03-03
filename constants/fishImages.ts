/**
 * Fish Image Map
 *
 * Each fish ID maps to its image in assets/images/fish/
 * You already have these files in your repo ✅
 *
 * BACKEND READY: When API is connected, swap any require()
 * with { uri: fishData.imageUrl } — no other changes needed.
 */

type FishImageSource = ReturnType<typeof require> | { uri: string } | null

const FISH_IMAGES: Record<string, FishImageSource> = {
  jumbo:    require('../assets/images/fish/jumbo.jpg'),
  pomfret:  require('../assets/images/fish/promphet.jpg'),   
  bhungar:  require('../assets/images/fish/bhungar.jpg'),
  narsinga: require('../assets/images/fish/narsinga.jpg'),
  white:    require('../assets/images/fish/white.jpg'),
  prati:    require('../assets/images/fish/prati.jpg'),
  squid:    require('../assets/images/fish/squid.jpg'),
  crab:     require('../assets/images/fish/crab.jpg'),
  prawns_l: require('../assets/images/fish/prawns_l.jpg'),
  prawns_s: require('../assets/images/fish/prawns_s.jpg'),
  kolami:   require('../assets/images/fish/kolami.jpg'),
  tiger:    require('../assets/images/fish/tiger.jpg'),
  flowers:  require('../assets/images/fish/flowers.jpg'),
}

/**
 * Returns the image source for a given fish ID.
 * Returns null for custom fish (user typed) — shows no image.
 */
export function getFishImage(fishId: string): FishImageSource {
  if (fishId.startsWith('custom_')) return null
  return FISH_IMAGES[fishId] ?? null
}