import { Badge, Button, Stack, Text, Group } from "@mantine/core";
import { type RideMemberDetail, type RideMode } from "../api/types";
import { type RideVerifyTarget } from "./ride-detail-verify-modal";

export interface RideMembersSectionProps {
  members: ReadonlyArray<RideMemberDetail>;
  mode: RideMode;
  isVerifying: boolean;
  verifyTarget: RideVerifyTarget | null;
  onOpenVerify: (member: RideMemberDetail) => void;
}

function getVerificationLabels(mode: RideMode): { verified: string; action: string } {
  if (mode === "taxi") {
    return { verified: "合流済み", action: "到着確認" };
  }
  return { verified: "集合済み", action: "集合確認" };
}

export function RideMembersSection({ members, mode, isVerifying, verifyTarget, onOpenVerify }: RideMembersSectionProps) {
  const labels = getVerificationLabels(mode);

  if (members.length === 0) {
    return (
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          参加者
        </Text>
        <Text size="sm" c="dimmed">
          まだ参加者はいません。
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        参加者
      </Text>
      <Stack gap={8}>
        {members.map((member) => {
          const locationStatus = describeLocationStatus(member.locationCheck);
          const isPendingVerification = Boolean(
            isVerifying && verifyTarget && verifyTarget.memberId === member.id && verifyTarget.isSelf === false,
          );
          const isLockedDuringVerification = Boolean(
            isVerifying && verifyTarget && verifyTarget.memberId !== member.id && verifyTarget.isSelf === false,
          );

          return (
            <Group key={member.id} justify="space-between" align="center">
              <Group gap="xs">
                <Text>{member.name}</Text>
                <Badge color={locationStatus.color} variant="light" size="sm">
                  {locationStatus.label}
                </Badge>
              </Group>
              {member.verified ? (
                <Badge color="teal" variant="light">
                  {labels.verified}
                </Badge>
              ) : (
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => {
                    onOpenVerify(member);
                  }}
                  loading={isPendingVerification}
                  disabled={isLockedDuringVerification}
                >
                  {labels.action}
                </Button>
              )}
            </Group>
          );
        })}
      </Stack>
    </Stack>
  );
}

function describeLocationStatus(locationCheck: RideMemberDetail["locationCheck"]): {
  label: string;
  color: string;
} {
  if (!locationCheck) {
    return { label: "未送信", color: "gray" };
  }

  if (locationCheck.matched === true) {
    return { label: "集合場所付近", color: "teal" };
  }

  if (locationCheck.matched === false) {
    return { label: "集合場所から離れています", color: "red" };
  }

  return { label: "判定できません", color: "gray" };
}
