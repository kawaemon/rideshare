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
  type RideMode,
} from "../api/client";
import { asUserId } from "../api/types";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

type RideDirection = "from_school" | "to_school";

const rideModeOptions: Array<SegmentedControlItem & { value: RideMode }> = [
  { label: "マイカー", value: "car" },
  { label: "タクシー割り勘", value: "taxi" },
];

const rideDirectionOptions: Array<
  SegmentedControlItem & { value: RideDirection }
> = [
  { label: "学校発", value: "from_school" },
  { label: "学校行き", value: "to_school" },
];

export function NewRidePage() {
  const { userId } = useUser();
  const nav = useNavigate();
  const [mode, setMode] = useState<RideMode>("car");
  const [direction, setDirection] = useState<RideDirection>("from_school");
  const [destination, setDestination] = useState<Destination | "">("");
  const [fromSpot, setFromSpot] = useState<FromSpot | "">("");
  // DateTimePicker returns Date | null
  const [departsAt, setDepartsAt] = useState<Date | null>(null);
  const [capacity, setCapacity] = useState<number>(1);
  const [minParticipants, setMinParticipants] = useState<number>(2);
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");

  const destinationChoices =
    direction === "from_school" ? stations : campusSpots;
  const fromSpotChoices = direction === "from_school" ? campusSpots : stations;

  const parsePositiveInt = (value: string | number | null | undefined, fallback: number) => {
    if (typeof value === "number") {
      if (Number.isFinite(value) && value > 0) {
        return Math.floor(value);
      }
      return fallback;
    }
    if (typeof value === "string" && value.length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed > 0) {
        return Math.floor(parsed);
      }
      return fallback;
    }
    return fallback;
  };

  const submit = async () => {
    setError("");
    if (!userId) {
      setError("認証されていません");
      return;
    }
    const departsAtIso = departsAt ? departsAt.toISOString() : "";
    const minCount = mode === "taxi" ? Math.max(2, Math.min(minParticipants, capacity)) : null;
    const res = await api.createRide(
      {
        mode,
        destination: destination as Destination,
        fromSpot: fromSpot as FromSpot,
        departsAt: departsAtIso,
        capacity,
        minParticipants: minCount,
        note,
      },
      asUserId(userId),
    );
    if (!res.ok) setError(res.error);
    else nav(`/ride/${res.data.id}`);
  };

  return (
    <Stack>
      <Title order={2}>ライドを作成</Title>
      {error && <Alert color="red">{error}</Alert>}
      <Stack gap={4}>
        <Text size="sm" fw={500}>
          ライド種別
        </Text>
        <SegmentedControl
          fullWidth
          data={rideModeOptions}
          value={mode}
          onChange={(value) => {
            const nextMode: RideMode = value === "taxi" ? "taxi" : "car";
            setMode(nextMode);
            if (nextMode === "taxi") {
              setCapacity((prev) => {
                if (minParticipants > prev) {
                  return minParticipants;
                }
                return prev;
              });
            }
          }}
        />
        {mode === "taxi" && (
          <Text size="xs" c="dimmed">
            タクシー運賃は参加者全員で均等に割り勘します。
          </Text>
        )}
      </Stack>
      <Stack gap={4}>
        <Text size="sm" fw={500}>
          方向
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
          label="集合場所"
          placeholder="選択してください"
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
          label="目的地"
          placeholder="選択してください"
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
        label="出発時刻"
        placeholder="日時を選択"
        value={departsAt}
        onChange={(value) => setDepartsAt(value)}
        valueFormat="YYYY/MM/DD HH:mm"
        minDate={new Date(Date.now() - 5 * 60 * 1000)}
        clearable
      />
      <NumberInput
        label={mode === "taxi" ? "最大人数" : "定員"}
        min={1}
        value={capacity}
        onChange={(value) => {
          const parsed = parsePositiveInt(value, 1);
          const nextCapacity = Math.max(parsed, 1);
          setCapacity(nextCapacity);
          if (mode === "taxi" && minParticipants > nextCapacity) {
            setMinParticipants(nextCapacity);
          }
        }}
      />
      {mode === "taxi" && (
        <NumberInput
          label="最低催行人数"
          min={2}
          value={minParticipants}
          onChange={(value) => {
            const parsed = parsePositiveInt(value, 2);
            const sanitized = Math.max(2, parsed);
            setMinParticipants(sanitized);
            if (sanitized > capacity) {
              setCapacity(sanitized);
            }
          }}
        />
      )}
      <TextInput
        label="メモ"
        value={note}
        onChange={(e) => setNote(e.currentTarget.value)}
      />
      <Button onClick={submit}>作成する</Button>
      <Text c="dimmed">
        選択した日時は自動的に日本標準時に変換されます。
      </Text>
    </Stack>
  );
}
