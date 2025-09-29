import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type RideDetail } from "../api/client";
import { asRideId, type RideMemberDetail, type UserId } from "../api/types";
import { type RideCapacityStats } from "../components/ride-detail-summary";
import { type RideVerifyTarget } from "../components/ride-detail-verify-modal";

export interface RideDetailState {
  ride: RideDetail | null;
  error: string;
  isLoading: boolean;
  verifyTarget: RideVerifyTarget | null;
  isVerifying: boolean;
  isSendingLocation: boolean;
  isReloadingStatus: boolean;
  capacityStats: RideCapacityStats;
  viewerRoleLabel: string;
  isDriver: boolean;
  canJoin: boolean;
  canSelfVerify: boolean;
  canLeave: boolean;
}

export interface RideDetailHandlers {
  handleDelete: () => Promise<void>;
  handleJoin: () => Promise<void>;
  handleLeave: () => Promise<void>;
  handleConfirmVerification: () => Promise<void>;
  handleSendLocation: () => Promise<void>;
  handleReloadVerificationStatus: () => Promise<void>;
  openVerifyModal: (member: RideMemberDetail) => void;
  openSelfVerifyModal: () => void;
  closeVerifyModal: () => void;
}

export interface RideDetailController {
  state: RideDetailState;
  handlers: RideDetailHandlers;
}

export function useRideDetailController(id: string | undefined, viewerUserId: UserId | undefined): RideDetailController {
  const [ride, setRide] = useState<RideDetail | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verifyTarget, setVerifyTarget] = useState<RideVerifyTarget | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSendingLocation, setIsSendingLocation] = useState<boolean>(false);
  const [isReloadingStatus, setIsReloadingStatus] = useState<boolean>(false);

  const load = useCallback(async () => {
    if (!id) {
      setRide(null);
      return;
    }

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      setError("不正なライドIDです");
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
      locationCheck: member.locationCheck,
    });
  }, []);

  const openSelfVerifyModal = useCallback(() => {
    if (!viewerUserId) {
      return;
    }
    setVerifyTarget({
      memberId: viewerUserId,
      memberName: "あなたの到着",
      isSelf: true,
      locationCheck: ride?.selfLocationCheck ?? null,
    });
  }, [viewerUserId, ride?.selfLocationCheck]);

  const closeVerifyModal = useCallback(() => {
    if (isVerifying || isSendingLocation || isReloadingStatus) {
      return;
    }
    setVerifyTarget(null);
  }, [isVerifying, isSendingLocation, isReloadingStatus]);

  const handleReloadVerificationStatus = useCallback(async () => {
    if (!ride || !viewerUserId || !verifyTarget || verifyTarget.isSelf) {
      return;
    }
    setIsReloadingStatus(true);
    setError("");
    try {
      const res = await api.getRide(ride.id, viewerUserId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRide(res.data);
      setVerifyTarget((prev) => {
        if (!prev || prev.isSelf) {
          return prev;
        }
        const updatedMember = res.data.members.find((member) => {
          return member.id === prev.memberId;
        });
        return {
          ...prev,
          locationCheck: updatedMember?.locationCheck ?? null,
        };
      });
    } finally {
      setIsReloadingStatus(false);
    }
  }, [ride, viewerUserId, verifyTarget]);

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

  const handleSendLocation = useCallback(async () => {
    if (!ride || !viewerUserId || !verifyTarget || !verifyTarget.isSelf) {
      return;
    }
    setIsSendingLocation(true);
    setError("");
    try {
      const res = await api.submitRideLocationCheck(ride.id, viewerUserId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRide((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          selfLocationCheck: res.data,
        };
      });
      setVerifyTarget((prev) => {
        if (!prev || !prev.isSelf) {
          return prev;
        }
        return {
          ...prev,
          locationCheck: res.data,
        };
      });
    } finally {
      setIsSendingLocation(false);
    }
  }, [ride, viewerUserId, verifyTarget]);

  const capacityStats = useMemo<RideCapacityStats>(() => {
    if (!ride) {
      return {
        seatsRemaining: 0,
        progressValue: 0,
        progressColor: "teal",
        capacityLabel: "",
      };
    }
    const seatsRemaining = Math.max(ride.capacity - ride.membersCount, 0);
    const utilization =
      ride.capacity > 0
        ? Math.min((ride.membersCount / ride.capacity) * 100, 100)
        : 0;
    const seatsLabel = seatsRemaining > 0 ? `残り${seatsRemaining}席` : "満席";
    let progressColor = seatsRemaining > 0 ? "teal" : "red";
    let capacityLabel = seatsLabel;
    if (ride.mode === "taxi" && ride.minParticipants) {
      const neededForTaxi = Math.max(ride.minParticipants - ride.membersCount, 0);
      if (neededForTaxi > 0) {
        capacityLabel = `${seatsLabel} / 催行まであと${neededForTaxi}人`;
        progressColor = "orange";
      } else {
        capacityLabel = `${seatsLabel} / 催行可能`;
      }
    }
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
      return ride.mode === "taxi" ? "あなたは主催者です" : "あなたはドライバーです";
    }
    if (ride.joined) {
      return ride.mode === "taxi"
        ? "このタクシー割り勘に参加しています"
        : "このライドに参加しています";
    }
    return "";
  }, [ride, viewerUserId]);

  const isDriver = Boolean(ride && viewerUserId && ride.driver.id === viewerUserId);
  const canJoin = Boolean(ride && viewerUserId && !isDriver && !ride.joined);
  const canSelfVerify = Boolean(ride && viewerUserId && !isDriver && ride.joined);
  const canLeave = canSelfVerify;

  return {
    state: {
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
    },
    handlers: {
      handleDelete,
      handleJoin,
      handleLeave,
      handleConfirmVerification,
      handleSendLocation,
      handleReloadVerificationStatus,
      openVerifyModal,
      openSelfVerifyModal,
      closeVerifyModal,
    },
  };
}
