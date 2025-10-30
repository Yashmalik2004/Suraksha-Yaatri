import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Shield, Heart, Truck, Edit, Save, X } from "lucide-react";
import AdminNavigation from "@/components/AdminNavigation";

const AdminContacts = () => {
  const [contacts, setContacts] = useState({
    police: {
      name: "City Police Department",
      phone: "100",
      emergencyPhone: "+91 98765 00100",
      email: "control@citypolice.gov.in",
      address: "Police Headquarters, Main Street, City"
    },
    health: {
      name: "Emergency Medical Services",
      phone: "102",
      emergencyPhone: "+91 98765 00102",
      email: "emergency@cityhospital.gov.in",
      address: "City General Hospital, Health District"
    },
    rescue: {
      name: "Fire & Rescue Department",
      phone: "101",
      emergencyPhone: "+91 98765 00101",
      email: "control@firerescue.gov.in",
      address: "Fire Station Central, Rescue Road"
    }
  });

  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const handleEdit = (contactType: string) => {
    setEditingContact(contactType);
    setEditData(contacts[contactType as keyof typeof contacts]);
  };

  const handleSave = (contactType: string) => {
    setContacts({
      ...contacts,
      [contactType]: editData
    });
    setEditingContact(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingContact(null);
    setEditData({});
  };

  const handleDirectContact = (contactType: string, phone: string) => {
    // In a real app, this would initiate a call or open a communication interface
    alert(`Initiating contact with ${contactType}: ${phone}`);
  };

  const ContactCard = ({ 
    type, 
    icon: Icon, 
    title, 
    contact, 
    color 
  }: { 
    type: string;
    icon: any;
    title: string;
    contact: any;
    color: string;
  }) => {
    const isEditing = editingContact === type;
    
    return (
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 ${color}`}>
              <Icon className="h-5 w-5" />
              {title}
            </CardTitle>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(type)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor={`${type}-name`}>Department Name</Label>
                <Input
                  id={`${type}-name`}
                  value={editData.name || ""}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`${type}-phone`}>Emergency Number</Label>
                  <Input
                    id={`${type}-phone`}
                    value={editData.phone || ""}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor={`${type}-emergency`}>Direct Phone</Label>
                  <Input
                    id={`${type}-emergency`}
                    value={editData.emergencyPhone || ""}
                    onChange={(e) => setEditData({...editData, emergencyPhone: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor={`${type}-email`}>Email</Label>
                <Input
                  id={`${type}-email`}
                  type="email"
                  value={editData.email || ""}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor={`${type}-address`}>Address</Label>
                <Input
                  id={`${type}-address`}
                  value={editData.address || ""}
                  onChange={(e) => setEditData({...editData, address: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSave(type)}
                  size="sm"
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  size="sm"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{contact.name}</h3>
                <p className="text-sm text-muted-foreground">{contact.address}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{contact.phone}</p>
                    <p className="text-sm text-muted-foreground">Emergency Hotline</p>
                  </div>
                  <Button
                    variant="emergency"
                    size="sm"
                    onClick={() => handleDirectContact(title, contact.phone)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{contact.emergencyPhone}</p>
                    <p className="text-sm text-muted-foreground">Direct Line</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDirectContact(title, contact.emergencyPhone)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-sm">
                  <span className="text-muted-foreground">Email: </span>
                  {contact.email}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-authority text-authority-foreground px-4 py-3">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <h1 className="text-xl font-semibold">Authority Contacts</h1>
            <p className="text-authority-foreground/80">Manage emergency service contacts</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20">
        <div className="space-y-6">
          {/* Emergency Notice */}
          <Card className="shadow-card border-emergency">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-emergency mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-emergency">Emergency Contact Protocol</p>
                  <p className="text-muted-foreground mt-1">
                    These contacts are automatically notified during SOS alerts. Ensure all information 
                    is current and verified. Test communications regularly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Police Contact */}
          <ContactCard
            type="police"
            icon={Shield}
            title="Police Department"
            contact={contacts.police}
            color="text-primary"
          />

          {/* Health Contact */}
          <ContactCard
            type="health"
            icon={Heart}
            title="Medical Services"
            contact={contacts.health}
            color="text-emergency"
          />

          {/* Rescue Contact */}
          <ContactCard
            type="rescue"
            icon={Truck}
            title="Fire & Rescue"
            contact={contacts.rescue}
            color="text-warning"
          />

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button variant="emergency" className="h-16 flex-col">
                <Phone className="h-6 w-6 mb-1" />
                Emergency Conference Call
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Shield className="h-6 w-6 mb-1" />
                Test All Contacts
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <AdminNavigation currentPage="contacts" />
    </div>
  );
};

export default AdminContacts;