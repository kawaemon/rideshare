import { FormEvent, useState } from "react";
import {
  Modal,
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Group,
} from "@mantine/core";
import { useUser } from "../context/UserContext";
import { api } from "../api/client";
import { asUserId } from "../api/types";

type Props = {
  opened: boolean;
  onClose: () => void;
};

export function LoginModal({ opened, onClose }: Props) {
  const { setUserId } = useUser();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Validate only that it's non-empty; actual password validation is not required
    const trimmed = id.trim();
    if (!trimmed) return;
    // Ensure user exists on backend (or mock)
    await api.ensureUser(asUserId(trimmed));
    setUserId(trimmed);
    // reset form after successful login
    setId("");
    setPw("");
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="ログイン" centered>
      <form onSubmit={onSubmit}>
        <Stack>
          <TextInput
            label="ユーザーID"
            placeholder="半角小文字（例: kawaemon）"
            value={id}
            onChange={(e) => setId(e.currentTarget.value)}
            autoFocus
          />
          <PasswordInput
            label="パスワード"
            // placeholder="not validated for demo"
            value={pw}
            onChange={(e) => setPw(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button type="button" variant="default" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">ログイン</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
