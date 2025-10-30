import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"user" | "admin">("user");
  const [formData, setFormData] = useState({
    credential: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.credential) {
      alert(userType === "admin" ? "Email is required" : "Blockchain ID is required");
      return;
    }
    if (!formData.password) {
      alert("Password is required");
      return;
    }

    try {
      // Prepare payload
      const body =
        userType === "admin"
          ? { email: formData.credential, password: formData.password }
          : { blockchain_id: formData.credential, password: formData.password };

      const res = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        // Save user info in localStorage
        localStorage.setItem("user", JSON.stringify({ ...data, userType }));

        alert(`Welcome ${data.name}!`);
        navigate(userType === "admin" ? "/admin/dashboard" : "/user/dashboard");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error during login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Login to SafePath</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* User Type Selection */}
            <div>
              <Label>Login as</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={userType === "user" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUserType("user")}
                  className="flex-1"
                >
                  User
                </Button>
                <Button
                  type="button"
                  variant={userType === "admin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUserType("admin")}
                  className="flex-1"
                >
                  Admin
                </Button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="credential">
                  {userType === "admin" ? "Email Address" : "Blockchain Digital ID"}
                </Label>
                <div className="flex">
                  <div className="flex items-center px-3 border border-r-0 border-input bg-muted rounded-l-lg">
                    {userType === "admin" ? <Mail className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                  </div>
                  <Input
                    id="credential"
                    value={formData.credential}
                    onChange={(e) => setFormData({ ...formData, credential: e.target.value })}
                    placeholder={userType === "admin" ? "admin@authority.gov.in" : "BID-1234567890-ABCDEFGH"}
                    className="rounded-l-none"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Login as {userType === "user" ? "User" : "Admin"}
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => navigate("/register")}
                className="text-sm text-primary hover:underline"
              >
                Don't have an account? Register here
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
