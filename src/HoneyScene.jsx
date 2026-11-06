import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import HoneyIllustration from './HoneyIllustration'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

// A lightweight product model: flexible clear wrapper, amber fill, original brand mark.
// Fluid motion is illustrative; this is not a simulation of a production packing line.
function pillowGeometry(width, height, depth) {
  const points = [], indices = [], uvs = []
  const rows = 44, columns = 32
  for (let y = 0; y <= rows; y++) {
    const v = y / rows
    const bulge = Math.pow(Math.sin(Math.PI * v), 0.3)
    for (let x = 0; x <= columns; x++) {
      const angle = x / columns * Math.PI * 2
      points.push(Math.cos(angle) * width / 2 * (0.88 + 0.12 * bulge), (v - 0.5) * height, Math.sin(angle) * depth / 2 * bulge)
      uvs.push(x / columns, v)
      if (y < rows && x < columns) {
        const a = y * (columns + 1) + x, b = a + columns + 1
        indices.push(a, b, a + 1, b, b + 1, a + 1)
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export default function HoneyScene({ mode = 'hero', size = '5g', playing = true, replay = 0 }) {
  const host = useRef(null)
  const animation = useRef({ playing, replay })
  const [failed, setFailed] = useState(false)
  useEffect(() => { animation.current = { playing, replay } }, [playing, replay])

  useEffect(() => {
    const node = host.current
    let renderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }) }
    catch { setFailed(true); return }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60)
    camera.position.set(0, 0.2, mode === 'hero' ? 11.5 : 12)
    camera.lookAt(0, 0, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    node.appendChild(renderer.domElement)
    const pmrem = new THREE.PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    const environment = pmrem.fromScene(room, 0.04)
    scene.environment = environment.texture
    room.dispose()
    scene.add(new THREE.HemisphereLight(0xfff4df, 0x69401d, 3))
    const light = new THREE.DirectionalLight(0xffedcc, 5)
    light.position.set(-3, 5, 5)
    scene.add(light)
    const rim = new THREE.DirectionalLight(0xffffff, 3)
    rim.position.set(4, 2, -2)
    scene.add(rim)

    const labelCanvas = document.createElement('canvas')
    labelCanvas.width = 384; labelCanvas.height = 640
    const context = labelCanvas.getContext('2d')
    const label = new THREE.CanvasTexture(labelCanvas)
    label.colorSpace = THREE.SRGBColorSpace
    label.anisotropy = 4
    let disposed = false
    const logo = new Image()
    function drawLabel() {
      context.fillStyle = '#fff9ee'; context.fillRect(0, 0, 384, 640)
      if (logo.complete && logo.naturalWidth) context.drawImage(logo, 132, 42, 120, 137)
      context.textAlign = 'center'; context.fillStyle = '#302418'; context.font = 'bold 65px Georgia'
      context.fillText('Norvax', 192, 255)
      context.fillStyle = '#986819'; context.fillText('Hub', 192, 323)
      context.font = '20px Arial'; context.fillStyle = '#473827'; context.fillText('PURE & NATURAL', 192, 376)
      context.fillStyle = '#b68b42'; context.fillRect(80, 418, 224, 2)
      context.font = '47px Georgia'; context.fillStyle = '#473827'; context.fillText(size, 192, 521)
      label.needsUpdate = true
    }
    drawLabel()
    logo.onload = () => { if (!disposed) drawLabel() }
    logo.src = '/images/norvax-bee-logo.svg'
    const honeyMaterial = new THREE.MeshPhysicalMaterial({ color: 0xe9940a, roughness: 0.19, metalness: 0, transmission: 0.28, thickness: 0.5, ior: 1.47, clearcoat: 1 })
    const wrapperMaterial = new THREE.MeshPhysicalMaterial({ color: 0xfffbef, roughness: 0.12, transparent: true, opacity: 0.22, metalness: 0.05, side: THREE.DoubleSide, depthWrite: false })
    const sealMaterial = new THREE.MeshPhysicalMaterial({ color: 0xeee6cf, roughness: 0.3, metalness: 0.4, transparent: true, opacity: 0.66 })
    const labelMaterial = new THREE.MeshStandardMaterial({ map: label, roughness: 0.7, side: THREE.DoubleSide })
    function createStick() {
      const group = new THREE.Group()
      const fill = new THREE.Mesh(pillowGeometry(0.64, 4.1, 0.31), honeyMaterial)
      group.add(fill)
      const wrapper = new THREE.Mesh(pillowGeometry(0.75, 4.38, 0.37), wrapperMaterial)
      wrapper.renderOrder = 2; group.add(wrapper)
      const top = new THREE.Group(), bottom = new THREE.Group()
      for (const [seal, y] of [[top, 2.28], [bottom, -2.28]]) {
        const foil = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.28, 0.025), sealMaterial)
        seal.add(foil)
        for (let i = 0; i < 6; i++) {
          const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.012, 0.04), sealMaterial)
          ridge.position.y = -0.11 + i * 0.044; seal.add(ridge)
        }
        seal.position.y = y; group.add(seal)
      }
      const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 1.27), labelMaterial)
      paper.position.set(0, -0.1, 0.196); group.add(paper)
      const back = paper.clone(); back.rotation.y = Math.PI; back.position.z = -0.196; group.add(back)
      return { group, fill, top }
    }
    const main = createStick()
    scene.add(main.group)
    const sides = []
    if (mode === 'hero') {
      for (const direction of [-1, 1]) {
        const side = createStick()
        side.group.position.set(direction * 1.35, -0.25, -0.55)
        side.group.rotation.set(0.05, direction * 0.24, -direction * 0.22)
        side.group.scale.setScalar(0.88)
        scene.add(side.group); sides.push(side.group)
      }
    }

    const steel = new THREE.MeshStandardMaterial({ color: 0xb6b0a5, metalness: 0.85, roughness: 0.23 })
    let nozzle, jaws, stream, cup, ripple, spoon
    if (mode === 'fill') {
      nozzle = new THREE.Group()
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.1, 0.65, 24), steel)
      body.position.y = 3.1; nozzle.add(body); scene.add(nozzle)
      jaws = new THREE.Group()
      for (const z of [-1, 1]) {
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.23, 0.16), steel)
        jaw.position.set(0, 1.98, z * 0.55); jaws.add(jaw)
      }
      scene.add(jaws)
      stream = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.04, 4.8, 12), honeyMaterial)
      stream.position.y = 0.45; scene.add(stream)
      main.group.position.y = -0.3
    }
    if (mode === 'pour') {
      cup = new THREE.Group()
      const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xf1e1c4, roughness: 0.27, clearcoat: 0.45, side: THREE.DoubleSide })
      const profile = [[0, 0], [0.65, 0], [0.86, 0.12], [1.05, 0.65], [1.08, 1.1], [1.04, 1.14], [0.98, 1.08], [0.94, 0.6], [0.72, 0.17], [0, 0.17]].map(([x, y]) => new THREE.Vector2(x, y))
      cup.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 64), ceramic))
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.11, 16, 40), ceramic)
      handle.position.set(1.05, 0.64, 0); cup.add(handle)
      const saucer = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.36, 0.09, 64), ceramic)
      saucer.position.y = -0.05; cup.add(saucer)
      const tea = new THREE.Mesh(new THREE.CircleGeometry(0.98, 64), new THREE.MeshPhysicalMaterial({ color: 0x783406, roughness: 0.17, metalness: 0.22, clearcoat: 1 }))
      tea.rotation.x = -Math.PI / 2; tea.position.y = 0.95; cup.add(tea)
      ripple = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.012, 8, 50), new THREE.MeshStandardMaterial({ color: 0xe6ad51, transparent: true, opacity: 0.6 }))
      ripple.rotation.x = Math.PI / 2; ripple.position.set(-0.12, 0.965, 0.05); cup.add(ripple)
      spoon = new THREE.Group()
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.8, 12), steel)
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 12), steel)
      bowl.scale.set(0.8, 0.18, 1.45); bowl.position.y = -0.85
      spoon.add(stem, bowl); spoon.position.y = 1.6; cup.add(spoon)
      cup.position.set(0, -2.4, 0); cup.rotation.x = 0.22; scene.add(cup)
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.05, 0.55, 0.2), new THREE.Vector3(-0.05, -0.25, 0.18), new THREE.Vector3(-0.12, -1.46, 0.25)])
      stream = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.034, 10, false), honeyMaterial)
      scene.add(stream)
    }
    // Soft contact shadow, generated procedurally rather than loading another texture.
    const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128
    const shadowContext = shadowCanvas.getContext('2d')
    const gradient = shadowContext.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, 'rgba(67,38,12,.25)'); gradient.addColorStop(1, 'rgba(67,38,12,0)')
    shadowContext.fillStyle = gradient; shadowContext.fillRect(0, 0, 128, 128)
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.3), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }))
    shadow.position.set(0, -2.8, -0.5); scene.add(shadow)

    let visible = false, frame, elapsed = 0, previous = 0, replayKey = animation.current.replay
    const pointer = { x: 0, y: 0 }
    const onPointer = (event) => {
      if (event.pointerType === 'touch' || reducedMotion.matches) return
      const bounds = node.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.35
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.12
    }
    const onLeave = () => { pointer.x = pointer.y = 0 }
    node.addEventListener('pointermove', onPointer); node.addEventListener('pointerleave', onLeave)
    const resize = new ResizeObserver(() => {
      if (!node.clientWidth || !node.clientHeight) return
      renderer.setSize(node.clientWidth, node.clientHeight)
      camera.aspect = node.clientWidth / node.clientHeight
      camera.position.z = camera.aspect < 0.8 ? 14 : mode === 'hero' ? 11.5 : 12
      camera.updateProjectionMatrix()
    })
    resize.observe(node)
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { rootMargin: '60px' })
    observer.observe(node)
    const onContextLost = (event) => { event.preventDefault(); setFailed(true) }
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    function render(now) {
      frame = requestAnimationFrame(render)
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0
      previous = now
      if (!visible || document.hidden) return
      if (animation.current.replay !== replayKey) { elapsed = 0; replayKey = animation.current.replay }
      if (animation.current.playing && !reducedMotion.matches) elapsed += delta
      const t = reducedMotion.matches ? 5.5 : elapsed % 12
      if (mode === 'hero') {
        main.group.position.y = 0.18 + Math.sin(t * 0.7) * 0.12
        main.group.rotation.set(pointer.y, Math.sin(t * 0.4) * 0.16 + pointer.x, -0.09)
        sides.forEach((side, index) => { side.position.y = -0.25 + Math.sin(t * 0.7 + index * 2) * 0.1 })
      } else if (mode === 'fill') {
        const amount = t < 1 ? 0.025 : t < 6 ? 0.025 + (t - 1) / 5 * 0.975 : 1
        main.fill.scale.y = amount; main.fill.position.y = -2.05 * (1 - amount)
        main.top.visible = t >= 7.5
        nozzle.visible = t < 6.5; stream.visible = t >= 1 && t < 6
        jaws.visible = t >= 6.5 && t < 8.5
        jaws.children.forEach((jaw, i) => { jaw.position.z = (i ? 1 : -1) * (t < 7.5 ? Math.max(0.1, 0.55 - (t - 6.5) * 0.45) : 0.1 + (t - 7.5) * 0.45) })
        main.group.rotation.y = t > 8.5 ? Math.sin((t - 8.5) * 0.8) * 0.3 : 0
      } else {
        const open = t >= 2, pour = t >= 3 && t < 8, stir = t >= 8
        main.group.scale.set(0.82 * (pour ? 1 - (t - 3) * 0.035 : 1), 0.82, 0.82)
        main.group.position.set(-0.05 + 2.28 * main.group.scale.x * Math.SQRT1_2, 1.87 + (stir ? (t - 8) * 0.5 : 0), 0.2)
        main.group.rotation.z = Math.PI * 0.75
        main.top.position.y = open ? 2.75 : 2.28; main.top.visible = t < 2.8
        main.fill.scale.y = pour ? Math.max(0.15, 1 - (t - 3) / 5) : stir ? 0.15 : 1
        main.fill.position.y = 2.05 * (1 - main.fill.scale.y)
        stream.visible = pour
        ripple.visible = pour || stir
        ripple.scale.setScalar(0.7 + (t % 1.5) * 2)
        ripple.material.opacity = 0.6 * (1 - t % 1.5 / 1.5)
        spoon.visible = stir
        spoon.position.x = Math.sin(t * 3) * 0.4; spoon.position.z = Math.cos(t * 3) * 0.4
        spoon.rotation.z = -0.2
      }
      renderer.render(scene, camera)
    }
    frame = requestAnimationFrame(render)
    return () => {
      disposed = true; cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect()
      node.removeEventListener('pointermove', onPointer); node.removeEventListener('pointerleave', onLeave)
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      const geometries = new Set(), materials = new Set()
      scene.traverse((object) => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material) })
      geometries.forEach((geometry) => geometry.dispose()); materials.forEach((material) => material.dispose())
      label.dispose(); shadowTexture.dispose(); environment.dispose(); pmrem.dispose(); renderer.dispose()
      renderer.domElement.remove()
    }
  }, [mode, size])

  return <div className={`honey-canvas ${failed ? 'scene-fallback' : ''}`} ref={host} role="img" aria-label={mode === 'hero' ? `Three-dimensional ${size} Norvax Hub honey sticks` : mode === 'fill' ? 'Illustration of a clear honey wrapper being filled and sealed' : 'Illustration of a honey stick opening, pouring into tea, and stirring'}>
    {failed && <HoneyIllustration mode={mode} size={size} playing={playing} replay={replay} />}
  </div>
}
