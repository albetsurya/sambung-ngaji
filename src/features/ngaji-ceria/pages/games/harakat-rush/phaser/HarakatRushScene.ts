import Phaser from "phaser";
import type { GamePhase } from "../../_shared/types";
import { HARAKAT_LIST, type HarakatId, type PowerUpType } from "../data/harakat-list";
import { Player } from "./entities/Player";
import { HarakatSprite } from "./entities/HarakatSprite";
import { PowerUp } from "./entities/PowerUp";

export interface RushSnapshot {
  phase: GamePhase; score: number; combo: number; maxCombo: number; lives: number; speed: number; target: HarakatId;
  lane: number; activePowerUp: PowerUpType | "none"; powerUpTimeLeft: number; distance: number;
}
export const initialRush = (): RushSnapshot => ({ phase: "idle", score: 0, combo: 0, maxCombo: 0, lives: 3, speed: 200, target: "fathah", lane: 1, activePowerUp: "none", powerUpTimeLeft: 0, distance: 0 });

export class HarakatRushScene extends Phaser.Scene {
  private state = initialRush();
  private scoreExact = 0;
  private elapsed = 0;
  private spawnLeft = 0;
  private publishLeft = 0;
  private nextPowerScore = 2000;
  private powerCount = 0;
  private caughtForTarget = 0;
  private invulnerableLeft = 0;
  private itemId = 0;
  private player!: Player;
  private items: HarakatSprite[] = [];
  private powerUps: PowerUp[] = [];
  private layers: Phaser.GameObjects.TileSprite[] = [];
  private lines!: Phaser.GameObjects.Graphics;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private ring!: Phaser.GameObjects.Arc;
  constructor(private readonly bridge: Phaser.Events.EventEmitter) { super("HarakatRush"); }
  private laneX(lane: number) { return this.scale.width * (lane + 0.5) / 3; }
  private playerY() { return this.scale.height - 48; }

  create() {
    Player.prepare(this);
    this.createBackground();
    this.lines = this.add.graphics().setDepth(1);
    this.player = new Player(this, this.laneX(1), this.playerY());
    this.ring = this.add.circle(this.player.x, this.player.y, 31).setStrokeStyle(2, 0xfbbf24).setDepth(4).setVisible(false);
    const spark = this.make.graphics({ x: 0, y: 0 }); spark.fillStyle(0x67e8f9).fillCircle(3, 3, 3); spark.generateTexture("rush-spark", 6, 6); spark.destroy();
    this.particles = this.add.particles(0, 0, "rush-spark", { speed: { min: 60, max: 140 }, lifespan: 300, scale: { start: 1, end: 0 }, emitting: false }).setDepth(6);
    const restart = () => this.begin();
    const pause = () => { if (this.state.phase === "playing") { this.state.phase = "paused"; this.player.anims.pause(); this.publish(); } };
    const resume = () => { if (this.state.phase === "paused") { this.state.phase = "playing"; this.player.anims.resume(); this.publish(); } };
    const lane = (value: number) => this.moveLane(value);
    this.bridge.on("start", restart); this.bridge.on("pause", pause); this.bridge.on("resume", resume); this.bridge.on("lane", lane);
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.moveLane(Math.min(2, Math.floor(pointer.x / (this.scale.width / 3)))));
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => { const dx = pointer.x - pointer.downX; if (Math.abs(dx) > 30) this.moveLane(this.state.lane + (dx > 0 ? 1 : -1)); });
    this.input.keyboard?.on("keydown-LEFT", () => this.moveLane(this.state.lane - 1));
    this.input.keyboard?.on("keydown-RIGHT", () => this.moveLane(this.state.lane + 1));
    this.input.keyboard?.addCapture([Phaser.Input.Keyboard.KeyCodes.LEFT, Phaser.Input.Keyboard.KeyCodes.RIGHT]);
    const resize = () => this.layout(); this.scale.on("resize", resize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.bridge.off("start", restart); this.bridge.off("pause", pause); this.bridge.off("resume", resume); this.bridge.off("lane", lane); this.scale.off("resize", resize);
    });
    this.layout(); this.begin(); this.bridge.emit("ready");
  }

  private createBackground() {
    const colors = [0x22d3ee, 0x155e75, 0x67e8f9];
    for (let layer = 0; layer < 3; layer++) {
      const graphic = this.make.graphics({ x: 0, y: 0 });
      graphic.lineStyle(1, colors[layer], layer === 1 ? 0.22 : 0.35);
      if (layer === 0) { graphic.fillStyle(colors[layer], 0.45); for (let i = 0; i < 8; i++) graphic.fillCircle((i * 37) % 128, (i * 51) % 128, 1); }
      if (layer === 1) { for (let i = 0; i < 128; i += 32) { graphic.lineBetween(i, 0, i, 128); graphic.lineBetween(0, i, 128, i); } }
      if (layer === 2) { graphic.lineBetween(20, 0, 20, 12); graphic.lineBetween(100, 60, 100, 78); }
      const key = `rush-layer-${layer}`; graphic.generateTexture(key, 128, 128); graphic.destroy();
      this.layers.push(this.add.tileSprite(0, 0, this.scale.width, this.scale.height, key).setOrigin(0).setDepth(0));
    }
  }
  private layout() {
    this.layers.forEach((layer) => layer.setSize(this.scale.width, this.scale.height));
    this.lines.clear().lineStyle(2, 0x22d3ee, 0.3);
    for (let lane = 1; lane < 3; lane++) this.lines.lineBetween(this.scale.width * lane / 3, 0, this.scale.width * lane / 3, this.scale.height);
    this.player.setPosition(this.laneX(this.state.lane), this.playerY());
    this.items.forEach((item) => item.x = this.laneX(item.lane));
    this.powerUps.forEach((item) => item.x = this.laneX(item.lane));
  }
  private begin() {
    this.items.forEach((item) => item.destroy()); this.items = [];
    this.powerUps.forEach((item) => item.destroy()); this.powerUps = [];
    this.state = { ...initialRush(), phase: "playing" };
    this.scoreExact = 0; this.elapsed = 0; this.spawnLeft = 0.4; this.publishLeft = 0;
    this.nextPowerScore = 2000; this.powerCount = 0; this.caughtForTarget = 0; this.invulnerableLeft = 0;
    this.player.anims.resume(); this.player.play("qirra-run"); this.player.clearTint(); this.ring.setVisible(false); this.layout(); this.publish();
  }
  private moveLane(lane: number) {
    if (this.state.phase !== "playing") return;
    this.state.lane = Phaser.Math.Clamp(lane, 0, 2);
    // Posisi diperbarui langsung; kontrol tidak menunggu render React/HUD.
    this.player.x = this.laneX(this.state.lane); this.publish();
  }
  private spawnWave() {
    const targetLane = Phaser.Math.Between(0, 2);
    const wrong = HARAKAT_LIST.filter((item) => item.id !== this.state.target);
    for (let lane = 0; lane < 3; lane++) {
      const harakat = lane === targetLane ? this.state.target : Phaser.Utils.Array.GetRandom(wrong).id;
      this.items.push(new HarakatSprite(this, `harakat-${this.itemId++}`, harakat, lane, this.laneX(lane), -30));
    }
  }
  private collect(item: HarakatSprite) {
    if (item.collected) return;
    item.collected = true;
    if (item.harakat === this.state.target) {
      this.state.combo++;
      this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);
      this.scoreExact += Math.round(25 * Math.min(1 + this.state.combo * 0.1, 6));
      this.particles.explode(8, item.x, this.playerY());
      this.bridge.emit("sfx", this.state.combo % 5 === 0 ? "combo" : "correct");
      this.caughtForTarget++;
      // Asumsi: target berganti setelah empat tangkapan; target lama di arena disesuaikan.
      if (this.caughtForTarget >= 4) {
        const previousTarget = this.state.target;
        const next = Phaser.Utils.Array.GetRandom(HARAKAT_LIST.filter((entry) => entry.id !== this.state.target));
        this.state.target = next.id; this.caughtForTarget = 0;
        this.items.forEach((pending) => { if (!pending.collected && pending.y < this.playerY() && pending.harakat === previousTarget) pending.setHarakat(next.id); });
      }
    } else if (this.invulnerableLeft <= 0) {
      this.state.combo = 0;
      if (this.state.activePowerUp === "shield") { this.state.activePowerUp = "none"; this.bridge.emit("sfx", "powerup"); }
      else { this.state.lives--; this.player.feedback(true); this.cameras.main.flash(140, 220, 40, 60); this.bridge.emit("sfx", "wrong"); }
      this.invulnerableLeft = 0.5;
      if (this.state.lives <= 0) { this.state.phase = "gameover"; this.player.anims.pause(); }
    }
    this.state.score = Math.floor(this.scoreExact); this.publish();
  }
  private activatePowerUp(item: PowerUp) {
    this.state.activePowerUp = item.kind;
    this.state.powerUpTimeLeft = item.kind === "magnet" ? 5 : item.kind === "slowmo" ? 3 : 0;
    this.player.feedback(false); this.particles.explode(14, item.x, this.playerY()); this.bridge.emit("sfx", "powerup"); this.publish();
  }
  private publish() { this.bridge.emit("state", { ...this.state }); }

  update(_time: number, elapsedMs: number) {
    if (this.state.phase !== "playing") return;
    const delta = Math.min(elapsedMs / 1000, 0.05);
    this.elapsed += delta; this.invulnerableLeft = Math.max(0, this.invulnerableLeft - delta);
    this.state.speed = 200 + Math.floor(this.elapsed / 15) * 15;
    if (this.state.activePowerUp !== "none" && this.state.activePowerUp !== "shield") {
      this.state.powerUpTimeLeft = Math.max(0, this.state.powerUpTimeLeft - delta);
      if (!this.state.powerUpTimeLeft) this.state.activePowerUp = "none";
    }
    const distance = this.state.speed * delta * (this.state.activePowerUp === "slowmo" ? 0.5 : 1);
    this.state.distance += distance / 10;
    this.scoreExact += distance / 100;
    this.state.score = Math.floor(this.scoreExact);
    this.layers.forEach((layer, index) => layer.tilePositionY -= distance * [0.1, 0.35, 0.7][index]);
    this.ring.setPosition(this.player.x, this.player.y).setVisible(this.state.activePowerUp !== "none");
    this.spawnLeft -= delta;
    if (this.spawnLeft <= 0) { this.spawnWave(); this.spawnLeft = Math.max(0.65, 1.35 - this.elapsed * 0.003); }
    if (this.state.score >= this.nextPowerScore) {
      const kind: PowerUpType = (["magnet", "slowmo", "shield"] as const)[this.powerCount++ % 3];
      this.powerUps.push(new PowerUp(this, kind, this.state.lane, this.laneX(this.state.lane), -65)); this.nextPowerScore += 2000;
    }
    let magnetCaught = false;
    for (const item of this.items) {
      const previous = item.y; item.y += distance;
      if (previous < this.playerY() && item.y >= this.playerY()) {
        const magnet = this.state.activePowerUp === "magnet" && item.harakat === this.state.target;
        if (magnet) { this.collect(item); magnetCaught = true; }
      }
    }
    // Magnet menangkap target lebih dulu dan menghindari benturan salah pada baris itu.
    for (const item of this.items) {
      if (!item.collected && item.y >= this.playerY() && item.y - distance < this.playerY() && item.lane === this.state.lane && !magnetCaught && this.state.phase === "playing") this.collect(item);
    }
    this.items = this.items.filter((item) => { if (item.collected || item.y > this.scale.height + 50) { item.destroy(); return false; } return true; });
    this.powerUps = this.powerUps.filter((item) => {
      const previous = item.y; item.y += distance;
      if (previous < this.playerY() && item.y >= this.playerY() && item.lane === this.state.lane) { this.activatePowerUp(item); item.destroy(); return false; }
      if (item.y > this.scale.height + 50) { item.destroy(); return false; } return true;
    });
    this.publishLeft -= delta;
    if (this.publishLeft <= 0) { this.publish(); this.publishLeft = 0.1; }
  }
}
