import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';
import { asset } from '../utils/asset';

function CameraModel({ url, mouse }: { url: string; mouse: React.RefObject<{ x: number; y: number }> }) {
  const { scene } = useGLTF(url);
  const group = useRef<THREE.Group>(null!);
  const target = useRef({ x: 0, y: 0 });
  const drift = useRef(0);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 4.5 / maxDim;
    scene.scale.setScalar(scale);

    const center = box.getCenter(new THREE.Vector3());
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.material && (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
          if ('transparent' in m) {
            m.transparent = true;
            m.opacity = 0.9;
          }
        });
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (!group.current) return;
    drift.current += delta * 0.25;
    if (!mouse.current) return;
    target.current.x = mouse.current.y * 0.3 + Math.sin(drift.current * 0.6) * 0.05;
    target.current.y = mouse.current.x * 0.5 + drift.current * 0.12;
    group.current.rotation.x += (target.current.x - group.current.rotation.x) * 0.05;
    group.current.rotation.y += (target.current.y - group.current.rotation.y) * 0.05;
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <primitive object={scene} />
      </Float>
    </group>
  );
}

function CameraRig({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();

  useFrame(() => {
    if (!mouse.current) return;
    camera.position.x += (mouse.current.x * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (mouse.current.y * 0.3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#444" wireframe />
    </mesh>
  );
}

interface CameraSceneProps {
  modelUrl?: string;
  opacity?: number;
  zIndex?: number;
}

export default function CameraScene({ modelUrl = asset('/models/canon-camera.glb'), opacity = 0.5, zIndex = 0 }: CameraSceneProps) {
  const mouse = useRef({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex,
        opacity: ready ? opacity : 0,
        transition: 'opacity 1.2s ease',
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        onCreated={() => setReady(true)}
        style={{ pointerEvents: 'none' }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#88aaff" />
        <pointLight position={[0, -2, 3]} intensity={0.6} color="#ffaa44" />

        <Suspense fallback={<LoadingFallback />}>
          <CameraModel url={modelUrl} mouse={mouse} />
        </Suspense>

        <CameraRig mouse={mouse} />
      </Canvas>
    </div>
  );
}
