import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers
    });
  }

  // Health check response
  const healthData = {
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    service: 'GoodText API',
    platform: 'Netlify Functions'
  };

  return new Response(JSON.stringify(healthData), {
    status: 200,
    headers
  });
};

export const config: Config = {
  path: "/api/health"
}; 