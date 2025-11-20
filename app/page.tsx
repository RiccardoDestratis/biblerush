import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, LayoutDashboard, TestTube, Database } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          BibleRush
        </h1>
        <p className="text-xl text-muted-foreground">
          Interactive Bible quiz game for churches and groups
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Create Game
            </CardTitle>
            <CardDescription>
              Start a new quiz game session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/create">Create New Game</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </CardTitle>
            <CardDescription>
              View your game history and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-4">Development Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" asChild>
            <Link href="/test-components" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Test Components
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/test-supabase" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Test Supabase
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

