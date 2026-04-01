'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader';

export default function ModelViewer({ file }: { file: File }) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [modelGroup, setModelGroup] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const loadModel = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const extension = file.name.toLowerCase().split('.').pop();

        if (extension === 'stl') {
          const loader = new STLLoader();
          const geom = loader.parse(arrayBuffer);
          geom.computeVertexNormals();
          if (active) {
            setGeometry(geom);
            setModelGroup(null);
          }
        } else if (extension === '3mf') {
          const loader = new ThreeMFLoader();
          const group = loader.parse(arrayBuffer);
          if (active) {
            setModelGroup(group);
            setGeometry(null);
          }
        } else {
          setError('Unsupported file format for preview.');
        }
      } catch (err: any) {
        console.error('Error parsing model:', err);
        setError('Failed to render preview. Model might be corrupt or too complex.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadModel();

    return () => {
      active = false;
      if (geometry) geometry.dispose();
      // Dispose logic for groups can be complex, skipping for MVP
    };
  }, [file]);

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
        Rendering 3D Preview...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
        {error}
      </div>
    );
  }

  return (
    <Canvas shadows camera={{ position: [0, 0, 150], fov: 50 }}>
      {/* Premium lighting setup */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={0.5} />
      
      <Stage environment="city" intensity={0.5} adjustCamera={1.2}>
        <Center>
          {geometry && (
            <mesh geometry={geometry} castShadow receiveShadow>
              <meshStandardMaterial 
                color="#6366f1" 
                roughness={0.4} 
                metalness={0.2}
              />
            </mesh>
          )}
          {modelGroup && (
            <primitive object={modelGroup} />
          )}
        </Center>
      </Stage>
      <OrbitControls autoRotate autoRotateSpeed={2} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 4} />
    </Canvas>
  );
}
