import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "../components/common/FontAwesomeIcons";
import {
  AppLayout,
  Header,
  FloatingActionButton,
} from "../components/layout/AppLayout";
import {
  Card,
  Avatar,
  Badge,
  ErrorState,
  EmptyState,
  BottomSheet,
  Button,
  Select,
} from "../components/common";
import { memberApi, type MemberFilters } from "../services/memberApi";
import type { Member, MemberCategory } from "../types";
import { CATEGORY_LABEL, normalizeGender } from "../utils/format";
import { MEMBER_CATEGORIES } from "../constants";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import { JamaahListSkeleton } from "../components/common/Skeleton";

export default function MembersListPage() {
  const navigate = useNavigate();
  const { role } = usePermission();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState<MemberCategory | "">("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [jenisKelamin, setJenisKelamin] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const filters: MemberFilters = {};
      if (search) filters.search = search;
      if (kategori) filters.kategori = kategori;
      if (jenisKelamin) filters.jenis_kelamin = jenisKelamin;
      const fn = role === "TIM_PNKB" ? memberApi.listPNKB : memberApi.list;
      const res = await fn(filters);
      setMembers(res);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Gagal memuat daftar jamaah",
      );
    } finally {
      setLoading(false);
    }
  }

  // Debounce search — hanya trigger request setelah user berhenti mengetik 300ms
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, kategori, jenisKelamin]);

  const canCreate = role === "SUPER_ADMIN" || role === "ADMIN";

  // Hitung jumlah filter aktif (selain kategori yang sudah ada chip-nya)
  const activeFilterCount = useMemo(
    () => (jenisKelamin ? 1 : 0),
    [jenisKelamin],
  );

  const hasActiveSearch = search.length > 0;

  return (
    <AppLayout
      fab={
        canCreate ? (
          <FloatingActionButton onClick={() => navigate("/jamaah/baru")} />
        ) : undefined
      }
    >
      <Header
        title="Jamaah"
        subtitle={`${members.length} jamaah${loading ? "" : " ditemukan"}`}
      />

      {/* Sticky wrapper: search + chips */}
      <div
        className="sticky z-20 backdrop-blur-xl bg-surface-bg/80 border-b border-surface-border"
        style={{ top: "calc(52px + var(--safe-top))" }}
      >
        <div className="px-4 pt-2 pb-2 flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama jamaah"
              className="w-full min-h-[40px] rounded-xl border border-surface-border bg-surface-card pl-9 pr-9 text-[16px] text-surface-text placeholder:text-surface-muted/70 shadow-sm transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
            {/* Clear search */}
            {hasActiveSearch && (
              <button
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-surface-muted hover:bg-surface-card2 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter button dengan badge count */}
          <button
            onClick={() => setFilterOpen(true)}
            className="relative min-h-[40px] px-3.5 rounded-xl bg-surface-card border border-surface-border text-ios-subhead font-medium text-surface-text flex items-center gap-1.5 transition-colors hover:bg-surface-card2 active:scale-[0.97]"
          >
            <SlidersHorizontal size={15} />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="ml-0.5 w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Category chips */}
        <div className="px-4 pb-2.5 flex gap-2 overflow-x-auto no-scrollbar">
          <CategoryChip
            active={kategori === ""}
            label="Semua"
            onClick={() => setKategori("")}
          />
          {MEMBER_CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              active={kategori === c}
              label={CATEGORY_LABEL[c]}
              onClick={() => setKategori(c)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        {loading && (
          <div className="px-4 py-2">
            <JamaahListSkeleton rows={8} />
          </div>
        )}

        {!loading && error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && members.length === 0 && (
          <EmptyState
            title={hasActiveSearch ? "Tidak ditemukan" : "Belum ada jamaah"}
            description={
              hasActiveSearch
                ? `Tidak ada jamaah dengan nama "${search}". Coba kata kunci lain.`
                : "Tambahkan jamaah pertama untuk memulai pembinaan."
            }
            action={
              canCreate && !hasActiveSearch ? (
                <Button onClick={() => navigate("/jamaah/baru")}>
                  Tambah Jamaah
                </Button>
              ) : undefined
            }
          />
        )}

        {!loading && !error && members.length > 0 && (
          <div className="px-4 py-2 space-y-2">
            {members.map((m) => (
              <JamaahCard
                key={m.member_id}
                member={m}
                onClick={() => navigate(`/jamaah/${m.member_id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filter sheet */}
      <BottomSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Jamaah"
      >
        <Select
          label="Jenis Kelamin"
          value={jenisKelamin}
          onChange={(e) => setJenisKelamin(e.target.value)}
        >
          <option value="">Semua</option>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </Select>

        <div className="flex gap-3 mt-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                setJenisKelamin("");
                setKategori("");
              }}
            >
              Reset
            </Button>
          )}
          <Button fullWidth onClick={() => setFilterOpen(false)}>
            Terapkan
          </Button>
        </div>
      </BottomSheet>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Jamaah Card                                   */
/* -------------------------------------------------------------------------- */

function JamaahCard({
  member,
  onClick,
}: {
  member: Member;
  onClick: () => void;
}) {
  return (
    <Card onClick={onClick} className="flex items-center gap-3">
      <Avatar
        src={member.foto_url}
        name={member.nama_lengkap}
        gender={normalizeGender(member?.jenis_kelamin)}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-surface-text truncate">
          {member.nama_lengkap}
        </p>
        <p className="text-xs text-surface-muted truncate">
          {member.kelompok || "Belum ada kelompok"}
        </p>
      </div>
      {member.kategori && <Badge>{CATEGORY_LABEL[member.kategori]}</Badge>}
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Category Chip                                 */
/* -------------------------------------------------------------------------- */

function CategoryChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-ios-footnote font-medium border transition-all duration-200 active:scale-[0.97] ${
        active
          ? "bg-accent text-white border-accent shadow-sm shadow-accent/30"
          : "bg-surface-card text-surface-text/80 border-surface-border hover:bg-surface-card2"
      }`}
    >
      {label}
    </button>
  );
}
