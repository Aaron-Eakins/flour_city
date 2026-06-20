@echo off
cd /d "%~dp0"
echo Installing dependencies (from workspace root)...
REM This worker depends on the @flour-city/email-core workspace package, so the
REM install must run at the repo root to create the symlink wrangler bundles.
call npm install --prefix "%~dp0..\.." > deploy-log.txt 2>&1
echo Deploying to Cloudflare...
npx wrangler deploy >> deploy-log.txt 2>&1
echo Done. Check deploy-log.txt for results.
pause
