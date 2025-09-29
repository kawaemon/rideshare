import { Modal, Stack, Text, Group, Button, Badge } from "@mantine/core";
import { type UserId, type RideMemberLocationCheck } from "../api/types";

export interface RideVerifyTarget {
  memberId: UserId;
  memberName: string;
  isSelf: boolean;
  locationCheck: RideMemberLocationCheck | null;
}

export interface RideVerifyModalProps {
  target: RideVerifyTarget | null;
  isVerifying: boolean;
  isSendingLocation: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSendLocation: () => void;
}

function describeOutcome(outcome: boolean | null): {
  label: string;
  color: string;
} {
  if (outcome === true) {
    return { label: "Near meeting point", color: "teal" };
  }
  if (outcome === false) {
    return { label: "Away from meeting point", color: "red" };
  }
  return { label: "Could not confirm", color: "gray" };
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString();
}

export function RideVerifyModal({
  target,
  isVerifying,
  isSendingLocation,
  onClose,
  onConfirm,
  onSendLocation,
}: RideVerifyModalProps) {
  const opened = Boolean(target);
  const isSelf = Boolean(target?.isSelf);
  const locationCheck = target?.locationCheck ?? null;
  const outcome = locationCheck ? describeOutcome(locationCheck.matched) : null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Meet up confirmation"
      centered
    >
      <Stack gap="md">
        <Stack gap={6}>
          <Text size="sm">
            {isSelf
              ? "Send your current network location so the driver can see you were nearby."
              : `We will mark ${target?.memberName ?? "this member"} as met. Use the status below as a hint.`}
          </Text>
          {isSelf ? (
            <Text size="xs" c="dimmed">
              We capture your public IP and ask the school API if it is close to
              the meeting point.
            </Text>
          ) : (
            <Text size="xs" c="dimmed">
              Location data comes from the member. Confirm only after you meet
              in person.
            </Text>
          )}
        </Stack>
        <Stack gap={4}>
          <Text size="xs" c="dimmed">
            Latest verification status
          </Text>
          {locationCheck ? (
            <Stack gap={4}>
              <Group gap="xs">
                <Badge color={outcome?.color ?? "gray"} variant="light">
                  {outcome?.label ?? "Unknown"}
                </Badge>
                <Text size="xs" c="dimmed">
                  {formatTimestamp(locationCheck.checkedAt)}
                </Text>
              </Group>
              <Text size="xs">IP: {locationCheck.ip}</Text>
            </Stack>
          ) : (
            <Text size="xs">No submission yet.</Text>
          )}
        </Stack>
        <Group justify="flex-end" gap="sm">
          <Button
            variant="default"
            onClick={onClose}
            disabled={isVerifying || isSendingLocation}
          >
            {isSelf ? "Close" : "Cancel"}
          </Button>
          {isSelf ? (
            <Button onClick={onSendLocation} loading={isSendingLocation}>
              Send location
            </Button>
          ) : (
            <Button
              onClick={() => {
                onConfirm();
              }}
              loading={isVerifying}
            >
              Confirm
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
