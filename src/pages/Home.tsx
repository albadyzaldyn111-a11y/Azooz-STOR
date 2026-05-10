import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { AppCard } from "@/components/AppCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Zap, TrendingUp, Star, Grid3X3, Download } from "lucide-react";

export default function Home() {
  const { data: featured, isLoading: featuredLoading } = trpc.app.featured.useQuery();
  const { data: trending, isLoading: trendingLoading } = trpc.app.trending.useQuery();
  const { data: categories } = trpc.category.list.useQuery();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
            <Zap className="w-4 h-4" />
            <span>Discover Amazing Apps</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            Your <span className="text-gradient">Digital</span> App Store
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Discover, download, and manage premium digital applications. 
            Curated for quality and security.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/apps">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Browse Apps
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/apps?trending=true">
              <Button size="lg" variant="outline" className="border-white/20">
                <TrendingUp className="mr-2 w-4 h-4" />
                Trending
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">500+</div>
              <div className="text-sm text-muted-foreground">Applications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">50K+</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">4.8</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">100%</div>
              <div className="text-sm text-muted-foreground">Secure</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Apps */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-2xl font-bold">Featured Apps</h2>
            </div>
            <Link to="/apps?featured=true" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured?.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Apps */}
      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <h2 className="text-2xl font-bold">Trending Now</h2>
            </div>
            <Link to="/apps?trending=true" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {trendingLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending?.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-8">
            <Grid3X3 className="w-5 h-5 text-blue-400" />
            <h2 className="text-2xl font-bold">Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                to={`/apps?category=${cat.slug}`}
                className="glass-card p-6 text-center hover:border-blue-500/30 transition-all group"
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: cat.color ?? "#3b82f6" }}
                >
                  {cat.name.charAt(0)}
                </div>
                <h3 className="font-medium text-sm group-hover:text-blue-400 transition-colors">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{cat.description ?? ""}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <Download className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                Join thousands of users who trust AZOOZ STORE for their digital application needs.
              </p>
              <Link to="/apps">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Explore Apps
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
