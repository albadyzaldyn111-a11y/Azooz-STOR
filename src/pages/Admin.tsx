import { useNavigate, Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  AppWindow,
  Download,
  Star,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const { data: stats } = trpc.admin.stats.useQuery(
    undefined,
    { enabled: isAdmin }
  );

  const { data: users, isLoading: usersLoading } = trpc.admin.users.useQuery(
    { page: 1, limit: 5 },
    { enabled: isAdmin }
  );

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-6 h-6 text-purple-400" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.users ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AppWindow className="w-4 h-4 text-purple-400" />
                Total Apps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.apps ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Download className="w-4 h-4 text-green-400" />
                Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.downloads ?? 0}</p>
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
              <p className="text-2xl font-bold">{stats?.reviews ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Users</h2>
            <Link to="/admin/users" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {usersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 font-medium">{u.name ?? "Unknown"}</td>
                      <td className="py-3 px-2 text-muted-foreground">{u.email ?? "N/A"}</td>
                      <td className="py-3 px-2">
                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className={u.role === "admin" ? "bg-purple-600" : ""}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
