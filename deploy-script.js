// deploy-script.js
const fs = require('fs');
const path = require('path');

async function deploy() {
    console.log('🔍 Locating docmd engine...');

    // 1. Find the internal build script inside node_modules
    // We look for package.json first to find the root of the package
    const docmdPkgPath = require.resolve('@mgks/docmd/package.json');
    const docmdRoot = path.dirname(docmdPkgPath);
    
    // The builder is located at src/commands/live.js in the package
    const internalBuilderPath = path.join(docmdRoot, 'src/commands/live.js');

    if (!fs.existsSync(internalBuilderPath)) {
        throw new Error(`Could not find builder at ${internalBuilderPath}`);
    }

    console.log('🚀 Triggering internal build...');

    // 2. Import the build function
    const { build } = require(internalBuilderPath);

    // 3. Execute Build
    // This will generate files into node_modules/@mgks/docmd/dist
    await build();

    // 4. Move artifacts to project root 'dist' for GitHub Pages
    const sourceDist = path.join(docmdRoot, 'dist');
    const targetDist = path.join(__dirname, 'dist');

    console.log(`📦 Moving artifacts from ${sourceDist} to ${targetDist}...`);
    
    // Clean target
    if (fs.existsSync(targetDist)) {
        fs.rmSync(targetDist, { recursive: true, force: true });
    }
    
    // Copy built assets
    fs.cpSync(sourceDist, targetDist, { recursive: true });
    
    // Copy CNAME to dist (Required because GH Pages serves from root of the artifact)
    if (fs.existsSync(path.join(__dirname, 'CNAME'))) {
        fs.copyFileSync(path.join(__dirname, 'CNAME'), path.join(targetDist, 'CNAME'));
    }
    
    console.log('✅ Ready for deployment.');
}

deploy().catch(err => {
    console.error('❌ Deployment script failed:', err);
    process.exit(1);
});