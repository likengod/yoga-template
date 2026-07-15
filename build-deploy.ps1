npm run build
Push-Location server
npx tsc
Pop-Location
New-Item -ItemType Directory -Force -Path deploy_temp
Copy-Item -Path dist, package.json, package-lock.json, index.js, app.js, ecosystem.config.js -Destination deploy_temp -Recurse
New-Item -ItemType Directory -Force -Path deploy_temp\server
Get-ChildItem -Path server -Exclude node_modules | Copy-Item -Destination deploy_temp\server -Recurse
Compress-Archive -Path deploy_temp\* -DestinationPath shakti-yoga-deploy-live.zip -Force
Remove-Item -Path deploy_temp -Recurse -Force
Write-Host "Deployment zip created successfully!"
