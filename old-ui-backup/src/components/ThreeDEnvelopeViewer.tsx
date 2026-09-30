import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Compass, Eye, Sun, Maximize2, Layers, Box } from 'lucide-react';

interface ThreeDEnvelopeViewerProps {
  floors: number;
  frontSetback: number;
  rearSetback?: number;
  sideSetback?: number;
  parcelArea: number;
}

export const ThreeDEnvelopeViewer: React.FC<ThreeDEnvelopeViewerProps> = ({
  floors,
  frontSetback,
  rearSetback = 1.5,
  sideSetback = 1.5,
  parcelArea
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<'ISOMETRIC' | 'FRONT' | 'TOP'>('ISOMETRIC');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 280;

    // 1. Scene setup - Warm Architectural Studio Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF5F2EA); // Warm cream studio background
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(18, 16, 20);
    camera.lookAt(0, 3.5, 0);
    cameraRef.current = camera;

    // 3. Renderer with soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Natural Daylight Illumination
    const ambientLight = new THREE.AmbientLight(0xFFF9F2, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFF0DE, 1.6);
    sunLight.position.set(24, 32, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    // Soft sky fill
    const skyFill = new THREE.DirectionalLight(0xE0F0FE, 0.6);
    skyFill.position.set(-20, 15, -15);
    scene.add(skyFill);

    // 5. Architectural Limestone Podium & Grid
    const podiumGeo = new THREE.BoxGeometry(16, 0.6, 16);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0xE8E3D8, // Travertine limestone
      roughness: 0.85,
      metalness: 0.05
    });
    const podiumMesh = new THREE.Mesh(podiumGeo, podiumMat);
    podiumMesh.position.y = -0.3;
    podiumMesh.receiveShadow = true;
    scene.add(podiumMesh);

    // Cadastral Parcel Border Frame
    const borderGeo = new THREE.PlaneGeometry(15, 15);
    const borderEdges = new THREE.EdgesGeometry(borderGeo);
    const borderMat = new THREE.LineBasicMaterial({ color: 0xC45A34, linewidth: 2 });
    const borderLines = new THREE.LineSegments(borderEdges, borderMat);
    borderLines.rotation.x = -Math.PI / 2;
    borderLines.position.y = 0.02;
    scene.add(borderLines);

    // Architectural Cadastral Tile Grid
    const grid = new THREE.GridHelper(15, 15, 0xC45A34, 0xD4CDC1);
    grid.position.y = 0.01;
    scene.add(grid);

    // 6. Building Group
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);
    buildingGroupRef.current = buildingGroup;

    // Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      if (buildingGroupRef.current && autoRotate && !isDraggingRef.current) {
        buildingGroupRef.current.rotation.y += 0.004;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Mouse Interaction
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !buildingGroupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      buildingGroupRef.current.rotation.y += deltaX * 0.008;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Building Volumes upon slider adjustment
  useEffect(() => {
    if (!buildingGroupRef.current || !sceneRef.current) return;
    const group = buildingGroupRef.current;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    const maxBuildingWidth = 14.5 - sideSetback * 2.6;
    const maxBuildingDepth = 14.5 - (frontSetback * 1.25 + rearSetback * 1.25);
    const zOffset = (frontSetback - rearSetback) * 0.45;
    const floorHeight = 1.9;

    // Setback Footprint on Ground (Dashed Terracotta Blueprint Line)
    const footprintGeo = new THREE.PlaneGeometry(maxBuildingWidth, maxBuildingDepth);
    const footprintEdges = new THREE.EdgesGeometry(footprintGeo);
    const footprintMat = new THREE.LineDashedMaterial({
      color: 0xC45A34,
      dashSize: 0.5,
      gapSize: 0.25,
      linewidth: 2
    });
    const footprintLines = new THREE.LineSegments(footprintEdges, footprintMat);
    footprintLines.computeLineDistances();
    footprintLines.rotation.x = -Math.PI / 2;
    footprintLines.position.set(0, 0.05, zOffset);
    group.add(footprintLines);

    // Build Individual Architectural Floorplates
    for (let f = 0; f < floors; f++) {
      const floorY = f * floorHeight;

      // Concrete Floor Slab
      const slabGeo = new THREE.BoxGeometry(maxBuildingWidth + 0.3, 0.2, maxBuildingDepth + 0.3);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0xFAF7F0,
        roughness: 0.7,
        metalness: 0.1
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.set(0, floorY, zOffset);
      slabMesh.castShadow = true;
      slabMesh.receiveShadow = true;
      group.add(slabMesh);

      // Glass Curtain Facade
      const glassGeo = new THREE.BoxGeometry(maxBuildingWidth, floorHeight - 0.2, maxBuildingDepth);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xD8ECF8,
        transparent: true,
        opacity: 0.72,
        roughness: 0.1,
        transmission: 0.85,
        thickness: 0.6,
        reflectivity: 0.9
      });
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(0, floorY + (floorHeight - 0.2) / 2 + 0.1, zOffset);
      glassMesh.castShadow = true;
      glassMesh.receiveShadow = true;
      group.add(glassMesh);

      // Architectural Window Mullions (Fine Dark Frames)
      const frameGeo = new THREE.EdgesGeometry(glassGeo);
      const frameMat = new THREE.LineBasicMaterial({ color: 0x33312E, linewidth: 1.5 });
      const frameLines = new THREE.LineSegments(frameGeo, frameMat);
      frameLines.position.set(0, floorY + (floorHeight - 0.2) / 2 + 0.1, zOffset);
      group.add(frameLines);
    }

    // Rooftop Slab & Parapet
    const roofY = floors * floorHeight;
    const roofSlabGeo = new THREE.BoxGeometry(maxBuildingWidth + 0.3, 0.25, maxBuildingDepth + 0.3);
    const roofSlabMat = new THREE.MeshStandardMaterial({ color: 0xEAE5DC, roughness: 0.6 });
    const roofMesh = new THREE.Mesh(roofSlabGeo, roofSlabMat);
    roofMesh.position.set(0, roofY, zOffset);
    roofMesh.castShadow = true;
    group.add(roofMesh);

    // Terracotta Parapet Trim
    const parapetGeo = new THREE.BoxGeometry(maxBuildingWidth + 0.35, 0.3, maxBuildingDepth + 0.35);
    const parapetEdges = new THREE.EdgesGeometry(parapetGeo);
    const parapetLines = new THREE.LineSegments(parapetEdges, new THREE.LineBasicMaterial({ color: 0xC45A34 }));
    parapetLines.position.set(0, roofY + 0.15, zOffset);
    group.add(parapetLines);

    // Rooftop Architectural Pergola
    const pergolaGeo = new THREE.BoxGeometry(maxBuildingWidth * 0.5, 0.6, maxBuildingDepth * 0.5);
    const pergolaMat = new THREE.MeshStandardMaterial({ color: 0x8C7A6B, roughness: 0.7 });
    const pergolaMesh = new THREE.Mesh(pergolaGeo, pergolaMat);
    pergolaMesh.position.set(0, roofY + 0.45, zOffset);
    pergolaMesh.castShadow = true;
    group.add(pergolaMesh);

    // Setback Corner Boundary Guide Markers (Brass Survey Poles)
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, roofY + 1, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xC45A34, metalness: 0.8, roughness: 0.3 });
    const corners = [
      [-maxBuildingWidth / 2, -maxBuildingDepth / 2],
      [maxBuildingWidth / 2, -maxBuildingDepth / 2],
      [maxBuildingWidth / 2, maxBuildingDepth / 2],
      [-maxBuildingWidth / 2, maxBuildingDepth / 2]
    ];
    corners.forEach(([cx, cz]) => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(cx, (roofY + 1) / 2, zOffset + cz);
      group.add(pole);
    });

  }, [floors, frontSetback, rearSetback, sideSetback]);

  const setCameraView = (preset: 'ISOMETRIC' | 'FRONT' | 'TOP') => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    setCameraPreset(preset);

    if (preset === 'ISOMETRIC') {
      camera.position.set(18, 16, 20);
      camera.lookAt(0, 3.5, 0);
    } else if (preset === 'FRONT') {
      camera.position.set(0, 7, 24);
      camera.lookAt(0, 4, 0);
    } else if (preset === 'TOP') {
      camera.position.set(0, 28, 0.1);
      camera.lookAt(0, 0, 0);
    }
  };

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-[#F5F2EA] border border-[#E2DDD3] shadow-md select-none">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Architectural Scale & HUD Ribbon */}
      <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#E2DDD3] shadow-xs">
        <span className="w-2.5 h-2.5 rounded-full bg-[#C45A34] animate-pulse"></span>
        <span className="text-xs font-mono font-bold text-[#141413] tracking-wide">
          SCALE 1:200 MODEL
        </span>
        <span className="text-[11px] text-[#C45A34] font-mono bg-[#FAF3ED] px-2 py-0.5 rounded-full border border-[#ECCFBE] font-bold">
          G+{floors} • {(floors * 3.5).toFixed(1)}m Max Height
        </span>
      </div>

      {/* Architectural View Controls */}
      <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-[#E2DDD3] shadow-xs">
        <button
          onClick={() => setCameraView('ISOMETRIC')}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
            cameraPreset === 'ISOMETRIC' ? 'btn-saar-primary' : 'text-[#635E56] hover:text-[#141413]'
          }`}
        >
          Isometric
        </button>
        <button
          onClick={() => setCameraView('FRONT')}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
            cameraPreset === 'FRONT' ? 'btn-saar-primary' : 'text-[#635E56] hover:text-[#141413]'
          }`}
        >
          Elevation
        </button>
        <button
          onClick={() => setCameraView('TOP')}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
            cameraPreset === 'TOP' ? 'btn-saar-primary' : 'text-[#635E56] hover:text-[#141413]'
          }`}
        >
          Plan
        </button>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            autoRotate ? 'bg-[#FAF3ED] text-[#C45A34] border border-[#ECCFBE]' : 'text-[#635E56] hover:text-[#141413]'
          }`}
          title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
        </button>
      </div>

      {/* Natural Daylight & Drag Indicator Legend */}
      <div className="absolute bottom-3 inset-x-3.5 z-10 flex items-center justify-between text-[11px] font-mono text-[#635E56] bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#E2DDD3]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FAF7F0] border border-[#D4CEC3]"></span>
            <span>Limestone Slabs</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C45A34]"></span>
            <span>Setback Envelope</span>
          </span>
        </div>
        <div className="text-[#8A847C] italic">
          Click & drag to rotate architectural massing
        </div>
      </div>
    </div>
  );
};
