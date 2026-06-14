@echo off
cd /d "%~dp0"
echo Installing dependencies...
call npm install > deploy-log.txt 2>&1
echo Deploying to Cloudflare...
npx wrangler deploy >> deploy-log.txt 2>&1
echo Done. Check deploy-log.txt for results.
pause
