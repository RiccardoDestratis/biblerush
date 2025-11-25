"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SignupRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionCount: number;
}

export function SignupRequiredModal({
  open,
  onOpenChange,
  questionCount,
}: SignupRequiredModalProps) {
  const router = useRouter();

  const handleSignUp = () => {
    onOpenChange(false);
    router.push(`/signup?redirect=${encodeURIComponent("/create")}`);
  };

  const handleSignIn = () => {
    onOpenChange(false);
    router.push(`/login?redirect=${encodeURIComponent("/create")}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account Required</DialogTitle>
          <DialogDescription>
            To create games with {questionCount} questions, you need to create an
            account. Other players can join without an account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleSignIn}
            className="w-full sm:w-auto"
          >
            Sign In
          </Button>
          <Button onClick={handleSignUp} className="w-full sm:w-auto">
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

