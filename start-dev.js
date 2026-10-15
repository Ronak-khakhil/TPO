import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('===============================================================');
console.log('🚀 Starting Campus Placement Communication & Tracking System...');
console.log('===============================================================');

// 1. Launch Backend Server
const serverProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
});

// 2. Launch Vite Client
const clientProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

clientProcess.on('error', (err) => {
  console.error('Failed to start client:', err);
});

// Process cleanup on exit
const cleanup = () => {
  console.log('\nStopping servers...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
