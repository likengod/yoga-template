const fs = require('fs');
const path = require('path');

function getLinesOfCode(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
}

const fileStats = [];

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            fileStats.push({
                file: fullPath,
                lines: getLinesOfCode(fullPath)
            });
        }
    }
}

scanDir('src/components');
scanDir('src/pages');

fileStats.sort((a, b) => b.lines - a.lines);

console.log("Top 10 Largest Files (Candidates for Modularization):");
fileStats.slice(0, 10).forEach((stat, index) => {
    console.log(`${index + 1}. ${stat.file} - ${stat.lines} lines`);
});
