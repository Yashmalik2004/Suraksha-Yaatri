import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle, User } from "lucide-react";

interface UserNavigationProps {
  currentPage: "dashboard" | "sos" | "profile";
}

const UserNavigation = ({ currentPage }: UserNavigationProps) => {
  const navigate = useNavigate();

  const navItems = [
    {
      id: "dashboard",
      label: "Home",
      icon: Home,
      path: "/user/dashboard"
    },
    {
      id: "sos",
      label: "SOS",
      icon: AlertCircle,
      path: "/user/sos"
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/user/profile"
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
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon className={`h-5 w-5 ${item.id === "sos" ? "text-emergency" : ""}`} />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default UserNavigation;