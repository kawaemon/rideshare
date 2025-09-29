import { Badge, Button, Stack, Text, Group } from "@mantine/core";
import { type RideMemberDetail } from "../api/types";
import { type RideVerifyTarget } from "./ride-detail-verify-modal";

export interface RideMembersSectionProps {
  members: ReadonlyArray<RideMemberDetail>;
  isVerifying: boolean;
  verifyTarget: RideVerifyTarget | null;
  onOpenVerify: (member: RideMemberDetail) => void;
}

export function RideMembersSection({ members, isVerifying, verifyTarget, onOpenVerify }: RideMembersSectionProps) {
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
          const isPendingVerification = Boolean(
            isVerifying && verifyTarget && verifyTarget.memberId === member.id && verifyTarget.isSelf === false,
          );
          const isLockedDuringVerification = Boolean(
            isVerifying && verifyTarget && verifyTarget.memberId !== member.id && verifyTarget.isSelf === false,
          );

          return (
            <Group key={member.id} justify="space-between">
              <Text>{member.name}</Text>
              {member.verified ? (
                <Badge color="teal" variant="light">
                  集合済み
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
                  集合確認
                </Button>
              )}
            </Group>
          );
        })}
      </Stack>
    </Stack>
  );
}
