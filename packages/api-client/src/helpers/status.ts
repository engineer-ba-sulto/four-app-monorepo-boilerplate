import { type StatusResponse, statusResponseSchema } from "@repo/schema";
import type { ClientResponse } from "hono/client";

export type StatusClient = {
  status: {
    $get: () => Promise<ClientResponse<StatusResponse>>;
  };
};

export async function fetchStatus(
  client: StatusClient,
): Promise<StatusResponse> {
  const response = await client.status.$get();

  if (!response.ok) {
    throw new Error(`Failed to fetch status: ${response.status}`);
  }

  const data: unknown = await response.json();
  return statusResponseSchema.parse(data);
}
