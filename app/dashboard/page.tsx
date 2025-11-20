export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Your game history and statistics will appear here.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Dashboard coming soon! This will show your past games, usage statistics, and quick access to create new games.
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          (Story 1.7 will implement the basic dashboard)
        </p>
      </div>
    </div>
  );
}

