import {
  type EchoRequest,
  type EchoResponse,
  echoRequestSchema,
  echoResponseSchema,
} from "@repo/schema";
import type { ClientResponse } from "hono/client";

export type EchoClient = {
  echo: {
    $post: (args: {
      json: EchoRequest;
    }) => Promise<ClientResponse<EchoResponse>>;
  };
};

export async function postEcho(
  client: EchoClient,
  input: EchoRequest,
): Promise<EchoResponse> {
  const body = echoRequestSchema.parse(input);
  const response = await client.echo.$post({ json: body });

  if (!response.ok) {
    throw new Error(`Failed to post echo: ${response.status}`);
  }

  const data: unknown = await response.json();
  return echoResponseSchema.parse(data);
}
