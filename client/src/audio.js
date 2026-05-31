// audio manager for game sound effects and background music
// loads each sound once at module level and provides play functions
// uses HTML5 Audio API for simple playback

import laserSound from './assets/sounds/laser.wav'
import asteroidHitSound from './assets/sounds/asteroid-hit.wav'
import shipHitSound from './assets/sounds/ship-hit.wav'
import shipExplosionSound from './assets/sounds/ship-explosion.wav'
import bounceSound from './assets/sounds/bounce.wav'
import victorySound from './assets/sounds/victory.wav'
import defeatSound from './assets/sounds/defeat.wav'
import fightSound from './assets/sounds/fight.wav'
import bgMusic from './assets/sounds/bg-music.mp3'

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
  fight: { src: fightSound, volume: 0.7 },
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

// background music management
// only one music track ever plays at a time and it loops
// fade in/out is handled by smoothly adjusting the volume over time

const BG_MUSIC_VOLUME = 0.25 // background music sits below the sound effects so it doesnt overwhelm
const FADE_DURATION_MS = 800
let bgMusicAudio = null
let bgMusicFadeInterval = null

function getBgMusicElement() {
  if (!bgMusicAudio) {
    bgMusicAudio = new Audio(bgMusic)
    bgMusicAudio.loop = true
    bgMusicAudio.volume = 0
  }
  return bgMusicAudio
}

// helper to smoothly fade volume from current to target over FADE_DURATION_MS
// clears any previous fade so calls don't fight each other
function fadeVolume(targetVolume, onComplete) {
  if (bgMusicFadeInterval) {
    clearInterval(bgMusicFadeInterval)
    bgMusicFadeInterval = null
  }

  const audio = getBgMusicElement()
  const startVolume = audio.volume
  const startTime = Date.now()

  bgMusicFadeInterval = setInterval(() => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(1, elapsed / FADE_DURATION_MS)
    audio.volume = startVolume + (targetVolume - startVolume) * progress

    if (progress >= 1) {
      clearInterval(bgMusicFadeInterval)
      bgMusicFadeInterval = null
      if (onComplete) onComplete()
    }
  }, 50)
}

// start background music with fade in
// safe to call multiple times - will just keep playing if already going
export function startBgMusic() {
  if (muted) return

  const audio = getBgMusicElement()
  if (audio.paused) {
    audio.play().catch(() => {})
  }
  fadeVolume(BG_MUSIC_VOLUME)
}

// stop background music with fade out
// pauses the audio once the fade completes so it can be restarted cleanly later
export function stopBgMusic() {
  if (!bgMusicAudio) return
  fadeVolume(0, () => {
    if (bgMusicAudio) bgMusicAudio.pause()
  })
}

// toggle mute state and return the new value so the UI can update
// also pauses/resumes background music to match the new mute state
export function toggleMute() {
  muted = !muted

  if (bgMusicAudio) {
    if (muted) {
      bgMusicAudio.pause()
    } else if (!bgMusicAudio.paused === false) {
      // music was playing before mute, restart it
      bgMusicAudio.play().catch(() => {})
    }
  }

  return muted
}

// check current mute state
export function isMuted() {
  return muted
}
