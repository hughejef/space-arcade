// audio manager for game sound effects
// loads each sound once at module level and provides a play function
// uses Web Audio API via HTML5 Audio elements for simple playback

import laserSound from './assets/sounds/laser.wav'
import asteroidHitSound from './assets/sounds/asteroid-hit.wav'
import shipHitSound from './assets/sounds/ship-hit.wav'
import shipExplosionSound from './assets/sounds/ship-explosion.wav'
import bounceSound from './assets/sounds/bounce.wav'
import victorySound from './assets/sounds/victory.wav'
import defeatSound from './assets/sounds/defeat.wav'

// each sound has a path and a default volume
// volumes are tuned so the loud effects (explosions) don't drown out the quieter ones (laser)
const SOUNDS = {
  laser: { src: laserSound, volume: 0.3 },
  asteroidHit: { src: asteroidHitSound, volume: 0.5 },
  shipHit: { src: shipHitSound, volume: 0.6 },
  shipExplosion: { src: shipExplosionSound, volume: 0.7 },
  bounce: { src: bounceSound, volume: 0.3 },
  victory: { src: victorySound, volume: 0.6 },
  defeat: { src: defeatSound, volume: 0.6 },
}

// global mute state - shared across all play calls
let muted = false

// pool of audio elements per sound to allow overlapping playback
// without this, rapid fire shooting would cut off the previous laser sound
// we keep a few clones per sound and cycle through them
const audioPools = {}
const POOL_SIZE = 4

function getPool(soundName) {
  if (!audioPools[soundName]) {
    const pool = []
    for (let i = 0; i < POOL_SIZE; i++) {
      const audio = new Audio(SOUNDS[soundName].src)
      audio.volume = SOUNDS[soundName].volume
      pool.push(audio)
    }
    audioPools[soundName] = { pool, index: 0 }
  }
  return audioPools[soundName]
}

// play a sound by name - safe to call rapidly
// returns silently if the sound doesn't exist or if audio is muted
export function playSound(soundName) {
  if (muted) return
  if (!SOUNDS[soundName]) {
    console.warn(`unknown sound: ${soundName}`)
    return
  }

  const poolInfo = getPool(soundName)
  const audio = poolInfo.pool[poolInfo.index]
  poolInfo.index = (poolInfo.index + 1) % POOL_SIZE

  // rewind to start in case this audio element is still playing from a previous call
  audio.currentTime = 0
  // play returns a promise that may reject if the browser blocks autoplay
  // we catch silently since this happens on first interaction before the user clicks anything
  audio.play().catch(() => {})
}

// toggle mute state and return the new value so the UI can update
export function toggleMute() {
  muted = !muted
  return muted
}

// check current mute state
export function isMuted() {
  return muted
}
