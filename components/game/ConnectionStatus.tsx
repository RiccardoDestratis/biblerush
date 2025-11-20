"use client";

import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/lib/types/realtime";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  className?: string;
}

/**
 * ConnectionStatus component displays the realtime connection status
 * - Green dot: connected
 * - Yellow dot: reconnecting
 * - Red dot: failed/disconnected
 */
export function ConnectionStatus({ status, className }: ConnectionStatusIndicatorProps) {
  const statusConfig = {
    connected: {
      color: "bg-green-500",
      icon: Wifi,
      label: "Connected",
      ariaLabel: "Realtime connection is active",
    },
    reconnecting: {
      color: "bg-yellow-500",
      icon: AlertCircle,
      label: "Reconnecting...",
      ariaLabel: "Realtime connection is reconnecting",
    },
    failed: {
      color: "bg-red-500",
      icon: WifiOff,
      label: "Connection failed",
      ariaLabel: "Realtime connection has failed",
    },
    disconnected: {
      color: "bg-gray-400",
      icon: WifiOff,
      label: "Disconnected",
      ariaLabel: "Realtime connection is disconnected",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        className
      )}
      role="status"
      aria-label={config.ariaLabel}
    >
      <div className="relative">
        <div
          className={cn(
            "h-3 w-3 rounded-full",
            config.color,
            status === "reconnecting" && "animate-pulse"
          )}
          aria-hidden="true"
        />
        {status === "connected" && (
          <div
            className={cn(
              "absolute inset-0 h-3 w-3 rounded-full animate-ping",
              config.color,
              "opacity-75"
            )}
            aria-hidden="true"
          />
        )}
      </div>
      <Icon
        className={cn(
          "h-4 w-4",
          status === "connected" && "text-green-600",
          status === "reconnecting" && "text-yellow-600",
          status === "failed" && "text-red-600",
          status === "disconnected" && "text-gray-500"
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "text-xs font-medium",
          status === "connected" && "text-green-700",
          status === "reconnecting" && "text-yellow-700",
          status === "failed" && "text-red-700",
          status === "disconnected" && "text-gray-600"
        )}
      >
        {config.label}
      </span>
    </div>
  );
}

