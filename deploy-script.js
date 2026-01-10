// deploy-script.js

const fs = require('fs');
const path = require('path');

async function deploy() {
    console.log('🔍 Locating docmd engine...');

    try {
        const mainEntryPath = require.resolve('@mgks/docmd');
        const srcDir = path.dirname(mainEntryPath);
        const internalBuilderPath = path.join(srcDir, 'commands', 'live.js');

        const docmdRoot = path.resolve(srcDir, '..');

        if (!fs.existsSync(internalBuilderPath)) {
            throw new Error(`Could not find builder at ${internalBuilderPath}`);
        }

        console.log('🚀 Triggering internal build...');

        const { build } = require(internalBuilderPath);

        await build();

        const sourceDist = path.join(docmdRoot, 'dist');
        const targetDist = path.join(__dirname, 'dist');

        console.log(`📦 Moving artifacts from ${sourceDist} to ${targetDist}...`);
        
        if (fs.existsSync(targetDist)) {
            fs.rmSync(targetDist, { recursive: true, force: true });
        }
        
        fs.cpSync(sourceDist, targetDist, { recursive: true });
        
        if (fs.existsSync(path.join(__dirname, 'CNAME'))) {
            fs.copyFileSync(path.join(__dirname, 'CNAME'), path.join(targetDist, 'CNAME'));
        }
        
        console.log('✅ Ready for deployment.');

    } catch (e) {
        console.error('❌ Error locating or running docmd:', e);
        process.exit(1);
    }
}

deploy().catch(err => {
    console.error('❌ Deployment script failed:', err);
    process.exit(1);
});