import Phaser from "phaser";

export class Player extends Phaser.GameObjects.Sprite {
  static prepare(scene: Phaser.Scene) {
    if (scene.textures.exists("qirra-runner")) return;
    // Sprite Qirra sementara: 4 frame untuk lari, lompat, dan terkena hit.
    const sheet = document.createElement("canvas"); sheet.width = 64 * 12; sheet.height = 80;
    const ctx = sheet.getContext("2d");
    if (!ctx) return;
    for (let frame = 0; frame < 12; frame++) {
      ctx.save(); ctx.translate(frame * 64, frame < 4 ? [0, -2, 0, 2][frame] : frame < 8 ? -5 : 0);
      const hit = frame >= 8;
      ctx.fillStyle = "#083344"; ctx.beginPath(); ctx.ellipse(32, 73, 20, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 5; ctx.lineCap = "round";
      const stride = frame % 2 ? 5 : -5;
      ctx.beginPath(); ctx.moveTo(24, 57); ctx.lineTo(22 + stride, 69); ctx.moveTo(40, 57); ctx.lineTo(42 - stride, 69); ctx.stroke();
      ctx.fillStyle = hit ? "#fb7185" : "#22d3ee"; ctx.beginPath(); ctx.ellipse(32, 40, 23, 25, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0891b2"; ctx.beginPath(); ctx.ellipse(13, 46, 10, 16, frame % 2 ? -0.4 : 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ecfeff"; ctx.beginPath(); ctx.ellipse(36, 47, 13, 15, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#082f49"; ctx.beginPath(); ctx.arc(24, 32, 3, 0, Math.PI * 2); ctx.arc(42, 32, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.moveTo(28, 38); ctx.lineTo(41, 40); ctx.lineTo(30, 45); ctx.fill();
      ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.ellipse(32, 15, 20, 7, 0, Math.PI, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    const texture = scene.textures.addCanvas("qirra-runner", sheet);
    if (!texture) return;
    for (let i = 0; i < 12; i++) texture.add(i, 0, i * 64, 0, 64, 80);
    for (const [index, name] of ["run", "jump", "hit"].entries()) scene.anims.create({ key: `qirra-${name}`, frames: scene.anims.generateFrameNumbers("qirra-runner", { start: index * 4, end: index * 4 + 3 }), frameRate: 12, repeat: name === "run" ? -1 : 0 });
  }
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "qirra-runner", 0);
    scene.add.existing(this); this.setDepth(5).setScale(0.75); this.play("qirra-run");
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.play("qirra-run"));
  }
  feedback(hit: boolean) { this.play(hit ? "qirra-hit" : "qirra-jump", true); }
}
