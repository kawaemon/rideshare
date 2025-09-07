import { AppShell, Container } from "@mantine/core";
import { Routes, Route } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { HomePage } from "./pages/HomePage";
import { NewRidePage } from "./pages/NewRidePage";
import { RideDetailPage } from "./pages/RideDetailPage";
import { MePage } from "./pages/MePage";

export default function App() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <AppHeader />
      </AppShell.Header>
      <AppShell.Main>
        <Container size="md">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ride/new" element={<NewRidePage />} />
            <Route path="/ride/:id" element={<RideDetailPage />} />
            <Route path="/me" element={<MePage />} />
          </Routes>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
