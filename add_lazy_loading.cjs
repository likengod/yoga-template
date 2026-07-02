const fs = require('fs');
const path = require('path');

const SKIP_FILES = ['Hero.tsx'];

function processFile(filepath) {
    const filename = path.basename(filepath);
    if (SKIP_FILES.includes(filename)) return;

    let content = fs.readFileSync(filepath, 'utf-8');
    
    // Regex to match <img without loading="lazy" or loading={'lazy'}
    const newContent = content.replace(/<img\b(?![^>]*\bloading=(?:["']lazy["']|\{["']lazy["']\}))/g, '<img loading="lazy"');
    
    if (newContent !== content) {
        fs.writeFileSync(filepath, newContent, 'utf-8');
        console.log(`Updated ${filepath}`);
    }
}

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

scanDir('src/components');
scanDir('src/pages');
