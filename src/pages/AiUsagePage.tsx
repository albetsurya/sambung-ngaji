import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Card,
  ErrorState,
  EmptyState,
  GroupedList,
  ListRow,
} from "../components/common";
import {
  StatTileSkeleton,
  GroupedListSkeleton,
} from "../components/common/Skeleton";
import { aiUsageApi } from "../services/domainApi";
import { ApiError } from "../services/api";
import { queryKeys } from "../lib/queryClient";

const PROVIDER_LABEL: Record<string, string> = {
  omniroute: "OmniRoute",
  groq: "Groq",
  gemini: "Gemini",
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  TIM_PNKB: "Tim PNKB",
  TIM_ABSENSI: "Tim Absensi",
  MEMBER: "Member",
};

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function AiUsagePage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.aiUsage(),
    queryFn: () => aiUsageApi.stats(),
    staleTime: 60_000,
  });

  return (
    <AppLayout hideNav>
      <Header
        title="Monitoring AI"
        onBack={() => history.back()}
        backLabel="Kembali"
      />

      <div className="py-4">
        {isLoading && (
          <div className="space-y-4">
            <div className="px-4 flex gap-3">
              <StatTileSkeleton />
              <StatTileSkeleton />
            </div>
            <GroupedListSkeleton rows={5} />
          </div>
        )}

        {!isLoading && error && (
          <ErrorState
            message={
              error instanceof ApiError ? error.message : "Gagal memuat data"
            }
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && data && (
          <div className="space-y-4">
            <div className="px-4 grid grid-cols-2 gap-3">
              <Card>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-ios-caption text-surface-muted font-medium">
                    Chat Hari Ini
                  </p>
                  <span className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center">
                    <Sparkles size={14} className="text-accent" />
                  </span>
                </div>
                <p className="font-display text-2xl font-semibold text-surface-text tabular-nums">
                  {data.today.chat_count}
                </p>
                <p className="text-ios-caption text-surface-muted mt-1">
                  {formatNumber(data.today.total_tokens)} token
                </p>
              </Card>

              <Card>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-ios-caption text-surface-muted font-medium">
                    Bulan Ini
                  </p>
                  <span className="w-7 h-7 rounded-lg bg-warning-soft flex items-center justify-center">
                    <TrendingUp size={14} className="text-warning" />
                  </span>
                </div>
                <p className="font-display text-2xl font-semibold text-surface-text tabular-nums">
                  {data.month.chat_count}
                </p>
                <p className="text-ios-caption text-surface-muted mt-1">
                  {formatNumber(data.month.total_tokens)} token
                </p>
              </Card>
            </div>

            {data.by_provider.length > 0 && (
              <div>
                <p className="px-4 text-ios-footnote font-semibold text-surface-text mb-2">
                  Distribusi Provider
                </p>
                <GroupedList>
                  {data.by_provider.map((p, i) => (
                    <ListRow
                      key={p.provider}
                      insetDivider={i !== data.by_provider.length - 1}
                      leading={
                        <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                          <Zap size={16} />
                        </span>
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-ios-body font-medium text-surface-text truncate">
                            {PROVIDER_LABEL[p.provider] || p.provider}
                          </p>
                          <p className="text-ios-caption text-surface-muted truncate">
                            {formatNumber(p.total_tokens)} token
                          </p>
                        </div>
                        <span className="text-ios-body font-semibold text-accent tabular-nums shrink-0">
                          {p.chat_count}
                        </span>
                      </div>
                    </ListRow>
                  ))}
                </GroupedList>
              </div>
            )}

            {data.by_role.length > 0 && (
              <div>
                <p className="px-4 text-ios-footnote font-semibold text-surface-text mb-2">
                  Per Role
                </p>
                <GroupedList>
                  {data.by_role.map((r, i) => (
                    <ListRow
                      key={r.role}
                      insetDivider={i !== data.by_role.length - 1}
                      leading={
                        <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                          <Users size={16} />
                        </span>
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-ios-body font-medium text-surface-text truncate">
                            {ROLE_LABEL[r.role] || r.role}
                          </p>
                          <p className="text-ios-caption text-surface-muted truncate">
                            {formatNumber(r.total_tokens)} token
                          </p>
                        </div>
                        <span className="text-ios-body font-semibold text-accent tabular-nums shrink-0">
                          {r.chat_count}
                        </span>
                      </div>
                    </ListRow>
                  ))}
                </GroupedList>
              </div>
            )}

            {data.top_users.length > 0 && (
              <div>
                <p className="px-4 text-ios-footnote font-semibold text-surface-text mb-2">
                  Top 10 Pengguna
                </p>
                <GroupedList>
                  {data.top_users.map((u, i) => (
                    <ListRow
                      key={u.user_id}
                      insetDivider={i !== data.top_users.length - 1}
                      leading={
                        <span className="w-9 h-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center text-[13px] font-bold shrink-0">
                          {i + 1}
                        </span>
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-ios-body font-medium text-surface-text truncate">
                            {u.user_nama}
                          </p>
                          <p className="text-ios-caption text-surface-muted truncate">
                            {ROLE_LABEL[u.role] || u.role} ·{" "}
                            {formatNumber(u.total_tokens)} token
                          </p>
                        </div>
                        <span className="text-ios-body font-semibold text-accent tabular-nums shrink-0">
                          {u.chat_count}
                        </span>
                      </div>
                    </ListRow>
                  ))}
                </GroupedList>
              </div>
            )}

            {data.month.chat_count === 0 && (
              <EmptyState
                title="Belum ada pemakaian AI"
                description="Statistik akan muncul setelah user mulai chat dengan AI."
              />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
