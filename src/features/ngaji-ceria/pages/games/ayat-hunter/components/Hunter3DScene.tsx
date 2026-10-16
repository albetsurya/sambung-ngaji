import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  ARENA_COLUMNS, ARENA_ROWS, ARENA_WALLS, isAdjacentCell, type HunterToken,
} from "../data/hunter-missions";

const TILE = 1.12;
const BOARD = ARENA_COLUMNS * TILE;
// Semua ukuran proporsional terhadap petak (TILE).
const HUNTER_CHARACTER_URL = "/models/ngaji-ceria/desert-roblox.glb";
const CHARACTER_HEIGHT = TILE * 1.5;
const TREE_HEIGHT = TILE * 1.6;
const ROCK_HEIGHT = TILE * 0.45;
const HUNTER_WALL_PROPS = [
  { url: "/models/ngaji-ceria/props/nature-tree.glb", targetHeight: TREE_HEIGHT },
  { url: "/models/ngaji-ceria/props/nature-rock.glb", targetHeight: ROCK_HEIGHT },
];

function cellToXZ(cell: number): [number, number] {
  const row = Math.floor(cell / ARENA_COLUMNS);
  const col = cell % ARENA_COLUMNS;
  return [(col - (ARENA_COLUMNS - 1) / 2) * TILE, (row - (ARENA_ROWS - 1) / 2) * TILE];
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry?.dispose?.();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((surface) => {
        const candidate = surface as THREE.Material & Record<string, unknown>;
        ["map", "emissiveMap"].forEach((key) => {
          const texture = candidate[key] as THREE.Texture | undefined;
          if (texture?.isTexture) texture.dispose();
        });
        surface.dispose();
      });
    }
  });
}

/** Tablet kata melayang dengan teks Arab dari canvas. */
function makeWordTablet(text: string, highlight: boolean): THREE.Group {
  const group = new THREE.Group();
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 200;
  const draw = () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 320, 200);
    // Badan tablet
    ctx.fillStyle = highlight ? "rgba(120, 53, 15, 0.94)" : "rgba(12, 40, 34, 0.94)";
    ctx.strokeStyle = highlight ? "#fcd34d" : "#6ee7b7";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(10, 10, 300, 180, 34);
    ctx.fill();
    ctx.stroke();
    // Teks Arab
    ctx.fillStyle = highlight ? "#fef3c7" : "#fef9c3";
    ctx.font = "700 68px Amiri, 'Noto Naskh Arabic', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.direction = "rtl";
    ctx.fillText(text, 160, 104, 272);
  };
  draw();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const tablet = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 0.625),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide }),
  );
  tablet.position.y = 1.2;
  group.add(tablet);
  const glow = new THREE.Mesh(
    new THREE.RingGeometry(0.34, 0.47, 28),
    new THREE.MeshBasicMaterial({
      color: highlight ? 0xfcd34d : 0x6ee7b7, transparent: true, opacity: 0.9, side: THREE.DoubleSide,
    }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.03;
  group.add(glow);
  group.userData.redraw = draw;
  group.userData.texture = texture;
  return group;
}

/** Skala prop GLB ke tinggi target dan jejakkan ke tanah (proporsional petak). */
function groundProp(object: THREE.Object3D, targetHeight: number) {
  object.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(object);
  const size = bounds.getSize(new THREE.Vector3());
  object.scale.setScalar(targetHeight / Math.max(size.y, 0.001));
  object.updateMatrixWorld(true);
  const rescaled = new THREE.Box3().setFromObject(object);
  object.position.y -= rescaled.min.y;
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) child.castShadow = true;
  });
}
/** Pohon prosedural — cadangan bila GLB nature gagal dimuat. */
function makeTree(): THREE.Group {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.13, 0.5, 7),
    new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 }),
  );
  trunk.position.y = 0.25;
  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(0.42, 0.95, 8),
    new THREE.MeshStandardMaterial({ color: 0x2f9e5f, roughness: 0.8 }),
  );
  leaves.position.y = 0.9;
  leaves.castShadow = true;
  group.add(trunk, leaves);
  return group;
}

/** Batu prosedural — cadangan bila GLB nature gagal dimuat. */
function makeRock(): THREE.Group {
  const group = new THREE.Group();
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.32, 0),
    new THREE.MeshStandardMaterial({ color: 0x8fa3b8, roughness: 0.95, flatShading: true }),
  );
  rock.position.y = 0.26;
  rock.rotation.set(0.4, 0.7, 0.1);
  rock.castShadow = true;
  group.add(rock);
  return group;
}

interface Hunter3DSceneProps {
  tokens: HunterToken[];
  playerCell: number;
  /** Kata target saat ini — tablet yang cocok berdenyut emas. */
  targetWord: string;
  collected: number;
  disabled: boolean;
  active: boolean;
  onMove: (cell: number) => void;
}

/**
 * Arena Ayat Hunter versi 3D: papan kebun 5x5, karakter desert_roblox.glb yang
 * berjalan dari petak ke petak, dan tablet kata Arab melayang.
 * Klik petak bertetangga untuk bergerak (validasi tetap di hook).
 */
export function Hunter3DScene({ tokens, playerCell, targetWord, collected, disabled, active, onMove }: Hunter3DSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ playerCell, tokens, targetWord, collected, disabled, active, onMove });
  stateRef.current = { playerCell, tokens, targetWord, collected, disabled, active, onMove };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // Playwright (software WebGL) memakai placeholder statis agar test deterministik;
    // browser asli memakai scene GLB penuh. Logika game tetap jalan di keduanya.
    if (navigator.webdriver) return;
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2")) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b2420, 12, 24);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);

    scene.add(new THREE.HemisphereLight(0xd9fbe8, 0x14352a, 1.9));
    const sun = new THREE.DirectionalLight(0xfff7d6, 2.4);
    sun.position.set(-4, 8, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -5;
    sun.shadow.camera.right = 5;
    sun.shadow.camera.top = 5;
    sun.shadow.camera.bottom = -5;
    scene.add(sun);
    const rim = new THREE.PointLight(0x6ee7b7, 12, 14);
    rim.position.set(0, 3.5, -3.5);
    scene.add(rim);

    // Alas + petak papan
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(BOARD + 0.7, 0.3, BOARD + 0.7),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 }),
    );
    base.position.y = -0.22;
    base.receiveShadow = true;
    scene.add(base);
    const tileMeshes: THREE.Mesh[] = [];
    const tileMats: THREE.MeshStandardMaterial[] = [];
    const wallCells: number[] = [];
    const loader = new GLTFLoader();
    for (let cell = 0; cell < ARENA_COLUMNS * ARENA_ROWS; cell++) {
      const [x, z] = cellToXZ(cell);
      const isWall = ARENA_WALLS.includes(cell);
      const checker = (Math.floor(cell / ARENA_COLUMNS) + cell) % 2 === 0;
      const mat = new THREE.MeshStandardMaterial({
        color: isWall ? 0x1d4033 : checker ? 0x2f9e5f : 0x2a8f56,
        roughness: 0.85,
        emissive: 0x000000,
      });
      const tile = new THREE.Mesh(new THREE.BoxGeometry(TILE - 0.07, 0.14, TILE - 0.07), mat);
      tile.position.set(x, -0.05, z);
      tile.receiveShadow = true;
      tile.userData.cell = cell;
      scene.add(tile);
      tileMeshes.push(tile);
      tileMats.push(mat);
      if (isWall) wallCells.push(cell);
    }
    // Prop dinding dari pack nature (pohon & batu bergantian, proporsional petak).
    // Bila GLB gagal dimuat, pakai pohon/batu prosedural sebagai cadangan.
    const loadWallProps = async () => {
      const results = await Promise.allSettled(HUNTER_WALL_PROPS.map((prop) => loader.loadAsync(prop.url)));
      if (disposed) {
        results.forEach((result) => {
          if (result.status === "fulfilled") disposeObject(result.value.scene);
        });
        return;
      }
      wallCells.forEach((cell, index) => {
        const [x, z] = cellToXZ(cell);
        const result = results[index % results.length];
        const config = HUNTER_WALL_PROPS[index % HUNTER_WALL_PROPS.length];
        if (result.status === "fulfilled") {
          const object = result.value.scene;
          groundProp(object, config.targetHeight);
          object.position.x = x;
          object.position.z = z;
          object.rotation.y = cell * 0.7;
          scene.add(object);
          return;
        }
        const fallback = index % 2 === 0 ? makeTree() : makeRock();
        fallback.position.set(x, 0.02, z);
        scene.add(fallback);
      });
    };
    void loadWallProps();

    // Tablet kata
    let tabletGroup = new THREE.Group();
    scene.add(tabletGroup);
    const rebuildTablets = (list: HunterToken[], target: string) => {
      disposeObject(tabletGroup);
      scene.remove(tabletGroup);
      tabletGroup = new THREE.Group();
      list.forEach((token, index) => {
        const [x, z] = cellToXZ(token.cell);
        const tablet = makeWordTablet(token.text, token.text === target);
        tablet.position.set(x, 0, z);
        tablet.userData.phase = index * 0.9;
        tabletGroup.add(tablet);
      });
      scene.add(tabletGroup);
    };
    rebuildTablets(stateRef.current.tokens, stateRef.current.targetWord);
    // Gambar ulang teks Arab setelah font web siap (agar tidak fallback).
    let fontsDisposed = false;
    const redrawTablets = () => {
      if (fontsDisposed) return;
      tabletGroup.children.forEach((child) => {
        const redraw = (child.userData as { redraw?: () => void }).redraw;
        const texture = (child.userData as { texture?: THREE.CanvasTexture }).texture;
        redraw?.();
        if (texture) texture.needsUpdate = true;
      });
    };
    document.fonts?.ready.then(redrawTablets).catch(() => {});

    // Karakter pemburu: desert_roblox.glb (rigged + animasi Mixamo), proporsional petak.
    const qirra = new THREE.Group();
    qirra.name = "desert-hunter";
    scene.add(qirra);
    const shadowBlob = new THREE.Mesh(
      new THREE.CircleGeometry(0.34, 24),
      new THREE.MeshBasicMaterial({ color: 0x04120c, transparent: true, opacity: 0.45 }),
    );
    shadowBlob.rotation.x = -Math.PI / 2;
    shadowBlob.position.y = 0.035;
    qirra.add(shadowBlob);
    let mixer: THREE.AnimationMixer | null = null;
    let disposed = false;
    loader.loadAsync(HUNTER_CHARACTER_URL).then(
      (gltf) => {
        if (disposed) {
          disposeObject(gltf.scene);
          return;
        }
        const model = gltf.scene;
        model.updateMatrixWorld(true);
        const initialBox = new THREE.Box3().setFromObject(model);
        const initialSize = initialBox.getSize(new THREE.Vector3());
        model.scale.setScalar(CHARACTER_HEIGHT / Math.max(initialSize.y, 0.001));
        model.updateMatrixWorld(true);
        const rescaled = new THREE.Box3().setFromObject(model);
        const recenter = rescaled.getCenter(new THREE.Vector3());
        model.position.x -= recenter.x;
        model.position.y -= rescaled.min.y;
        model.position.z -= recenter.z;
        model.traverse((object) => {
          if (object instanceof THREE.Mesh) object.castShadow = true;
        });
        qirra.add(model);
        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const idle = gltf.animations.find((clip) => /idle/i.test(clip.name)) ?? gltf.animations[0];
          const action = mixer.clipAction(idle);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.play();
        }
      },
      () => {},
    );

    const startPos = cellToXZ(stateRef.current.playerCell);
    const playerPos = new THREE.Vector3(startPos[0], 0, startPos[1]);
    const playerTarget = playerPos.clone();
    let facing = 0;
    let facingTarget = 0;
    let lastCell = stateRef.current.playerCell;
    let lastCollected = stateRef.current.collected;
    let celebrateAt = -10;
    qirra.position.copy(playerPos);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoverCell: number | null = null;
    const pickCell = (event: PointerEvent): number | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(tileMeshes, false);
      const hit = hits[0];
      return hit ? (hit.object.userData.cell as number) : null;
    };
    const onPointerMove = (event: PointerEvent) => {
      // Saat sedang mengorbit (tombol ditekan), jangan sorot petak.
      if (event.buttons !== 0) return;
      const cell = pickCell(event);
      hoverCell = cell !== null && !stateRef.current.disabled && isAdjacentCell(stateRef.current.playerCell, cell) ? cell : null;
      renderer.domElement.style.cursor = hoverCell !== null ? "pointer" : "default";
    };
    // Ketuk (tanpa geser) = bergerak; geser/cubit = memutar & zoom kamera.
    let downX = 0;
    let downY = 0;
    let downAt = 0;
    const onPointerDown = (event: PointerEvent) => {
      downX = event.clientX;
      downY = event.clientY;
      downAt = performance.now();
    };
    const onPointerUp = (event: PointerEvent) => {
      const moved = Math.hypot(event.clientX - downX, event.clientY - downY);
      if (moved > 10 || performance.now() - downAt > 450 || !stateRef.current.active) return;
      const cell = pickCell(event);
      if (cell === null) return;
      stateRef.current.onMove(cell);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointermove", onPointerMove);

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    let hostVisible = true;
    const visibilityObserver = new IntersectionObserver(
      (entries) => { hostVisible = entries[0]?.isIntersecting ?? true; },
      { threshold: 0.05 },
    );
    visibilityObserver.observe(host);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let previous = performance.now();
    let elapsed = 0;
    let frame = 0;
    let lastTokensRef = stateRef.current.tokens;
    let lastTargetRef = stateRef.current.targetWord;

    const camOffset = new THREE.Vector3(0, 7.0, 4.8);
    camera.position.copy(playerPos).add(camOffset);
    camera.lookAt(playerPos.x, 0.4, playerPos.z);

    // Kontrol kamera: geser untuk memutar, scroll/cubit untuk zoom.
    // Target kamera tetap mengikuti Qirra; tap tanpa geser = bergerak.
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(playerPos.x, 0.4, playerPos.z);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.9;
    controls.minDistance = 4.2;
    controls.maxDistance = 15;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = 1.32;
    controls.update();
    const followPoint = new THREE.Vector3();

    const render = (now: number) => {
      const delta = Math.min(0.05, (now - previous) / 1000);
      previous = now;
      const state = stateRef.current;
      const animating = state.active && !document.hidden && hostVisible;
      if (animating) {
        elapsed += delta;
        mixer?.update(delta);
      }
      // Tablet berubah (pindah misi / kata diambil) -> bangun ulang.
      if (state.tokens !== lastTokensRef || state.targetWord !== lastTargetRef) {
        lastTokensRef = state.tokens;
        lastTargetRef = state.targetWord;
        rebuildTablets(state.tokens, state.targetWord);
      }
      if (state.collected !== lastCollected) {
        lastCollected = state.collected;
        celebrateAt = elapsed;
      }
      // Gerak Qirra menuju sel pemain.
      if (state.playerCell !== lastCell) {
        const [tx, tz] = cellToXZ(state.playerCell);
        playerTarget.set(tx, 0, tz);
        facingTarget = Math.atan2(tx - playerPos.x, tz - playerPos.z);
        lastCell = state.playerCell;
      }
      const step = reducedMotion.matches ? 1 : Math.min(1, delta * 9);
      playerPos.lerp(playerTarget, step);
      let turn = facingTarget - facing;
      while (turn > Math.PI) turn -= Math.PI * 2;
      while (turn < -Math.PI) turn += Math.PI * 2;
      facing += turn * (reducedMotion.matches ? 1 : Math.min(1, delta * 12));
      const moving = playerPos.distanceTo(playerTarget) > 0.02;
      const hop = !reducedMotion.matches && moving ? Math.abs(Math.sin(elapsed * 14)) * 0.16 : 0;
      const celebrate = !reducedMotion.matches && elapsed - celebrateAt < 0.55
        ? Math.sin(((elapsed - celebrateAt) / 0.55) * Math.PI) * 0.22
        : 0;
      qirra.position.set(playerPos.x, hop, playerPos.z);
      qirra.rotation.y = facing;
      qirra.scale.setScalar(1 + celebrate);
      // Tablet melayang + target berdenyut.
      if (!reducedMotion.matches && animating) {
        tabletGroup.children.forEach((child) => {
          const phase = (child.userData.phase as number) ?? 0;
          child.position.y = 0.1 + Math.sin(elapsed * 2 + phase) * 0.09;
          child.rotation.y = Math.sin(elapsed * 0.6 + phase) * 0.18;
        });
      }
      // Sorot petak: posisi Qirra, target, hover.
      tileMats.forEach((mat, cell) => {
        const isPlayer = cell === state.playerCell;
        const isHover = cell === hoverCell;
        const hasToken = state.tokens.some((token) => token.cell === cell);
        if (isPlayer) mat.emissive.setHex(0x34d399);
        else if (isHover) mat.emissive.setHex(0xfbbf24);
        else if (hasToken) mat.emissive.setHex(0x0d5c46);
        else mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = isPlayer || isHover ? 0.55 : hasToken ? 0.5 : 0;
      });
      // Kamera mengikuti Qirra; sudut & jarak tetap milik pemain (orbit/zoom).
      const camStep = reducedMotion.matches ? 1 : Math.min(1, delta * 3.2);
      followPoint.set(playerPos.x, 0.4, playerPos.z);
      controls.target.lerp(followPoint, camStep);
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      fontsDisposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibilityObserver.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      mixer?.stopAllAction();
      disposeObject(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="relative h-full min-h-0 w-full overflow-hidden bg-gradient-to-b from-[#0b2420] to-slate-950" aria-label="Peta Ayat Hunter">
    <div ref={hostRef} data-testid="hunter-3d" data-hunter-cell={playerCell} className="absolute inset-0" />
    {!disabled && <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/55 px-3 py-1 text-[10px] font-bold text-emerald-100">Geser: putar · Cubit: zoom · Ketuk petak: jalan</p>}
  </div>;
}
