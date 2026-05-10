import { useState } from "react";
import { useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { AppCard } from "@/components/AppCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, Grid3X3, LayoutList, ChevronLeft, ChevronRight } from "lucide-react";

export default function AppsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const page = parseInt(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const sort = (searchParams.get("sort") as "newest" | "popular" | "rating" | "name") ?? "newest";
  const featured = searchParams.get("featured") === "true" ? true : undefined;
  const trending = searchParams.get("trending") === "true" ? true : undefined;

  const { data, isLoading } = trpc.app.list.useQuery({
    page,
    limit: 12,
    search: search || undefined,
    category: category || undefined,
    sort,
    featured,
    trending,
  });

  const { data: categories } = trpc.category.list.useQuery();

  const updateParams = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const pagination = data?.pagination;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {featured ? "Featured Apps" : trending ? "Trending Apps" : category ? categories?.find(c => c.slug === category)?.name ?? "Apps" : "All Applications"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {pagination?.total ?? 0} apps available
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search apps..."
              className="pl-10 bg-white/5 border-white/10"
              value={search ?? ""}
              onChange={(e) => updateParams({ search: e.target.value || undefined })}
            />
          </div>
          <Select value={category ?? "all"} onValueChange={(v) => updateParams({ category: v === "all" ? undefined : v })}>
            <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => updateParams({ sort: v })}>
            <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Apps Grid/List */}
        {isLoading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={`rounded-xl bg-white/5 ${viewMode === "grid" ? "h-72" : "h-24"}`} />
            ))}
          </div>
        ) : data?.apps.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No apps found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {data?.apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => updateParams({ page: String(page - 1) })}
              className="border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <div key={p} className="flex items-center gap-2">
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-muted-foreground">...</span>}
                  <Button
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateParams({ page: String(p) })}
                    className={p === page ? "bg-blue-600" : "border-white/10"}
                  >
                    {p}
                  </Button>
                </div>
              ))}
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => updateParams({ page: String(page + 1) })}
              className="border-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
