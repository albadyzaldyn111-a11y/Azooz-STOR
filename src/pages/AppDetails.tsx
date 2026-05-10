import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Star,
  Download,
  Heart,
  Share2,
  ArrowLeft,
  ExternalLink,
  Calendar,
  User,
  Package,
  Tag,
} from "lucide-react";

export default function AppDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { data: app, isLoading } = trpc.app.getBySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  const { data: related } = trpc.app.related.useQuery(
    { appId: app?.id ?? 0 },
    { enabled: !!app?.id }
  );

  const { data: favData } = trpc.favorite.check.useQuery(
    { appId: app?.id ?? 0 },
    { enabled: isAuthenticated && !!app?.id }
  );

  const downloadMutation = trpc.app.download.useMutation({
    onSuccess: () => {
      toast.success("Download started!");
    },
  });

  const toggleFav = trpc.favorite.toggle.useMutation({
    onSuccess: (data) => {
      toast.success(data.favorited ? "Added to favorites" : "Removed from favorites");
    },
  });

  const rating = parseFloat(app?.rating ?? "0");
  const screenshots = app?.screenshots ? JSON.parse(app.screenshots) as string[] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 rounded-lg bg-white/5 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 rounded-xl bg-white/5" />
              <Skeleton className="h-32 rounded-xl bg-white/5" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 rounded-xl bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">App Not Found</h1>
          <p className="text-muted-foreground mb-4">The app you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/apps")}>Browse Apps</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/apps")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Apps
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Screenshots */}
            <div className="glass-card p-6">
              <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-lg flex items-center justify-center">
                {screenshots[0] ? (
                  <img
                    src={`/assets/apps/${screenshots[0]}`}
                    alt={app.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">{app.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              {screenshots.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto">
                  {screenshots.map((_s, i) => (
                    <div key={i} className="w-24 h-16 rounded-lg bg-white/5 flex-shrink-0" />
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4">About this app</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {app.longDescription || app.description || "No description available."}
              </p>
            </div>

            {/* Changelog */}
            {app.changelog && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-4">What's New</h2>
                <p className="text-muted-foreground">{app.changelog}</p>
              </div>
            )}

            {/* Reviews */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4">Reviews</h2>
              <p className="text-muted-foreground">Reviews feature coming soon.</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* App Info Card */}
            <div className="glass-card p-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">{app.name.charAt(0)}</span>
              </div>
              <h1 className="text-xl font-bold text-center">{app.name}</h1>
              <p className="text-sm text-muted-foreground text-center">{app.developer}</p>

              <div className="flex items-center justify-center gap-1 mt-3">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({app.reviewCount} reviews)</span>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => downloadMutation.mutate({ appId: app.id })}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleFav.mutate({ appId: app.id })}
                    className={favData?.favorited ? "border-red-500/50" : ""}
                  >
                    <Heart className={`w-4 h-4 ${favData?.favorited ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                )}
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold">Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Package className="w-4 h-4" /> Version
                  </span>
                  <span>{app.version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Developer
                  </span>
                  <span>{app.developer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Released
                  </span>
                  <span>{new Date(app.releaseDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Download className="w-4 h-4" /> Downloads
                  </span>
                  <span>{app.downloadCount?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Category
                  </span>
                  <Link to={`/apps?category=${app.categorySlug}`} className="text-blue-400 hover:underline">
                    {app.categoryName}
                  </Link>
                </div>
              </div>
            </div>

            {/* Tags */}
            {app.tags && app.tags.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {app.tags.map((tag) => (
                    <Badge key={tag.slug} variant="secondary" className="bg-white/5">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Related Apps */}
            {related && related.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Related Apps</h3>
                <div className="space-y-3">
                  {related.map((rel) => (
                    <Link key={rel.id} to={`/apps/${rel.slug}`} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/50 to-purple-600/50 flex items-center justify-center shrink-0">
                        <span className="font-bold text-white text-sm">{rel.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm group-hover:text-blue-400 transition-colors truncate">{rel.name}</p>
                        <p className="text-xs text-muted-foreground">{rel.developer}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
