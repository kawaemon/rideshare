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
            from {labelFromSpot(ride.fromSpot)}
          </Badge>
          {viewerRoleLabel && (
            <Badge color="teal" variant="light">
              {viewerRoleLabel}
            </Badge>
          )}
        </Group>
        <Text size="sm" c="dimmed">
          Departs at {formatDateTimeJst(ride.departsAt)} JST
        </Text>
      </Stack>
      <Divider />
      <Group gap="xl" align="flex-start" grow>
        <Stack gap={6}>
          <Text size="sm" c="dimmed">
            Driver
          </Text>
          <Text fw={600}>{ride.driver.name}</Text>
          <Text size="sm" c="dimmed">
            Organizer of this ride
          </Text>
        </Stack>
        <Stack gap={6}>
          <Text size="sm" c="dimmed">
            Seats
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
            Meeting point
          </Text>
          <Text fw={600}>{labelFromSpot(ride.fromSpot)}</Text>
          <Text size="sm" c="dimmed">
            Heading to {labelDestination(ride.destination)}
          </Text>
        </Stack>
      </Group>
      {ride.note && (
        <Stack gap={4}>
          <Text size="sm" c="dimmed">
            Driver's note
          </Text>
          <Text>{ride.note}</Text>
        </Stack>
      )}
    </Stack>
  );
}
