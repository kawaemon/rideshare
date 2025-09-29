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
  isReloadingStatus: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSendLocation: () => void;
  onReloadStatus: () => void;
}

function describeOutcome(outcome: boolean | null): {
  label: string;
  color: string;
} {
  if (outcome === true) {
    return { label: "集合場所付近", color: "teal" };
  }
  if (outcome === false) {
    return { label: "集合場所から離れています", color: "red" };
  }
  return { label: "判定できません", color: "gray" };
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
  isReloadingStatus,
  onClose,
  onConfirm,
  onSendLocation,
  onReloadStatus,
}: RideVerifyModalProps) {
  const opened = Boolean(target);
  const isSelf = Boolean(target?.isSelf);
  const locationCheck = target?.locationCheck ?? null;
  const outcome = locationCheck ? describeOutcome(locationCheck.matched) : null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="集合確認"
      centered
    >
      <Stack gap="md">
        <Stack gap={6}>
          <Text size="sm">
            {isSelf
              ? "現在のネットワーク位置情報を送信して、ドライバーが近くにいたことを確認できるようにします。"
              : `以下のステータスを参考に、${target?.memberName ?? "このメンバー"}さんを集合済みに更新します。`}
          </Text>
          {isSelf ? (
            <Text size="xs" c="dimmed">
              公開IPアドレスを取得し、学校のAPIに集合場所付近かどうかを確認します。
            </Text>
          ) : (
            <Text size="xs" c="dimmed">
              位置情報は参加者自身が送信したものです。必ず対面で確認してから確定してください。
            </Text>
          )}
        </Stack>
        <Stack gap={4}>
          <Group justify="space-between" gap="xs" align="center">
            <Text size="xs" c="dimmed">
              最新の確認状況
            </Text>
            {!isSelf && (
              <Button
                size="xs"
                variant="light"
                onClick={onReloadStatus}
                loading={isReloadingStatus}
                disabled={isVerifying || isSendingLocation}
              >
                再読み込み
              </Button>
            )}
          </Group>
          {locationCheck ? (
            <Stack gap={4}>
              <Group gap="xs">
                <Badge color={outcome?.color ?? "gray"} variant="light">
                  {outcome?.label ?? "不明"}
                </Badge>
                <Text size="xs" c="dimmed">
                  {formatTimestamp(locationCheck.checkedAt)}
                </Text>
              </Group>
              <Text size="xs">IP: {locationCheck.ip}</Text>
            </Stack>
          ) : (
            <Text size="xs">まだ送信がありません。</Text>
          )}
        </Stack>
        <Group justify="flex-end" gap="sm">
          <Button
            variant="default"
            onClick={onClose}
            disabled={isVerifying || isSendingLocation || isReloadingStatus}
          >
            {isSelf ? "閉じる" : "キャンセル"}
          </Button>
          {isSelf ? (
            <Button onClick={onSendLocation} loading={isSendingLocation}>
              位置情報を送信
            </Button>
          ) : (
            <Button
              onClick={() => {
                onConfirm();
              }}
              loading={isVerifying}
              disabled={isReloadingStatus}
            >
              集合済みにする
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
