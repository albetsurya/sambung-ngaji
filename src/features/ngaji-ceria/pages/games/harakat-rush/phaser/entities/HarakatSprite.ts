import Phaser from "phaser";
import { HARAKAT_LIST, type HarakatId } from "../../data/harakat-list";

export class HarakatSprite extends Phaser.GameObjects.Container {
  collected = false;
  private label: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, readonly id: string, public harakat: HarakatId, readonly lane: number, x: number, y: number) {
    super(scene, x, y);
    const item = HARAKAT_LIST.find((entry) => entry.id === harakat)!;
    const box = scene.add.rectangle(0, 0, 50, 48, 0x164e63).setStrokeStyle(1.5, 0x67e8f9, 0.7);
    // Padding menjaga tanda di atas/bawah huruf agar tidak terpotong oleh metrik canvas.
    this.label = scene.add.text(0, 0, item.symbol, { fontFamily: "Amiri, serif", fontSize: "30px", color: "#ecfeff", padding: { top: 12, bottom: 12 } }).setOrigin(0.5);
    this.add([box, this.label]); this.setDepth(3); scene.add.existing(this);
  }
  setHarakat(harakat: HarakatId) { this.harakat = harakat; this.label.setText(HARAKAT_LIST.find((item) => item.id === harakat)!.symbol); }
}
