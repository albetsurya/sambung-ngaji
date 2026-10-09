/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_NGAJI_CERIA_PLAYER_MODEL?: string;
  readonly VITE_NGAJI_CERIA_MONSTER_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
