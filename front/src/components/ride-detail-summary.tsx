import { Badge, Divider, Group, Progress, Stack, Text } from "@mantine/core";
import { type RideDetail, type RideMode, type Station, stations } from "../api/types";
import { formatDateTimeJst } from "../lib/datetime";
import { labelDestination, labelFromSpot } from "../lib/labels";

export interface RideCapacityStats {
  seatsRemaining: number;
  progressValue: number;
  progressColor: string;
  capacityLabel: string;
}

export interface RideDetailSummaryProps {
  ride: RideDetail;
  viewerRoleLabel: string;
  capacityStats: RideCapacityStats;
  viewerIsHost: boolean;
  viewerJoined: boolean;
}

const rideModeBadgeColor: Record<RideMode, string> = {
  car: "blue",
  taxi: "grape",
};

const rideModeLabel: Record<RideMode, string> = {
  car: "マイカー",
  taxi: "タクシー割り勘",
};

function describeHostRole(mode: RideMode): { title: string; subtitle: string } {
  if (mode === "taxi") {
    return {
      title: "主催者",
      subtitle: "タクシーの手配と割り勘を担当します",
    };
  }
  return {
    title: "ドライバー",
    subtitle: "車を運転して会場まで向かいます",
  };
}

function describeCapacityBlock(ride: RideDetail): {
  title: string;
  subtitle: string;
  extra?: string;
} {
  if (ride.mode === "taxi") {
    const base = ride.minParticipants
      ? `最低催行 ${ride.minParticipants}人`
      : "参加者で均等に割り勘";
    return {
      title: "参加予定人数",
      subtitle: base,
      extra: "人数に応じて料金を割り勘します",
    };
  }

  return {
    title: "定員",
    subtitle: "空いていれば参加できます",
  };
}

function isStation(value: string): value is Station {
  return (stations as readonly string[]).includes(value);
}

const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

function formatYen(amount: number): string {
  return yenFormatter.format(amount);
}

function getTaxiReferenceFare(ride: RideDetail): { amount: number; station: Station } | null {
  if (ride.mode !== "taxi") {
    return null;
  }

  const taxiFareTable: Record<Station, number> = {
    shonandai: 2000,
    tsujido: 3500,
  };

  let station: Station | null = null;
  if (isStation(ride.destination)) {
    station = ride.destination;
  } else if (isStation(ride.fromSpot)) {
    station = ride.fromSpot;
  }
  if (!station) {
    return null;
  }

  const amount = taxiFareTable[station];
  if (!amount) {
    return null;
  }

  return { amount, station };
}

export function RideDetailSummary({
  ride,
  viewerRoleLabel,
  capacityStats,
  viewerIsHost,
  viewerJoined,
}: RideDetailSummaryProps) {
  const hostRole = describeHostRole(ride.mode);
  const capacityBlock = describeCapacityBlock(ride);
  const taxiReference = getTaxiReferenceFare(ride);
  const hostIncludedCount = ride.membersCount + 1;
  const currentShare = taxiReference
    ? Math.ceil(taxiReference.amount / Math.max(hostIncludedCount, 1))
    : null;
  const showShareWithViewer = Boolean(
    taxiReference && !viewerIsHost && !viewerJoined,
  );
  const shareWithViewer = taxiReference
    ? Math.ceil(taxiReference.amount / Math.max(hostIncludedCount + (showShareWithViewer ? 1 : 0), 1))
    : null;

  return (
    <Stack gap="xl">
      <Stack gap={6}>
        <Group justify="space-between" align="flex-start" gap="md">
          <Stack gap={2}>
            <Text size="lg" fw={600}>
              {labelDestination(ride.destination)}
            </Text>
            <Text size="sm" c="dimmed">
              集合: {labelFromSpot(ride.fromSpot)}
            </Text>
          </Stack>
          <Group gap="xs">
            <Badge color={rideModeBadgeColor[ride.mode]} variant="light">
              {rideModeLabel[ride.mode]}
            </Badge>
            {viewerRoleLabel && (
              <Badge color="teal" variant="light">
                {viewerRoleLabel}
              </Badge>
            )}
          </Group>
        </Group>
        <Text size="sm" c="dimmed">
          出発時刻: {formatDateTimeJst(ride.departsAt)} JST
        </Text>
      </Stack>
      <Divider />
      <Group gap="xl" align="flex-start" grow>
        <Stack gap={6}>
          <Text size="sm" c="dimmed">
            {hostRole.title}
          </Text>
          <Text fw={600}>{ride.driver.name}</Text>
          <Text size="sm" c="dimmed">
            {hostRole.subtitle}
          </Text>
        </Stack>
        <Stack gap={6}>
          <Text size="sm" c="dimmed">
            {capacityBlock.title}
          </Text>
          <Text fw={600}>
            {ride.membersCount}/{ride.capacity}
          </Text>
          <Progress size="sm" value={capacityStats.progressValue} color={capacityStats.progressColor} />
          <Text size="sm" c="dimmed">
            {capacityStats.capacityLabel}
          </Text>
          {capacityBlock.subtitle && (
            <Text size="xs" c="dimmed">{capacityBlock.subtitle}</Text>
          )}
          {taxiReference && currentShare && (
            <Stack gap={2}>
              <Text size="xs" c="dimmed">
                {labelDestination(taxiReference.station)}方面タクシー参考: 約{formatYen(taxiReference.amount)}
              </Text>
              <Text size="xs" c="dimmed">
                現在の想定負担額: 約{formatYen(currentShare)} / 人
              </Text>
              {showShareWithViewer && shareWithViewer && (
                <Text size="xs" c="dimmed">
                  参加すると 約{formatYen(shareWithViewer)} / 人
                </Text>
              )}
            </Stack>
          )}
        </Stack>
        <Stack gap={6}>
          <Text size="sm" c="dimmed">
            集合場所
          </Text>
          <Text fw={600}>{labelFromSpot(ride.fromSpot)}</Text>
          <Text size="sm" c="dimmed">
            行き先: {labelDestination(ride.destination)}
          </Text>
        </Stack>
      </Group>
      {ride.note && (
        <Stack gap={4}>
          <Text size="sm" c="dimmed">
            {hostRole.title}からのメモ
          </Text>
          <Text>{ride.note}</Text>
        </Stack>
      )}
    </Stack>
  );
}
