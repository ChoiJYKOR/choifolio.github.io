import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { gsap } from 'gsap'

interface LoadSceneProps {
  onFirstVisitComplete?: () => void
}

const LoadScene: React.FC<LoadSceneProps> = ({ onFirstVisitComplete }) => {
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()

  // 해시 URL이 있는 경우 바로 홈으로 리다이렉트 (로딩 애니메이션 없음)
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      navigate('/home', { replace: true })
    }
  }, [navigate])
  const sceneRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const tlRef = useRef<gsap.core.Timeline>()
  const textMeshesRef = useRef<THREE.Mesh[]>([])
  const sceneInstanceRef = useRef<THREE.Scene>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const rendererRef = useRef<THREE.WebGLRenderer>()

  useEffect(() => {
    // 3D 씬 초기화
    initThreeScene()
    
    // 애니메이션 타임라인 설정
    setupAnimation()
    
    return () => {
      cleanup()
    }
  }, [])

  // Loading 완료 후 자동으로 홈 화면으로 이동
  useEffect(() => {
    const autoNavigateTimer = setTimeout(() => {
      // 첫 방문 완료 플래그 설정
      localStorage.setItem('hasVisited', 'true')
      onFirstVisitComplete?.()
      navigate('/home')
    }, 6000) // 총 6초 후 자동 이동 (Loading 3초 + 추가 3초)

    return () => clearTimeout(autoNavigateTimer)
  }, [navigate, onFirstVisitComplete])

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (tlRef.current) {
      tlRef.current.kill()
    }
    if (rendererRef.current && sceneRef.current) {
      const canvas = rendererRef.current.domElement
      if (sceneRef.current.contains(canvas)) {
        sceneRef.current.removeChild(canvas)
      }
      rendererRef.current.dispose()
    }
    textMeshesRef.current = []
  }

  const initThreeScene = () => {
    if (!sceneRef.current) return

    // Three.js 씬 설정
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a) // 매우 어두운 배경 (Eric 스타일)
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x0a0a0a, 1)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    sceneRef.current.appendChild(renderer.domElement)

    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)
    
    // 포인트 라이트 추가 (텍스트에 더 나은 조명)
    const pointLight = new THREE.PointLight(0x00ffff, 0.5, 100)
    pointLight.position.set(-10, 0, 10)
    scene.add(pointLight)
    
    const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 100)
    pointLight2.position.set(10, 0, 10)
    scene.add(pointLight2)

    // 3D 텍스트 생성
    create3DText(scene)
    
    // 카메라 위치
    camera.position.z = 20
    camera.lookAt(0, 0, 0)
    
    // 참조 저장
    sceneInstanceRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    
    // 렌더링 루프
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
      
      // 텍스트 회전 애니메이션
      textMeshesRef.current.forEach((mesh, index) => {
        if (mesh) {
          mesh.rotation.y += 0.008 + (index * 0.002)
          mesh.rotation.x = Math.sin(Date.now() * 0.001 + index) * 0.1
          mesh.position.y = Math.sin(Date.now() * 0.002 + index) * 0.5
        }
      })
      
      // 카메라 약간의 움직임 (Eric 스타일)
      if (cameraRef.current) {
        cameraRef.current.position.x = Math.sin(Date.now() * 0.0005) * 2
        cameraRef.current.position.y = Math.cos(Date.now() * 0.0003) * 1
        cameraRef.current.lookAt(0, 0, 0)
      }
      
      renderer.render(scene, camera)
    }
    animate()

    // 윈도우 리사이즈 처리
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    }
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }

  const create3DText = (scene: THREE.Scene) => {
    // "LOADING" 텍스트를 기본 지오메트리로 생성
    const loadingLetters = ['L', 'O', 'A', 'D', 'I', 'N', 'G']
    
    loadingLetters.forEach((letter, index) => {
      // 각 글자를 위한 지오메트리 생성
      let geometry: THREE.BufferGeometry
      
      // 글자별로 다른 지오메트리 사용
      switch(letter) {
        case 'L':
          geometry = createLGeometry()
          break
        case 'O':
          geometry = new THREE.TorusGeometry(1.2, 0.4, 16, 32)
          break
        case 'A':
          geometry = new THREE.ConeGeometry(1.8, 4, 3)
          break
        case 'D':
          geometry = createDGeometry()
          break
        case 'I':
          geometry = new THREE.BoxGeometry(0.4, 4, 0.4)
          break
        case 'N':
          geometry = createNGeometry()
          break
        case 'G':
          geometry = createGGeometry()
          break
        default:
          geometry = new THREE.BoxGeometry(1, 4, 0.5)
      }
      
      // 재질 생성 (그라데이션 효과를 위한 색상)
      const hue = (index / loadingLetters.length) * 360
      const material = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color().setHSL(hue / 360, 0.8, 0.6),
        shininess: 100,
        specular: 0x333333,
        emissive: new THREE.Color().setHSL(hue / 360, 0.3, 0.1)
      })
      
      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      
      // 위치 설정
      const spacing = 3.5
      const startX = -(loadingLetters.length - 1) * spacing / 2
      mesh.position.set(startX + index * spacing, 0, 0)
      
      // 초기 애니메이션 상태
      mesh.scale.set(0.01, 0.01, 0.01)
      mesh.rotation.x = Math.PI
      mesh.rotation.z = Math.PI
      
      scene.add(mesh)
      textMeshesRef.current.push(mesh)
      
      // GSAP으로 나타나는 애니메이션
      gsap.to(mesh.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.2,
        delay: index * 0.15,
        ease: "back.out(2)"
      })
      
      gsap.to(mesh.rotation, {
        x: 0,
        z: 0,
        duration: 1.2,
        delay: index * 0.15,
        ease: "power2.out"
      })
    })
  }

  // 커스텀 지오메트리 생성 함수들
  const createLGeometry = () => {
    const geometry = new THREE.BufferGeometry()
    const vertices = []
    
    // L 모양 생성
    vertices.push(-1, -2, 0, -1, 2, 0, -0.3, 2, 0) // 왼쪽 세로선
    vertices.push(-1, -2, 0, -0.3, 2, 0, -0.3, -2, 0)
    vertices.push(-0.3, -1.5, 0, 1, -1.5, 0, 1, -2, 0) // 아래 가로선
    vertices.push(-0.3, -1.5, 0, 1, -2, 0, -0.3, -2, 0)
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.computeVertexNormals()
    return geometry
  }

  const createDGeometry = () => {
    const geometry = new THREE.BufferGeometry()
    const vertices = []
    
    // D 모양 생성 (반원 + 직선)
    for (let i = 0; i <= 16; i++) {
      const angle = (i / 16) * Math.PI
      const x = Math.cos(angle) * 1.5
      const y = Math.sin(angle) * 2
      vertices.push(x, y, 0, x, y, 0.5)
    }
    
    // 왼쪽 직선 추가
    vertices.push(-1.5, -2, 0, -1.5, 2, 0, -1.5, 2, 0.5)
    vertices.push(-1.5, -2, 0, -1.5, 2, 0.5, -1.5, -2, 0.5)
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.computeVertexNormals()
    return geometry
  }

  const createNGeometry = () => {
    const geometry = new THREE.BufferGeometry()
    const vertices = []
    
    // N 모양 생성
    vertices.push(-1, -2, 0, -1, 2, 0, -0.3, 2, 0) // 왼쪽 세로선
    vertices.push(-1, -2, 0, -0.3, 2, 0, -0.3, -2, 0)
    vertices.push(-0.3, 1.5, 0, 1, -2, 0, 1, -1.5, 0) // 대각선
    vertices.push(-0.3, 1.5, 0, 1, -1.5, 0, -0.3, -2, 0)
    vertices.push(0.7, -2, 0, 0.7, 2, 0, 1, 2, 0) // 오른쪽 세로선
    vertices.push(0.7, -2, 0, 1, 2, 0, 1, -2, 0)
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.computeVertexNormals()
    return geometry
  }

  const createGGeometry = () => {
    const geometry = new THREE.BufferGeometry()
    const vertices = []
    
    // G 모양 생성 (불완전한 원 + 직선)
    for (let i = 0; i <= 20; i++) {
      const angle = (i / 20) * Math.PI * 1.8 // 거의 완전한 원
      const x = Math.cos(angle) * 1.5
      const y = Math.sin(angle) * 2
      vertices.push(x, y, 0, x, y, 0.5)
    }
    
    // 가로선 추가
    vertices.push(-1.5, -2, 0, 0, -2, 0, 0, -1.5, 0)
    vertices.push(-1.5, -2, 0, 0, -1.5, 0, -1.5, -1.5, 0)
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.computeVertexNormals()
    return geometry
  }


  const setupAnimation = () => {
    const tl = gsap.timeline()
    tlRef.current = tl
    
    // 3초간 Loading 애니메이션
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        setProgress((this['progress']() * 100))
      }
    })
  }



  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* 3D 씬 컨테이너 */}
      <div ref={sceneRef} className="absolute inset-0" />
      
      {/* UI 오버레이 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-5xl font-bold text-white mb-12 tracking-wider">
            Loading...
          </h2>
          
          {/* 로딩 바 */}
          <div className="w-96 h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-lg text-gray-400 mt-6 font-mono">
            {Math.round(progress)}%
          </p>
        </motion.div>
      </div>
      
      
    </div>
  )
}

export default LoadScene