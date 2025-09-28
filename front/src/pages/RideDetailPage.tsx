import {
  Title,
  Text,
  Group,
  Button,
  Stack,
  Alert,
  Container,
  Paper,
  Badge,
  Divider,
  Progress,
  LoadingOverlay,
  Modal,
} from "@mantine/core";
import { Link, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type RideDetail } from "../api/client";
import { asRideId, asUserId, type UserId, type RideMemberDetail } from "../api/types";
import { labelDestination, labelFromSpot } from "../lib/labels";
import { formatDateTimeJst } from "../lib/datetime";
import { useUser } from "../context/UserContext";

export function RideDetailPage() {
  const { id } = useParams();
  const { userId } = useUser();
  const viewerUserId = useMemo(() => {
    return userId ? asUserId(userId) : undefined;
  }, [userId]);
  const [ride, setRide] = useState<RideDetail | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verifyTarget, setVerifyTarget] = useState<VerifyTarget | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const load = useCallback(async () => {
    if (!id) {
      setRide(null);
      return;
    }

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      setError("Invalid ride id");
      setRide(null);
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      const res = await api.getRide(asRideId(numericId), viewerUserId);
      if (!res.ok) {
        setError(res.error);
        setRide(null);
        return;
      }
      setRide(res.data);
    } finally {
      setIsLoading(false);
    }
  }, [id, viewerUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = useCallback(async () => {
    if (!ride || !viewerUserId) {
      return;
    }
    const res = await api.deleteRide(ride.id, viewerUserId);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setRide(null);
  }, [ride, viewerUserId]);

  const handleJoin = useCallback(async () => {
    if (!ride || !viewerUserId) {
      return;
    }
    const res = await api.joinRide(ride.id, viewerUserId);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    await load();
  }, [ride, viewerUserId, load]);

  const handleLeave = useCallback(async () => {
    if (!ride || !viewerUserId) {
      return;
    }
    const res = await api.leaveRide(ride.id, viewerUserId);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    await load();
  }, [ride, viewerUserId, load]);

  const openVerifyModal = useCallback((member: RideMemberDetail) => {
    setVerifyTarget({
      memberId: member.id,
      memberName: member.name,
      isSelf: false,
    });
  }, []);

  const openSelfVerifyModal = useCallback(() => {
    if (!viewerUserId) {
      return;
    }
    setVerifyTarget({
      memberId: viewerUserId,
      memberName: "your arrival",
      isSelf: true,
    });
  }, [viewerUserId]);

  const closeVerifyModal = useCallback(() => {
    if (isVerifying) {
      return;
    }
    setVerifyTarget(null);
  }, [isVerifying]);

  const handleConfirmVerification = useCallback(async () => {
    if (!ride || !viewerUserId || !verifyTarget || verifyTarget.isSelf) {
      return;
    }
    setIsVerifying(true);
    setError("");
    const res = await api.verifyRideMember(ride.id, verifyTarget.memberId, viewerUserId);
    if (!res.ok) {
      setError(res.error);
      setIsVerifying(false);
      return;
    }
    await load();
    setIsVerifying(false);
    setVerifyTarget(null);
  }, [ride, viewerUserId, verifyTarget, load]);

  const capacityStats = useMemo(() => {
    if (!ride) {
      return {
        seatsRemaining: 0,
        progressValue: 0,
        progressColor: "teal" as const,
        capacityLabel: "",
      };
    }
    const seatsRemaining = Math.max(ride.capacity - ride.membersCount, 0);
    const utilization =
      ride.capacity > 0
        ? Math.min((ride.membersCount / ride.capacity) * 100, 100)
        : 0;
    const progressColor = seatsRemaining > 0 ? "teal" : "red";
    const capacityLabel =
      seatsRemaining > 0
        ? `${seatsRemaining} seat${seatsRemaining === 1 ? "" : "s"} left`
        : "Fully booked";
    return {
      seatsRemaining,
      progressValue: utilization,
      progressColor,
      capacityLabel,
    };
  }, [ride]);

  const viewerRoleLabel = useMemo(() => {
    if (!ride || !viewerUserId) {
      return "";
    }
    if (ride.driver.id === viewerUserId) {
      return "You are the driver";
    }
    if (ride.joined) {
      return "You joined this ride";
    }
    return "";
  }, [ride, viewerUserId]);

  if (!id) {
    return <Text>Invalid ID</Text>;
  }

  return (
    <Container size="md">
      <Modal
        opened={Boolean(verifyTarget)}
        onClose={closeVerifyModal}
        title="Meet up confirmation"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            {verifyTarget?.isSelf
              ? "Tell your driver once you see each other. They will do the confirmation here."
              : `We will mark ${verifyTarget?.memberName} as met. Authentication will arrive later.`}
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={closeVerifyModal} disabled={isVerifying}>
              {verifyTarget?.isSelf ? "Close" : "Cancel"}
            </Button>
            {!verifyTarget?.isSelf && (
              <Button
                onClick={() => {
                  void handleConfirmVerification();
                }}
                loading={isVerifying}
              >
                Confirm
              </Button>
            )}
          </Group>
        </Stack>
      </Modal>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Title order={2}>Ride detail</Title>
            <Text size="sm" c="dimmed">
              Check the full plan before you decide to hop in.
            </Text>
          </Stack>
          <Button component={Link} to="/" variant="light">
            Back to rides
          </Button>
        </Group>
        {error && <Alert color="red">{error}</Alert>}
        <Paper withBorder radius="lg" p="xl" pos="relative">
          {ride && <LoadingOverlay visible={isLoading} zIndex={5} />}
          {isLoading && !ride && (
            <Group justify="center">
              <Stack gap="xs" align="center">
                <Text size="sm" c="dimmed">
                  Loading ride information...
                </Text>
              </Stack>
            </Group>
          )}
          {!isLoading && !ride && !error && (
            <Text c="dimmed">Ride not found.</Text>
          )}
          {ride && (
            <Stack gap="xl">
              <Stack gap={6}>
                <Group gap="sm">
                  <Badge size="lg" variant="light" color="indigo">
                    {labelDestination(ride.destination)}
                  </Badge>
                  <Badge variant="outline" color="gray">
                    from {labelFromSpot(ride.fromSpot)}
                  </Badge>
                  {viewerRoleLabel && (
                    <Badge color="teal" variant="light">
                      {viewerRoleLabel}
                    </Badge>
                  )}
                </Group>
                <Text size="sm" c="dimmed">
                  Departs at {formatDateTimeJst(ride.departsAt)} JST
                </Text>
              </Stack>
              <Divider />
              <Group gap="xl" align="flex-start" grow>
                <Stack gap={6}>
                  <Text size="sm" c="dimmed">
                    Driver
                  </Text>
                  <Text fw={600}>{ride.driver.name}</Text>
                  <Text size="sm" c="dimmed">
                    Organizer of this ride
                  </Text>
                </Stack>
                <Stack gap={6}>
                  <Text size="sm" c="dimmed">
                    Seats
                  </Text>
                  <Text fw={600}>
                    {ride.membersCount}/{ride.capacity}
                  </Text>
                  <Progress
                    size="sm"
                    value={capacityStats.progressValue}
                    color={capacityStats.progressColor}
                  />
                  <Text size="sm" c="dimmed">
                    {capacityStats.capacityLabel}
                  </Text>
                </Stack>
                <Stack gap={6}>
                  <Text size="sm" c="dimmed">
                    Meeting point
                  </Text>
                  <Text fw={600}>{labelFromSpot(ride.fromSpot)}</Text>
                  <Text size="sm" c="dimmed">
                    Heading to {labelDestination(ride.destination)}
                  </Text>
                </Stack>
              </Group>
              {ride.note && (
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">
                    Driver's note
                  </Text>
                  <Text>{ride.note}</Text>
                </Stack>
              )}
              {viewerUserId && ride.driver.id === viewerUserId && (
                <>
                  <Divider />
                  <Stack gap="sm">
                    <Text size="sm" c="dimmed">
                      Members
                    </Text>
                    {ride.members.length === 0 ? (
                      <Text size="sm" c="dimmed">
                        No members yet.
                      </Text>
                    ) : (
                      <Stack gap={8}>
                        {ride.members.map((member) => (
                          <Group key={member.id} justify="space-between">
                            <Text>{member.name}</Text>
                            {member.verified ? (
                              <Badge color="teal" variant="light">
                                Met
                              </Badge>
                            ) : (
                              <Button
                                size="xs"
                                variant="light"
                                onClick={() => {
                                  openVerifyModal(member);
                                }}
                                loading={
                                  isVerifying && verifyTarget?.memberId === member.id && !verifyTarget.isSelf
                                }
                                disabled={
                                  isVerifying &&
                                  verifyTarget?.memberId !== member.id &&
                                  !verifyTarget?.isSelf
                                }
                              >
                                Meet up
                              </Button>
                            )}
                          </Group>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </>
              )}
              <Divider />
              <Group justify="flex-end" gap="sm">
                {viewerUserId && ride.driver.id === viewerUserId && (
                  <Button
                    color="red"
                    variant="light"
                    onClick={() => {
                      void handleDelete();
                    }}
                  >
                    Delete ride
                  </Button>
                )}
                {viewerUserId &&
                  ride.driver.id !== viewerUserId &&
                  !ride.joined && (
                    <Button
                      onClick={() => {
                        void handleJoin();
                      }}
                    >
                      Join ride
                    </Button>
                  )}
                {viewerUserId &&
                  ride.driver.id !== viewerUserId &&
                  ride.joined && (
                    <Button
                      variant="outline"
                      disabled={ride.verified}
                      loading={isVerifying && verifyTarget?.isSelf}
                      onClick={() => {
                        openSelfVerifyModal();
                      }}
                    >
                      {ride.verified ? "Already met" : "Meet up"}
                    </Button>
                  )}
                {viewerUserId &&
                  ride.driver.id !== viewerUserId &&
                  ride.joined && (
                    <Button
                      variant="light"
                      onClick={() => {
                        void handleLeave();
                      }}
                    >
                      Leave ride
                    </Button>
                  )}
              </Group>
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}

type VerifyTarget = {
  memberId: UserId;
  memberName: string;
  isSelf: boolean;
};
