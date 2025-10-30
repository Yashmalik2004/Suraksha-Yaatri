import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MapPin, Shield, Phone } from "lucide-react";

interface AdminNavigationProps {
  currentPage: "dashboard" | "geofencing" | "verification" | "contacts";
}

const AdminNavigation = ({ currentPage }: AdminNavigationProps) => {
  const navigate = useNavigate();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard"
    },
    {
      id: "geofencing",
      label: "Zones",
      icon: MapPin,
      path: "/admin/geofencing"
    },
    {
      id: "verification",
      label: "Verify",
      icon: Shield,
      path: "/admin/verification"
    },
    {
      id: "contacts",
      label: "Contacts",
      icon: Phone,
      path: "/admin/contacts"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex-1 h-16 rounded-none flex-col gap-1 ${
                isActive ? "text-authority bg-authority/10" : "text-muted-foreground"
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminNavigation;