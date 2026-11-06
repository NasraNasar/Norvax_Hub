import test from 'node:test'
import assert from 'node:assert/strict'
import { ritualAt, RITUAL_DURATION, ease } from '../src/honeyMotion.js'
import { Vector3, Euler } from 'three'

test('honey pours after opening and stirring starts after the pour', () => {
  for (let t = 0; t < RITUAL_DURATION; t += 0.025) {
    const state = ritualAt(t)
    if (state.pour > 0) assert.equal(state.tear, 1)
    if (state.stir > 0) { assert.equal(state.pour, 0); assert.equal(state.spoonEntry, 1) }
    assert.ok(state.remaining >= 0 && state.remaining <= 1)
    assert.ok(state.pour >= 0 && state.pour <= 1)
  }
})
test('tea continues settling after the spoon stops and reset is hidden', () => {
  const settled = ritualAt(15.1)
  assert.equal(settled.stir, 0)
  assert.ok(settled.wake > 0)
  assert.equal(ritualAt(17.4).wake, 0)
  assert.equal(ritualAt(18).reveal, 0)
  assert.ok(ritualAt(17.999).reveal < 0.001)
})
test('squeezing does not pull the opening away from the honey stream', () => {
  for (const t of [3, 5, 7.9]) {
    const width = 0.65 * (1 - 0.18 * ease(3, 8, t))
    const tip = new Vector3(0, 2.28, 0).multiply(new Vector3(width, 0.65, 0.65)).applyEuler(new Euler(0, 0, Math.PI * 0.75))
    tip.add(new Vector3(2.28 * 0.65 * Math.SQRT1_2, 0.74 + 2.28 * 0.65 * Math.SQRT1_2, 0.34))
    assert.ok(tip.distanceTo(new Vector3(0, 0.74, 0.34)) < 1e-10)
  }
})
