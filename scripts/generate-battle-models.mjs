import fs from "node:fs/promises";
import path from "node:path";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

class NodeFileReader {
  result = null;
  onloadend = null;

  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onloadend?.();
    });
  }
}

globalThis.FileReader = NodeFileReader;

const outputDirectory = path.resolve("public/models/ngaji-ceria");

function standardMaterial(name, color, options = {}) {
  return new THREE.MeshStandardMaterial({
    name,
    color,
    roughness: 0.55,
    metalness: options.metalness ?? 0,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
  });
}

function mesh(parent, name, geometry, material, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material);
  object.name = name;
  object.position.set(...position);
  parent.add(object);
  return object;
}

function addAnimations(root, targetName, attackDistance) {
  root.animations = [
    new THREE.AnimationClip("idle", 1.2, [
      new THREE.NumberKeyframeTrack(`${targetName}.position`, [0, 0.6, 1.2], [0, 0, 0, 0, 0.045, 0, 0, 0, 0]),
    ]),
    new THREE.AnimationClip("attack", 0.62, [
      new THREE.NumberKeyframeTrack(`${targetName}.position`, [0, 0.2, 0.62], [0, 0, 0, attackDistance, 0, 0, 0, 0, 0]),
    ]),
    new THREE.AnimationClip("hit", 0.42, [
      new THREE.QuaternionKeyframeTrack(`${targetName}.quaternion`, [0, 0.09, 0.2, 0.42], [0, 0, 0, 1, 0, 0, 0.06, 0.998, 0, 0, -0.05, 0.999, 0, 0, 0, 1]),
    ]),
    new THREE.AnimationClip("defeat", 0.75, [
      new THREE.QuaternionKeyframeTrack(`${targetName}.quaternion`, [0, 0.3, 0.75], [0, 0, 0, 1, 0, 0, 0.412, 0.911, 0, 0, 0.565, 0.825]),
      new THREE.NumberKeyframeTrack(`${targetName}.position`, [0, 0.75], [0, 0, 0, 0, -0.18, 0]),
    ]),
  ];
}

function makeQirra() {
  const root = new THREE.Group();
  root.name = "QirraRoot";
  const body = new THREE.Group();
  body.name = "QirraBody";
  root.add(body);

  const skin = standardMaterial("QirraSkin", 0xf0b88a);
  const robe = standardMaterial("QirraRobe", 0x14b8a6, { metalness: 0.1 });
  const boots = standardMaterial("QirraBoots", 0x172c40);
  const white = standardMaterial("QirraKufi", 0xfffaf0);
  const dark = standardMaterial("QirraEyes", 0x172033);
  const gold = standardMaterial("QirraStaff", 0xfbbf24, { metalness: 0.5 });
  const light = standardMaterial("QirraLight", 0xa5f3fc, { emissive: 0x22d3ee, emissiveIntensity: 1.2 });

  mesh(body, "QirraRobeMesh", new THREE.CylinderGeometry(0.28, 0.42, 0.85, 10), robe, [0, 0.91, 0]);
  mesh(body, "QirraHead", new THREE.SphereGeometry(0.32, 16, 12), skin, [0, 1.68, 0]);
  mesh(body, "QirraKufiMesh", new THREE.CylinderGeometry(0.32, 0.33, 0.19, 12), white, [0, 1.92, 0]);
  [-1, 1].forEach((side) => {
    mesh(body, `QirraBoot${side}`, new THREE.CapsuleGeometry(0.105, 0.25, 4, 8), boots, [side * 0.18, 0.3, 0]);
    const arm = mesh(body, `QirraArm${side}`, new THREE.CapsuleGeometry(0.11, 0.37, 4, 8), robe, [side * 0.37, 1.05, 0]);
    arm.rotation.z = side * 0.25;
    mesh(body, `QirraHand${side}`, new THREE.SphereGeometry(0.1, 10, 8), skin, [side * 0.43, 0.78, 0.03]);
    mesh(body, `QirraEye${side}`, new THREE.SphereGeometry(0.035, 8, 6), dark, [side * 0.115, 1.72, 0.293]);
  });
  mesh(body, "QirraStaff", new THREE.CylinderGeometry(0.03, 0.03, 1.15, 8), gold, [0.47, 1.26, 0.12]);
  mesh(body, "QirraStaffCrystal", new THREE.OctahedronGeometry(0.15), light, [0.47, 1.9, 0.12]);

  addAnimations(root, "QirraRoot", 0.25);
  return root;
}

function makeNurling() {
  const root = new THREE.Group();
  root.name = "NurlingRoot";
  const body = new THREE.Group();
  body.name = "NurlingBody";
  root.add(body);

  const shell = standardMaterial("NurlingBody", 0x8b5cf6, { metalness: 0.12 });
  const dark = standardMaterial("NurlingDark", 0x231830);
  const eyes = standardMaterial("NurlingEyes", 0xfff0bb, { emissive: 0xf59e0b, emissiveIntensity: 0.25 });
  const horn = standardMaterial("NurlingHorn", 0xfde68a, { metalness: 0.25 });
  const glow = standardMaterial("NurlingGlow", 0xc4b5fd, { emissive: 0x8b5cf6, emissiveIntensity: 0.8 });

  const torso = mesh(body, "NurlingShell", new THREE.IcosahedronGeometry(0.72, 1), shell, [0, 1, 0]);
  torso.scale.set(1, 0.95, 0.85);
  [-1, 1].forEach((side) => {
    mesh(body, `NurlingLeg${side}`, new THREE.SphereGeometry(0.21, 10, 8), dark, [side * 0.36, 0.21, 0.06]);
    mesh(body, `NurlingArm${side}`, new THREE.SphereGeometry(0.25, 10, 8), shell, [side * 0.72, 0.83, 0]);
    const spike = mesh(body, `NurlingHorn${side}`, new THREE.ConeGeometry(0.16, 0.48, 7), horn, [side * 0.47, 1.65, 0]);
    spike.rotation.z = -side * 0.35;
    mesh(body, `NurlingEye${side}`, new THREE.SphereGeometry(0.13, 12, 8), eyes, [side * 0.23, 1.19, 0.53]);
    mesh(body, `NurlingPupil${side}`, new THREE.SphereGeometry(0.052, 8, 6), dark, [side * 0.23, 1.18, 0.65]);
  });
  mesh(body, "NurlingMouth", new THREE.BoxGeometry(0.32, 0.08, 0.04), dark, [0, 0.89, 0.59]);
  mesh(body, "NurlingGlow", new THREE.TorusGeometry(0.48, 0.035, 6, 24), glow, [0, 1.02, -0.06]);

  addAnimations(root, "NurlingRoot", -0.25);
  return root;
}

function makeCrystalGolem() {
  const root = new THREE.Group();
  root.name = "CrystalGolemRoot";
  const body = new THREE.Group();
  body.name = "CrystalGolemBody";
  root.add(body);
  const stone = standardMaterial("CrystalGolemBody", 0x315c51, { metalness: 0.25 });
  const crystal = standardMaterial("CrystalGolemCrystal", 0x86efac, { emissive: 0x34d399, emissiveIntensity: 0.7 });
  const eyes = standardMaterial("CrystalGolemEyes", 0xfef3c7, { emissive: 0xfbbf24, emissiveIntensity: 0.5 });
  mesh(body, "CrystalGolemTorso", new THREE.BoxGeometry(0.88, 0.82, 0.55), stone, [0, 1.05, 0]);
  mesh(body, "CrystalGolemHead", new THREE.IcosahedronGeometry(0.35, 0), stone, [0, 1.68, 0]);
  [-1, 1].forEach((side) => {
    mesh(body, `CrystalGolemArm${side}`, new THREE.BoxGeometry(0.28, 0.65, 0.35), stone, [side * 0.65, 1.02, 0]);
    mesh(body, `CrystalGolemLeg${side}`, new THREE.BoxGeometry(0.3, 0.42, 0.4), stone, [side * 0.24, 0.3, 0]);
    mesh(body, `CrystalGolemEye${side}`, new THREE.SphereGeometry(0.05, 8, 6), eyes, [side * 0.12, 1.7, 0.3]);
    mesh(body, `CrystalGolemCrystal${side}`, new THREE.OctahedronGeometry(0.2), crystal, [side * 0.64, 1.55, 0]);
  });
  mesh(body, "CrystalGolemCore", new THREE.OctahedronGeometry(0.21), crystal, [0, 1.13, 0.31]);
  addAnimations(root, "CrystalGolemRoot", -0.2);
  return root;
}

function exportModel(root, fileName) {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(root, (result) => {
      if (!(result instanceof ArrayBuffer)) {
        reject(new Error(`Exporter did not return binary GLB for ${fileName}`));
        return;
      }
      resolve(fs.writeFile(path.join(outputDirectory, fileName), Buffer.from(result)));
    }, reject, { binary: true, animations: root.animations });
  });
}

await fs.mkdir(outputDirectory, { recursive: true });
await exportModel(makeQirra(), "qirra.glb");
await exportModel(makeNurling(), "nurling.glb");
await exportModel(makeCrystalGolem(), "crystal-golem.glb");
console.log(`Generated bundled battle models in ${outputDirectory}`);
