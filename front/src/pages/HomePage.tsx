import { Title, Text, Button, Group, Stack, Alert } from "@mantine/core";
import { useEffect, useState } from "react";
import { api, type RideListItem } from "../api/client";
import { asUserId, type RideId } from "../api/types";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import { RideListItemCard } from "../components/ride-list-item";

export function HomePage() {
  const { userId } = useUser();
  const currentUser = userId ? asUserId(userId) : undefined;
  const [items, setItems] = useState<RideListItem[]>([]);
  const [error, setError] = useState<string>("");

  const load = async () => {
    setError("");
    const res = await api.listRides({}, currentUser);
    if (!res.ok) setError(res.error);
    else setItems(res.data);
  };

  const handleJoin = async (rideId: RideId) => {
    if (!currentUser) {
      return;
    }
    setError("");
    const rr = await api.joinRide(rideId, currentUser);
    if (!rr.ok) setError(rr.error);
    else await load();
  };

  const handleLeave = async (rideId: RideId) => {
    if (!currentUser) {
      return;
    }
    setError("");
    const rr = await api.leaveRide(rideId, currentUser);
    if (!rr.ok) setError(rr.error);
    else await load();
  };

  const renderActions = (ride: RideListItem) => {
    if (!currentUser) {
      return undefined;
    }
    if (ride.driver.id === currentUser) {
      return undefined;
    }
    if (ride.joined) {
      return (
        <Button
          size="xs"
          variant="light"
          onClick={() => {
            void handleLeave(ride.id);
          }}
        >
          Leave
        </Button>
      );
    }
    return (
      <Button
        size="xs"
        onClick={() => {
          void handleJoin(ride.id);
        }}
      >
        Join
      </Button>
    );
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Rides</Title>
        <Button component={Link} to="/ride/new">
          Create
        </Button>
      </Group>
      {error && <Alert color="red">{error}</Alert>}
      {!error && items.length === 0 && <Text c="dimmed">No rides.</Text>}
      <Stack>
        {items.map((r) => (
          <RideListItemCard
            key={r.id}
            ride={r}
            currentUserId={currentUser}
            actions={renderActions(r)}
          />
        ))}
      </Stack>
    </Stack>
  );
}
