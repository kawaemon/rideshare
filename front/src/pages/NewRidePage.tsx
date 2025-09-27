import {
  Title,
  Text,
  Stack,
  TextInput,
  Select,
  NumberInput,
  Button,
  Alert,
  Group,
  SegmentedControl,
  type SegmentedControlItem,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { labelDestination, labelFromSpot } from "../lib/labels";
import { useState } from "react";
import {
  api,
  stations,
  campusSpots,
  type Destination,
  type FromSpot,
} from "../api/client";
import { asUserId } from "../api/types";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

type RideDirection = "from_school" | "to_school";

const rideDirectionOptions: Array<
  SegmentedControlItem & { value: RideDirection }
> = [
  { label: "From School", value: "from_school" },
  { label: "To School", value: "to_school" },
];

export function NewRidePage() {
  const { userId } = useUser();
  const nav = useNavigate();
  const [direction, setDirection] = useState<RideDirection>("from_school");
  const [destination, setDestination] = useState<Destination | "">("");
  const [fromSpot, setFromSpot] = useState<FromSpot | "">("");
  // DateTimePicker returns Date | null
  const [departsAt, setDepartsAt] = useState<Date | null>(null);
  const [capacity, setCapacity] = useState<number>(1);
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");

  const destinationChoices =
    direction === "from_school" ? stations : campusSpots;
  const fromSpotChoices = direction === "from_school" ? campusSpots : stations;

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
      <Stack gap={4}>
        <Text size="sm" fw={500}>
          Direction
        </Text>
        <SegmentedControl
          fullWidth
          data={rideDirectionOptions}
          value={direction}
          onChange={(value) => {
            const nextDirection =
              value === "to_school" ? "to_school" : "from_school";
            setDirection(nextDirection);
            setDestination("");
            setFromSpot("");
          }}
        />
      </Stack>
      <Group grow>
        <Select
          label="From"
          placeholder="Pick one"
          data={fromSpotChoices.map((value) => ({
            value,
            label: labelFromSpot(value),
          }))}
          value={fromSpot}
          onChange={(value) => {
            if (!value) {
              setFromSpot("");
              return;
            }
            const selected = fromSpotChoices.find((option) => option === value);
            setFromSpot(selected ?? "");
          }}
        />
        <Select
          label="Destination"
          placeholder="Pick one"
          data={destinationChoices.map((value) => ({
            value,
            label: labelDestination(value),
          }))}
          value={destination}
          onChange={(value) => {
            if (!value) {
              setDestination("");
              return;
            }
            const selected = destinationChoices.find(
              (option) => option === value,
            );
            setDestination(selected ?? "");
          }}
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
      <NumberInput
        label="Capacity"
        min={1}
        value={capacity}
        onChange={(v) => setCapacity(Number(v) || 1)}
      />
      <TextInput
        label="Note"
        value={note}
        onChange={(e) => setNote(e.currentTarget.value)}
      />
      <Button onClick={submit}>Create</Button>
      <Text c="dimmed">
        Selected local time is converted to JST automatically.
      </Text>
    </Stack>
  );
}
