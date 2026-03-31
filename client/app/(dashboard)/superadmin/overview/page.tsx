import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, Settings } from "lucide-react";

export default function SuperadminOverview() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Superadmin Dashboard</h1>
            <p className="text-muted-foreground">Welcome to the Bbrains Officials control panel.</p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/superadmin/colleges" className="block">
                    <Card className="hover:bg-accent/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Manage Colleges</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Colleges</div>
                            <p className="text-xs text-muted-foreground">Configure feature flags per college</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/superadmin/features" className="block">
                    <Card className="hover:bg-accent/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Global Features</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">System Config</div>
                            <p className="text-xs text-muted-foreground">Manage system-wide features</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
