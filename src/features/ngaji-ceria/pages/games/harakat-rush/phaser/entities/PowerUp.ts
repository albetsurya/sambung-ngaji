import Phaser from "phaser";
import type { PowerUpType } from "../../data/harakat-list";

export class PowerUp extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, readonly kind: PowerUpType, readonly lane: number, x: number, y: number) {
    super(scene, x, y);
    const circle = scene.add.circle(0, 0, 22, 0xfbbf24).setStrokeStyle(2, 0xfef3c7);
    const label = scene.add.text(0, 0, { magnet: "M", slowmo: "½", shield: "◆" }[kind], { fontFamily: "sans-serif", fontSize: "22px", fontStyle: "bold", color: "#0f172a" }).setOrigin(0.5);
    this.add([circle, label]); this.setDepth(4); scene.add.existing(this);
  }
}
