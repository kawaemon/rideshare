import { Modal, Stack, Text, Group, Button } from "@mantine/core";
import { type UserId } from "../api/types";

export interface RideVerifyTarget {
  memberId: UserId;
  memberName: string;
  isSelf: boolean;
}

export interface RideVerifyModalProps {
  target: RideVerifyTarget | null;
  isVerifying: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RideVerifyModal({ target, isVerifying, onClose, onConfirm }: RideVerifyModalProps) {
  const opened = Boolean(target);
  const isSelf = Boolean(target?.isSelf);

  return (
    <Modal opened={opened} onClose={onClose} title="Meet up confirmation" centered>
      <Stack gap="md">
        <Text size="sm">
          {isSelf
            ? "Tell your driver once you see each other. They will do the confirmation here."
            : `We will mark ${target?.memberName ?? "this member"} as met. Authentication will arrive later.`}
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={isVerifying}>
            {isSelf ? "Close" : "Cancel"}
          </Button>
          {!isSelf && (
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
