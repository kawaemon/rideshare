import { Title, Text } from "@mantine/core";
import { useParams } from "react-router-dom";

export function RideDetailPage() {
  const { id } = useParams();
  return (
    <div>
      <Title order={2}>Ride Detail</Title>
      <Text c="dimmed">Ride ID: {id}</Text>
    </div>
  );
}

