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

# 1. Build Vite frontend
npm run build
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }

# 2. Compile TypeScript server
Push-Location server
npx tsc
$tscExit = $LASTEXITCODE
Pop-Location
if ($tscExit -ne 0) { throw "Server TypeScript build failed" }

# 3. Prepare PHP / public_html deployment directory (NO package.json so Hostinger won't re-run vite build)
if (Test-Path deploy_temp) { Remove-Item -Path deploy_temp -Recurse -Force }
New-Item -ItemType Directory -Force -Path deploy_temp | Out-Null

# Copy production built frontend from dist/ directly to the root of deployment
Copy-Item -Path "dist\*" -Destination deploy_temp -Recurse -Force

# Copy API bridge, Setup Wizard, Database schema, and .htaccess to root
Copy-Item -Path "public\setup.php" -Destination deploy_temp\setup.php -Force
Copy-Item -Path "public\api.php" -Destination deploy_temp\api.php -Force
Copy-Item -Path "public\schema.sql" -Destination deploy_temp\schema.sql -Force
Copy-Item -Path "public\.htaccess" -Destination deploy_temp\.htaccess -Force

# Package PHP / public_html zip with POSIX forward slashes
New-PosixZip -SourceDir "deploy_temp" -DestinationZip "shakti-yoga-deploy-live.zip"
Remove-Item -Path deploy_temp -Recurse -Force
Write-Host "Deployment package shakti-yoga-deploy-live.zip (PHP / public_html) created successfully!"

# 4. Prepare Node.js Web App deployment directory
if (Test-Path deploy_node) { Remove-Item -Path deploy_node -Recurse -Force }
New-Item -ItemType Directory -Force -Path deploy_node | Out-Null
New-Item -ItemType Directory -Force -Path deploy_node\dist | Out-Null
New-Item -ItemType Directory -Force -Path deploy_node\server | Out-Null

Copy-Item -Path "dist\*" -Destination deploy_node\dist -Recurse -Force
Remove-Item -Path deploy_node\dist\setup.php, deploy_node\dist\api.php, deploy_node\dist\.htaccess, deploy_node\dist\_redirects, deploy_node\dist\schema.sql -Force -ErrorAction SilentlyContinue
Copy-Item -Path server.js, index.js, app.js, ecosystem.config.js, ecosystem.config.cjs, .npmrc, .env.example -Destination deploy_node -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path server -Exclude node_modules, .env | Copy-Item -Destination deploy_node\server -Recurse -Force
Remove-Item -Path deploy_node\server\.env, deploy_node\server\prisma\dev.db -Force -ErrorAction SilentlyContinue

$nodePkg = @'
{
  "name": "shakti-yoga-app",
  "version": "1.0.4",
  "private": true,
  "main": "server.js",
  "scripts": {
    "postinstall": "prisma generate --schema=./server/prisma/schema.prisma",
    "build": "prisma generate --schema=./server/prisma/schema.prisma",
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
Write-Host "Deployment package shakti-yoga-nodejs-deploy.zip (Hostinger Node.js Web App) created successfully!"
