import { Title, Text, Group, Button, Stack, Alert, Container, Paper, Divider, LoadingOverlay } from "@mantine/core";
import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { asUserId } from "../api/types";
import { useUser } from "../context/UserContext";
import { RideDetailSummary } from "../components/ride-detail-summary";
import { RideMembersSection } from "../components/ride-members-section";
import { RideDetailActions } from "../components/ride-detail-actions";
import { RideVerifyModal } from "../components/ride-detail-verify-modal";
import { useRideDetailController } from "./use-ride-detail-controller";

export function RideDetailPage() {
  const { id } = useParams();
  const { userId } = useUser();
  const viewerUserId = useMemo(() => {
    return userId ? asUserId(userId) : undefined;
  }, [userId]);
  const { state, handlers } = useRideDetailController(id, viewerUserId);
  const {
    ride,
    error,
    isLoading,
    verifyTarget,
    isVerifying,
    isSendingLocation,
    isReloadingStatus,
    capacityStats,
    viewerRoleLabel,
    isDriver,
    canJoin,
    canSelfVerify,
    canLeave,
  } = state;
  const {
    handleDelete,
    handleJoin,
    handleLeave,
    handleConfirmVerification,
    handleSendLocation,
    handleReloadVerificationStatus,
    openVerifyModal,
    openSelfVerifyModal,
    closeVerifyModal,
  } = handlers;

  if (!id) {
    return <Text>Invalid ID</Text>;
  }

  return (
    <Container size="md">
      <RideVerifyModal
        target={verifyTarget}
        isVerifying={isVerifying}
        isSendingLocation={isSendingLocation}
        isReloadingStatus={isReloadingStatus}
        onClose={closeVerifyModal}
        onConfirm={() => {
          void handleConfirmVerification();
        }}
        onSendLocation={() => {
          void handleSendLocation();
        }}
        onReloadStatus={() => {
          void handleReloadVerificationStatus();
        }}
      />
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
              <RideDetailSummary
                ride={ride}
                viewerRoleLabel={viewerRoleLabel}
                capacityStats={capacityStats}
              />
              {isDriver && (
                <>
                  <Divider />
                  <RideMembersSection
                    members={ride.members}
                    isVerifying={isVerifying}
                    verifyTarget={verifyTarget}
                    onOpenVerify={openVerifyModal}
                  />
                </>
              )}
              <Divider />
              <RideDetailActions
                ride={ride}
                showDelete={isDriver}
                showJoin={canJoin}
                showSelfVerify={canSelfVerify}
                showLeave={canLeave}
                isSendingLocation={isSendingLocation}
                onDelete={handleDelete}
                onJoin={handleJoin}
                onSelfVerify={openSelfVerifyModal}
                onLeave={handleLeave}
              />
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
