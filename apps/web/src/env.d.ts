type ImportMetaEnv = {
  readonly APP_ENV?: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_APP_URL?: string;
  readonly PUBLIC_API_URL?: string;
  readonly PUBLIC_APP_NAME?: string;
  readonly PUBLIC_SUPPORT_EMAIL?: string;
};

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
