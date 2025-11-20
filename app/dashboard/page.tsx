import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPastGames } from "@/lib/actions/games";
import { Plus } from "lucide-react";

// Note: This dashboard is for HOSTS only.
// Players don't have a dashboard in Epic 1 - they join games via /join
// and wait on the player view (/game/[gameId]/play).

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" {
  switch (status) {
    case "completed":
      return "default";
    case "active":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

export default async function DashboardPage() {
  const gamesResult = await getPastGames();

  const games = gamesResult.success ? gamesResult.games : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Your Games</h1>
        </div>
        <Link href="/create">
          <Button size="lg" className="w-full sm:w-auto">
            <Plus className="mr-2 h-5 w-5" />
            Create New Game
          </Button>
        </Link>
      </div>

      {games.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              No games yet. Create your first game!
            </p>
            <Link href="/create">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create New Game
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {games.map((game) => (
            <Card key={game.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      {game.question_set_title || "Untitled Game"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Room Code: {game.room_code} • {game.question_count}{" "}
                      questions • {game.player_count}{" "}
                      {game.player_count === 1 ? "player" : "players"}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(game.status)}>
                    {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created {formatDate(game.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

