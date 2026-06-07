import { StyleSheet, View } from "react-native";

import { StatusCard } from "@/components/status-card";

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
});
