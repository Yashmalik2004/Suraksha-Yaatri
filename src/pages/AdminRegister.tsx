import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Key, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    authorityCode: "",
    otp: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      // Simulate OTP sending
      setStep(2);
    } else if (step === 2) {
      // Simulate form completion and show success
      setStep(3);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Official Email ID</Label>
              <div className="flex">
                <div className="flex items-center px-3 border border-r-0 border-input bg-muted rounded-l-lg">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="admin@authority.gov.in"
                  className="rounded-l-none"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="authorityCode">Authority Code</Label>
              <div className="flex">
                <div className="flex items-center px-3 border border-r-0 border-input bg-muted rounded-l-lg">
                  <Key className="h-4 w-4" />
                </div>
                <Input
                  id="authorityCode"
                  value={formData.authorityCode}
                  onChange={(e) => setFormData({...formData, authorityCode: e.target.value})}
                  placeholder="AUTH-2024-XXXX"
                  className="rounded-l-none"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Contact your supervising authority for this code
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Send Verification OTP
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit OTP to {formData.email}
              </p>
            </div>
            
            <div>
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                value={formData.otp}
                onChange={(e) => setFormData({...formData, otp: e.target.value})}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Complete Application
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => setStep(1)}
            >
              Resend OTP
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center">
            <div>
              <CheckCircle className="h-16 w-16 text-safety mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Application Submitted</h3>
              <p className="text-muted-foreground mt-2">
                Your admin access request has been sent to the Super Admin for approval. 
                You'll receive an email confirmation once your account is approved.
              </p>
            </div>
            
            <div className="bg-authority-light p-4 rounded-lg">
              <p className="text-sm font-medium">Application Details:</p>
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <p>Name: {formData.name}</p>
                <p>Email: {formData.email}</p>
                <p>Authority Code: {formData.authorityCode}</p>
                <p>Status: Pending Approval</p>
              </div>
            </div>

            <Button 
              onClick={() => navigate("/")}
              className="w-full" 
              size="lg"
            >
              Return to Home
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              {step < 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => step === 1 ? navigate("/") : setStep(step - 1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <CardTitle className="text-authority">Admin Registration</CardTitle>
                {step < 3 && <p className="text-sm text-muted-foreground">Step {step} of 2</p>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {step < 3 ? (
              <form onSubmit={handleSubmit}>
                {renderStep()}
              </form>
            ) : (
              renderStep()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRegister;