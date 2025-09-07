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

type Props = {
  opened: boolean;
  onClose: () => void;
};

export function LoginModal({ opened, onClose }: Props) {
  const { setUserId } = useUser();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const onSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    // Validate only that it's non-empty; actual password validation is not required
    const trimmed = id.trim();
    if (!trimmed) return;
    setUserId(trimmed);
    // reset form after successful login
    setId("");
    setPw("");
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Login" centered>
      <form onSubmit={onSubmit}>
        <Stack>
          <TextInput
            label="User ID"
            placeholder="ascii lowercase (e.g. kawaemon)"
            value={id}
            onChange={(e) => setId(e.currentTarget.value)}
            autoFocus
          />
          <PasswordInput
            label="Password"
            // placeholder="not validated for demo"
            value={pw}
            onChange={(e) => setPw(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button type="button" variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Login</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
