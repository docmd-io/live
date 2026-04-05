// deploy-script.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deploy() {
    console.log('🚀 Starting deployment build for live.docmd.io...');

    // 1. Clean previous build
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
        console.log('🧹 Cleaning previous dist...');
        fs.rmSync(distDir, { recursive: true, force: true });
    }

    try {
        // 2. Run docmd live --build-only
        // We use npx to ensure we use the locally installed version from package.json
        console.log('🔨 Building Live Editor bundle...');
        execSync('npx docmd live --build-only', { 
            stdio: 'inherit',
            cwd: __dirname 
        });

        // 2.5 Relocate files
        // Since @docmd/live writes to its own public folder, we need to copy it to dist
        const buildOutput = path.join(__dirname, 'node_modules', '@docmd/live', 'public');
        if (fs.existsSync(buildOutput)) {
            console.log('📂 Moving built files to dist...');
            fs.cpSync(buildOutput, distDir, { recursive: true });
        } else {
            console.error('❌ Build output not found in node_modules!');
            process.exit(1);
        }

        // 3. Copy CNAME
        // GitHub Pages requires the CNAME file to be inside the uploaded folder
        if (fs.existsSync(path.join(__dirname, 'CNAME'))) {
            console.log('📄 Copying CNAME...');
            fs.copyFileSync(
                path.join(__dirname, 'CNAME'), 
                path.join(distDir, 'CNAME')
            );
        }

        console.log('✅ Build complete. /dist is ready for deployment.');

    } catch (e) {
        console.error('❌ Build failed:', e.message);
        process.exit(1);
    }
}

deploy();