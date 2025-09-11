// password-hash-script.js (ES Module version)
// Run this with: node password-hash-script.js

import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';

async function hashAndTest() {
    console.log('=== Password Hashing and Testing ===\n');

    // Define the passwords we want to hash
    const passwords = {
        'admin@connectedautocare.net': 'admin123',
        'rm@pdgsinc.com': 'robmm123',
        'test@example.com': 'password123'
    };

    console.log('🔐 Generating bcrypt hashes...\n');

    const hashes = {};
    for (const [email, password] of Object.entries(passwords)) {
        const hash = await bcrypt.hash(password, 12);
        hashes[email] = hash;
        console.log(`${email}: ${password}`);
        console.log(`Hash: ${hash}\n`);
    }

    console.log('=== SQL UPDATE STATEMENTS ===\n');

    // Generate SQL update statements
    for (const [email, hash] of Object.entries(hashes)) {
        console.log(`UPDATE users SET password_hash = '${hash}', provider = 'local' WHERE email = '${email}';`);
    }

    console.log('\n=== VERIFICATION TESTS ===\n');

    // Test the hashes work correctly
    for (const [email, password] of Object.entries(passwords)) {
        const hash = hashes[email];
        const isValid = await bcrypt.compare(password, hash);
        console.log(`${email} with password "${password}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }

    console.log('\n=== TEST WRONG PASSWORDS ===\n');

    // Test with wrong passwords
    const wrongTests = [
        ['admin@connectedautocare.net', 'wrongpassword'],
        ['rm@pdgsinc.com', 'incorrect123'],
    ];

    for (const [email, wrongPassword] of wrongTests) {
        const hash = hashes[email];
        const isValid = await bcrypt.compare(wrongPassword, hash);
        console.log(`${email} with wrong password "${wrongPassword}": ${isValid ? '❌ SHOULD BE INVALID' : '✅ CORRECTLY INVALID'}`);
    }

    console.log('\n=== DEBUGGING INFO ===\n');

    // Get bcryptjs version
    try {
        const packageJson = JSON.parse(readFileSync('./node_modules/bcryptjs/package.json', 'utf8'));
        console.log('bcryptjs version:', packageJson.version);
    } catch (e) {
        console.log('bcryptjs version: Could not determine');
    }

    console.log('Salt rounds used: 12');
    console.log('Hash format: bcrypt');

    // Test what's currently in your database
    console.log('\n=== TEST CURRENT DB HASH ===');
    const currentHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3ufR6LQwg2';
    const testPasswords = ['password123', 'admin123', 'robmm123'];

    console.log(`Testing current DB hash: ${currentHash}`);
    for (const testPwd of testPasswords) {
        const isValid = await bcrypt.compare(testPwd, currentHash);
        console.log(`  Password "${testPwd}": ${isValid ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
}

// Alternative manual hash function for specific passwords
async function generateSpecificHashes() {
    console.log('\n=== MANUAL HASH GENERATION ===\n');

    const admin123Hash = await bcrypt.hash('admin123', 12);
    const robmm123Hash = await bcrypt.hash('robmm123', 12);

    console.log('For admin123:', admin123Hash);
    console.log('For robmm123:', robmm123Hash);

    // Verify they work
    console.log('\nVerification:');
    console.log('admin123 hash valid:', await bcrypt.compare('admin123', admin123Hash));
    console.log('robmm123 hash valid:', await bcrypt.compare('robmm123', robmm123Hash));

    console.log('\n=== COPY THESE SQL STATEMENTS ===\n');
    console.log(`UPDATE users SET password_hash = '${admin123Hash}', provider = 'local' WHERE email = 'admin@connectedautocare.net';`);
    console.log(`UPDATE users SET password_hash = '${robmm123Hash}', provider = 'local' WHERE email = 'rm@pdgsinc.com';`);
}

// Run the script
hashAndTest().then(() => {
    return generateSpecificHashes();
}).catch(console.error);