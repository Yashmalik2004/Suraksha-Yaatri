"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  MapPin,
  Users,
  Clock,
} from "lucide-react";
import UserNavigation from "@/components/UserNavigation";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  Autocomplete,
  DirectionsRenderer,
  Circle,
} from "@react-google-maps/api";
import { io, Socket } from "socket.io-client";

const API_URL = "http://localhost:5000";
const SOCKET_URL = "http://localhost:5000";

interface Alert {
  id: number;
  type: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  priority?: string;
  time?: string;
  created_at?: string;
  message?: string;
}

interface DangerZone {
  id: number;
  name: string;
  type: string;
  severity: "high" | "medium" | "low";
  shape: "circle";
  coordinates: string;
  radius: number;
  status: "active" | "inactive";
}

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
}

const isDangerZone = (zone: Alert | DangerZone): zone is DangerZone =>
  (zone as DangerZone).coordinates !== undefined;

const UserDashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [publishedAlerts, setPublishedAlerts] = useState<Alert[]>([]);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ lat: 28.6139, lng: 77.209 });
  const [selectedZone, setSelectedZone] = useState<Alert | DangerZone | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const containerStyle = { width: "100%", height: "400px" };

  // Fetch live alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_URL}/alerts/live`);
        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAlerts();
  }, []);

  // Fetch published alerts
  useEffect(() => {
    const fetchPublished = async () => {
      try {
        const res = await fetch(`${API_URL}/alerts/published`);
        const data = await res.json();
        setPublishedAlerts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPublished();
  }, []);

  // Fetch danger zones
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await fetch(`${API_URL}/api/danger-zones`);
        const data = await res.json();
        setDangerZones(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchZones();
  }, []);

  // Expire published alerts after 5 mins
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setPublishedAlerts((prev) =>
        prev.filter(
          (a) => now - new Date(a.created_at || "").getTime() < 5 * 60 * 1000
        )
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Socket.io setup
  useEffect(() => {
    const socket: Socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("new-alert", (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 20));
      setNotifications((prev) => [
        {
          id: alert.id,
          type: alert.type === "weapon" ? "danger" : "alert",
          message: `New ${alert.type} alert at ${alert.location || "unknown"}`,
          time: new Date(alert.time || Date.now()).toLocaleTimeString(),
        },
        ...prev,
      ]);
    });

    socket.on("published-alert", (alert: Alert) => {
      setPublishedAlerts((prev) => [alert, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(loc);
        setMapCenter(loc);
      });
    }
  }, []);

  // Handle search
  const handlePlaceChanged = () => {
    if (!autocompleteRef.current || !mapRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      setMapCenter({ lat, lng });
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(14);

      if (currentLocation) {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route(
          {
            origin: currentLocation,
            destination: { lat, lng },
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === "OK" && result) setDirections(result);
          }
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Suraksha Yaatri Dashboard</h1>
        <Bell className="h-5 w-5 text-primary" />
      </header>

      <main className="flex-1 p-4 pb-20 space-y-6">
        {/* Live Safety Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Live Safety Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Autocomplete
              onLoad={(ref) => (autocompleteRef.current = ref)}
              onPlaceChanged={handlePlaceChanged}
            >
              <input
                type="text"
                placeholder="Search destination"
                className="border p-2 rounded w-full mb-2"
              />
            </Autocomplete>

            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={13}
              onLoad={(map) => { mapRef.current = map; }}
            >
              {currentLocation && (
                <Marker
                  position={currentLocation}
                  label="You"
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  }}
                />
              )}

              {alerts.map(
                (a) =>
                  a.latitude &&
                  a.longitude && (
                    <Marker
                      key={a.id}
                      position={{
                        lat: parseFloat(a.latitude),
                        lng: parseFloat(a.longitude),
                      }}
                      icon={{
                        url:
                          a.type === "weapon"
                            ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                            : "http://maps.google.com/mapfiles/ms/icons/orange-dot.png",
                      }}
                      onClick={() => setSelectedZone(a)}
                    />
                  )
              )}

              {dangerZones.map((zone) => {
                const [lat, lng] = zone.coordinates.split(",").map(Number);
                return (
                  <Circle
                    key={zone.id}
                    center={{ lat, lng }}
                    radius={zone.radius || 100}
                    options={{
                      fillColor:
                        zone.severity === "high"
                          ? "red"
                          : zone.severity === "medium"
                          ? "orange"
                          : "yellow",
                      fillOpacity: 0.2,
                      strokeColor:
                        zone.severity === "high"
                          ? "red"
                          : zone.severity === "medium"
                          ? "orange"
                          : "yellow",
                      strokeOpacity: 0.5,
                      strokeWeight: 2,
                    }}
                    onClick={() => setSelectedZone(zone)}
                  />
                );
              })}

              {selectedZone && (
                <InfoWindow
                  position={
                    isDangerZone(selectedZone)
                      ? (() => {
                          const [lat, lng] = selectedZone.coordinates
                            .split(",")
                            .map(Number);
                          return { lat, lng };
                        })()
                      : {
                          lat: parseFloat(selectedZone.latitude!),
                          lng: parseFloat(selectedZone.longitude!),
                        }
                  }
                  onCloseClick={() => setSelectedZone(null)}
                >
                  <div>
                    <h3 className="font-semibold">
                      {isDangerZone(selectedZone)
                        ? selectedZone.name
                        : selectedZone.type.toUpperCase()}
                    </h3>
                    <p>
                      {isDangerZone(selectedZone)
                        ? selectedZone.name
                        : selectedZone.location}
                    </p>
                    {"priority" in selectedZone && selectedZone.priority && (
                      <p>Priority: {selectedZone.priority}</p>
                    )}
                  </div>
                </InfoWindow>
              )}

              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </CardContent>
        </Card>

        {/* Community Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Community Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-y-auto">
            {publishedAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No alerts published yet.</p>
            ) : (
              publishedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-accent rounded-lg border-l-4 border-l-warning"
                >
                  <p className="font-medium">{alert.type.toUpperCase()}</p>
                  <p>{alert.location || "Unknown location"}</p>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.created_at
                      ? new Date(alert.created_at).toLocaleTimeString()
                      : ""}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>

      <UserNavigation currentPage="dashboard" />
    </div>
  );
};

export default UserDashboard;
