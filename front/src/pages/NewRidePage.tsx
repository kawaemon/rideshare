import { Title, Text, Stack, TextInput, Select, NumberInput, Button, Alert, Group } from "@mantine/core";
import { useState } from "react";
import { api, type Destination, type FromSpot } from "../api/client";
import { asUserId } from "../api/types";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export function NewRidePage() {
  const { userId } = useUser();
  const nav = useNavigate();
  const [destination, setDestination] = useState<Destination | "">("");
  const [fromSpot, setFromSpot] = useState<FromSpot | "">("");
  const [departsAt, setDepartsAt] = useState<string>("");
  const [capacity, setCapacity] = useState<number>(1);
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");

  const submit = async () => {
    setError("");
    if (!userId) {
      setError("unauthorized");
      return;
    }
    const res = await api.createRide(
      { destination: destination as Destination, fromSpot: fromSpot as FromSpot, departsAt, capacity, note },
      asUserId(userId),
    );
    if (!res.ok) setError(res.error);
    else nav(`/ride/${res.data.id}`);
  };

  return (
    <Stack>
      <Title order={2}>Create Ride</Title>
      {error && <Alert color="red">{error}</Alert>}
      <Group grow>
        <Select label="Destination" placeholder="Pick one" data={["shonandai", "tsujido"]} value={destination} onChange={(v) => setDestination((v ?? "") as Destination | "")} />
        <Select label="From" placeholder="Pick one" data={["g_parking", "delta_back", "main_cross"]} value={fromSpot} onChange={(v) => setFromSpot((v ?? "") as FromSpot | "")} />
      </Group>
      <TextInput label="Departs At" placeholder="YYYY-MM-DDTHH:mm:ssZ" value={departsAt} onChange={(e) => setDepartsAt(e.currentTarget.value)} />
      <NumberInput label="Capacity" min={1} value={capacity} onChange={(v) => setCapacity(Number(v) || 1)} />
      <TextInput label="Note" value={note} onChange={(e) => setNote(e.currentTarget.value)} />
      <Button onClick={submit}>Create</Button>
      <Text c="dimmed">Make sure datetime is ISO8601 with timezone (e.g. 2025-09-07T12:30:00Z)</Text>
    </Stack>
  );
}
