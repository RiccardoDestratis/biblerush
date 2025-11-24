/**
 * Get the network URL for the current server
 * In development, detects the network IP instead of localhost
 * In production, uses the configured APP_URL
 */
export function getNetworkUrl(): string {
  // In browser/client, use window.location
  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    
    // If already using an IP address or domain (not localhost), use it
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
    }
    
    // If using localhost, we can't detect network IP from browser
    // Return localhost URL (user can manually change it)
    return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  }
  
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Get network IP address (for display purposes)
 * Note: This only works if the page is accessed via network IP
 */
export function getNetworkIp(): string | null {
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    
    // If already using an IP address, return it
    if (hostname !== "localhost" && hostname !== "127.0.0.1" && /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return hostname;
    }
    
    // If using localhost, we can't detect network IP from browser
    return null;
  }
  
  return null;
}



