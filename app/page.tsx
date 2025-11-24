import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Smartphone, 
  Monitor, 
  BookOpen, 
  Zap, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Gamepad2
} from "lucide-react";
import { QuestionCarouselWrapper } from "@/components/landing/question-carousel-wrapper";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent">
              BibleRush
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Interactive Bible quiz games for your community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
                <Link href="/create">
                  Start game
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Completely for free, no credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No App Required</h3>
              <p className="text-sm text-muted-foreground">
                Join instantly from any phone browser
              </p>
            </div>

            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-Time Sync</h3>
              <p className="text-sm text-muted-foreground">
                Everyone sees updates instantly
              </p>
            </div>

            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Zero Setup</h3>
              <p className="text-sm text-muted-foreground">
                Start playing in minutes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Two Ways to Play
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the mode that works best for your group
            </p>
          </div>

          {/* Two Modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Host Mode */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Monitor className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Host Mode</CardTitle>
                </div>
                <CardDescription>
                  Perfect for group events with projector display
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Screenshot for Host Mode */}
                <div className="mb-4 rounded-lg overflow-hidden border-2 border-border bg-muted/50 relative aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                    {/* Add screenshot at /public/images/host-mode-screenshot.png */}
                    <span className="text-muted-foreground text-sm">Screenshot: Host Mode with Projector</span>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Host displays questions on projector</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Players answer on their phones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Real-time leaderboard visible to all</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Direct Play Mode */}
            <Card className="border-2 hover:border-secondary/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-secondary" />
                  </div>
                  <CardTitle>Direct Play</CardTitle>
                </div>
                <CardDescription>
                  Play together using just your phones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Screenshot for Direct Play */}
                <div className="mb-4 rounded-lg overflow-hidden border-2 border-border bg-muted/50 relative aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary/10 to-accent/10">
                    {/* Add screenshot at /public/images/direct-play-screenshot.png */}
                    <span className="text-muted-foreground text-sm">Screenshot: Direct Play on Phones</span>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>No projector needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Questions and answers on phones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Perfect for small groups or friends</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Account Info */}
          <div className="text-center max-w-2xl mx-auto bg-muted/50 rounded-lg p-6">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Only the host needs to sign up</strong> to create a game. 
              All other players can join without an account. 
              If players create an account, they can keep their stats and track their progress.
            </p>
          </div>
        </div>
      </section>

      {/* Bible-Based Questions Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Bible-Based Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Curated, theologically accurate question sets with scripture references
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Question Carousel */}
            <div className="transition-all duration-300">
              <QuestionCarouselWrapper />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Choose What Works for You
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free and grow with your community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="border-2 transition-all duration-300 hover:shadow-lg flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">€0</span>
                  <span className="text-muted-foreground">/forever</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Perfect for getting started</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Up to 10 players per game</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Real-time leaderboards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>No credit card required</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full mt-auto">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Daily Pass */}
            <Card className="border-2 border-primary relative transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">24-Hour Pass</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">€24</span>
                  <span className="text-muted-foreground">/one-time</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Full access for 24 hours</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Up to 50 players</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>All question sets unlocked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Unlimited games for 24 hours</span>
                  </li>
                </ul>
                <Button asChild className="w-full mt-auto">
                  <Link href="/pricing">Get 24-Hour Pass</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Subscription */}
            <Card className="border-2 transition-all duration-300 hover:shadow-lg flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">Subscription</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">€29</span>
                  <span className="text-muted-foreground text-xl">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Sufficient for most cases</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Up to 100 players per game</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>All question sets + more coming</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Request custom question sets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>More features coming soon</span>
                  </li>
                </ul>
                <Button asChild className="w-full mt-auto">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Ready to bring your community together?
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Start your first game in minutes and watch the fun begin!
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
            <Link href="/create">
              Start game
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Completely for free, no credit card required
          </p>
        </div>
      </section>
    </div>
  );
}

