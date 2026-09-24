import { useEffect, useState } from "react";
import {
  applyAppUpdate,
  checkForAppUpdate,
  subscribeAppUpdate,
  type AppUpdateState,
} from "../lib/appUpdate";

export function useAppUpdate() {
  const [state, setState] = useState<AppUpdateState>(() => ({
    updateAvailable: false,
    checking: false,
  }));

  useEffect(() => subscribeAppUpdate(setState), []);

  return {
    updateAvailable: state.updateAvailable,
    checking: state.checking,
    /** Cek + terapkan update bila ada. Resolve true bila update diterapkan. */
    checkForUpdate: checkForAppUpdate,
    applyUpdate: applyAppUpdate,
  };
}
