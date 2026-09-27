import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { memberSelfApi } from "../services/memberSelfApi";
import { queryKeys } from "../lib/queryClient";

export function useIsMuballigh(): boolean {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: queryKeys.memberSelfDashboard(user?.user_id || ""),
    queryFn: () => memberSelfApi.getDashboard(),
    enabled: !!user?.user_id,
    staleTime: 5 * 60_000,
  });
  return data?.profile?.is_muballigh === true;
}
