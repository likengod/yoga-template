// Shakti Yoga Production Server Entrypoint
// Supports Phusion Passenger, cPanel Node.js Selector, PM2, and direct Node.js execution.

const fs = require('fs');
const path = require('path');

function writeLog(prefix, err) {
  try {
    const logPath = path.join(__dirname, 'passenger_error.log');
    const time = new Date().toISOString();
    const details = (err && (err.stack || err.message)) ? (err.stack || err.message) : String(err);
    const line = `[${time}] [${prefix}] ${details}\n`;
    fs.appendFileSync(logPath, line);
    console.error(line);
  } catch (e) {
    console.error(`[${prefix}]`, err);
  }
}

process.on('uncaughtException', (err) => {
  writeLog('UNCAUGHT_EXCEPTION', err);
});

process.on('unhandledRejection', (reason) => {
  writeLog('UNHANDLED_REJECTION', reason);
});

try {
  // Load the compiled Express server
  require('./server/dist/index.js');
} catch (startupErr) {
  writeLog('STARTUP_ERROR', startupErr);

  // If the server failed to start (e.g. missing npm modules, unconfigured database),
  // start a resilient fallback HTTP server using Node built-in 'http' so Phusion Passenger
  // does not show a blank 503 Service Unavailable error.
  try {
    const http = require('http');
    const isPassenger = typeof (global).PhusionPassenger !== 'undefined';
    const envPort = process.env.PORT;

    const fallbackServer = http.createServer((req, res) => {
      res.writeHead(500, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      });

      const errMsg = startupErr && (startupErr.stack || startupErr.message || String(startupErr));
      const isMissingModule = errMsg.includes('Cannot find module');

      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shakti Yoga - Server Setup Notice</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; }
    .card { max-width: 750px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
    h1 { color: #f59e0b; font-size: 24px; margin-top: 0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; background: #dc2626; color: white; margin-bottom: 16px; }
    pre { background: #0b1120; border: 1px solid #334155; padding: 16px; border-radius: 8px; color: #f87171; overflow-x: auto; font-size: 13px; line-height: 1.5; }
    h3 { color: #38bdf8; margin-top: 24px; }
    ol { padding-left: 20px; line-height: 1.8; color: #cbd5e1; }
    code { background: #334155; padding: 2px 6px; border-radius: 4px; color: #fbbf24; font-size: 13px; }
    .footer { margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Action Required</div>
    <h1>Shakti Yoga &mdash; Application Notice</h1>
    <p>The application encountered a startup issue while initializing:</p>
    <pre>${errMsg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>

    ${isMissingModule ? `
    <h3>How to Fix (Missing Modules):</h3>
    <ol>
      <li>Log in to your <strong>cPanel</strong>.</li>
      <li>Open <strong>Setup Node.js App</strong>.</li>
      <li>Find your application and click <strong>Run NPM Install</strong>.</li>
      <li>Once installation completes, click <strong>Restart</strong>.</li>
    </ol>
    ` : `
    <h3>Troubleshooting Steps:</h3>
    <ol>
      <li>Verify your <code>.env</code> file in the application root contains valid <code>DATABASE_URL</code> and <code>ADMIN_PASSWORD</code> settings.</li>
      <li>In cPanel &rarr; <strong>Setup Node.js App</strong>, click <strong>Run NPM Install</strong> to ensure all dependencies and Prisma engine are initialized.</li>
      <li>Click <strong>Restart Application</strong> in cPanel.</li>
      <li>Detailed diagnostic logs are saved to <code>passenger_error.log</code> in your application root folder.</li>
    </ol>
    `}
    <div class="footer">Server time: ${new Date().toUTCString()} &bull; Shakti Yoga v1.0.4</div>
  </div>
</body>
</html>`);
    });

    if (isPassenger) {
      fallbackServer.listen('passenger', () => {
        writeLog('FALLBACK_SERVER', 'Listening on Phusion Passenger socket');
      });
    } else if (envPort && isNaN(Number(envPort))) {
      fallbackServer.listen(envPort, () => {
        writeLog('FALLBACK_SERVER', `Listening on socket ${envPort}`);
      });
    } else {
      const port = Number(envPort) || 3000;
      fallbackServer.listen(port, '0.0.0.0', () => {
        writeLog('FALLBACK_SERVER', `Listening on port ${port}`);
      });
    }
  } catch (listenErr) {
    writeLog('FALLBACK_LISTEN_ERROR', listenErr);
  }
}
