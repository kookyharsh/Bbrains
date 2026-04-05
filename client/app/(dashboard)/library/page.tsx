"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Download, Loader2, BookOpen, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { DashboardContent } from "@/components/dashboard-content";
import { libraryApi, LibraryItem } from "@/services/api/client";

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  const fetchLibrary = useCallback(async () => {
    try {
      setLoading(true);
      const response = await libraryApi.getLibrary(undefined, 1, 100);
      if (response.success && response.data) {
        setItems(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch library:", error);
      toast.error("Failed to load library");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const handleDownload = async (item: LibraryItem) => {
    try {
      setDownloading(item.productId);
      const resp = await libraryApi.getDownloadUrl(item.productId);
      if (resp.success && resp.data?.url) {
        window.open(resp.data.url, "_blank");
      } else {
        toast.error("Download link not available");
      }
    } catch (error) {
      toast.error("Failed to get download link");
    } finally {
      setDownloading(null);
    }
  };

  const digitalItems = items.filter(i => i.category !== 'theme' && i.fileUrl);
  const physicalItems = items.filter(i => !i.fileUrl || i.category === 'theme');
  const themeItems = items.filter(i => i.category === 'theme');

  if (loading) {
    return (
      <DashboardContent>
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading Library...</p>
        </div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-brand-orange" />
            My Library
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Your purchased products and downloads</p>
        </div>

        {items.length === 0 ? (
          <Card className="border-2 border-dashed border-border/50 bg-muted/20 rounded-[2rem] py-24">
            <div className="flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-xl font-bold mb-2">Library is Empty</h3>
              <p className="text-muted-foreground max-w-sm">Products you purchase will appear here</p>
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="digital" className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1">
              <TabsTrigger value="digital" className="rounded-lg data-[state=active]:bg-brand-orange data-[state=active]:text-white">
                Digital ({digitalItems.length})
              </TabsTrigger>
              <TabsTrigger value="physical" className="rounded-lg data-[state=active]:bg-brand-orange data-[state=active]:text-white">
                Physical ({physicalItems.length})
              </TabsTrigger>
              <TabsTrigger value="themes" className="rounded-lg data-[state=active]:bg-brand-orange data-[state=active]:text-white">
                Themes ({themeItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="digital" className="space-y-4">
              {digitalItems.length === 0 ? (
                <p className="text-center text-white/40 py-12 font-medium">No digital products yet</p>
              ) : (
                <div className="space-y-3">
                  {digitalItems.map((item) => (
                    <Card key={item.id} className="rounded-xl border-white/5 bg-white/[0.02]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-white/10 m-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{item.name}</h3>
                            <p className="text-xs text-white/40 mt-0.5">By {item.creator}</p>
                            <p className="text-xs text-white/30 mt-0.5">Purchased {new Date(item.purchasedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="default" className="text-[10px] font-black uppercase tracking-widest">Digital</Badge>
                            <Button
                              size="sm"
                              onClick={() => handleDownload(item)}
                              disabled={downloading === item.productId}
                              className="h-9 px-4 rounded-lg bg-brand-orange hover:bg-brand-orange/90 text-white font-bold"
                            >
                              {downloading === item.productId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Download className="w-3.5 h-3.5 mr-1.5" />
                                  Download
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="physical" className="space-y-4">
              {physicalItems.length === 0 ? (
                <p className="text-center text-white/40 py-12 font-medium">No physical products yet</p>
              ) : (
                <div className="space-y-3">
                  {physicalItems.map((item) => (
                    <Card key={item.id} className="rounded-xl border-white/5 bg-white/[0.02]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-white/10 m-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{item.name}</h3>
                            <p className="text-xs text-white/40 mt-0.5">By {item.creator}</p>
                            <p className="text-xs text-white/30 mt-0.5">Purchased {new Date(item.purchasedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">Physical</Badge>
                            <div className="flex items-center gap-1 text-green-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="text-xs font-bold">Delivered</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="themes" className="space-y-4">
              {themeItems.length === 0 ? (
                <p className="text-center text-white/40 py-12 font-medium">No themes yet</p>
              ) : (
                <div className="space-y-3">
                  {themeItems.map((item) => (
                    <Card key={item.id} className="rounded-xl border-white/5 bg-white/[0.02]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-white/10 m-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{item.name}</h3>
                            <p className="text-xs text-white/40 mt-0.5">By {item.creator}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">Theme</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardContent>
  );
}
