import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import HoneyIllustration from './HoneyIllustration'
import { ritualAt, ease } from './honeyMotion'
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

// Concentric topology gives the liquid interior enough vertices to form a gentle wake.
function liquidGeometry(radius) {
  const vertices = [], indices = [], rings = 24, segments = 96
  for (let ring = 0; ring <= rings; ring++) {
    for (let segment = 0; segment <= segments; segment++) {
      const a = segment / segments * Math.PI * 2, r = radius * ring / rings
      vertices.push(Math.cos(a) * r, Math.sin(a) * r, 0)
      if (ring < rings && segment < segments) {
        const a0 = ring * (segments + 1) + segment, b = a0 + segments + 1
        indices.push(a0, b, a0 + 1, b, b + 1, a0 + 1)
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices); geometry.computeVertexNormals()
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
    renderer.toneMappingExposure = 0.92
    node.appendChild(renderer.domElement)
    const pmrem = new THREE.PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    const environment = pmrem.fromScene(room, 0.04)
    scene.environment = environment.texture
    scene.environmentIntensity = 0.55
    room.dispose()
    scene.add(new THREE.HemisphereLight(0xfff7e9, 0x392717, 0.65))
    const light = new THREE.DirectionalLight(0xfff3df, 2.4)
    light.position.set(-3, 5, 5)
    scene.add(light)
    const rim = new THREE.DirectionalLight(0xffffff, 1.3)
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
    const honeyMaterial = new THREE.MeshPhysicalMaterial({ color: 0xb96808, roughness: 0.23, metalness: 0, transmission: 0.08, thickness: 0.65, attenuationColor: 0xa84603, attenuationDistance: 0.8, ior: 1.47, clearcoat: 0.8, clearcoatRoughness: 0.18 })
    const wrapperMaterial = new THREE.MeshPhysicalMaterial({ color: 0xfffaf0, roughness: 0.26, transparent: true, opacity: 0.085, metalness: 0, clearcoat: 0.7, side: THREE.FrontSide, depthWrite: false })
    const sealMaterial = new THREE.MeshPhysicalMaterial({ color: 0xbcb8a9, roughness: 0.38, metalness: 0.32 })
    const labelMaterial = new THREE.MeshBasicMaterial({ map: label, toneMapped: false, side: THREE.DoubleSide })
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
      // The welded edges and small folds catch light without turning the film opaque.
      const seamMaterial = new THREE.MeshStandardMaterial({ color: 0xd3b87a, roughness: 0.45, transparent: true, opacity: 0.4 })
      for (const direction of [-1, 1]) {
        const seam = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 4.3, 8), seamMaterial)
        seam.position.set(direction * 0.35, 0, 0.025); group.add(seam)
        for (const end of [-1, 1]) {
          for (let i = 0; i < 3; i++) {
            const crease = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.002, 0.26, 5), seamMaterial)
            crease.position.set(direction * (0.25 - i * 0.055), end * 2.06, 0.07)
            crease.rotation.z = direction * end * (0.15 + i * 0.12); group.add(crease)
          }
        }
      }
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
    let nozzle, jaws, stream, cup, spoon, teaUniforms
    const ripples = []
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
      const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xd8cbb3, roughness: 0.24, clearcoat: 0.65, clearcoatRoughness: 0.16, side: THREE.DoubleSide })
      const profile = [[0, 0], [0.50, 0], [0.62, 0.035], [0.68, 0.1], [0.8, 0.27], [0.95, 0.62], [1.04, 1.02], [1.045, 1.1], [1.025, 1.125], [0.995, 1.115], [0.98, 1.08], [0.91, 0.65], [0.76, 0.28], [0.61, 0.14], [0, 0.14]].map(([x, y]) => new THREE.Vector2(x, y))
      cup.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 96), ceramic))
      const handleCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.99, 0.95, 0), new THREE.Vector3(1.48, 0.96, 0),
        new THREE.Vector3(1.51, 0.56, 0), new THREE.Vector3(1.24, 0.26, 0), new THREE.Vector3(0.8, 0.25, 0),
      ])
      cup.add(new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 40, 0.085, 12, false), ceramic))
      const saucerProfile = [[0, -0.1], [0.63, -0.1], [0.68, -0.12], [0.72, -0.1], [1.15, -0.07], [1.48, 0.015], [1.53, 0.06], [1.49, 0.08], [1.25, 0.02], [0.76, -0.025], [0, -0.025]].map(([x, y]) => new THREE.Vector2(x, y))
      cup.add(new THREE.Mesh(new THREE.LatheGeometry(saucerProfile, 96), ceramic))
      const teaMaterial = new THREE.MeshPhysicalMaterial({ color: 0x64300d, roughness: 0.2, metalness: 0.03, clearcoat: 1, clearcoatRoughness: 0.12 })
      teaUniforms = { uTime: { value: 0 }, uWake: { value: 0 }, uHoney: { value: 0 }, uAngle: { value: 0 }, uPour: { value: 0 } }
      teaMaterial.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, teaUniforms)
        const uniforms = 'uniform float uTime; uniform float uWake; uniform float uHoney; uniform float uAngle; uniform float uPour; varying vec2 vLiquid;\n'
        shader.vertexShader = uniforms + shader.vertexShader
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
          #include <begin_vertex>
          vLiquid = position.xy;
          float radius = length(position.xy);
          float wave = sin(radius * 24.0 - uTime * 5.0) * 0.007 * uPour;
          float swirlWave = sin(atan(position.y, position.x) * 3.0 - uAngle * 1.3 + radius * 9.0) * 0.009 * uWake;
          transformed.z += (wave + swirlWave) * (1.0 - smoothstep(0.65, 0.96, radius));
        `)
        shader.fragmentShader = uniforms + shader.fragmentShader
        shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
          #include <color_fragment>
          float r = length(vLiquid);
          float theta = atan(vLiquid.y, vLiquid.x);
          float spiral = sin(theta * 3.0 + r * 18.0 - uAngle * 1.5 + sin(r * 13.0 - uTime * 0.6) * 0.4);
          float vein = pow(max(0.0, spiral), 12.0) * (1.0 - smoothstep(0.7, 0.94, r));
          float pool = exp(-length(vLiquid - vec2(0.06, -0.12)) * 9.0) * uPour;
          diffuseColor.rgb *= 0.78 + 0.3 * (1.0 - smoothstep(0.0, 1.0, r));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.34, 0.14, 0.025), vein * uWake * 0.43 + pool * 0.38);
          diffuseColor.rgb += vec3(0.035, 0.015, 0.003) * uHoney;
        `)
      }
      const tea = new THREE.Mesh(liquidGeometry(0.975), teaMaterial)
      tea.rotation.x = -Math.PI / 2; tea.position.y = 1.01; cup.add(tea)
      // Subtle expanding surface ripples, rather than a single bright target ring.
      for (let i = 0; i < 3; i++) {
        const ripple = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.0035, 6, 64), new THREE.MeshBasicMaterial({ color: 0xc19452, transparent: true, opacity: 0, depthWrite: false }))
        ripple.rotation.x = Math.PI / 2; ripple.position.set(0.06, 1.016, 0.12); cup.add(ripple); ripples.push(ripple)
      }
      spoon = new THREE.Group()
      const stem = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 1.5, 5, 12), steel)
      stem.scale.z = 0.42; stem.position.y = 0.84
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xb9b5aa, metalness: 0.94, roughness: 0.2, side: THREE.DoubleSide }))
      bowl.scale.set(0.14, 0.055, 0.23)
      bowl.rotation.x = 0.18; spoon.add(stem, bowl); cup.add(spoon)
      cup.position.set(-0.1, -2.05, 0); cup.rotation.x = 0.27; cup.scale.setScalar(1.15); scene.add(cup)
      // Endpoints are calculated in world space from the sachet opening and tea surface.
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.0, 0.74, 0.34), new THREE.Vector3(0.005, -0.05, 0.38), new THREE.Vector3(-0.031, -0.967, 0.442)])
      stream = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.023, 12, false), honeyMaterial)
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
      const t = reducedMotion.matches ? 5.5 : elapsed % (mode === 'pour' ? 18 : 12)
      if (mode === 'hero') {
        main.group.position.y = 0.18 + Math.sin((reducedMotion.matches ? 0 : elapsed) * 0.7) * 0.12
        main.group.rotation.set(pointer.y, Math.sin((reducedMotion.matches ? 0 : elapsed) * 0.4) * 0.16 + pointer.x, -0.09)
        sides.forEach((side, index) => { side.position.y = -0.25 + Math.sin((reducedMotion.matches ? 0 : elapsed) * 0.7 + index * 2) * 0.1 })
      } else if (mode === 'fill') {
        const amount = t < 1 ? 0.025 : t < 6 ? 0.025 + (t - 1) / 5 * 0.975 : 1
        main.fill.scale.y = amount; main.fill.position.y = -2.05 * (1 - amount)
        main.top.visible = t >= 7.5
        nozzle.visible = t < 6.5; stream.visible = t >= 1 && t < 6
        const surfaceY = -0.3 - 2.05 + amount * 4.1
        const streamLength = 2.775 - surfaceY
        stream.scale.y = streamLength / 4.8
        stream.position.y = (2.775 + surfaceY) / 2
        jaws.visible = t >= 6.5 && t < 8.5
        jaws.children.forEach((jaw, i) => { jaw.position.z = (i ? 1 : -1) * (t < 7.5 ? Math.max(0.1, 0.55 - (t - 6.5) * 0.45) : 0.1 + (t - 7.5) * 0.45) })
        main.group.rotation.y = t > 8.5 ? Math.sin((t - 8.5) * 0.8) * 0.3 : 0
      } else {
        const state = ritualAt(t)
        // Keep the torn opening anchored while the flexible packet compresses.
        const width = 0.65 * (1 - 0.18 * ease(3, 8, t))
        main.group.scale.set(width, 0.65, 0.65 * (1 - 0.55 * ease(3, 8, t)))
        main.group.rotation.set(0, 0, Math.PI * 0.75)
        main.group.position.set(2.28 * 0.65 * Math.SQRT1_2 + state.retreat * 2, 0.74 + 2.28 * 0.65 * Math.SQRT1_2 + state.retreat * 1.5, 0.34)
        main.group.visible = state.retreat < 0.99
        main.top.position.set(state.tear * 0.4, 2.28 + state.tear * 0.6, 0)
        main.top.rotation.z = state.tear * 0.45; main.top.visible = t < 2.2
        main.fill.scale.y = state.remaining
        main.fill.position.y = 2.05 * (1 - state.remaining)
        stream.visible = state.pour > 0.01
        stream.scale.x = stream.scale.z = 0.65 + state.pour * 0.35
        teaUniforms.uTime.value = t
        teaUniforms.uWake.value = state.wake
        teaUniforms.uAngle.value = state.angle
        teaUniforms.uPour.value = state.pour
        teaUniforms.uHoney.value = 1 - state.remaining
        ripples.forEach((ripple, i) => {
          const phase = ((t - 2.6 + i * 0.45) % 1.35 + 1.35) % 1.35 / 1.35
          ripple.scale.setScalar(0.2 + phase * 4)
          ripple.material.opacity = (1 - phase) * 0.2 * state.pour
        })
        spoon.visible = t >= 8.7 && t < 16.3
        const radius = 0.42 * (1 - 0.15 * state.stir)
        spoon.position.set(Math.cos(state.angle) * radius, 0.82 + (1 - state.spoonEntry + state.spoonExit) * 1.5, Math.sin(state.angle) * radius)
        spoon.rotation.set(Math.sin(state.angle) * 0.2, -state.angle, -Math.cos(state.angle) * 0.2)
        // A gentle crossfade hides the reset after the liquid has settled.
        renderer.domElement.style.opacity = state.reveal

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
