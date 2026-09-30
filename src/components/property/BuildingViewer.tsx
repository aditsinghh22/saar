import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Move3d, RotateCw } from 'lucide-react';

export interface Massing {
  plotW: number;
  plotD: number;
  front: number;
  side: number;
  rear: number;
  floors: number;
  maxFloors: number;
  /** 0–1 share of the setback envelope actually used by the footprint */
  footprintScale: number;
}

const FLOOR_H = 3.2;

type View = 'angle' | 'front' | 'top';

export function BuildingViewer(props: Massing) {
  const mountRef = useRef<HTMLDivElement>(null);
  const three = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    world: THREE.Group;
    massing: THREE.Group;
  } | null>(null);
  const orbit = useRef({ yaw: -0.65, pitch: 0.55, dist: 60, dragging: false, x: 0, y: 0 });
  const autoRef = useRef(true);
  const [auto, setAuto] = useState(true);
  const [view, setView] = useState<View>('angle');

  // Scene setup — once.
  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf1ede3, 90, 180);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 500);

    scene.add(new THREE.HemisphereLight(0xfffaf0, 0xd9cfbd, 1.4));
    const sun = new THREE.DirectionalLight(0xfff1dc, 2.2);
    sun.position.set(30, 50, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45 });
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    const world = new THREE.Group();
    scene.add(world);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(120, 64), new THREE.MeshStandardMaterial({ color: 0xe6e8d6, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    world.add(ground);

    const massing = new THREE.Group();
    world.add(massing);

    three.current = { renderer, scene, camera, world, massing };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const o = orbit.current;
      if (autoRef.current && !o.dragging) o.yaw += 0.0025;
      camera.position.set(Math.sin(o.yaw) * Math.cos(o.pitch) * o.dist, Math.sin(o.pitch) * o.dist + 2, Math.cos(o.yaw) * Math.cos(o.pitch) * o.dist);
      camera.lookAt(0, 5, 0);
      renderer.render(scene, camera);
    };
    tick();

    const el = renderer.domElement;
    const down = (e: PointerEvent) => {
      orbit.current.dragging = true;
      orbit.current.x = e.clientX;
      orbit.current.y = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      const o = orbit.current;
      if (!o.dragging) return;
      o.yaw -= (e.clientX - o.x) * 0.008;
      o.pitch = Math.min(1.45, Math.max(0.08, o.pitch + (e.clientY - o.y) * 0.006));
      o.x = e.clientX;
      o.y = e.clientY;
    };
    const up = () => (orbit.current.dragging = false);
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      orbit.current.dist = Math.min(120, Math.max(28, orbit.current.dist + e.deltaY * 0.05));
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('wheel', wheel, { passive: false });

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('wheel', wheel);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      mount.removeChild(el);
    };
  }, []);

  // Rebuild plot + building whenever inputs change.
  const { plotW, plotD, front, side, rear, floors, maxFloors, footprintScale } = props;
  useEffect(() => {
    const t = three.current;
    if (!t) return;
    const g = t.massing;
    g.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
        obj.geometry.dispose();
        (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((m) => m.dispose());
      }
    });
    g.clear();

    const lineBox = (w: number, d: number, y: number, color: number, dashed = false) => {
      const geo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, d));
      const mat = dashed ? new THREE.LineDashedMaterial({ color, dashSize: 0.6, gapSize: 0.4 }) : new THREE.LineBasicMaterial({ color });
      const l = new THREE.LineSegments(geo, mat);
      if (dashed) l.computeLineDistances();
      l.rotation.x = -Math.PI / 2;
      l.position.y = y;
      return l;
    };

    // Road along the front edge.
    const road = new THREE.Mesh(new THREE.BoxGeometry(plotW + 40, 0.1, 8), new THREE.MeshStandardMaterial({ color: 0xd8d2c6, roughness: 0.95 }));
    road.position.set(0, 0, plotD / 2 + 5);
    road.receiveShadow = true;
    g.add(road);
    for (let x = -plotW / 2 - 18; x < plotW / 2 + 18; x += 4) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(2, 0.02, 0.25), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      dash.position.set(x, 0.07, plotD / 2 + 5);
      g.add(dash);
    }

    // Plot pad.
    const pad = new THREE.Mesh(new THREE.BoxGeometry(plotW, 0.3, plotD), new THREE.MeshStandardMaterial({ color: 0xf1ebdd, roughness: 0.9 }));
    pad.position.y = 0.1;
    pad.receiveShadow = true;
    g.add(pad);
    g.add(lineBox(plotW, plotD, 0.27, 0x1b1a16));

    // Allowed envelope.
    const envW = Math.max(1, plotW - side * 2);
    const envD = Math.max(1, plotD - front - rear);
    const zOff = (rear - front) / 2;
    const env = lineBox(envW, envD, 0.28, 0x2f7a4e, true);
    env.position.z = zOff;
    g.add(env);

    // Building footprint.
    const s = Math.sqrt(Math.min(1, Math.max(0.2, footprintScale)));
    const bW = envW * s;
    const bD = envD * s;
    const wall = new THREE.MeshStandardMaterial({ color: 0xfbf8f2, roughness: 0.75 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x9fb7c4, roughness: 0.15, metalness: 0.3 });
    const over = new THREE.MeshStandardMaterial({ color: 0xe4623a, transparent: true, opacity: 0.55, roughness: 0.6 });

    for (let f = 0; f < floors; f++) {
      const y = 0.25 + f * FLOOR_H;
      const tooHigh = f >= maxFloors;
      const slab = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.4, 0.35, bD + 0.4), tooHigh ? over : wall);
      slab.position.set(0, y + 0.17, zOff);
      slab.castShadow = slab.receiveShadow = true;
      g.add(slab);
      const body = new THREE.Mesh(new THREE.BoxGeometry(bW, FLOOR_H - 0.35, bD), tooHigh ? over : wall);
      body.position.set(0, y + 0.35 + (FLOOR_H - 0.35) / 2, zOff);
      body.castShadow = body.receiveShadow = true;
      g.add(body);
      if (!tooHigh) {
        const band = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.05, 1.4, bD * 0.7), glass);
        band.position.set(0, y + 1.7, zOff);
        g.add(band);
        const band2 = new THREE.Mesh(new THREE.BoxGeometry(bW * 0.7, 1.4, bD + 0.05), glass);
        band2.position.set(0, y + 1.7, zOff);
        g.add(band2);
      }
    }
    const roofY = 0.25 + floors * FLOOR_H;
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.4, 0.6, bD + 0.4), new THREE.MeshStandardMaterial({ color: floors > maxFloors ? 0xe4623a : 0x1f4634, roughness: 0.6 }));
    parapet.position.set(0, roofY + 0.3, zOff);
    parapet.castShadow = true;
    g.add(parapet);

    // A few trees for scale.
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8a6b4f });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x8fb176, roughness: 0.9 });
    const trees: [number, number][] = [
      [-plotW / 2 - 4, -plotD / 4],
      [plotW / 2 + 4, plotD / 5],
      [-plotW / 2 - 6, plotD / 2 - 2],
      [plotW / 2 + 5, -plotD / 2],
    ];
    trees.forEach(([x, z], i) => {
      const h = 3 + (i % 2);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, h, 8), trunkMat);
      trunk.position.set(x, h / 2, z);
      trunk.castShadow = true;
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8 + (i % 3) * 0.4, 16, 12), leafMat);
      crown.position.set(x, h + 1.2, z);
      crown.castShadow = true;
      g.add(trunk, crown);
    });
  }, [plotW, plotD, front, side, rear, floors, maxFloors, footprintScale]);

  const setPreset = (v: View) => {
    setView(v);
    const o = orbit.current;
    if (v === 'angle') Object.assign(o, { yaw: -0.65, pitch: 0.55, dist: 60 });
    if (v === 'front') Object.assign(o, { yaw: 0, pitch: 0.12, dist: 55 });
    if (v === 'top') Object.assign(o, { yaw: 0, pitch: 1.45, dist: 70 });
    autoRef.current = false;
    setAuto(false);
  };

  return (
    <div className="relative size-full select-none">
      <div ref={mountRef} className="size-full cursor-grab active:cursor-grabbing" />
      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/95 p-1 shadow-sm backdrop-blur">
        {(['angle', 'front', 'top'] as View[]).map((v) => (
          <button key={v} onClick={() => setPreset(v)} className={`h-8 cursor-pointer rounded-full px-3.5 text-sm capitalize transition ${view === v ? 'bg-ink text-white' : 'text-ink-2 hover:bg-sand'}`}>
            {v === 'angle' ? '3D' : v}
          </button>
        ))}
        <button
          onClick={() => {
            autoRef.current = !auto;
            setAuto(!auto);
          }}
          className={`grid size-8 cursor-pointer place-items-center rounded-full transition ${auto ? 'bg-lime' : 'hover:bg-sand'}`}
          aria-label={auto ? 'Stop rotating' : 'Rotate'}
        >
          <RotateCw className={`size-3.5 ${auto ? 'animate-spin [animation-duration:6s]' : ''}`} />
        </button>
      </div>
      <p className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs text-mute backdrop-blur">
        <Move3d className="size-3.5" /> Drag to turn · scroll to zoom
      </p>
    </div>
  );
}
