import { Group, Text, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { LoginModal } from "./LoginModal";

export function AppHeader() {
  const { userId, setUserId } = useUser();
  const [opened, { open, close }] = useDisclosure(false);
  const loc = useLocation();
  return (
    <Group h={60} px="md" justify="space-between" wrap="nowrap">
      <Group gap="sm">
        <Text fw={700} size="lg" component={Link} to="/" style={{ textDecoration: "none" }}>
          Rideshare Demo
        </Text>
        <Button variant={loc.pathname === "/" ? "filled" : "subtle"} component={Link} to="/">
          Home
        </Button>
        <Button variant={loc.pathname.startsWith("/ride/new") ? "filled" : "subtle"} component={Link} to="/ride/new">
          Create
        </Button>
        <Button variant={loc.pathname.startsWith("/me") ? "filled" : "subtle"} component={Link} to="/me">
          Me
        </Button>
      </Group>
      <Group gap="sm" wrap="nowrap">
        {userId ? (
          <>
            <Text c="dimmed">user: {userId}</Text>
            <Button variant="light" color="red" onClick={() => setUserId("")}>Logout</Button>
          </>
        ) : (
          <>
            <Text c="dimmed">not logged in</Text>
            <Button onClick={open} variant="light">Login</Button>
          </>
        )}
      </Group>
      <LoginModal opened={opened} onClose={close} />
    </Group>
  );
}
