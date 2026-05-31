const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');
const EXAMPLE_PATH = path.join(ROOT, '.env.example');

function parseEnv(content) {
    const vars = new Map();
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.slice(0, eqIndex).trim();
        vars.set(key, trimmed);
    }
    return vars;
}

function main() {
    if (!fs.existsSync(EXAMPLE_PATH)) {
        console.error('❌ .env.example not found');
        process.exit(1);
    }

    if (!fs.existsSync(ENV_PATH)) {
        console.error('❌ .env not found. Copy .env.example to .env first.');
        process.exit(1);
    }

    const exampleVars = parseEnv(fs.readFileSync(EXAMPLE_PATH, 'utf8'));
    const envContent = fs.readFileSync(ENV_PATH, 'utf8');
    const envVars = parseEnv(envContent);

    const missing = [];
    for (const [key, line] of exampleVars) {
        if (!envVars.has(key)) {
            missing.push({ key, line });
        }
    }

    if (missing.length === 0) {
        console.log('✅ .env is up to date with .env.example');
        return;
    }

    console.log(`\n📋 Found ${missing.length} new variable(s) in .env.example:\n`);
    for (const { key, line } of missing) {
        console.log(`  + ${key} = ${line.split('=')[1] || '(empty)'}`);
    }

    // Append new variables to .env
    let appendContent = envContent.endsWith('\n') ? '' : '\n';
    appendContent += '\n# Added by update_env.js\n';
    for (const { line } of missing) {
        appendContent += line + '\n';
    }

    fs.appendFileSync(ENV_PATH, appendContent, 'utf8');
    console.log(`\n✅ Added ${missing.length} variable(s) to .env`);
}

main();
