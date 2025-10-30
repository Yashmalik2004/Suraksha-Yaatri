import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Key, Shield, CheckCircle, Copy, Download, RefreshCw } from "lucide-react";

const BlockchainID = () => {
  const navigate = useNavigate();
  const [blockchainID, setBlockchainID] = useState("BC-2024-AJ-789456123");
  const [verificationStatus, setVerificationStatus] = useState("verified");
  const [generatingNew, setGeneratingNew] = useState(false);

  const handleGenerateNew = () => {
    setGeneratingNew(true);
    // Simulate blockchain ID generation
    setTimeout(() => {
      setBlockchainID(`BC-2024-AJ-${Math.random().toString().slice(2, 11)}`);
      setGeneratingNew(false);
    }, 2000);
  };

  const handleCopyID = () => {
    navigator.clipboard.writeText(blockchainID);
    // Could add toast notification here
  };

  const verificationData = {
    name: "Alex Johnson",
    aadhaar: "1234 5678 9012",
    phone: "+91 98765 43210",
    email: "alex.johnson@email.com",
    dateGenerated: "2024-01-15",
    lastVerified: "2024-01-15",
    blockNumber: "856743",
    transactionHash: "0x9b2f8a3c1e5d7g9h2k4l6m8n0p1q3r5s7t9u1v3w5x7y9z",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/user/profile")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">Blockchain Digital ID</h1>
            <p className="text-sm text-muted-foreground">Secure Identity Verification</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20">
        <div className="space-y-6">
          {/* Current Blockchain ID */}
          <Card className="shadow-card border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Key className="h-5 w-5" />
                  Your Blockchain ID
                </CardTitle>
                <Badge 
                  variant={verificationStatus === "verified" ? "default" : "secondary"}
                  className="bg-safety text-safety-foreground"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-lg font-mono text-center break-all">{blockchainID}</p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleCopyID}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy ID
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGenerateNew}
                disabled={generatingNew}
              >
                {generatingNew ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating New ID...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New ID
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Verification Details */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Verification Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{verificationData.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Aadhaar</p>
                  <p className="font-medium">{verificationData.aadhaar}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{verificationData.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{verificationData.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Blockchain Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date Generated</p>
                  <p className="font-medium">{verificationData.dateGenerated}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Verified</p>
                  <p className="font-medium">{verificationData.lastVerified}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Block Number</p>
                  <p className="font-medium font-mono">{verificationData.blockNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Transaction Hash</p>
                  <p className="font-medium font-mono text-xs break-all">
                    {verificationData.transactionHash}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="shadow-card border-warning">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-warning mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-warning">Security Notice</p>
                  <p className="text-muted-foreground mt-1">
                    Your blockchain ID is cryptographically secured and cannot be tampered with. 
                    Keep this ID safe and never share it with unauthorized parties.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BlockchainID;