"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Shield, Plus, X, Trash2 } from "lucide-react";
import AdminNavigation from "@/components/AdminNavigation";
import { GoogleMap, Marker, Circle, Autocomplete } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "400px", borderRadius: "12px" };
const defaultCenter = { lat: 12.9716, lng: 77.5946 };
const API_URL = "http://localhost:5000";

interface DangerZone {
  id: number;
  name: string;
  type: string;
  severity: "high" | "medium" | "low";
  shape: "circle";
  coordinates: string;
  lat: number;
  lng: number;
  radius?: number;
  status: "active" | "inactive";
  createdDate: string;
}

const severityColorMap = { high: "red", medium: "orange", low: "yellow" };

const AdminGeofencing = () => {
  const [center, setCenter] = useState(defaultCenter);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newZone, setNewZone] = useState<Omit<DangerZone, "id" | "createdDate" | "lat" | "lng">>({
    name: "",
    type: "",
    severity: "low",
    shape: "circle",
    coordinates: "",
    radius: 100,
    status: "active",
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchRef = useRef<google.maps.places.Autocomplete | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const [searchMarker, setSearchMarker] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch danger zones from backend
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await fetch(`${API_URL}/api/danger-zones`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const zones = (Array.isArray(data) ? data : []).map((zone: any) => {
          const [lat, lng] = zone.coordinates.split(",").map((c: string) => parseFloat(c.trim()));
          return { ...zone, lat, lng, radius: zone.radius || 100 };
        });
        setDangerZones(zones);
      } catch (err) {
        console.error("Failed to fetch zones:", err);
      }
    };
    fetchZones();
  }, []);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocation(loc);
          setCenter(loc);
        },
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  // Danger zone autocomplete
  const handlePlaceChanged = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (!place?.geometry) return;
    const loc = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
    setCenter(loc);
    setNewZone({ ...newZone, coordinates: `${loc.lat},${loc.lng}` });
  };

  // Manual search autocomplete
  const handleSearchPlaceChanged = () => {
    if (!searchRef.current) return;
    const place = searchRef.current.getPlace();
    if (!place?.geometry) return;
    const loc = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
    setCenter(loc);
    setSearchMarker(loc);
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const loc = { lat: e.latLng.lat(), lng: e.latLng.lng() };

    // If adding/editing new zone, move its center
    if (showAddForm) {
      setNewZone({ ...newZone, coordinates: `${loc.lat},${loc.lng}` });
    } else {
      setSearchMarker(loc); // otherwise, move search marker
    }

    setCenter(loc);
  };

  const handleAddZone = async () => {
    if (!newZone.name || !newZone.type || !newZone.coordinates) return alert("Please fill all fields!");
    try {
      const res = await fetch(`${API_URL}/api/danger-zones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newZone),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const [lat, lng] = newZone.coordinates.split(",").map((c) => parseFloat(c.trim()));

      setDangerZones([
        ...dangerZones,
        { ...newZone, id: data.id, createdDate: new Date().toISOString().split("T")[0], lat, lng },
      ]);

      setNewZone({ name: "", type: "", severity: "low", shape: "circle", coordinates: "", radius: 100, status: "active" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add zone:", err);
      alert("Failed to save zone. Check console for details.");
    }
  };

  const handleDeleteZone = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/danger-zones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      setDangerZones(dangerZones.filter((z) => z.id !== id));
    } catch (err) {
      console.error("Failed to delete zone:", err);
      alert("Failed to delete zone.");
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const getCircleColor = (severity: "high" | "medium" | "low") => severityColorMap[severity];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-authority text-authority-foreground px-4 py-3 flex items-center gap-3">
        <Shield className="h-8 w-8" />
        <div>
          <h1 className="text-xl font-semibold">Geo-fencing Management</h1>
          <p className="text-authority-foreground/80">Manage danger zones</p>
        </div>
      </header>

      <main className="flex-1 p-4 pb-20 space-y-6">
        {/* Manual Search Section */}
        <Card className="shadow-card mb-4">
          <CardHeader>
            <CardTitle>Search Any Location</CardTitle>
          </CardHeader>
          <CardContent>
            <Autocomplete onLoad={(ref) => (searchRef.current = ref)} onPlaceChanged={handleSearchPlaceChanged}>
              <Input placeholder="Search for a place..." />
            </Autocomplete>
          </CardContent>
        </Card>

        {/* Map Section */}
        <Card className="shadow-card">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Interactive Map
            </CardTitle>
            <Button variant="authority" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Zone
            </Button>
          </CardHeader>
          <CardContent>
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15} onClick={handleMapClick}>
              {currentLocation && (
                <Marker
                  position={currentLocation}
                  label="You"
                  icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
                />
              )}

              {searchMarker && <Marker position={searchMarker} label="Searched" />}

              {/* Existing Danger Zones */}
              {dangerZones.map((zone) => (
                <Circle
                  key={zone.id}
                  center={{ lat: zone.lat, lng: zone.lng }}
                  radius={zone.radius || 100}
                  options={{ fillColor: getCircleColor(zone.severity), fillOpacity: 0.3, strokeWeight: 1 }}
                />
              ))}

              {/* New Danger Zone */}
              {newZone.coordinates && (() => {
                const [lat, lng] = newZone.coordinates.split(",").map((c) => parseFloat(c.trim()));
                if (isNaN(lat) || isNaN(lng)) return null;
                return (
                  <Circle
                    center={{ lat, lng }}
                    radius={newZone.radius || 100}
                    options={{ fillColor: getCircleColor(newZone.severity), fillOpacity: 0.3, strokeWeight: 1 }}
                    draggable
                    editable
                    onLoad={(circle) => (circleRef.current = circle)}
                    onDragEnd={() => {
                      if (circleRef.current) {
                        const c = circleRef.current.getCenter();
                        setNewZone((prev) => ({ ...prev, coordinates: `${c.lat()},${c.lng()}` }));
                        setCenter({ lat: c.lat(), lng: c.lng() });
                      }
                    }}
                    onRadiusChanged={() => {
                      if (circleRef.current) setNewZone((prev) => ({ ...prev, radius: circleRef.current?.getRadius() || 100 }));
                    }}
                  />
                );
              })()}
            </GoogleMap>
          </CardContent>
        </Card>

        {/* Add Zone Form */}
        {showAddForm && (
          <Card className="shadow-card border-primary">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Add New Danger Zone</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={handlePlaceChanged}>
                <Input placeholder="Search place for danger zone" />
              </Autocomplete>

              <div>
                <Label>Zone Name</Label>
                <Input value={newZone.name} onChange={(e) => setNewZone({ ...newZone, name: e.target.value })} />
              </div>

              <div>
                <Label>Zone Type</Label>
                <Input value={newZone.type} onChange={(e) => setNewZone({ ...newZone, type: e.target.value })} />
              </div>

              <div>
                <Label>Severity</Label>
                <select
                  className="w-full border rounded p-2"
                  value={newZone.severity}
                  onChange={(e) => setNewZone({ ...newZone, severity: e.target.value as "high" | "medium" | "low" })}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <Label>Radius (meters)</Label>
                <Input
                  type="number"
                  value={newZone.radius}
                  onChange={(e) => setNewZone({ ...newZone, radius: parseFloat(e.target.value) })}
                />
              </div>

              <div className="flex gap-2 mt-2">
                <Button className="flex-1" onClick={handleAddZone}>
                  Save Zone
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Zones List */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Active Danger Zones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dangerZones.map((zone) => (
              <div
                key={zone.id}
                className="p-4 bg-accent rounded-lg border-l-4 border-l-primary flex justify-between items-start"
              >
                <div>
                  <h3 className="font-semibold">{zone.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {getSeverityBadge(zone.severity)}
                    <Badge>{zone.shape}</Badge>
                  </div>
                  <p className="text-sm mt-1">
                    Coordinates: {zone.coordinates} | Radius: {zone.radius}m
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteZone(zone.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      <AdminNavigation currentPage="geofencing" />
    </div>
  );
};

export default AdminGeofencing;
