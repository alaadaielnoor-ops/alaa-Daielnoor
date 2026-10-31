import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

const outPath = path.resolve('data/active-tunnel.json');
let retryCount = 0;
const MAX_RETRIES = 3;

export function startCloudflareTunnel(onUrlReady?: (url: string) => void): ChildProcess | null {
  // Only start tunnel if explicitly requested via env variable to prevent container crashes
  if (process.env.ENABLE_TUNNEL !== 'true') {
    console.log('[Tunnel] Cloudflare tunnel is disabled by default in cloud container environment (ENABLE_TUNNEL != true).');
    if (fs.existsSync(outPath) && onUrlReady) {
      try {
        const existing = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
        if (existing?.webhookUrl) {
          onUrlReady(existing.webhookUrl);
        }
      } catch (_) {}
    }
    return null;
  }

  if (retryCount >= MAX_RETRIES) {
    console.warn('[Tunnel] Maximum tunnel retry attempts reached. Halting auto-restart.');
    return null;
  }

  console.log('[Tunnel] Spawning cloudflared tunnel on port 3000 with http2...');
  
  try {
    const child = spawn('npx', ['--yes', 'cloudflared', 'tunnel', '--protocol', 'http2', '--url', 'http://127.0.0.1:3000'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let activeUrl = '';

    const handleOutput = (chunk: Buffer) => {
      const text = chunk.toString();
      
      // Look for trycloudflare.com URL
      const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match && (!activeUrl || activeUrl !== match[0])) {
        activeUrl = match[0];
        const webhookUrl = `${activeUrl}/api/whatsapp/webhook`;
        console.log('🚀 [Tunnel Ready]:', webhookUrl);
        retryCount = 0;
        
        try {
          fs.writeFileSync(outPath, JSON.stringify({
            tunnelUrl: activeUrl,
            webhookUrl,
            verified: true,
            updatedAt: new Date().toISOString()
          }, null, 2));
        } catch (err) {
          console.error('Failed to write active-tunnel.json:', err);
        }

        if (onUrlReady) onUrlReady(webhookUrl);
      }
    };

    child.stdout?.on('data', handleOutput);
    child.stderr?.on('data', handleOutput);

    child.on('error', (err) => {
      console.error('[Tunnel Error]:', err);
    });

    child.on('exit', (code) => {
      console.warn('[Tunnel] Exited with code:', code);
      retryCount++;
      if (retryCount < MAX_RETRIES) {
        console.log(`[Tunnel] Retrying in 10s (attempt ${retryCount}/${MAX_RETRIES})...`);
        setTimeout(() => startCloudflareTunnel(onUrlReady), 10000);
      }
    });

    return child;
  } catch (err) {
    console.error('[Tunnel Spawn Exception]:', err);
    return null;
  }
}

