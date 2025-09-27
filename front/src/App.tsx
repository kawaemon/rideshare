import { AppShell, Container } from "@mantine/core";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { AppHeader } from "./components/AppHeader";
import { HomePage } from "./pages/HomePage";
import { NewRidePage } from "./pages/NewRidePage";
import { RideDetailPage } from "./pages/RideDetailPage";
import { MePage } from "./pages/MePage";
import { RequireLogin } from "./components/RequireLogin";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Show login-required notice once after redirect, then clear state
  useEffect(() => {
    const state = location.state as Record<string, unknown> | null;
    if (state && state["loginRequired"]) {
      notifications.show({
        id: "login-required",
        color: "red",
        title: "Login required",
        message: "Please login to continue",
      });
      // Clear state to prevent duplicate notifications (incl. React StrictMode)
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.key]);

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <AppHeader />
      </AppShell.Header>
      <AppShell.Main>
        <Container size="md">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/ride/new"
              element={
                <RequireLogin>
                  <NewRidePage />
                </RequireLogin>
              }
            />
            <Route path="/ride/:id" element={<RideDetailPage />} />
            <Route
              path="/me"
              element={
                <RequireLogin>
                  <MePage />
                </RequireLogin>
              }
            />
          </Routes>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
