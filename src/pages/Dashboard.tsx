import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Heart,
  Star,
  Settings,
  Bell,
  Shield,
} from "lucide-react";
import { Link } from "react-router";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-32 rounded-xl bg-white/5 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{user?.name?.charAt(0) ?? "U"}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name ?? "User"}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={user?.role === "admin" ? "default" : "secondary"} className={user?.role === "admin" ? "bg-purple-600" : ""}>
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-400" />
                Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="w-4 h-4 text-green-400" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/downloads">
            <Button variant="outline" className="w-full h-20 border-white/10 flex flex-col items-center gap-2">
              <Download className="w-6 h-6 text-blue-400" />
              <span>My Downloads</span>
            </Button>
          </Link>
          <Link to="/favorites">
            <Button variant="outline" className="w-full h-20 border-white/10 flex flex-col items-center gap-2">
              <Heart className="w-6 h-6 text-red-400" />
              <span>Favorites</span>
            </Button>
          </Link>
          <Link to="/notifications">
            <Button variant="outline" className="w-full h-20 border-white/10 flex flex-col items-center gap-2">
              <Bell className="w-6 h-6 text-green-400" />
              <span>Notifications</span>
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline" className="w-full h-20 border-white/10 flex flex-col items-center gap-2">
              <Settings className="w-6 h-6 text-purple-400" />
              <span>Settings</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
