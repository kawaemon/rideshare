import { Badge, Group, Paper, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { RideListItem, UserId } from "../api/types";
import { formatDateTimeJst } from "../lib/datetime";
import { labelDestination, labelFromSpot } from "../lib/labels";

interface RideListItemCardProps {
  ride: RideListItem;
  currentUserId?: UserId;
  actions?: ReactNode;
}

type RideRole = "driver" | "member" | null;

function getRoleForViewer(ride: RideListItem, viewerId?: UserId): RideRole {
  if (!viewerId) {
    return null;
  }
  if (ride.driver.id === viewerId) {
    return "driver";
  }
  if (ride.joined) {
    return "member";
  }
  return null;
}

export function RideListItemCard({ ride, currentUserId, actions }: RideListItemCardProps) {
  const role = getRoleForViewer(ride, currentUserId);

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Group gap="xs" align="center">
              <Text
                fw={600}
                component={Link}
                to={`/ride/${ride.id}`}
                style={{ textDecoration: "none" }}
              >
                {labelDestination(ride.destination)} from {labelFromSpot(ride.fromSpot)}
              </Text>
              {role && (
                <Badge color={role === "driver" ? "blue" : "teal"} variant="light">
                  {role === "driver" ? "Driver" : "Member"}
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed">
              departs {formatDateTimeJst(ride.departsAt)} JST / driver {ride.driver.name} / {ride.membersCount}/{ride.capacity}
            </Text>
          </Stack>
          {actions}
        </Group>
        {ride.note && (
          <Text size="sm">{ride.note}</Text>
        )}
      </Stack>
    </Paper>
  );
}
