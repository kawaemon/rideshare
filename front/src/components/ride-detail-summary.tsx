import { Badge, Divider, Group, Progress, Stack, Text } from "@mantine/core";
import { type RideDetail } from "../api/types";
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
}

export function RideDetailSummary({ ride, viewerRoleLabel, capacityStats }: RideDetailSummaryProps) {
  return (
    <Stack gap="xl">
      <Stack gap={6}>
        <Group gap="sm">
          <Badge size="lg" variant="light" color="indigo">
            {labelDestination(ride.destination)}
          </Badge>
          <Badge variant="outline" color="gray">
            集合場所 {labelFromSpot(ride.fromSpot)}
          </Badge>
          {viewerRoleLabel && (
            <Badge color="teal" variant="light">
              {viewerRoleLabel}
            </Badge>
          )}
        </Group>
        <Text size="sm" c="dimmed">
          出発時刻: {formatDateTimeJst(ride.departsAt)} JST
        </Text>
      </Stack>
      <Divider />
      <Group gap="xl" align="flex-start" grow>
        <Stack gap={6}>
          <Text size="sm" c="dimmed">
            ドライバー
          </Text>
          <Text fw={600}>{ride.driver.name}</Text>
          <Text size="sm" c="dimmed">
            このライドの主催者
          </Text>
        </Stack>
        <Stack gap={6}>
          <Text size="sm" c="dimmed">
            定員
          </Text>
          <Text fw={600}>
            {ride.membersCount}/{ride.capacity}
          </Text>
          <Progress size="sm" value={capacityStats.progressValue} color={capacityStats.progressColor} />
          <Text size="sm" c="dimmed">
            {capacityStats.capacityLabel}
          </Text>
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
            ドライバーからのメモ
          </Text>
          <Text>{ride.note}</Text>
        </Stack>
      )}
    </Stack>
  );
}
