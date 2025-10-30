"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Plus, Edit, Trash2, AlertCircle, Shield } from "lucide-react";
import UserNavigation from "@/components/UserNavigation";

interface Contact {
  id: number;
  contact_name: string;
  relation: string;
  phone_number: string;
}

const UserSOS = () => {
  const userId = 1; // 🔹 Replace with actual logged-in user ID
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm, setContactForm] = useState({ contact_name: "", relation: "", phone_number: "" });
  const [sosTriggered, setSosTriggered] = useState(false);

  // --- Fetch contacts from backend ---
  const fetchContacts = async () => {
    try {
      const res = await fetch(`http://localhost:5000/user_contacts/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.error("❌ Error fetching contacts:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // --- Save or Edit contact ---
  const handleSaveContact = async () => {
    if (!contactForm.contact_name || !contactForm.phone_number) return;

    const url = editingContact
      ? `http://localhost:5000/user_contacts/${editingContact.id}`
      : `http://localhost:5000/user_contacts/${userId}`;

    const method = editingContact ? "PUT" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      setEditingContact(null);
      setContactForm({ contact_name: "", relation: "", phone_number: "" });
      setShowAddForm(false);
      fetchContacts();
    } catch (err) {
      console.error("❌ Error saving contact:", err);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setContactForm(contact);
    setShowAddForm(true);
  };

  const handleDelete = async (contactId: number) => {
    try {
      await fetch(`http://localhost:5000/user_contacts/${contactId}`, { method: "DELETE" });
      fetchContacts();
    } catch (err) {
      console.error("❌ Error deleting contact:", err);
    }
  };

  // --- SOS Trigger ---
  const handleSOSPress = () => {
    setSosTriggered(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendSOS(pos.coords.latitude, pos.coords.longitude),
        () => sendSOS(null, null, "Location unavailable") // fallback
      );
    } else {
      console.warn("Geolocation not supported");
      sendSOS(null, null, "Geolocation not supported");
    }

    setTimeout(() => setSosTriggered(false), 3000);
  };

  // --- Send SOS to backend ---
  const sendSOS = async (latitude?: number | null, longitude?: number | null, fallback?: string) => {
    // 🔹 Sohna, Gurgaon fallback
    if (!latitude || !longitude) {
      latitude = 28.2477;
      longitude = 77.0650;
    }

    try {
      const res = await fetch(`http://localhost:5000/alerts/sos/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude,
          longitude,
          location: fallback || "User SOS Triggered",
          priority: "high",
          type: "sos",
        }),
      });

      if (res.ok) {
        const result = await res.json();
        console.log("✅ SOS Alert sent:", result);
        alert("🚨 SOS Alert sent! Authorities have been notified.");
      } else {
        const error = await res.json();
        console.error("❌ SOS Alert failed:", error);
        alert("Failed to send SOS alert. Please try again.");
      }
    } catch (err) {
      console.error("🌐 Network error:", err);
      alert("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">Emergency Support</h1>
            <p className="text-sm text-muted-foreground">SOS & Emergency Contacts</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 pb-32 space-y-6">
        {/* Contacts */}
        <Card className="shadow-card">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" /> Emergency Contacts
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddForm(true);
                setEditingContact(null);
                setContactForm({ contact_name: "", relation: "", phone_number: "" });
              }}
            >
              <Plus className="h-4 w-4" /> Add Contact
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{c.contact_name}</p>
                    <p className="text-sm text-muted-foreground">{c.relation}</p>
                    <p className="text-sm font-mono">{c.phone_number}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {showAddForm && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={contactForm.contact_name}
                      onChange={(e) => setContactForm({ ...contactForm, contact_name: e.target.value })}
                      placeholder="Contact Name"
                    />
                  </div>
                  <div>
                    <Label>Relation</Label>
                    <Input
                      value={contactForm.relation}
                      onChange={(e) => setContactForm({ ...contactForm, relation: e.target.value })}
                      placeholder="Brother, Wife, Doctor"
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={contactForm.phone_number}
                      onChange={(e) => setContactForm({ ...contactForm, phone_number: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveContact} size="sm">
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Emergency Instructions */}
        <Card className="shadow-card border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-5 w-5" /> Emergency Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Press the SOS button to activate</p>
            <p>• Your location will be shared with emergency contacts</p>
            <p>• Local authorities will be notified automatically</p>
            <p>• Stay calm and move to a safe location if possible</p>
          </CardContent>
        </Card>
      </main>

      {/* SOS Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4">
        <Button
          variant="emergency"
          size="lg"
          className={`w-full h-16 text-lg font-bold ${sosTriggered ? "animate-pulse" : ""}`}
          onClick={handleSOSPress}
          disabled={sosTriggered}
        >
          {sosTriggered ? (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 animate-spin" /> SOS SENT
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6" /> EMERGENCY SOS
            </div>
          )}
        </Button>
      </div>

      <UserNavigation currentPage="sos" />
    </div>
  );
};

export default UserSOS;
