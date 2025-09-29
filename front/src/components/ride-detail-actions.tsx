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
          Delete ride
        </Button>
      )}
      {showJoin && (
        <Button
          onClick={() => {
            void onJoin();
          }}
        >
          Join ride
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
          {ride.verified ? "Already met" : "Meet up"}
        </Button>
      )}
      {showLeave && (
        <Button
          variant="light"
          onClick={() => {
            void onLeave();
          }}
        >
          Leave ride
        </Button>
      )}
    </Group>
  );
}
