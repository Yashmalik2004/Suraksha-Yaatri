import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, LogOut, Shield, Edit, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import UserNavigation from "@/components/UserNavigation";

const API_BASE = "http://localhost:5000";

// Helper to truncate blockchain addresses
const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
};

interface ProfileData {
  name: string;
  phone: string;
  aadhar_no: string;
  password: string;
  blockchain_id: string;
}

const UserProfile = () => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [showBlockchainId, setShowBlockchainId] = useState(false);
  const [verificationPassword, setVerificationPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Get logged-in user from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const blockchainId = user?.blockchain_id;

  useEffect(() => {
    if (!user || !blockchainId) {
      alert("You must be logged in");
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/profile/${blockchainId}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data: ProfileData = await res.json();
        setProfileData(data);
      } catch (err) {
        console.error(err);
        alert("Error fetching profile data");
      }
    };

    fetchProfile();
  }, [blockchainId, navigate, user]);

  const handleSave = () => {
    setEditMode(false);
    // TODO: Send updated profile data to backend if needed
  };

  const handleVerifyPassword = () => {
    if (!profileData) return;
    setIsVerifying(true);
    setTimeout(() => {
      if (verificationPassword === profileData.password) {
        setShowBlockchainId(true);
      } else {
        alert("Incorrect password");
      }
      setIsVerifying(false);
      setVerificationPassword("");
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!profileData) return <p className="p-4">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-4 py-3 flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-xl font-semibold">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account</p>
        </div>
      </header>

      <main className="flex-1 p-4 pb-20 space-y-6">
        {/* Profile Photo */}
        <Card className="shadow-card">
          <CardContent className="pt-6 flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profileData.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="icon"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold">{profileData.name}</h2>
              <p className="text-muted-foreground">SafePath</p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="shadow-card">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Personal Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (editMode ? handleSave() : setEditMode(true))}
            >
              {editMode ? "Save Changes" : <><Edit className="h-4 w-4" /> Edit</>}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                disabled={!editMode}
                onChange={e => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                disabled={!editMode}
                onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="aadhaar">Aadhaar Number</Label>
              <Input id="aadhaar" value={profileData.aadhar_no} disabled className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        {/* Blockchain ID */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Blockchain Digital ID
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showBlockchainId ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" /> View Blockchain ID
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Verify Password</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={verificationPassword}
                      onChange={e => setVerificationPassword(e.target.value)}
                    />
                    <Button
                      onClick={handleVerifyPassword}
                      disabled={isVerifying || !verificationPassword}
                      className="w-full"
                    >
                      {isVerifying ? "Verifying..." : "Verify & Show ID"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <Label className="text-sm font-medium">Your Blockchain ID</Label>
                  <div className="bg-background p-3 rounded border mt-2">
                    <code className="text-sm font-mono break-all">{profileData.blockchain_id}</code>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setShowBlockchainId(false)}>Hide ID</Button>
              </div>
            )}
            {!showBlockchainId && (
              <p className="text-xs text-muted-foreground">
                (Blockchain ID will be truncated in alerts, full ID available after verification)
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6 space-y-3">
            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </CardContent>
        </Card>
      </main>

      <UserNavigation currentPage="profile" />
    </div>
  );
};

export default UserProfile;
