// import { useState } from "react";
// import { Button } from "../components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
// import { Input } from "../components/ui/input";
// import { Label } from "../components/ui/label";
// import { ArrowLeft, Phone, Shield } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { polygonService } from "../services/polygonService";

// const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:5000";

// const UserRegister = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//     aadhaar: "",
//     blockchainId: "",
//   });
//   const [step, setStep] = useState(1);

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (formData.password !== formData.confirmPassword) {
//       alert("Passwords don't match!");
//       return;
//     }

//     try {
//       // Connect wallet via polygonService
//       const wallet = await polygonService.connectWallet();

//       // Generate blockchain ID (mock/demo)
//       const blockchainIdentity = polygonService.generateMockBlockchainID({
//         name: formData.name,
//         aadhaar: formData.aadhaar,
//         phone: formData.phone,
//         email: "", // optional
//       });

//       // Prepare payload
//       const payload = {
//         ...formData,
//         blockchain_id: blockchainIdentity.identityId,
//       };

//       // Call backend API
//       const res = await fetch(`${API_BASE}/users/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const text = await res.text().catch(() => "");
//         throw new Error(`Backend error ${res.status}: ${text || res.statusText}`);
//       }

//       const data = await res.json();
//       if (data.success) {
//         setFormData({ ...formData, blockchainId: blockchainIdentity.identityId });
//         setStep(2);
//         alert("✅ User registered with Blockchain ID: " + blockchainIdentity.identityId);
//       } else {
//         alert("❌ Registration failed: " + data.message);
//       }
//     } catch (error) {
//       console.error(error);
//       alert("❌ Error registering user: " + (error as Error).message + `\nAPI_BASE: ${API_BASE}`);
//     }
//   };

//   if (step === 1) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center p-4">
//         <div className="w-full max-w-md">
//           <Card className="shadow-card">
//             <CardHeader>
//               <div className="flex items-center gap-3">
//                 <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
//                   <ArrowLeft className="h-4 w-4" />
//                 </Button>
//                 <div>
//                   <CardTitle>User Registration</CardTitle>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleRegister} className="space-y-4">
//                 <div>
//                   <Label htmlFor="name">Full Name</Label>
//                   <Input
//                     id="name"
//                     value={formData.name}
//                     onChange={(e) =>
//                       setFormData({ ...formData, name: e.target.value })
//                     }
//                     placeholder="Enter your full name"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="phone">Phone Number</Label>
//                   <div className="flex">
//                     <div className="flex items-center px-3 border border-r-0 border-input bg-muted rounded-l-lg">
//                       <Phone className="h-4 w-4" />
//                     </div>
//                     <Input
//                       id="phone"
//                       value={formData.phone}
//                       onChange={(e) =>
//                         setFormData({ ...formData, phone: e.target.value })
//                       }
//                       placeholder="+919876543210"
//                       className="rounded-l-none"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <Label htmlFor="password">Password</Label>
//                   <Input
//                     id="password"
//                     type="password"
//                     value={formData.password}
//                     onChange={(e) =>
//                       setFormData({ ...formData, password: e.target.value })
//                     }
//                     placeholder="Enter a strong password"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="confirmPassword">Confirm Password</Label>
//                   <Input
//                     id="confirmPassword"
//                     type="password"
//                     value={formData.confirmPassword}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         confirmPassword: e.target.value,
//                       })
//                     }
//                     placeholder="Confirm your password"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="aadhaar">Aadhaar Number</Label>
//                   <Input
//                     id="aadhaar"
//                     value={formData.aadhaar}
//                     onChange={(e) =>
//                       setFormData({ ...formData, aadhaar: e.target.value })
//                     }
//                     placeholder="1234 5678 9012"
//                     maxLength={12}
//                     className="text-center tracking-wider"
//                     required
//                   />
//                 </div>

//                 <Button type="submit" className="w-full" size="lg">
//                   Register & Get Blockchain ID
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <Card className="shadow-card">
//           <CardHeader>
//             <CardTitle>Registration Complete</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="text-center">
//               <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
//               <h3 className="text-lg font-semibold">
//                 Blockchain Digital ID Generated
//               </h3>
//               <p className="text-sm text-muted-foreground">
//                 Your secure digital identity has been created
//               </p>
//             </div>

//             <div className="bg-muted p-4 rounded-lg">
//               <Label className="text-sm font-medium">Your Blockchain ID</Label>
//               <div className="bg-background p-3 rounded border mt-2">
//                 <code className="text-sm font-mono break-all">
//                   {formData.blockchainId}
//                 </code>
//               </div>
//               <p className="text-xs text-muted-foreground mt-2">
//                 Save this ID securely. You'll need it to login to your account.
//               </p>
//             </div>

//             <Button
//               type="button"
//               className="w-full"
//               size="lg"
//               onClick={() => navigate("/user/dashboard")}
//             >
//               Go to Dashboard
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default UserRegister;


import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, Phone, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { polygonService } from "../services/polygonService";

const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:5000";

// Helper to truncate addresses for alerts
const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
};

const UserRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    aadhaar: "",
    blockchainId: "",
  });
  const [step, setStep] = useState(1);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      let blockchainId: string;

      // Try connecting MetaMask
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        blockchainId = accounts[0];
      } else {
        // Fallback: generate mock blockchain ID
        const mockIdentity = polygonService.generateMockBlockchainID({
          name: formData.name,
          aadhaar: formData.aadhaar,
          phone: formData.phone,
          email: "",
        });
        blockchainId = mockIdentity.identityId;
      }

      // Save full blockchain ID in backend
      const payload = {
        ...formData,
        blockchain_id: blockchainId,
      };

      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Backend error ${res.status}: ${text || res.statusText}`);
      }

      const data = await res.json();
      if (data.success) {
        setFormData({ ...formData, blockchainId });
        setStep(2);

        // Show truncated address in alert
        alert(`✅ User registered with Blockchain ID: ${truncateAddress(blockchainId)}`);
      } else {
        alert("❌ Registration failed: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error registering user: " + (error as Error).message);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle>User Registration</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 border-input bg-muted rounded-l-lg">
                      <Phone className="h-4 w-4" />
                    </div>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+919876543210"
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
                    placeholder="Enter a strong password"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="aadhaar">Aadhaar Number</Label>
                  <Input
                    id="aadhaar"
                    value={formData.aadhaar}
                    onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                    placeholder="1234 5678 9012"
                    maxLength={12}
                    className="text-center tracking-wider"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Register & Get Blockchain ID
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Registration Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Blockchain Digital ID Generated</h3>
              <p className="text-sm text-muted-foreground">Your secure digital identity has been created</p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <Label className="text-sm font-medium">Your Blockchain ID</Label>
              <div className="bg-background p-3 rounded border mt-2">
                <code className="text-sm font-mono break-all">{formData.blockchainId}</code>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Save this ID securely. You'll need it to login to your account.
              </p>
            </div>

            <Button type="button" className="w-full" size="lg" onClick={() => navigate("/user/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserRegister;
