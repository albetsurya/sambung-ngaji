"""Original, loopable marimba-style Ngaji Ceria music, dedicated to CC0-1.0.

Run: python3 scripts/generate-ngaji-bgm.py (requires ffmpeg).
"""
import array
import math
from pathlib import Path
import subprocess

RATE = 22050
OUT = Path(__file__).resolve().parents[1] / "public/audio/ngaji-ceria/bgm"
TRACKS = {
    "menu": (84, [60, 64, 67, 69, 67, 64, 62, 64, 60, 64, 67, 72, 69, 67, 64, 62]),
    "quiz": (104, [64, 67, 69, 72, 69, 67, 64, 67, 62, 65, 69, 74, 72, 69, 65, 62]),
    "battle": (112, [57, 60, 64, 67, 64, 60, 62, 64, 53, 57, 60, 65, 64, 60, 57, 55]),
}


def render(bpm, melody):
    beat = 60 / bpm
    length = round(32 * beat * RATE)
    pcm = [0.0] * length

    def note(midi, at, gain, decay=0.22):
        frequency = 440 * 2 ** ((midi - 69) / 12)
        start = round(at * RATE)
        for i in range(round(1.2 * RATE)):
            t = i / RATE
            # Soft mallet attack and rapidly decaying wooden overtones.
            envelope = (1 - math.exp(-t * 450)) * math.exp(-t / decay)
            tone = math.sin(2 * math.pi * frequency * t)
            tone += 0.24 * math.sin(2 * math.pi * frequency * 4 * t) * math.exp(-t / 0.09)
            tone += 0.12 * math.sin(2 * math.pi * frequency * 10 * t) * math.exp(-t / 0.045)
            pcm[(start + i) % length] += gain * envelope * tone

    for step in range(64):
        note(melody[step % len(melody)], step * beat / 2, 0.18 if step % 2 == 0 else 0.11)
        if step % 8 == 0:
            root = [48, 53, 55, 48][(step // 8) % 4]
            note(root - 12, step * beat / 2, 0.14, 0.4)
            for chord in [root, root + 4, root + 7]:
                note(chord, step * beat / 2 + 0.02, 0.025, 0.5)
    peak = max(abs(sample) for sample in pcm)
    assert 0.1 < peak < 1, f"Unexpected audio peak: {peak}"
    assert math.sqrt(sum(sample * sample for sample in pcm) / length) > 0.01
    return array.array("h", (round(sample * 26000) for sample in pcm))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (bpm, melody) in TRACKS.items():
        pcm = render(bpm, melody)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "s16le", "-ar", str(RATE), "-ac", "1", "-i", "pipe:0", "-c:a", "libvorbis", "-q:a", "4", "-metadata", f"title=Ngaji Ceria - {name}", "-metadata", "license=CC0-1.0", str(OUT / f"{name}.ogg")], input=pcm.tobytes(), check=True)
        print(f"Generated {name}.ogg ({len(pcm) / RATE:.2f}s)")


if __name__ == "__main__":
    main()
