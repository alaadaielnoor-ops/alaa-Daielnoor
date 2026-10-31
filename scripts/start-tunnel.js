import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outPath = path.resolve('data/active-tunnel.json');

console.log('Starting cloudflared tunnel on port 3000...');
const child = spawn('npx', ['--yes', 'cloudflared', 'tunnel', '--protocol', 'http2', '--url', 'http://127.0.0.1:3000'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let urlFound = false;

function processOutput(data) {
  const str = data.toString();
  console.log('[cloudflared]:', str);
  const match = str.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match && !urlFound) {
    urlFound = true;
    const tunnelUrl = match[0];
    console.log('🎉 ACTIVE PUBLIC TUNNEL URL:', tunnelUrl);
    fs.writeFileSync(outPath, JSON.stringify({
      tunnelUrl,
      webhookUrl: `${tunnelUrl}/api/whatsapp/webhook`,
      startedAt: new Date().toISOString()
    }, null, 2));
  }
}

child.stdout.on('data', processOutput);
child.stderr.on('data', processOutput);

child.on('error', (err) => {
  console.error('cloudflared process error:', err);
});

child.on('exit', (code) => {
  console.log('cloudflared exited with code:', code);
});
