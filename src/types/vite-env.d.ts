/// <reference types="vite/client" />

interface ViteTypeOptions {
  // 아래 라인을 추가하면, ImportMetaEnv 타입을 엄격하게 설정해
  // 알 수 없는 키를 허용하지 않게 할 수 있습니다.
  // strictImportEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_SYNCFUSION_LICENSE;
  readonly VITE_SERIAL_FILE_BASE_URL?: string;
  readonly VITE_AWS_S3_REGION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
