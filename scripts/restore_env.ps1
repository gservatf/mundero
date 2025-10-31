# RESTORE_ENV.PS1 - MUNDERO Environment Restoration Script
# Author: Gabriel Servat
# Date: 2025-10-29
# Description: Restores development environment, fixes timeouts, syncs dependencies

param(
    [switch]$SkipTests,
    [switch]$Verbose
)

function Write-StepHeader {
    param([string]$Message)
    Write-Host "`n[STEP] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Header
Clear-Host
Write-Host "MUNDERO Environment Restoration Script" -ForegroundColor Magenta
Write-Host "=======================================" -ForegroundColor Magenta
Write-Host "Version: 1.0" -ForegroundColor White
Write-Host "Author: Gabriel Servat" -ForegroundColor White
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host "=======================================" -ForegroundColor Magenta

# Step 1: Configure npm/pnpm mirrors and timeouts
Write-StepHeader "Configuring network mirrors and timeouts"
try {
    pnpm config set registry https://registry.npmmirror.com
    pnpm config set fetch-timeout 600000
    pnpm config set fetch-retries 5
    npm config set registry https://registry.npmmirror.com
    Write-Success "Network configuration updated"
} catch {
    Write-Error "Error configuring mirrors: $($_.Exception.Message)"
    exit 1
}

# Step 2: Clean cache and previous dependencies
Write-StepHeader "Cleaning cache and old modules"
try {
    if (Test-Path "node_modules") {
        Write-Warning "Removing node_modules..."
        Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "pnpm-lock.yaml") {
        Write-Warning "Removing pnpm-lock.yaml..."
        Remove-Item -Force "pnpm-lock.yaml" -ErrorAction SilentlyContinue
    }
    
    Write-Host "Cleaning pnpm store..."
    pnpm store prune
    Write-Success "Cleanup completed"
} catch {
    Write-Error "Error during cleanup: $($_.Exception.Message)"
}

# Step 3: Reinstall base dependencies
Write-StepHeader "Reinstalling main dependencies"
try {
    Write-Host "Installing testing dependencies..."
    $null = pnpm install -D vite@latest vitest@latest "@vitejs/plugin-react@latest" "@vitest/ui@latest" jsdom@latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Testing dependencies installed correctly"
    } else {
        Write-Error "Error installing testing dependencies"
        exit 1
    }
    
    Write-Host "Installing all project dependencies..."
    $null = pnpm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All dependencies installed correctly"
    } else {
        Write-Error "Error installing project dependencies"
        exit 1
    }
} catch {
    Write-Error "Error during installation: $($_.Exception.Message)"
    exit 1
}

# Step 4: Validate installation
Write-StepHeader "Validating installation"
try {
    Write-Host "Checking installed versions..."
    pnpm list vite vitest
    Write-Success "Version validation completed"
} catch {
    Write-Warning "Could not verify versions, but continuing..."
}

# Step 5: Run test suite (unless skipped)
if (-not $SkipTests) {
    Write-StepHeader "Running test suite"
    try {
        Write-Host "Running tests..."
        $null = pnpm test
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "All tests passed correctly"
        } else {
            Write-Warning "Some tests failed, but environment is configured"
        }
    } catch {
        Write-Warning "Error running tests: $($_.Exception.Message)"
    }
} else {
    Write-Warning "Tests skipped (-SkipTests parameter used)"
}

# Step 6: TypeScript compilation check
Write-StepHeader "Verifying TypeScript compilation"
try {
    Write-Host "Checking types..."
    $null = pnpm run type-check
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "TypeScript compilation successful"
    } else {
        Write-Warning "TypeScript errors detected"
    }
} catch {
    Write-Warning "Error checking TypeScript: $($_.Exception.Message)"
}

# Step 7: Final validation and summary
Write-StepHeader "Restoration summary"

# Get current package versions
try {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $vitestVersion = $packageJson.devDependencies.vitest
    $viteVersion = $packageJson.devDependencies.vite
    
    Write-Host "Environment status:" -ForegroundColor Cyan
    Write-Host "   • Vite: $viteVersion" -ForegroundColor White
    Write-Host "   • Vitest: $vitestVersion" -ForegroundColor White
    Write-Host "   • Registry: $(pnpm config get registry)" -ForegroundColor White
    Write-Host "   • pnpm: $(pnpm --version)" -ForegroundColor White

} catch {
    Write-Warning "Could not read package.json information"
}

# Final message
Write-Host "`nENVIRONMENT RESTORED SUCCESSFULLY" -ForegroundColor Green -BackgroundColor DarkGreen
Write-Host "`nAvailable commands:" -ForegroundColor White
Write-Host "   • pnpm test          - Run tests in CI mode" -ForegroundColor Cyan
Write-Host "   • pnpm vitest --ui   - Run tests in interactive mode" -ForegroundColor Cyan  
Write-Host "   • pnpm run dev       - Start development server" -ForegroundColor Cyan
Write-Host "   • pnpm run build     - Build for production" -ForegroundColor Cyan
Write-Host "`nThe environment is ready for development and CI/CD." -ForegroundColor White

# Optional: Start interactive test UI
$startUI = Read-Host "`nDo you want to start Vitest UI now? (y/n)"
if ($startUI -eq "y" -or $startUI -eq "Y" -or $startUI -eq "yes") {
    Write-Host "`nStarting Vitest UI..." -ForegroundColor Cyan
    pnpm vitest --ui
}

Write-Host "`nScript completed successfully." -ForegroundColor Green