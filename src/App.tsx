import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminRoute, ProtectedRoute, WriterRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import TicketList from "./pages/TicketList";
import CreateTicket from "./pages/CreateTicket";
import EditTicket from "./pages/EditTicket";
import TicketDetail from "./pages/TicketDetail";
import CreateTechnicalReport from "./pages/CreateTechnicalReport";
import EditTechnicalReport from "./pages/EditTechnicalReport";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import VehicleData from "./pages/VehicleData";
import MasterData from "./pages/MasterData";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BukuPintar from "./pages/BukuPintar";
import ComplainCompass from "./pages/ComplainCompass";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TicketList />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/create"
              element={
                <WriterRoute>
                  <AppLayout>
                    <CreateTicket />
                  </AppLayout>
                </WriterRoute>
              }
            />
            <Route
              path="/tickets/:ticketId"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TicketDetail />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/:ticketId/edit"
              element={
                <WriterRoute>
                  <AppLayout>
                    <EditTicket />
                  </AppLayout>
                </WriterRoute>
              }
            />
            <Route
              path="/tickets/:ticketId/technical-report"
              element={
                <WriterRoute>
                  <AppLayout>
                    <CreateTechnicalReport />
                  </AppLayout>
                </WriterRoute>
              }
            />
            <Route
              path="/tickets/:ticketId/technical-report/edit"
              element={
                <WriterRoute>
                  <AppLayout>
                    <EditTechnicalReport />
                  </AppLayout>
                </WriterRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Reports />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/buku-pintar"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <BukuPintar />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/complain-compass"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ComplainCompass />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <AdminRoute>
                  <AppLayout>
                    <UserManagement />
                  </AppLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/vehicles"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <VehicleData />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/master-data"
              element={
                <AdminRoute>
                  <AppLayout>
                    <MasterData />
                  </AppLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <AdminRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
