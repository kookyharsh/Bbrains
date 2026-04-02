"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Library, Search, Download, Star, BookOpen, Palette, FileText, Eye, Play, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { libraryApi, themeApi, LibraryItem, Product } from "@/services/api/client";
import { useTheme } from "@/context/theme";

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [applyingTheme, setApplyingTheme] = useState(false);
  const { addTheme, setTheme } = useTheme();
  const limit = 12;

  useEffect(() => {
    fetchLibrary();
  }, [page, category]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const response = await libraryApi.getLibrary(category, page, limit);
      if (response.success && response.data) {
        setItems(response.data || []);
        setTotal(response.pagination?.total || 0);
      }
    } catch (err) {
      toast.error("Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.creator?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case "theme":
        return <Palette className="w-4 h-4" />;
      case "notes":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case "theme":
        return "default";
      case "notes":
        return "secondary";
      case "template":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleDownload = async (item: LibraryItem) => {
    try {
      setDownloading(true);
      const response = await libraryApi.getDownloadUrl(item.productId);
      if (response.success && response.data?.url) {
        window.open(response.data.url, '_blank');
        toast.success("Download started!");
      } else {
        toast.error(response.message || "Download not available");
      }
    } catch (err) {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const handleApplyTheme = async (item: LibraryItem) => {
    try {
      setApplyingTheme(true);
      const response = await themeApi.applyTheme(item.productId);
      if (response.success) {
        addTheme(String(item.productId));
        setTheme(String(item.productId));
        toast.success("Theme applied successfully!");
      } else {
        toast.error(response.message || "Failed to apply theme");
      }
    } catch (err) {
      toast.error("Failed to apply theme");
    } finally {
      setApplyingTheme(false);
    }
  };

  const handlePreview = (item: LibraryItem) => {
    setSelectedItem(item);
    setShowPreview(true);
  };

  const getPreviewColors = (item: LibraryItem) => {
    const config = item.themeConfig;
    if (!config) return null;
    return {
      primary: (config.primaryColor as string) || "oklch(var(--primary))",
      secondary: (config.secondaryColor as string) || "oklch(var(--secondary))",
      dark: config.darkMode ? true : false,
    };
  };

  const categories = [
    { value: undefined, label: "All" },
    { value: "theme", label: "Themes" },
    { value: "notes", label: "Notes" },
    { value: "template", label: "Templates" },
    { value: "asset", label: "Assets" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Library className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">My Library</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={category || ""} onValueChange={(val) => setCategory(val || undefined)}>
          <TabsList>
            {categories.map((cat) => (
              <TabsTrigger key={cat.label} value={cat.value || ""}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full rounded-lg mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No items in your library</p>
          <p className="text-sm mt-1">Purchase themes, notes, or templates to see them here</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const previewColors = getPreviewColors(item);
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow overflow-hidden">
                  {item.category === "theme" && previewColors ? (
                    <div 
                      className="h-28 cursor-pointer relative"
                      style={{
                        background: `linear-gradient(135deg, ${previewColors.primary} 0%, ${previewColors.secondary} 100%)`
                      }}
                      onClick={() => handlePreview(item)}
                    >
                      {previewColors.dark && (
                        <Badge className="absolute top-2 right-2 bg-black/50 text-white" variant="secondary">
                          Dark
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div 
                      className="h-28 bg-muted flex items-center justify-center cursor-pointer"
                      onClick={() => handlePreview(item)}
                    >
                      <span className="text-4xl">{item.image || "📄"}</span>
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
                      <Badge variant={getCategoryColor(item.category)}>
                        {getCategoryIcon(item.category)}
                        <span className="ml-1">{item.category}</span>
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">by {item.creator}</p>
                    {item.version && (
                      <p className="text-xs text-muted-foreground">v{item.version}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handlePreview(item)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      {item.category === "theme" ? (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleApplyTheme(item)}
                          disabled={applyingTheme}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Apply
                        </Button>
                      ) : item.fileUrl ? (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDownload(item)}
                          disabled={downloading}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
            <DialogDescription>
              {selectedItem?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.category === "theme" && selectedItem.themeConfig ? (
                <div 
                  className="h-32 rounded-lg"
                  style={{
                    background: (() => {
                      const config = selectedItem.themeConfig;
                      const primary = (config.primaryColor as string) || "oklch(var(--primary))";
                      const secondary = (config.secondaryColor as string) || "oklch(var(--secondary))";
                      return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
                    })()
                  }}
                />
              ) : (
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center text-5xl">
                  {selectedItem.image || "📄"}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">{selectedItem.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Version</p>
                  <p className="font-medium">{selectedItem.version || "1.0"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Creator</p>
                  <p className="font-medium">{selectedItem.creator}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Purchased</p>
                  <p className="font-medium">
                    {selectedItem.purchasedAt ? new Date(selectedItem.purchasedAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            {selectedItem?.category === "theme" ? (
              <Button 
                onClick={() => {
                  setShowPreview(false);
                  handleApplyTheme(selectedItem);
                }}
                disabled={applyingTheme}
              >
                <Play className="w-4 h-4 mr-2" />
                Apply Theme
              </Button>
            ) : selectedItem?.fileUrl ? (
              <Button 
                onClick={() => {
                  setShowPreview(false);
                  handleDownload(selectedItem);
                }}
                disabled={downloading}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
