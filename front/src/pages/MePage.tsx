import { Title, Text, SegmentedControl, Stack, Alert } from "@mantine/core";
import { useEffect, useState } from "react";
import { api, type RideListItem } from "../api/client";
import { asUserId } from "../api/types";
import { labelDestination, labelFromSpot } from "../lib/labels";
import { formatDateTimeJst } from "../lib/datetime";
import { useUser } from "../context/UserContext";

export function MePage() {
  const { userId } = useUser();
  const [role, setRole] = useState<"driver" | "member" | "all">("all");
  const [items, setItems] = useState<RideListItem[]>([]);
  const [error, setError] = useState<string>("");

  const load = async () => {
    setError("");
    if (!userId) return setItems([]);
    const res = await api.listMyRides(role, asUserId(userId));
    if (!res.ok) setError(res.error);
    else setItems(res.data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, role]);

  return (
    <Stack>
      <Title order={2}>My Rides</Title>
      <SegmentedControl
        value={role}
        onChange={(v) => setRole(v as "driver" | "member" | "all")}
        data={[{ label: "All", value: "all" }, { label: "Driver", value: "driver" }, { label: "Member", value: "member" }]}
      />
      {error && <Alert color="red">{error}</Alert>}
      {!error && items.length === 0 && <Text c="dimmed">No rides.</Text>}
      {items.map((r) => (
        <Text key={r.id}>
          {labelDestination(r.destination)} from {labelFromSpot(r.fromSpot)} at {formatDateTimeJst(r.departsAt)} JST ({r.membersCount}/{r.capacity})
        </Text>
      ))}
    </Stack>
  );
}
