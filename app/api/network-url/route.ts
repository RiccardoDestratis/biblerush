import { NextRequest, NextResponse } from "next/server";
import os from "os";

/**
 * Get the network IP address (non-internal IPv4)
 */
function getNetworkIp(): string | null {
  const nets = os.networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    const interfaces = nets[name];
    if (!interfaces) continue;
    
    for (const net of interfaces) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  
  return null;
}

/**
 * API route to get the network URL for QR codes
 * 
 * Development: Returns the network IP (e.g., http://192.168.2.105:3000) 
 *              so you can test on mobile devices on the same network
 * 
 * Production: Returns the configured NEXT_PUBLIC_APP_URL or the request origin
 *             (e.g., https://yourdomain.com)
 */
export async function GET(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const port = process.env.PORT || "3000";
  
  // In development: detect network IP for mobile testing
  if (isDevelopment) {
    const networkIp = getNetworkIp();
    
    if (networkIp) {
      return NextResponse.json({
        networkUrl: `http://${networkIp}:${port}`,
        origin: request.headers.get("host") || `localhost:${port}`,
      });
    }
  }
  
  // Production: use configured APP_URL or request origin
  // This ensures QR codes work with the actual domain in production
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origin = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || 
                   (request.url.startsWith("https") ? "https" : "http");
  
  // In production, prefer NEXT_PUBLIC_APP_URL if set, otherwise use request origin
  const productionUrl = appUrl || (origin ? `${protocol}://${origin}` : null);
  
  return NextResponse.json({
    networkUrl: productionUrl || `http://localhost:${port}`, // Fallback for dev
    origin: origin || `localhost:${port}`,
  });
}

