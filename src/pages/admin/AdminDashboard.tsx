// frontend/src/pages/AdminDashboard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertTriangle,
  Users,
  MapPin,
  Shield,
  Clock,
  CheckCircle,
  LogOut,
  Zap,
} from "lucide-react";
import AdminNavigation from "@/components/AdminNavigation";
import SplashScreen from "@/components/SplashScreen";

const SOCKET_URL = "http://localhost:5000";
const API_URL = "http://localhost:5000";

interface Alert {
  id: number;
  type: string;
  status: "active" | "acknowledged" | "resolved" | string;
  location?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  resolved_at?: string;
}

interface DetectedWeapon {
  type: string;
  location: string;
  confidence: number;
  timestamp: string;
  latitude: number;
  longitude: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [resolvedAlerts, setResolvedAlerts] = useState<Alert[]>([]);
  const [showWeaponScanModal, setShowWeaponScanModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedWeapons, setDetectedWeapons] = useState<DetectedWeapon[]>([]);
  const [scanStatus, setScanStatus] = useState("Initializing scan...");
  const lastAlertTimeRef = useRef<number>(0);
  const socketRef = useRef<Socket | null>(null);

  // --- Splash screen logic ---
  useEffect(() => {
    const shown = sessionStorage.getItem("hasShownAdminSplash");
    if (!shown) {
      setShowSplash(true);
      sessionStorage.setItem("hasShownAdminSplash", "true");
    }
  }, []);
  const handleSplashComplete = () => setShowSplash(false);

  // --- Logout ---
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  // --- Fetch alerts from API ---
  const fetchAlerts = async () => {
    try {
      const [activeRes, resolvedRes] = await Promise.all([
        fetch(`${API_URL}/alerts/live`).then((res) => res.json()),
        fetch(`${API_URL}/alerts/resolved`).then((res) => res.json()),
      ]);
      setActiveAlerts(Array.isArray(activeRes) ? activeRes : []);
      setResolvedAlerts(Array.isArray(resolvedRes) ? resolvedRes : []);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // --- Socket.io for real-time alerts ---
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => console.log("✅ Connected to socket.io"));
    socket.on("disconnect", () => console.log("❌ Disconnected from socket.io"));

    // New traditional alerts
    socket.on("new-alert", (alert: Alert) => {
      const now = Date.now();
      if (now - lastAlertTimeRef.current > 1000) {
        setActiveAlerts((prev) => [alert, ...prev].slice(0, 20));
        lastAlertTimeRef.current = now;
      }
    });

    // AI alerts: crowd behavior, weapon detection, geofencing alerts
    socket.on("ai-alert", (alert: Alert) => {
      console.log("🤖 AI Alert:", alert);
      setActiveAlerts((prev) => [alert, ...prev].slice(0, 20));
    });

    // Weapon detection events from scan
    socket.on("weapon-detected", (weapon: DetectedWeapon) => {
      console.log("🔫 Weapon Detected:", weapon);
      setDetectedWeapons((prev) => [weapon, ...prev]);
      // Automatically add to active alerts
      const alert: Alert = {
        id: Date.now(),
        type: "weapon",
        status: "active",
        location: weapon.location,
        latitude: weapon.latitude,
        longitude: weapon.longitude,
        created_at: new Date().toISOString(),
      };
      setActiveAlerts((prev) => [alert, ...prev].slice(0, 20));
    });

    // Scan start/stop events
    socket.on("scan-started", () => {
      setScanStatus("Scan started... Initializing camera and AI model");
    });

    socket.on("scan-status", (data: { message: string }) => {
      setScanStatus(data.message);
    });

    socket.on("scan-complete", () => {
      setIsScanning(false);
      setScanStatus("Scan complete");
    });

    socket.on("scan-error", (data: { error: string }) => {
      setIsScanning(false);
      setScanStatus(`Error: ${data.error}`);
    });

    // Resolved alerts
    socket.on("alert-resolved", ({ alert }: { alert: Alert }) => {
      setActiveAlerts((prev) => prev.filter((a) => a.id !== alert.id));
      setResolvedAlerts((prev) => [alert, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  // --- Alert actions ---
  const handleResolve = async (id: number) => {
    try {
      await fetch(`${API_URL}/alerts/resolve/${id}`, { method: "PUT" });
    } catch (err) {
      console.error("❌ Failed to resolve alert:", err);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await fetch(`${API_URL}/alerts/publish/${id}`, { method: "POST" });
      alert("✅ Alert published to community!");
    } catch (err) {
      console.error("❌ Failed to publish alert:", err);
    }
  };

  const handleDownloadHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/alerts/download`);
      if (!res.ok) throw new Error("Failed to download history");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "alert_history.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Download error:", err);
    }
  };

  const handleStartWeaponScan = async () => {
    try {
      setShowWeaponScanModal(true);
      setIsScanning(true);
      setDetectedWeapons([]);
      setScanStatus("Initializing scan...");

      const response = await fetch(`${API_URL}/ai/weapon-scan`, {
        method: "POST",
      });

      if (!response.ok) {
        setScanStatus(`Error: ${response.statusText}`);
        setIsScanning(false);
        return;
      }

      const data = await response.json();
      console.log("✅ Weapon scan response:", data);
    } catch (err) {
      console.error("❌ Weapon scan error:", err);
      setScanStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      setIsScanning(false);
    }
  };

  const handleStopWeaponScan = async () => {
    try {
      await fetch(`${API_URL}/ai/stop-scan`, { method: "POST" });
      setIsScanning(false);
      setScanStatus("Scan stopped");
    } catch (err) {
      console.error("❌ Stop scan error:", err);
    }
  };

  if (showSplash) return <SplashScreen onComplete={handleSplashComplete} />;

  const stats = {
    activeAlerts: activeAlerts.length,
    totalUsers: 1247, // TODO: fetch from backend
    dangerZones: 8,   // TODO: fetch from backend
    resolvedToday: resolvedAlerts.length,
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "weapon":
      case "emergency":
        return <AlertTriangle className="h-4 w-4 text-emergency" />;
      case "danger-zone":
        return <MapPin className="h-4 w-4 text-warning" />;
      case "verification":
        return <Shield className="h-4 w-4 text-primary" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="destructive">Active</Badge>;
      case "acknowledged":
        return (
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
            Acknowledged
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="secondary" className="bg-safety text-safety-foreground">
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-authority text-authority-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <h1 className="text-xl font-semibold">Admin Portal</h1>
            <p className="text-authority-foreground/80">Emergency Management Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="warning" 
            size="sm" 
            onClick={handleStartWeaponScan}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Start Weapon Scan
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-6 w-6 text-destructive" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-20 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-emergency">{stats.activeAlerts}</p>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-emergency" />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning">{stats.dangerZones}</p>
                <p className="text-sm text-muted-foreground">Danger Zones</p>
              </div>
              <MapPin className="h-8 w-8 text-warning" />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-safety">{stats.resolvedToday}</p>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
              </div>
              <CheckCircle className="h-8 w-8 text-safety" />
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Alerts */}
          <Card className="shadow-card max-h-[500px] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-emergency" /> Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active alerts.</p>
              ) : (
                activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 bg-accent rounded-lg border-l-4 border-l-primary"
                  >
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{alert.type.toUpperCase()}</p>
                          {getStatusBadge(alert.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {alert.location ?? `${alert.latitude}, ${alert.longitude}`}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />{" "}
                          {new Date(alert.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="safety" size="sm" onClick={() => handleResolve(alert.id)}>
                        Resolve
                      </Button>
                      <Button variant="warning" size="sm" onClick={() => handlePublish(alert.id)}>
                        Publish
                      </Button>
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Resolved Alerts */}
          <Card className="shadow-card max-h-[500px] overflow-y-auto">
            <div className="flex justify-end p-2">
              <Button size="sm" variant="safety" onClick={handleDownloadHistory}>
                Download Full History
              </Button>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-safety" /> Resolved Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resolvedAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No resolved alerts yet.</p>
              ) : (
                resolvedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 bg-accent rounded-lg border-l-4 border-l-safety"
                  >
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <p className="font-medium">{alert.type.toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.location ?? `${alert.latitude}, ${alert.longitude}`}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />{" "}
                          {alert.resolved_at ? new Date(alert.resolved_at).toLocaleTimeString() : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Weapon Scan Modal */}
      <Dialog open={showWeaponScanModal} onOpenChange={setShowWeaponScanModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" />
              Weapon Detection Scan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Scan Status */}
            <div className="p-4 bg-accent rounded-lg border border-border">
              <p className="text-sm font-medium">Status: {scanStatus}</p>
              {isScanning && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Scanning in progress...</span>
                </div>
              )}
            </div>

            {/* Detected Weapons */}
            <div>
              <h3 className="text-sm font-semibold mb-2">
                Detected Weapons ({detectedWeapons.length})
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {detectedWeapons.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No weapons detected yet...
                  </p>
                ) : (
                  detectedWeapons.map((weapon, index) => (
                    <div
                      key={index}
                      className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {weapon.type.toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Location: {weapon.location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Confidence: {(weapon.confidence * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Coordinates: {weapon.latitude.toFixed(6)}, {weapon.longitude.toFixed(6)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Time: {new Date(weapon.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowWeaponScanModal(false);
                  if (isScanning) handleStopWeaponScan();
                }}
              >
                Close
              </Button>
              {isScanning && (
                <Button variant="destructive" onClick={handleStopWeaponScan}>
                  Stop Scan
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AdminNavigation currentPage="dashboard" />
    </div>
  );
};

export default AdminDashboard;
