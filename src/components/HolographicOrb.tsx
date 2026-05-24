import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, GradientTexture, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Orb({ isActive }: { isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.5;
      meshRef.current.rotation.z = time * 0.3;
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
    }
  });

  return (
    <group>
      {/* Outer Glow Orb */}
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#00f2ff"
          speed={isActive ? 4 : 1.5}
          distort={isActive ? 0.6 : 0.3}
          radius={1}
          opacity={0.3}
          transparent
          wireframe={true}
        />
      </Sphere>

      {/* Inner Solid Core */}
      <Sphere ref={coreRef} args={[0.4, 32, 32]}>
        <meshStandardMaterial color="#bc00ff" emissive="#bc00ff" emissiveIntensity={2} />
      </Sphere>

      {/* Atmospheric Ring */}
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[1.4, 0.012, 16, 100]} />
        <meshBasicMaterial color="#00f2ff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function StarField() {
  const count = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <Points ref={ref} positions={positions}>
      <PointMaterial
        transparent
        color="#00f2ff"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export default function HolographicOrb({ isActive }: { isActive: boolean }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#00f2ff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#bc00ff" />
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <Orb isActive={isActive} />
        </Float>
        <StarField />
      </Canvas>
    </div>
  );
}
