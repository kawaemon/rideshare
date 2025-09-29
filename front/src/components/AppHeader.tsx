import { Group, Text, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { LoginModal } from "./LoginModal";
import { notifications } from "@mantine/notifications";

export function AppHeader() {
  const { userId, setUserId } = useUser();
  const [opened, { open, close }] = useDisclosure(false);
  const loc = useLocation();
  return (
    <Group h={60} px="md" justify="space-between" wrap="nowrap">
      <Group gap="sm">
        <Text
          fw={700}
          size="lg"
          component={Link}
          to="/"
          style={{ textDecoration: "none" }}
        >
          ライドシェア デモ
        </Text>
        <Button
          variant={loc.pathname === "/" ? "filled" : "subtle"}
          component={Link}
          to="/"
        >
          ホーム
        </Button>
        <Button
          variant={loc.pathname.startsWith("/ride/new") ? "filled" : "subtle"}
          component={Link}
          to="/ride/new"
          onClick={(e) => {
            if (!userId) {
              e.preventDefault();
              notifications.show({
                id: "login-required",
                color: "red",
                title: "ログインが必要です",
                message: "続行するにはログインしてください",
              });
            }
          }}
        >
          募集する
        </Button>
        <Button
          variant={loc.pathname.startsWith("/me") ? "filled" : "subtle"}
          component={Link}
          to="/me"
          onClick={(e) => {
            if (!userId) {
              e.preventDefault();
              notifications.show({
                id: "login-required",
                color: "red",
                title: "ログインが必要です",
                message: "続行するにはログインしてください",
              });
            }
          }}
        >
          参加状況
        </Button>
      </Group>
      <Group gap="sm" wrap="nowrap">
        {userId ? (
          <>
            <Text c="dimmed">ユーザー: {userId}</Text>
            <Button variant="light" color="red" onClick={() => setUserId("")}>
              ログアウト
            </Button>
          </>
        ) : (
          <>
            <Text c="dimmed">未ログイン</Text>
            <Button onClick={open} variant="light">
              ログイン
            </Button>
          </>
        )}
      </Group>
      <LoginModal opened={opened} onClose={close} />
    </Group>
  );
}
