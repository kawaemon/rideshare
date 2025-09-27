import { Title, Text, Group, Button, Stack, Alert } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, type RideWithDriver } from "../api/client";
import { asRideId, asUserId } from "../api/types";
import { labelDestination, labelFromSpot } from "../lib/labels";
import { formatDateTimeJst } from "../lib/datetime";
import { useUser } from "../context/UserContext";

export function RideDetailPage() {
  const { id } = useParams();
  const { userId } = useUser();
  const [ride, setRide] = useState<
    (RideWithDriver & { membersCount: number; joined: boolean }) | null
  >(null);
  const [error, setError] = useState<string>("");

  const load = async () => {
    setError("");
    if (!id) return;
    const res = await api.getRide(
      asRideId(Number(id)),
      userId ? asUserId(userId) : undefined,
    );
    if (!res.ok) setError(res.error);
    else setRide(res.data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, userId]);

  if (!id) return <Text>Invalid ID</Text>;

  return (
    <Stack>
      <Title order={2}>Ride Detail</Title>
      {error && <Alert color="red">{error}</Alert>}
      {ride && (
        <>
          <Text>Destination: {labelDestination(ride.destination)}</Text>
          <Text>From: {labelFromSpot(ride.fromSpot)}</Text>
          <Text>Departs: {formatDateTimeJst(ride.departsAt)} JST</Text>
          <Text>
            Driver: {ride.driver.name} / {ride.membersCount}/{ride.capacity}
          </Text>
          <Group>
            {userId && ride.driver.id === userId && (
              <Button
                color="red"
                variant="light"
                onClick={async () => {
                  const r = await api.deleteRide(ride.id, asUserId(userId));
                  if (!r.ok) setError(r.error);
                  else setRide(null);
                }}
              >
                Delete
              </Button>
            )}
            {userId && !ride.joined && (
              <Button
                onClick={async () => {
                  const r = await api.joinRide(ride.id, asUserId(userId));
                  if (!r.ok) setError(r.error);
                  else load();
                }}
              >
                Join
              </Button>
            )}
            {userId && ride.joined && (
              <Button
                variant="light"
                onClick={async () => {
                  const r = await api.leaveRide(ride.id, asUserId(userId));
                  if (!r.ok) setError(r.error);
                  else load();
                }}
              >
                Leave
              </Button>
            )}
          </Group>
        </>
      )}
    </Stack>
  );
}
