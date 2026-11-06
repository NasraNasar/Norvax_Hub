export const RITUAL_DURATION = 18
export const clamp01 = (value) => Math.max(0, Math.min(1, value))
export function ease(start, end, time) {
  const x = clamp01((time - start) / (end - start))
  return x * x * (3 - 2 * x)
}

// Separate the choreography from rendering so alignment and transitions can be checked.
export function ritualAt(time) {
  const t = ((time % RITUAL_DURATION) + RITUAL_DURATION) % RITUAL_DURATION
  const pour = ease(2.6, 3.15, t) * (1 - ease(7.6, 8.2, t))
  const stir = ease(9.6, 10.6, t) * (1 - ease(13.8, 15.1, t))
  return {
    t, pour, stir,
    tear: ease(1.2, 2.1, t),
    remaining: 1 - 0.96 * ease(2.8, 8.2, t),
    retreat: ease(8.4, 9.8, t),
    spoonEntry: ease(8.7, 9.6, t),
    spoonExit: ease(15.2, 16.2, t),
    // An eased angular journey, with a damped wake after the spoon stops.
    angle: Math.PI * 5.5 * ease(9.6, 15.1, t),
    wake: ease(9.4, 10.6, t) * (1 - ease(14.3, 17.3, t)),
    reveal: ease(0, 0.65, t) * (1 - ease(17.25, 18, t)),
  }
}
