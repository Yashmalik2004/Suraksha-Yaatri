import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, UserCheck } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(194, 228, 240, 0.9), rgba(24, 18, 209, 0.8)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-md space-y-6">
        {/* App Header */}
        <div className="text-center text-white space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Safe Path</h1>
          <p className="text-white/80">Emergency Response & Safety Management</p>
        </div>

        {/* Registration Options */}
        <div className="space-y-4">
          <Card className="shadow-authority">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Register as User</CardTitle>
              <CardDescription>
                Access safety features, emergency contacts, and real-time alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate("/register/user")}
              >
                Get Started as User
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-authority">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <UserCheck className="h-8 w-8 text-authority" />
              </div>
              <CardTitle>Register as Admin</CardTitle>
              <CardDescription>
                Manage danger zones, verify blockchain IDs, and coordinate emergency response
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => navigate("/register/admin")}
              >
                Apply for Admin Access
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-white/80 text-sm">
            Already have an account?{" "}
            <button 
              onClick={() => navigate("/login")}
              className="text-white underline hover:text-white/80 transition-smooth"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;