Set-Location "C:\Users\gorillatech\Documents\shakti-yoga-rebuild-54-main\shakti-yoga-rebuild-54-main"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function New-PosixZip {
    param([string]$SourceDir, [string]$DestinationZip)
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

# 1. Compile server
Push-Location server
npx tsc
Pop-Location

# 2. Package Node.js Web App deployment (Hostinger Express / Node.js)
if (Test-Path deploy_node) { Remove-Item -Path deploy_node -Recurse -Force }
New-Item -ItemType Directory -Force -Path deploy_node | Out-Null
New-Item -ItemType Directory -Force -Path deploy_node\dist | Out-Null
New-Item -ItemType Directory -Force -Path deploy_node\server | Out-Null

Copy-Item -Path "dist\*" -Destination deploy_node\dist -Recurse -Force
Copy-Item -Path server.js, index.js, app.js, ecosystem.config.js, ecosystem.config.cjs, .npmrc -Destination deploy_node -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path server -Exclude node_modules, .env | Copy-Item -Destination deploy_node\server -Recurse -Force
Remove-Item -Path deploy_node\server\.env, deploy_node\server\prisma\dev.db -Force -ErrorAction SilentlyContinue

$nodePkg = @'
{
  "name": "shakti-yoga-app",
  "version": "1.0.2",
  "private": true,
  "main": "server.js",
  "scripts": {
    "build": "cd server && npm install --omit=dev --legacy-peer-deps && npx prisma generate",
    "postinstall": "cd server && npm install --omit=dev --legacy-peer-deps && npx prisma generate",
    "start": "node server.js"
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

New-PosixZip -SourceDir "deploy_node" -DestinationZip "shakti-yoga-nodejs-deploy.zip"
Remove-Item -Path deploy_node -Recurse -Force

Write-Host "SUCCESS: Created shakti-yoga-nodejs-deploy.zip"
Get-Item shakti-yoga-nodejs-deploy.zip | Select-Object Name, Length, LastWriteTime
