"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function TestComponentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 space-y-8 px-4 py-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Component Showcase</h1>
          <p className="text-muted-foreground">
            Testing all shadcn/ui components with Soft Lavender theme
          </p>
        </div>

        {/* Buttons Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default (Primary)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🚀</Button>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Game-Style Cards</h2>
          <p className="text-sm text-muted-foreground">
            Cards with 3D elevation, gradients, and game-like depth
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer bg-gradient-to-br from-primary/10 via-card to-primary/5">
              <CardHeader>
                <CardTitle>Question Set Card</CardTitle>
                <CardDescription>Game-style card with 3D effects</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Hover to see elevation effect. This is how question sets will look!</p>
                <Badge className="mt-2">20 Questions</Badge>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Select</Button>
              </CardFooter>
            </Card>
            <Card className="cursor-pointer bg-gradient-to-br from-secondary/10 via-card to-secondary/5">
              <CardHeader>
                <CardTitle>Another Game Card</CardTitle>
                <CardDescription>With gradient background</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Notice the depth and shadow effects - perfect for game UI!</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer bg-gradient-to-br from-accent/10 via-card to-accent/5 border-2 border-accent/30">
              <CardHeader>
                <CardTitle>Selected Card</CardTitle>
                <CardDescription>Highlighted with accent border</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This shows how selected question sets will appear</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Elements Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Form Elements</h2>
          <div className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-input">Input Label</Label>
              <Input id="test-input" placeholder="Enter text here" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-input-disabled">Disabled Input</Label>
              <Input
                id="test-input-disabled"
                placeholder="Disabled"
                disabled
              />
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* Dialog Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Dialog</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>
                  This is a dialog component example. Click outside or press
                  Escape to close.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>Dialog content goes here</p>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Toast Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Toast Notifications</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => toast.success("Success message!")}
              variant="default"
            >
              Success Toast
            </Button>
            <Button
              onClick={() => toast.error("Error message!")}
              variant="destructive"
            >
              Error Toast
            </Button>
            <Button
              onClick={() => toast.info("Info message!")}
              variant="outline"
            >
              Info Toast
            </Button>
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Typography Utilities</h2>
          <div className="space-y-2">
            <p className="text-lg font-bold">Projector Heading (48px+)</p>
            <p className="text-base">Projector Body (32px+)</p>
            <p className="text-sm">Mobile Body (18px)</p>
            <p className="text-xs">Mobile Small (16px minimum)</p>
          </div>
        </section>

        {/* Responsive Test Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Responsive Breakpoints</h2>
          <div className="rounded-lg border p-4">
            <p className="text-sm md:text-base">
              This text is smaller on mobile (375px) and larger on desktop
              (1280px+)
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Resize your browser to test responsive behavior
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

