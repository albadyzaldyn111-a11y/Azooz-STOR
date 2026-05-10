import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppCard } from "@/components/AppCard";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: favorites, isLoading } = trpc.favorite.list.useQuery();

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <Heart className="w-6 h-6 text-red-500" />
          <h1 className="text-3xl font-bold">My Favorites</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl bg-white/5" />
            ))}
          </div>
        ) : favorites?.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No favorites yet</h3>
            <p className="text-muted-foreground mb-4">Start exploring and add apps to your favorites</p>
            <Button onClick={() => navigate("/apps")}>Browse Apps</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites?.map((fav) => (
              <AppCard
                key={fav.id}
                app={{
                  id: fav.appId,
                  name: fav.appName ?? "",
                  slug: fav.appSlug ?? "",
                  description: fav.appDescription,
                  version: null,
                  developer: fav.appDeveloper,
                  size: null,
                  rating: fav.appRating,
                  downloadCount: null,
                  screenshots: null,
                  categoryName: null,
                  categorySlug: null,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
