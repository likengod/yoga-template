# Packaging Script for Shakti Yoga Production Node.js Web App Deployment
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($ScriptDir) { Set-Location $ScriptDir }

$ProgressPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function New-PosixZip {
    param(
        [Parameter(Mandatory=$true)][string]$SourceDir,
        [Parameter(Mandatory=$true)][string]$DestinationZip
    )
    $resolvedSource = (Resolve-Path $SourceDir).Path.TrimEnd('\')
    if (Test-Path $DestinationZip) { Remove-Item $DestinationZip -Force }
    $fullZipPath = Join-Path (Get-Location).Path $DestinationZip
    $zip = [System.IO.Compression.ZipFile]::Open($fullZipPath, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        $files = Get-ChildItem -Path $resolvedSource -Recurse -File -Force
        foreach ($file in $files) {
            $relPath = $file.FullName.Substring($resolvedSource.Length + 1).Replace('\', '/')
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relPath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    }
    finally {
        $zip.Dispose()
    }
}

Write-Host "1. Compiling TypeScript server..."
Push-Location server
npx tsc
$tscExit = $LASTEXITCODE
Pop-Location
if ($tscExit -ne 0) { throw "Server TypeScript build failed" }

Write-Host "2. Preparing Node.js deployment staging directory..."
if (Test-Path deploy_node) { Remove-Item -Path deploy_node -Recurse -Force }
New-Item -ItemType Directory -Force -Path deploy_node | Out-Null
New-Item -ItemType Directory -Force -Path deploy_node\dist | Out-Null
New-Item -ItemType Directory -Force -Path deploy_node\server | Out-Null

Copy-Item -Path "dist\*" -Destination deploy_node\dist -Recurse -Force
Copy-Item -Path server.js, index.js, app.js, ecosystem.config.js, ecosystem.config.cjs, .npmrc, .env.example -Destination deploy_node -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path server -Exclude node_modules, .env | Copy-Item -Destination deploy_node\server -Recurse -Force
Remove-Item -Path deploy_node\server\.env, deploy_node\server\prisma\dev.db -Force -ErrorAction SilentlyContinue

# Production package.json with CommonJS (no "type": "module") and all backend dependencies
$nodePkg = @'
{
  "name": "shakti-yoga-app",
  "version": "1.0.4",
  "private": true,
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "postinstall": "prisma generate --schema=./server/prisma/schema.prisma",
    "build": "prisma generate --schema=./server/prisma/schema.prisma"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "compression": "^1.8.1",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^8.5.2",
    "helmet": "^8.2.0",
    "jsonwebtoken": "^9.0.3",
    "multer": "^2.2.0",
    "mysql2": "^3.22.5",
    "prisma": "^5.22.0",
    "zod": "^4.4.3"
  },
  "engines": {
    "node": ">=18"
  }
}
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location).Path "deploy_node\package.json"), $nodePkg, (New-Object System.Text.UTF8Encoding $false))

$readmeText = @'
=====================================================
  SHAKTI YOGA - PRODUCTION NODE.JS DEPLOYMENT GUIDE
=====================================================

Follow these steps to deploy on cPanel (or Hostinger / CloudLinux / Phusion Passenger):

1. UPLOAD & EXTRACT:
   Upload "shakti-yoga-nodejs-deploy.zip" to your web root (e.g. /home/user/shaktiyogaraai.com or public_html) and Extract all files.

2. CONFIGURE .ENV:
   Create or verify your ".env" file in the application root folder with your database credentials:
   -------------------------------------------------
   PORT=3000
   DATABASE_URL="mysql://DB_USER:DB_PASS@localhost:3306/DB_NAME"
   DB_HOST="localhost"
   DB_PORT=3306
   DB_USER="DB_USER"
   DB_PASSWORD="DB_PASS"
   DB_NAME="DB_NAME"
   ADMIN_EMAIL="admin@shaktiyogaraai.com"
   ADMIN_PASSWORD="YourPassword"
   JWT_SECRET="YourSecureJwtSecretKey32CharsMin"
   NODE_ENV="production"
   -------------------------------------------------

3. SETUP IN CPANEL:
   a. Go to cPanel -> "Setup Node.js App".
   b. Select Node.js version 18.x or 20.x or 22.x.
   c. Set Application root to your folder path.
   d. Set Application startup file to: server.js (or app.js).
   e. Click "Run NPM Install" button (this installs all dependencies and builds Prisma engine).
   f. Click "Restart" application.

4. LOGS & TROUBLESHOOTING:
   If anything fails to start, check "passenger_error.log" created automatically in the root folder.
=====================================================
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location).Path "deploy_node\README_DEPLOY.txt"), $readmeText, (New-Object System.Text.UTF8Encoding $false))

Write-Host "3. Creating shakti-yoga-nodejs-deploy.zip..."
New-PosixZip -SourceDir "deploy_node" -DestinationZip "shakti-yoga-nodejs-deploy.zip"
Remove-Item -Path deploy_node -Recurse -Force

Write-Host "SUCCESS: Created shakti-yoga-nodejs-deploy.zip"
Get-Item shakti-yoga-nodejs-deploy.zip | Select-Object Name, Length, LastWriteTime
