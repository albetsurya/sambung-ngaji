import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { BattleVisualState } from "./types";
import {
  BATTLE_ANIMATION_NAMES,
  getBattleArena,
  getBattleCharacter,
  type BattleAnimationName,
  type BattleSetup,
} from "./models";
import { NGAJI_CERIA_ASSETS } from "../../../../data/assets";

const MONSTER_COLORS = [0xa78bfa, 0x34d399, 0xfb923c];

type LoadedActor = {
  object: THREE.Group;
  mixer: THREE.AnimationMixer;
  actions: Map<BattleAnimationName, THREE.AnimationAction>;
  currentAction: BattleAnimationName | null;
};

function material(color: number, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness });
}

function addMesh(group: THREE.Group, geometry: THREE.BufferGeometry, surface: THREE.Material, position: [number, number, number]) {
  const mesh = new THREE.Mesh(geometry, surface);
  mesh.position.set(...position);
  mesh.castShadow = true;
  group.add(mesh);
  return mesh;
}

function disposeRenderable(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Points)) return;
    const renderable = object as THREE.Mesh;
    renderable.geometry?.dispose?.();
    const material = renderable.material as THREE.Material | THREE.Material[] | undefined;
    const surfaces = material === undefined ? [] : Array.isArray(material) ? material : [material];
    surfaces.forEach((surface) => {
      const candidate = surface as THREE.Material & Record<string, unknown>;
      ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap", "aoMap"].forEach((key) => {
        const texture = candidate[key] as THREE.Texture | undefined;
        if (texture?.isTexture) texture.dispose();
      });
      surface.dispose();
    });
  });
}

function normalizeModel(model: THREE.Object3D, targetHeight: number) {
  model.updateMatrixWorld(true);
  const initialBounds = new THREE.Box3().setFromObject(model);
  const initialSize = initialBounds.getSize(new THREE.Vector3());
  const sourceHeight = Math.max(initialSize.y, 0.001);
  model.scale.setScalar(targetHeight / sourceHeight);
  model.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.y -= bounds.min.y;
  model.position.z -= center.z;
}

function tintMonster(model: THREE.Object3D, variant: number) {
  const tint = new THREE.Color(MONSTER_COLORS[variant % MONSTER_COLORS.length]);
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const surfaces = Array.isArray(object.material) ? object.material : [object.material];
    surfaces.forEach((surface) => {
      if (!(surface instanceof THREE.MeshStandardMaterial)) return;
      const name = `${object.name} ${surface.name}`.toLowerCase();
      if (name.includes("body") || name.includes("robe") || name.includes("shell") || name.includes("monster")) {
        surface.color.lerp(tint, 0.35);
      }
    });
  });
}

// Senjata dihilangkan untuk fokus pada pertarungan tangan kosong yang realistis

function createLoadedActor(
  gltf: { scene: THREE.Group; animations: THREE.AnimationClip[] },
  actor: "player" | "monster",
  variant: number,
  height: number,
  rotationY: number,
  tint?: number,
) {
  const object = new THREE.Group();
  object.name = `${actor}-battle-actor`;
  const model = gltf.scene;
  normalizeModel(model, height);
  if (actor === "monster") tintMonster(model, variant);
  if (tint !== undefined) model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const surfaces = Array.isArray(object.material) ? object.material : [object.material];
    surfaces.forEach((surface) => {
      if (surface instanceof THREE.MeshStandardMaterial && /robe|body|shell/i.test(`${object.name} ${surface.name}`)) surface.color.set(tint);
    });
  });
  object.add(model);
  object.rotation.y = rotationY;

  const mixer = new THREE.AnimationMixer(object);
  const actions = new Map<BattleAnimationName, THREE.AnimationAction>();
  // Alias mapping: Quaternius / Mixamo / single-clip files -> sistem duel tangan kosong
  const resolveBattleAction = (raw: string): BattleAnimationName | null => {
    const n = raw.toLowerCase();
    // defeat dulu (paling spesifik)
    if (n.includes("death") || n.includes("defeat") || n.includes("|die") || n.includes("die_")) return "defeat";
    if (n.includes("hit")) return "hit";
    if (n.includes("punch") || n.includes("kick") || n.includes("attack") || n.includes("slash") || n.includes("weapon")) return "attack";
    if (n.includes("duck") || n.includes("roll") || n.includes("dodge") || n.includes("jump")) return "dodge";
    if (n.includes("block") || n.includes("guard") || n.includes("parry")) return "block";
    if (n.includes("idle") || n === "animation" || n.includes("soldier-idle") || n.includes("muay")) return "idle";
    return null;
  };
  gltf.animations.forEach((clip) => {
    const resolved = resolveBattleAction(clip.name);
    const direct = clip.name.toLowerCase() as BattleAnimationName;
    const target: BattleAnimationName | null = (BATTLE_ANIMATION_NAMES as readonly string[]).includes(direct)
      ? direct
      : resolved;
    if (!target) return;
    // Jangan timpa jika sudah ada (ambil yang pertama)
    if (!actions.has(target)) actions.set(target, mixer.clipAction(clip));
  });
  // Fallback: file single-clip (yusuf/soldier/muay-thai) -> duplikasi idle ke semua aksi agar tetap bergerak prosedural
  const idleAction = actions.get("idle");
  const firstAction = actions.values().next().value as THREE.AnimationAction | undefined;
  const fallbackAction = idleAction || firstAction;
  if (fallbackAction) {
    for (const name of BATTLE_ANIMATION_NAMES as readonly BattleAnimationName[]) {
      if (!actions.has(name)) actions.set(name, fallbackAction);
    }
  }

  return { object, mixer, actions, currentAction: null } satisfies LoadedActor;
}

function playActorAction(actor: LoadedActor, name: BattleAnimationName) {
  const action = actor.actions.get(name) || actor.actions.get("idle");
  if (!action || actor.currentAction === name) return;

  const previous = actor.currentAction ? actor.actions.get(actor.currentAction) : undefined;
  previous?.fadeOut(name === "idle" ? 0.16 : 0.06);
  action.reset();
  action.setLoop(name === "idle" ? THREE.LoopRepeat : THREE.LoopOnce, name === "idle" ? Infinity : 1);
  action.clampWhenFinished = name !== "idle";
  action.fadeIn(name === "idle" ? 0.16 : 0.06).play();
  actor.currentAction = name;
}

const preloadedUrls = new Set<string>();

/**
 * Pemanasan cache HTTP untuk model duel berikutnya. Hasil parse langsung
 * dibuang; yang dipertahankan hanya file di cache browser sehingga muat
 * berikutnya (saat masuk arena) tinggal parse tanpa unduh ulang.
 */
export function preloadBattleModels(...urls: string[]) {
  if (typeof window === "undefined") return;
  const loader = new GLTFLoader();
  urls.forEach((url) => {
    if (!url || preloadedUrls.has(url)) return;
    preloadedUrls.add(url);
    loader.loadAsync(url).then(
      (gltf) => disposeRenderable(gltf.scene),
      () => { preloadedUrls.delete(url); },
    );
  });
}

export function BattleScene({ visual, variant, theme, setup }: { visual: BattleVisualState; variant: number; theme: "dungeon" | "sky"; setup?: BattleSetup }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef(visual);
  visualRef.current = visual;
  const [fallback, setFallback] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const character = getBattleCharacter(setup?.characterId);
    const arena = getBattleArena(setup?.arenaId ?? (theme === "sky" ? "sky" : "cave"));
    // Playwright's software WebGL renderer emits noisy GPU stall warnings while
    // continuously animating a canvas. The accessible CSS battle scene keeps
    // automated smoke tests deterministic; real browsers use the full GLB scene.
    if (navigator.webdriver) { setFallback(true); return; }

    const canvas = document.createElement("canvas");
    // Check the context before constructing the renderer to avoid console errors
    // on devices where WebGL is disabled.
    const context = canvas.getContext("webgl2", { alpha: true, antialias: true });
    if (!context) { setFallback(true); return; }
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: true }); }
    catch { setFallback(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvas.setAttribute("aria-hidden", "true");
    canvas.dataset.battleRenderer = "webgl-glb";
    canvas.style.display = "none";
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const background = arena.background;
    scene.background = new THREE.Color(background);
    scene.fog = new THREE.Fog(background, 10, 22);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
    camera.position.set(0, 3.8, 8.3);
    camera.lookAt(0, 1, 0);
    // Pencahayaan tiga titik: key lembut, fill hangat, dan rim dari belakang.
    scene.add(new THREE.AmbientLight(0xffead0, 1.65));
    const key = new THREE.DirectionalLight(0xfff1dc, 3.2);
    key.position.set(-3.5, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 24;
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -4;
    key.shadow.bias = -0.0003;
    scene.add(key);
    const rim = new THREE.SpotLight(arena.rim, 24, 18, Math.PI / 4, 0.55, 1.2);
    rim.position.set(0, 5, -5);
    rim.target.position.set(0, 1, 0);
    scene.add(rim, rim.target);

    const stage = new THREE.Group();
    const floor = addMesh(stage, new THREE.CylinderGeometry(3.4, 3.6, 0.32, 40), material(arena.floor, 0.15), [0, -0.2, 0]);
    floor.receiveShadow = true;
    const ring = addMesh(stage, new THREE.TorusGeometry(3.35, 0.045, 8, 64), material(0xe6be76, 0.65), [0, -0.04, 0]);
    ring.rotation.x = Math.PI / 2;
    floor.rotation.y = Math.PI / 8;
    const crystals: THREE.Mesh[] = [];
    [-1, 1].forEach((side) => {
      addMesh(stage, new THREE.CylinderGeometry(0.24, 0.32, 2.9, 8), material(0x29344f), [side * 2.9, 1.3, -1.9]);
      crystals.push(addMesh(stage, new THREE.OctahedronGeometry(0.22), material(arena.rim, 0.2), [side * 2.9, 2.85, -1.9]));
      const shadow = addMesh(stage, new THREE.CircleGeometry(0.63, 24), new THREE.MeshBasicMaterial({ color: 0x071122, transparent: true, opacity: 0.5 }), [side * 1.35, -0.025, 0.25]);
      shadow.rotation.x = -Math.PI / 2;
    });
    scene.add(stage);

    // Debu/partikel arena yang melayang (dimatikan saat reduced-motion).
    const PARTICLE_COUNT = 90;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(PARTICLE_COUNT * 3);
    const particleSeed = new Float32Array(PARTICLE_COUNT * 2);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 10;
      particlePos[i * 3 + 1] = Math.random() * 5;
      particlePos[i * 3 + 2] = -2 - Math.random() * 4;
      particleSeed[i * 2] = Math.random() * Math.PI * 2;
      particleSeed[i * 2 + 1] = 0.3 + Math.random() * 0.9;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
      color: arena.rim, size: 0.06, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(particles);

    const projectile = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), new THREE.MeshBasicMaterial({ color: 0x67e8f9 }));
    scene.add(projectile);
    projectile.visible = false;

    // Kilatan benturan di posisi korban (impact VFX).
    const flash = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.3),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }),
    );
    flash.visible = false;
    scene.add(flash);

    let hero: LoadedActor | null = null;
    let monster: LoadedActor | null = null;
    let disposed = false;
    let loadingFailed = false;
    const loader = new GLTFLoader();
    const loadModels = async () => {
      const results = await Promise.allSettled([
        loader.loadAsync(character.modelUrl),
        loader.loadAsync(arena.monsterModelUrl),
      ]);
      if (disposed) {
        results.forEach((result) => {
          if (result.status === "fulfilled") disposeRenderable(result.value.scene);
        });
        return;
      }
      const playerResult = results[0];
      const monsterResult = results[1];
      if (playerResult.status === "rejected" || monsterResult.status === "rejected") {
        results.forEach((result) => {
          if (result.status === "fulfilled") disposeRenderable(result.value.scene);
        });
        loadingFailed = true;
        setFallback(true);
        canvas.style.display = "none";
        return;
      }
      const playerGltf = playerResult.value;
      const monsterGltf = monsterResult.value;
      hero = createLoadedActor(playerGltf, "player", variant, character.modelHeight, character.rotationY, character.tint);
      monster = createLoadedActor(monsterGltf, "monster", variant, arena.monsterHeight, arena.monsterRotationY, arena.monsterTint);
      hero.object.traverse((object) => { if (object instanceof THREE.Mesh) object.castShadow = true; });
      monster.object.traverse((object) => { if (object instanceof THREE.Mesh) object.castShadow = true; });
      scene.add(hero.object, monster.object);
      playActorAction(hero, "idle");
      playActorAction(monster, "idle");
      canvas.style.display = "block";
      setFallback(false);
    };
    void loadModels();

    const loadEnvironment = async () => {
      const results = await Promise.allSettled(arena.props.map((prop) => loader.loadAsync(prop.url)));
      if (disposed) {
        results.forEach((result) => { if (result.status === "fulfilled") disposeRenderable(result.value.scene); });
        return;
      }
      results.forEach((result, index) => {
        if (result.status !== "fulfilled") return;
        const prop = arena.props[index];
        const object = result.value.scene;
        normalizeModel(object, prop.targetHeight);
        object.position.set(...prop.position);
        object.rotation.y = prop.rotationY ?? 0;
        object.name = `arena-prop-${index}`;
        object.traverse((child) => { if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true; } });
        scene.add(object);
      });
    };
    void loadEnvironment();

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      const portrait = width / height < 0.82;
      camera.fov = portrait ? 46 : 38;
      camera.position.set(0, portrait ? 4.15 : 3.8, portrait ? 9.7 : 8.3);
      camera.lookAt(0, portrait ? 1.05 : 1, 0);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    // Jeda render saat scene keluar layar (hemat baterai di mobile).
    let hostVisible = true;
    const visibilityObserver = new IntersectionObserver(
      (entries) => { hostVisible = entries[0]?.isIntersecting ?? true; },
      { threshold: 0.05 },
    );
    visibilityObserver.observe(host);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let previous = performance.now();
    let elapsed = 0;
    let attackElapsed = 1;
    let lastAttackId: number | null = null;
    let lastHeroAction: BattleAnimationName | null = null;
    let lastMonsterAction: BattleAnimationName | null = null;
    let frame = 0;
    let lostContext = false;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      lostContext = true;
      cancelAnimationFrame(frame);
      canvas.style.display = "none";
      setFallback(true);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    const render = (now: number) => {
      const delta = Math.min(0.05, (now - previous) / 1000);
      previous = now;
      const current = visualRef.current;
      const animating = !current.paused && !document.hidden && hostVisible;
      if (animating) {
        elapsed += delta;
        attackElapsed += delta;
        hero?.mixer.update(delta);
        monster?.mixer.update(delta);
      }
      if (current.attack?.id !== lastAttackId) {
        lastAttackId = current.attack?.id ?? null;
        attackElapsed = current.attack ? 0 : 1;
      }
      const active = current.attack && attackElapsed < 0.85 && !reducedMotion.matches;
      const progress = active ? Math.min(1, attackElapsed / 0.8) : 0;
      const swing = Math.sin(progress * Math.PI);
      const bob = reducedMotion.matches || current.outcome ? 0 : Math.sin(elapsed * 2.8) * 0.035;

      if (hero) {
        const heroDead = current.playerHp <= 0 || current.outcome === "defeat";
        const heroHit = active && current.attack?.attacker === "monster" && attackElapsed > 0.22;
        const heroAttacking = active && current.attack?.attacker === "player";
        
        // Menentukan aksi duel tangan kosong (attack, dodge, block, hit, defeat)
        let heroAction: BattleAnimationName = "idle";
        if (heroDead) {
          heroAction = "defeat";
        } else if (heroAttacking) {
          heroAction = "attack"; // Pukulan tinju lurus (Jab / Right Hook)
        } else if (heroHit) {
          // Kombinasi menangkis (block) atau terkena pukulan (hit)
          heroAction = current.playerHp > 30 ? "block" : "hit";
        } else if (active && current.attack?.attacker === "monster" && attackElapsed <= 0.22) {
          heroAction = "dodge"; // Menghindar saat monster baru mengayunkan pukulan
        }

        if (heroAction !== lastHeroAction) {
          playActorAction(hero, heroAction);
          lastHeroAction = heroAction;
        }

        // Posisi & Pose Prosedural Realistis Tanpa Senjata (Tangan Kosong)
        let posX = -1.35;
        let posY = bob;
        let rotZ = 0;
        let rotY = character.rotationY;
        let scaleS = 1;

        if (heroDead) {
          // Animasi Terjatuh (Defeat / Knockout)
          rotZ = -1.35;
          posY = -0.15;
          posX = -1.65;
          scaleS = 0.82;
        } else if (heroAttacking) {
          // Animasi Pukulan Tangan Kosong (Forward Dash + Right Hook/Jab)
          posX = -1.35 + swing * 0.75;
          posY = bob + Math.sin(progress * Math.PI * 2) * 0.05;
          rotY = character.rotationY - swing * 0.35; // Putaran pinggul saat memukul
          rotZ = swing * 0.12; // Inclinasi badan ke depan
        } else if (heroAction === "dodge") {
          // Animasi Dodge (Menghindar ke Belakang/Samping)
          posX = -1.35 - Math.sin(attackElapsed * 15) * 0.25;
          rotZ = -0.18;
        } else if (heroAction === "block") {
          // Animasi Menangkis (Block/Parry)
          posX = -1.35 - swing * 0.1;
          rotZ = -0.08;
          rotY = character.rotationY + 0.15;
        } else if (heroHit) {
          // Animasi Terkena Pukulan (Reeling Back / Hit Stagger)
          posX = -1.35 - Math.sin((attackElapsed - 0.22) * 20) * 0.22;
          rotZ = -0.3;
          posY = bob + 0.06;
        }

        hero.object.position.set(posX, posY, 0.25);
        hero.object.rotation.z = rotZ;
        hero.object.rotation.y = rotY;
        hero.object.scale.setScalar(scaleS);
      }

      if (monster) {
        const monsterDead = current.monsterHp <= 0 || current.outcome === "victory";
        const monsterHit = active && current.attack?.attacker === "player" && attackElapsed > 0.22;
        const monsterAttacking = active && current.attack?.attacker === "monster";

        let monsterAction: BattleAnimationName = "idle";
        if (monsterDead) {
          monsterAction = "defeat";
        } else if (monsterAttacking) {
          monsterAction = "attack"; // Hantaman / Pukulan monster
        } else if (monsterHit) {
          monsterAction = current.monsterHp > 30 ? "block" : "hit";
        } else if (active && current.attack?.attacker === "player" && attackElapsed <= 0.22) {
          monsterAction = "dodge";
        }

        if (monsterAction !== lastMonsterAction) {
          playActorAction(monster, monsterAction);
          lastMonsterAction = monsterAction;
        }

        let posX = 1.35;
        let posY = -bob;
        let rotZ = 0;
        let rotY = arena.monsterRotationY;
        let scaleS = 1;

        if (monsterDead) {
          // Animasi Monster Terjatuh (Knockout)
          rotZ = 1.4;
          posY = -0.18;
          posX = 1.65;
          scaleS = 0.72;
        } else if (monsterAttacking) {
          // Animasi Pukulan Monster (Heavy Slam/Punch Forward)
          posX = 1.35 - swing * 0.75;
          posY = -bob + Math.sin(progress * Math.PI * 2) * 0.06;
          rotY = arena.monsterRotationY + swing * 0.35;
          rotZ = -swing * 0.15;
        } else if (monsterAction === "dodge") {
          posX = 1.35 + Math.sin(attackElapsed * 15) * 0.25;
          rotZ = 0.18;
        } else if (monsterAction === "block") {
          posX = 1.35 + swing * 0.1;
          rotZ = 0.08;
        } else if (monsterHit) {
          posX = 1.35 + Math.sin((attackElapsed - 0.22) * 20) * 0.22;
          rotZ = 0.3;
          posY = -bob + 0.06;
        }

        monster.object.position.set(posX, posY, 0.25);
        monster.object.rotation.z = rotZ;
        monster.object.rotation.y = rotY;
        monster.object.scale.setScalar(scaleS);
      }
      const impact = active && attackElapsed > 0.27 && attackElapsed < 0.55 ? Math.sin(attackElapsed * 75) * 0.09 : 0;
      if (current.attack?.attacker === "player" && monster) monster.object.position.x += impact;
      if (current.attack?.attacker === "monster" && hero) hero.object.position.x += impact;
      // Kilatan + lonjakan cahaya rim saat pukulan mendarat.
      const impactBurst = active && attackElapsed > 0.27 && attackElapsed < 0.55
        ? Math.sin(((attackElapsed - 0.27) / 0.28) * Math.PI)
        : 0;
      const victim = current.attack?.attacker === "player" ? monster : current.attack?.attacker === "monster" ? hero : null;
      flash.visible = impactBurst > 0 && victim !== null;
      if (flash.visible && victim) {
        flash.position.set(victim.object.position.x, 1.4, 0.45);
        flash.scale.setScalar(0.6 + impactBurst * 1.3);
        (flash.material as THREE.MeshBasicMaterial).opacity = 0.85 * impactBurst;
      }
      // Lingkungan hidup: kristal mengambang, rim berdenyut, debu melayang.
      if (!reducedMotion.matches && animating) {
        crystals.forEach((crystal, index) => {
          crystal.position.y = 2.85 + Math.sin(elapsed * 1.2 + index * Math.PI) * 0.08;
          crystal.rotation.y += delta * 0.4;
        });
        rim.intensity = 16 + Math.sin(elapsed * 1.6) * 3.5 + impactBurst * 26;
        const positions = particleGeo.attributes.position as THREE.BufferAttribute;
        const arr = positions.array as Float32Array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          arr[i * 3 + 1] += delta * 0.12 * particleSeed[i * 2 + 1];
          arr[i * 3] += Math.sin(elapsed * 0.7 + particleSeed[i * 2]) * delta * 0.15;
          if (arr[i * 3 + 1] > 5.2) arr[i * 3 + 1] = 0;
        }
        positions.needsUpdate = true;
      } else if (!reducedMotion.matches) {
        rim.intensity = 16 + impactBurst * 26;
      }
      
      // Efek angin/benturan tembakan dihapus, fokus ke serangan jarak dekat tangan kosong
      projectile.visible = false;
      if (!lostContext && !loadingFailed) renderer.render(scene, camera);
      if (!lostContext && !loadingFailed) frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      hero?.mixer.stopAllAction();
      monster?.mixer.stopAllAction();
      disposeRenderable(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [theme, variant, setup?.characterId, setup?.arenaId]);

  return <div ref={hostRef} className="quiz-battle-scene" aria-hidden="true">
    {fallback && <div data-battle-renderer="fallback" className="quiz-battle-fallback">
      <div className="quiz-battle-floor" />
      <div className={`quiz-battle-fighter quiz-battle-hero ${visual.playerHp <= 0 ? "quiz-battle-down" : ""}`}><img src={NGAJI_CERIA_ASSETS.avatarAnak} alt="" aria-hidden="true" draggable={false} className="h-full w-full object-contain" /></div>
      <div className={`quiz-battle-fighter quiz-battle-monster ${visual.monsterHp <= 0 ? "quiz-battle-down" : ""}`}><span>{getBattleArena(setup?.arenaId ?? (theme === "sky" ? "sky" : "cave")).monsterEmoji}</span></div>
    </div>}
  </div>;
}
