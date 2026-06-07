import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { loadApiStatus } from "@/lib/api";

type StatusTone = "error" | "ok" | "unknown";

const toneColors: Record<StatusTone, string> = {
  ok: "#10b981",
  error: "#ef4444",
  unknown: "#94a3b8",
};

export function StatusCard() {
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
    <View style={styles.card}>
      <Text style={styles.title}>SP App</Text>
      <Text style={styles.description}>
        Monorepo boilerplate mobile client connected to the API.
      </Text>
      <View style={styles.indicator}>
        <View
          style={[styles.dot, { backgroundColor: toneColors[tone] }]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    maxWidth: 360,
    width: "100%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0f172a",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
  },
  indicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  label: {
    flexShrink: 1,
    fontSize: 14,
    color: "#334155",
  },
});
