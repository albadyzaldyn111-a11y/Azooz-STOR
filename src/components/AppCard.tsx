import { Link } from "react-router";
import { Star, Download, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

interface AppCardProps {
  app: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    version: string | null;
    developer: string | null;
    size: string | null;
    rating: string | null;
    downloadCount: number | null;
    screenshots: string | null;
    categoryName: string | null;
    categorySlug?: string | null;
  };
}

export function AppCard({ app }: AppCardProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: favData } = trpc.favorite.check.useQuery(
    { appId: app.id },
    { enabled: isAuthenticated }
  );
  const toggleFav = trpc.favorite.toggle.useMutation({
    onSuccess: () => {
      utils.favorite.check.invalidate({ appId: app.id });
      utils.favorite.list.invalidate();
    },
  });

  const screenshots = app.screenshots ? JSON.parse(app.screenshots) as string[] : [];
  const rating = parseFloat(app.rating ?? "0");

  return (
    <div className="glass-card hover-lift overflow-hidden group">
      <Link to={`/apps/${app.slug}`} className="block">
        <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center relative overflow-hidden">
          {screenshots[0] ? (
            <img
              src={`/assets/apps/${screenshots[0]}`}
              alt={app.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{app.name.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/apps/${app.slug}`} className="block flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate hover:text-blue-400 transition-colors">{app.name}</h3>
          </Link>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => {
                e.preventDefault();
                toggleFav.mutate({ appId: app.id });
              }}
            >
              <Heart className={`w-4 h-4 ${favData?.favorited ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{app.description}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            {rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {app.downloadCount?.toLocaleString() ?? 0}
          </span>
          <span>{app.size ?? "N/A"}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-blue-400">{app.categoryName ?? "General"}</span>
          <span className="text-xs text-muted-foreground">v{app.version ?? "1.0"}</span>
        </div>
      </div>
    </div>
  );
}
