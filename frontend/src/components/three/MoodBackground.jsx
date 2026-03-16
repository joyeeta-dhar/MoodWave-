import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const MOOD_CONFIGS = {
  happy:     { color: 0xfbbf24, speed: 2.5, count: 200, size: 0.05 },
  sad:       { color: 0x60a5fa, speed: 0.4, count: 80,  size: 0.03 },
  energetic: { color: 0xf472b6, speed: 4.0, count: 350, size: 0.04 },
  calm:      { color: 0x34d399, speed: 0.6, count: 100, size: 0.04 },
  stressed:  { color: 0xfb923c, speed: 1.8, count: 150, size: 0.035 },
  romantic:  { color: 0xf43f5e, speed: 0.8, count: 120, size: 0.05 },
  nostalgic: { color: 0xa78bfa, speed: 0.9, count: 130, size: 0.04 },
}

export default function MoodBackground({ mood }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 3

    const cfg = MOOD_CONFIGS[mood] || MOOD_CONFIGS.calm

    // Particle system
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(cfg.count * 3)
    for (let i = 0; i < cfg.count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({
      color: cfg.color,
      size: cfg.size,
      transparent: true,
      opacity: 0.7,
    })
    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    // Central wireframe sphere
    const sphereGeo = new THREE.SphereGeometry(0.5, 32, 32)
    const sphereMat = new THREE.MeshBasicMaterial({
      color: cfg.color,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    })
    const sphere = new THREE.Mesh(sphereGeo, sphereMat)
    scene.add(sphere)

    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = Date.now() * 0.001 * cfg.speed
      particles.rotation.y = t * 0.1
      particles.rotation.x = t * 0.05
      sphere.rotation.y = t * 0.3
      sphere.rotation.x = t * 0.2
      sphere.scale.setScalar(1 + Math.sin(t) * 0.1)
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      sphereGeo.dispose()
      sphereMat.dispose()
    }
  }, [mood])

  return <canvas ref={canvasRef} id="three-canvas" />
}
