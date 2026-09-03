import { ref, onUnmounted } from 'vue'

export function useCountdown() {
  const countdown = ref(5)
  const isCounting = ref(false)
  const isPaused = ref(false)
  let timerInterval = null
  let completeCallback = null

  const clearTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  const startCountdown = (duration = 5, onComplete = null) => {
    clearTimer()
    countdown.value = duration
    isCounting.value = true
    isPaused.value = false
    completeCallback = onComplete

    timerInterval = setInterval(() => {
      if (isPaused.value) return

      if (countdown.value > 1) {
        countdown.value--
      } else {
        countdown.value = 0
        clearTimer()
        isCounting.value = false
        if (completeCallback) {
          completeCallback()
        }
      }
    }, 1000)
  }

  const pauseCountdown = () => {
    if (isCounting.value) {
      isPaused.value = true
    }
  }

  const resumeCountdown = () => {
    if (isCounting.value) {
      isPaused.value = false
    }
  }

  const cancelCountdown = () => {
    clearTimer()
    isCounting.value = false
    isPaused.value = false
    countdown.value = 0
  }

  onUnmounted(() => {
    clearTimer()
  })

  return {
    countdown,
    isCounting,
    isPaused,
    startCountdown,
    pauseCountdown,
    resumeCountdown,
    cancelCountdown
  }
}
