import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadScriptNext } from "@react-google-maps/api"; // ✅ use LoadScriptNext

import Landing from "./pages/Landing";
import UserRegister from "./pages/UserRegister";
import AdminRegister from "./pages/AdminRegister";
import Login from "./pages/Login";
import UserDashboard from "./pages/user/UserDashboard";
import UserSOS from "./pages/user/UserSOS";
import UserProfile from "./pages/user/UserProfile";
import BlockchainID from "./pages/user/BlockchainID";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGeofencing from "./pages/admin/AdminGeofencing";
import AdminVerification from "./pages/admin/AdminVerification";
import AdminContacts from "./pages/admin/AdminContacts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/*  Load Google Maps script once globally */}
        <LoadScriptNext
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={["places"]}
        >
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register/user" element={<UserRegister />} />
            <Route path="/register/admin" element={<AdminRegister />} />
            <Route path="/login" element={<Login />} />

            {/* User Routes */}
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/sos" element={<UserSOS />} />
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/blockchain" element={<BlockchainID />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/geofencing" element={<AdminGeofencing />} />
            <Route path="/admin/verification" element={<AdminVerification />} />
            <Route path="/admin/contacts" element={<AdminContacts />} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LoadScriptNext>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
