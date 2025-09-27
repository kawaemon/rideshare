import { Title, Text, Stack, TextInput, Select, NumberInput, Button, Alert, Group } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { labelDestination } from "../lib/labels";
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
  // DateTimePicker returns Date | null
  const [departsAt, setDepartsAt] = useState<Date | null>(null);
  const [capacity, setCapacity] = useState<number>(1);
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");

  const submit = async () => {
    setError("");
    if (!userId) {
      setError("unauthorized");
      return;
    }
    const departsAtIso = departsAt ? departsAt.toISOString() : "";
    const res = await api.createRide(
      {
        destination: destination as Destination,
        fromSpot: fromSpot as FromSpot,
        departsAt: departsAtIso,
        capacity,
        note,
      },
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
        <Select
          label="Destination"
          placeholder="Pick one"
          data={[
            { value: "shonandai", label: labelDestination("shonandai") },
            { value: "tsujido", label: labelDestination("tsujido") },
          ]}
          value={destination}
          onChange={(v) => setDestination((v ?? "") as Destination | "")}
        />
        <Select
          label="From"
          placeholder="Pick one"
          data={[
            { value: "g_parking", label: "G駐車場" },
            { value: "delta_back", label: "デルタ館裏" },
            { value: "main_cross", label: "正面交差点" },
          ]}
          value={fromSpot}
          onChange={(v) => setFromSpot((v ?? "") as FromSpot | "")}
        />
      </Group>
      <DateTimePicker
        label="Departs At"
        placeholder="Pick date and time"
        value={departsAt}
        onChange={(value) => setDepartsAt(value)}
        valueFormat="YYYY/MM/DD HH:mm"
        minDate={new Date(Date.now() - 5 * 60 * 1000)}
        clearable
      />
      <NumberInput label="Capacity" min={1} value={capacity} onChange={(v) => setCapacity(Number(v) || 1)} />
      <TextInput label="Note" value={note} onChange={(e) => setNote(e.currentTarget.value)} />
      <Button onClick={submit}>Create</Button>
      <Text c="dimmed">Selected local time is converted to UTC automatically.</Text>
    </Stack>
  );
}
