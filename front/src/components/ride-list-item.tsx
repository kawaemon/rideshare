import { Badge, Group, Paper, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { RideListItem, RideMode, UserId } from "../api/types";
import { formatDateTimeJst } from "../lib/datetime";
import { labelDestination, labelFromSpot } from "../lib/labels";

interface RideListItemCardProps {
  ride: RideListItem;
  currentUserId?: UserId;
  actions?: ReactNode;
}

type RideRole = "driver" | "member" | null;

const rideModeBadgeColor: Record<RideMode, string> = {
  car: "blue",
  taxi: "grape",
};

const rideModeLabel: Record<RideMode, string> = {
  car: "マイカー",
  taxi: "タクシー割り勘",
};

function describeHostLabel(mode: RideMode): string {
  return mode === "taxi" ? "主催者" : "ドライバー";
}

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

export function RideListItemCard({
  ride,
  currentUserId,
  actions,
}: RideListItemCardProps) {
  const role = getRoleForViewer(ride, currentUserId);
  const hostLabel = describeHostLabel(ride.mode);

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
                {labelDestination(ride.destination)}（集合: {labelFromSpot(ride.fromSpot)}）
              </Text>
              <Badge color={rideModeBadgeColor[ride.mode]} variant="light">
                {rideModeLabel[ride.mode]}
              </Badge>
              {role && (
                <Badge
                  color={role === "driver" ? "blue" : "teal"}
                  variant="light"
                >
                  {role === "driver" ? "ドライバー" : "参加者"}
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed">
              出発: {formatDateTimeJst(ride.departsAt)} JST / {hostLabel} {ride.driver.name} /
              {" "}
              {ride.membersCount}/{ride.capacity}人
              {ride.mode === "taxi" && ride.minParticipants ? ` / 最低催行 ${ride.minParticipants}人` : ""}
            </Text>
          </Stack>
          {actions}
        </Group>
        {ride.note && <Text size="sm">{ride.note}</Text>}
      </Stack>
    </Paper>
  );
}
