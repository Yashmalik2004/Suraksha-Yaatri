import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, Shield, CheckCircle, XCircle, Search, User, Clock } from "lucide-react";
import AdminNavigation from "@/components/AdminNavigation";

const API_BASE = "http://localhost:5000";

const AdminVerification = () => {
  const [blockchainID, setBlockchainID] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);

  const handleVerification = async () => {
    if (!blockchainID.trim()) return;

    setIsVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/users/verify/${blockchainID}`);
      const data = await res.json();

      if (res.ok && data.valid) {
        setVerificationResult({
          blockchainID,
          status: "valid",
          userDetails: data.userDetails,
          timestamp: new Date().toLocaleString(),
          errorReason: null,
        });

        setRecentVerifications(prev => [
          {
            id: prev.length + 1,
            blockchainID,
            userName: data.userDetails.name,
            status: "valid",
            timestamp: new Date().toLocaleString(),
            verifiedBy: "Admin",
          },
          ...prev,
        ]);
      } else {
        setVerificationResult({
          blockchainID,
          status: "invalid",
          userDetails: null,
          timestamp: new Date().toLocaleString(),
          errorReason: data.error || "Blockchain ID not found",
        });

        setRecentVerifications(prev => [
          {
            id: prev.length + 1,
            blockchainID,
            userName: "Unknown",
            status: "invalid",
            timestamp: new Date().toLocaleString(),
            verifiedBy: "Admin",
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error(err);
      alert("Server error during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  const clearResults = () => {
    setVerificationResult(null);
    setBlockchainID("");
  };

  const getStatusBadge = (status: string) => {
    return status === "valid" ? (
      <Badge variant="default" className="bg-safety text-safety-foreground gap-1">
        <CheckCircle className="h-3 w-3" />
        Valid
      </Badge>
    ) : (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Invalid
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-authority text-authority-foreground px-4 py-3">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <h1 className="text-xl font-semibold">Blockchain ID Verification</h1>
            <p className="text-authority-foreground/80">Verify user blockchain digital identities</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 pb-20">
        <div className="space-y-6">
          <Card className="shadow-card border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Verify Blockchain ID
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="blockchainID">Blockchain ID</Label>
                <Input
                  id="blockchainID"
                  value={blockchainID}
                  onChange={(e) => setBlockchainID(e.target.value)}
                  placeholder="BC-2024-XX-XXXXXXXXX"
                  className="font-mono"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleVerification}
                  disabled={isVerifying || !blockchainID.trim()}
                  className="flex-1"
                >
                  {isVerifying ? (
                    <>
                      <Search className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Verify ID
                    </>
                  )}
                </Button>
                {verificationResult && (
                  <Button variant="outline" onClick={clearResults}>
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {verificationResult && (
            <Card className={`shadow-card ${verificationResult.status === "valid" ? "border-safety" : "border-destructive"}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {verificationResult.status === "valid" ? 
                      <CheckCircle className="h-5 w-5 text-safety" /> :
                      <XCircle className="h-5 w-5 text-destructive" />
                    }
                    Verification Result
                  </CardTitle>
                  {getStatusBadge(verificationResult.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-mono text-sm break-all">{verificationResult.blockchainID}</p>
                </div>
                
                {verificationResult.status === "valid" && verificationResult.userDetails && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">User Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Name</p>
                        <p className="font-medium">{verificationResult.userDetails.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Aadhaar</p>
                        <p className="font-medium">{verificationResult.userDetails.aadhar_no}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{verificationResult.userDetails.phone}</p>
                      </div>
                      <div>
                        {/* <p className="text-muted-foreground">Email</p> */}
                        <p className="font-medium break-all">{verificationResult.userDetails.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold">Blockchain Details</h4>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Block Number</p>
                          <p className="font-medium font-mono">{verificationResult.userDetails.blockNumber}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Transaction Hash</p>
                          <p className="font-medium font-mono text-xs break-all">{verificationResult.userDetails.transactionHash}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {verificationResult.status === "invalid" && (
                  <div className="bg-destructive/10 p-4 rounded-lg">
                    <p className="text-destructive font-medium">Verification Failed</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {verificationResult.errorReason}
                    </p>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Verified at: {verificationResult.timestamp}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Verifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentVerifications.map((verification) => (
                <div key={verification.id} className="p-4 bg-accent rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{verification.userName}</span>
                      {getStatusBadge(verification.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">{verification.timestamp}</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-mono text-muted-foreground break-all">{verification.blockchainID}</p>
                    <p className="text-xs text-muted-foreground mt-1">Verified by: {verification.verifiedBy}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>

      <AdminNavigation currentPage="verification" />
    </div>
  );
};

export default AdminVerification;
