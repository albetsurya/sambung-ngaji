import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { AppLayout, Header } from "../../../components/layout/AppLayout";
import { Button, Input, Select, Textarea } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import { ApiError } from "../../../services/api";
import {
  adminEventApi,
  type AdminEventActionType,
} from "../services/adminEventApi";

interface MissionDraft {
  key: string;
  title: string;
  action_type: AdminEventActionType;
  target_amount: string;
  reward_coins: string;
  reward_tickets: string;
  reward_hearts: string;
}

let missionSeq = 0;

function newMission(): MissionDraft {
  missionSeq += 1;
  return {
    key: `mission-${missionSeq}`,
    title: "",
    action_type: "PLAY_GAME",
    target_amount: "1",
    reward_coins: "0",
    reward_tickets: "0",
    reward_hearts: "0",
  };
}

function toInteger(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.floor(parsed) : 0;
}

export default function AdminEventsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [missions, setMissions] = useState<MissionDraft[]>(() => [newMission()]);
  const [saving, setSaving] = useState(false);

  const updateMission = (key: string, patch: Partial<MissionDraft>) => {
    setMissions((previous) =>
      previous.map((mission) =>
        mission.key === key ? { ...mission, ...patch } : mission,
      ),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (missions.length === 0) {
      showToast("Tambahkan minimal satu misi", "warning");
      return;
    }

    setSaving(true);
    try {
      await adminEventApi.createEvent({
        name: name.trim(),
        description: description.trim(),
        start_date: startDate,
        end_date: endDate,
        is_active: isActive,
        missions: missions.map((mission) => ({
          title: mission.title.trim(),
          action_type: mission.action_type,
          target_amount: toInteger(mission.target_amount),
          reward_coins: toInteger(mission.reward_coins),
          reward_tickets: toInteger(mission.reward_tickets),
          reward_hearts: toInteger(mission.reward_hearts),
        })),
      });

      showToast("Event berhasil dibuat");
      setName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setIsActive(true);
      setMissions([newMission()]);
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Gagal menyimpan event",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout hideNav>
      <Header
        title="Event Management"
        subtitle="Buat event dan misi permainan"
        onBack={() => navigate("/")}
        backLabel="Beranda"
        showSyncButton={false}
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 px-4 py-4 md:px-6 md:py-6"
      >
        <section className="rounded-2xl border-2 border-surface-border bg-surface-card p-4">
          <h2 className="text-ios-headline font-semibold text-surface-text">
            Detail Event
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <Input
              label="Nama Event"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Misal: Ramadan Ceria"
              maxLength={120}
              required
            />
            <Textarea
              label="Deskripsi"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Penjelasan singkat event"
              maxLength={500}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Tanggal Mulai"
                type="datetime-local"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
              <Input
                label="Tanggal Selesai"
                type="datetime-local"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
            </div>
            <label className="flex items-center gap-2 text-ios-footnote text-surface-text">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Aktifkan event setelah disimpan
            </label>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-surface-border bg-surface-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-ios-headline font-semibold text-surface-text">
                Misi Event
              </h2>
              <p className="mt-0.5 text-ios-caption text-surface-muted">
                {missions.length} misi akan disimpan bersama event.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setMissions((previous) => [...previous, newMission()])}
            >
              Tambah Misi
            </Button>
          </div>

          {missions.length === 0 ? (
            <p className="mt-3 rounded-xl border-2 border-dashed border-surface-border px-3 py-6 text-center text-ios-footnote text-surface-muted">
              Belum ada misi. Klik Tambah Misi untuk menambahkan.
            </p>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {missions.map((mission, index) => (
                <div
                  key={mission.key}
                  className="rounded-xl border-2 border-surface-border bg-surface-bg p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ios-footnote font-semibold text-accent">
                      Misi {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="softDanger"
                      size="xs"
                      onClick={() =>
                        setMissions((previous) =>
                          previous.filter((item) => item.key !== mission.key),
                        )
                      }
                    >
                      Hapus
                    </Button>
                  </div>

                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <Input
                      label="Judul Misi"
                      value={mission.title}
                      onChange={(event) =>
                        updateMission(mission.key, { title: event.target.value })
                      }
                      placeholder="Misal: Mainkan 3 game"
                      maxLength={120}
                      required
                    />
                    <Select
                      label="Action Type"
                      value={mission.action_type}
                      onChange={(event) =>
                        updateMission(mission.key, {
                          action_type: event.target.value as AdminEventActionType,
                        })
                      }
                    >
                      <option value="PLAY_GAME">PLAY_GAME</option>
                      <option value="FINISH_QUIZ">FINISH_QUIZ</option>
                    </Select>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Input
                      label="Target"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={mission.target_amount}
                      onChange={(event) =>
                        updateMission(mission.key, {
                          target_amount: event.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      label="Hadiah Koin"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={mission.reward_coins}
                      onChange={(event) =>
                        updateMission(mission.key, {
                          reward_coins: event.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      label="Hadiah Tiket"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={mission.reward_tickets}
                      onChange={(event) =>
                        updateMission(mission.key, {
                          reward_tickets: event.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      label="Hadiah Hati"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={mission.reward_hearts}
                      onChange={(event) =>
                        updateMission(mission.key, {
                          reward_hearts: event.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <Button type="submit" fullWidth loading={saving}>
          Simpan Event
        </Button>
      </form>
    </AppLayout>
  );
}
