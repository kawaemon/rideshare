import { Button, Group } from "@mantine/core";
import { type RideDetail } from "../api/types";

export interface RideDetailActionsProps {
  ride: RideDetail;
  showDelete: boolean;
  showJoin: boolean;
  showSelfVerify: boolean;
  showLeave: boolean;
  isSendingLocation: boolean;
  onDelete: () => Promise<void>;
  onJoin: () => Promise<void>;
  onSelfVerify: () => void;
  onLeave: () => Promise<void>;
}

export function RideDetailActions({
  ride,
  showDelete,
  showJoin,
  showSelfVerify,
  showLeave,
  isSendingLocation,
  onDelete,
  onJoin,
  onSelfVerify,
  onLeave,
}: RideDetailActionsProps) {
  return (
    <Group justify="flex-end" gap="sm">
      {showDelete && (
        <Button
          color="red"
          variant="light"
          onClick={() => {
            void onDelete();
          }}
        >
          募集を削除
        </Button>
      )}
      {showJoin && (
        <Button
          onClick={() => {
            void onJoin();
          }}
        >
          参加する
        </Button>
      )}
      {showSelfVerify && (
        <Button
          variant="outline"
          disabled={ride.verified}
          loading={isSendingLocation}
          onClick={() => {
            onSelfVerify();
          }}
        >
          {ride.verified ? "集合済み" : "集合確認"}
        </Button>
      )}
      {showLeave && (
        <Button
          variant="light"
          onClick={() => {
            void onLeave();
          }}
        >
          参加を取り消す
        </Button>
      )}
    </Group>
  );
}
