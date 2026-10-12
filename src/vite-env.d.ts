/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_NGAJI_CERIA_PLAYER_MODEL?: string;
  readonly VITE_NGAJI_CERIA_MONSTER_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface GoogleIdentityCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleIdentityButtonOptions {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "small" | "medium" | "large";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
  logo_alignment?: "left" | "center";
}

interface GoogleIdentityAccountsId {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleIdentityCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: GoogleIdentityButtonOptions): void;
  cancel(): void;
}

interface Window {
  google?: {
    accounts: {
      id: GoogleIdentityAccountsId;
    };
  };
}
