import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/auth/AuthForm";
import { Navbar } from "@/components/layout/Navbar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NewScreen from "./pages/NewScreen";
import ScreenInventory from "./pages/ScreenInventory";
import ScreenContent from "./pages/ScreenContent";
import CreateCampaign from "./pages/CreateCampaign";
import Campaigns from "./pages/Campaigns";
import DiscoverScreens from "./pages/DiscoverScreens";
import Bookings from "./pages/Bookings";
import Analytics from "./pages/Analytics";
import ScreenSettings from "./pages/ScreenSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <AuthForm />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Redirect authenticated users from auth page to dashboard
  if (user && location.pathname === '/auth') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <Index />} 
        />
        <Route path="/auth" element={<AuthForm />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screens/new" 
          element={
            <ProtectedRoute>
              <NewScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screens/inventory" 
          element={
            <ProtectedRoute>
              <ScreenInventory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screens/content" 
          element={
            <ProtectedRoute>
              <ScreenContent />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/campaigns/new" 
          element={
            <ProtectedRoute>
              <CreateCampaign />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/campaigns" 
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/discover" 
          element={
            <ProtectedRoute>
              <DiscoverScreens />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bookings" 
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <ScreenSettings />
            </ProtectedRoute>
          } 
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
