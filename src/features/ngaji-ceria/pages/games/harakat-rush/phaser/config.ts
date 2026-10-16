import Phaser from "phaser";
import { HarakatRushScene } from "./HarakatRushScene";

export function rushConfig(parent: HTMLDivElement, bridge: Phaser.Events.EventEmitter): Phaser.Types.Core.GameConfig {
  return {
    // Arena ringan (maksimal beberapa puluh sprite); Canvas menghindari kebutuhan WebGL.
    type: Phaser.CANVAS, parent, backgroundColor: "#020617", transparent: false,
    width: parent.clientWidth, height: parent.clientHeight,
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, pixelArt: false }, audio: { noAudio: true },
    fps: { target: 60 }, banner: false,
    scene: new HarakatRushScene(bridge),
  };
}
