import { Title, Text, Button, Group, Stack, Alert } from "@mantine/core";
import { useEffect, useState } from "react";
import { api, type RideListItem } from "../api/client";
import { asUserId } from "../api/types";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import { labelDestination, labelFromSpot } from "../lib/labels";

export function HomePage() {
  const { userId } = useUser();
  const [items, setItems] = useState<RideListItem[]>([]);
  const [error, setError] = useState<string>("");

  const load = async () => {
    setError("");
    const res = await api.listRides({}, userId ? asUserId(userId) : undefined);
    if (!res.ok) setError(res.error);
    else setItems(res.data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Rides</Title>
        <Button component={Link} to="/ride/new">Create</Button>
      </Group>
      {error && <Alert color="red">{error}</Alert>}
      {!error && items.length === 0 && <Text c="dimmed">No rides.</Text>}
      <Stack>
        {items.map((r) => (
          <Group key={r.id} justify="space-between">
            <div>
              <Text fw={600} component={Link} to={`/ride/${r.id}`} style={{ textDecoration: "none" }}>
                {labelDestination(r.destination)} from {labelFromSpot(r.fromSpot)}
              </Text>
              <Text size="sm" c="dimmed">
                departs {new Date(r.departsAt).toLocaleString()} / driver {r.driver.name} / {r.membersCount}/{r.capacity}
              </Text>
              {r.note && (
                <Text size="sm">{r.note}</Text>
              )}
            </div>
            <Group>
              {userId && !r.joined && (
                <Button size="xs" onClick={async () => { const rr = await api.joinRide(r.id, asUserId(userId)); if (!rr.ok) setError(rr.error); else load(); }}>Join</Button>
              )}
              {userId && r.joined && (
                <Button size="xs" variant="light" onClick={async () => { const rr = await api.leaveRide(r.id, asUserId(userId)); if (!rr.ok) setError(rr.error); else load(); }}>Leave</Button>
              )}
            </Group>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
}
