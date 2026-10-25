/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Full published origin — override when a real domain is configured. */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv & { BASE_URL: string };
}
