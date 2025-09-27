import { Title, Text, SegmentedControl, Stack, Alert, Group } from "@mantine/core";
import { useEffect, useState } from "react";
import { api, type RideListItem } from "../api/client";
import { asUserId } from "../api/types";
import { useUser } from "../context/UserContext";
import { RideListItemCard } from "../components/ride-list-item";

export function MePage() {
  const { userId } = useUser();
  const [role, setRole] = useState<"driver" | "member" | "all">("all");
  const [items, setItems] = useState<RideListItem[]>([]);
  const [error, setError] = useState<string>("");
  const currentUser = userId ? asUserId(userId) : undefined;

  const load = async () => {
    setError("");
    if (!currentUser) {
      setItems([]);
      return;
    }
    const res = await api.listMyRides(role, currentUser);
    if (!res.ok) setError(res.error);
    else setItems(res.data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, role]);

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Title order={2}>My Rides</Title>
        <SegmentedControl
          value={role}
          onChange={(value) => { if (isRoleFilter(value)) setRole(value); }}
          data={[{ label: "All", value: "all" }, { label: "Driver", value: "driver" }, { label: "Member", value: "member" }]}
        />
      </Group>
      {error && <Alert color="red">{error}</Alert>}
      {!error && items.length === 0 && <Text c="dimmed">No rides.</Text>}
      <Stack>
        {items.map((ride) => (
          <RideListItemCard key={ride.id} ride={ride} currentUserId={currentUser} />
        ))}
      </Stack>
    </Stack>
  );
}

function isRoleFilter(value: string): value is "driver" | "member" | "all" {
  return value === "driver" || value === "member" || value === "all";
}
