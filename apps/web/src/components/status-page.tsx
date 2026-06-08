import { Card, CardDescription, CardTitle, StatusIndicator } from "@repo/ui";
import { useEffect, useState } from "react";

import { loadApiStatus } from "@/lib/api";

type StatusTone = "error" | "ok" | "unknown";

export function StatusPage() {
  const [label, setLabel] = useState("Loading API status...");
  const [tone, setTone] = useState<StatusTone>("unknown");

  useEffect(() => {
    loadApiStatus()
      .then((status) => {
        setLabel(`${status.app} v${status.version} (${status.env})`);
        setTone("ok");
      })
      .catch(() => {
        setLabel("Failed to reach API");
        setTone("error");
      });
  }, []);

  return (
    <Card>
      <CardTitle>Web App</CardTitle>
      <CardDescription>
        Monorepo boilerplate web client connected to the API.
      </CardDescription>
      <StatusIndicator className="mt-4" label={label} tone={tone} />
    </Card>
  );
}
