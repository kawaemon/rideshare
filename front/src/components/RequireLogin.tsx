import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

type Props = { children: JSX.Element };

export function RequireLogin({ children }: Props) {
  const { userId } = useUser();
  const location = useLocation();

  if (!userId) {
    return <Navigate to="/" replace state={{ loginRequired: true, from: location.pathname }} />;
  }
  return children;
}
