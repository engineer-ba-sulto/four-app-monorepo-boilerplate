import {
  createApiClient,
  fetchStatus,
  type StatusClient,
} from "@repo/api-client";
import type { StatusResponse } from "@repo/schema";
import type { AppType } from "api/app";

import { getWebEnv } from "@/lib/env";

export async function loadApiStatus(): Promise<StatusResponse> {
  const env = getWebEnv();
  const client = createApiClient<AppType>(env.PUBLIC_API_URL);

  return fetchStatus(client as StatusClient);
}
