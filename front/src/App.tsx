import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";

export default function App() {
  return (
    <Stack p="md">
      <Title order={2}>Hello, Rideshare!</Title>
      <Card withBorder>
        <Group justify="space-between">
          <Text c="dimmed">Vite + React + Mantine</Text>
          <Button>OK</Button>
        </Group>
      </Card>
    </Stack>
  );
}

