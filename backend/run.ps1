# CapitalForge AI backend — always run from this folder
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path .\.venv\Scripts\uvicorn.exe)) {
    Write-Host "Creating Python 3.13 venv..."
    py -3.13 -m venv .venv
    .\.venv\Scripts\python.exe -m pip install --upgrade pip
    .\.venv\Scripts\pip install -r requirements.txt
}

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "Created .env from .env.example — set OPENAI_API_KEY before analyzing."
}

Write-Host "Starting CapitalForge AI on http://0.0.0.0:8000 ..."
.\.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
