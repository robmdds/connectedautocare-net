// auth-debug.js - Test authentication directly
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000'; // Adjust if your server runs on different port

async function testAuth() {
    console.log('=== Authentication Debug Test ===\n');

    const testAccounts = [
        { email: 'admin@connectedautocare.net', password: 'admin123' },
        { email: 'rm@pdgsinc.com', password: 'robmm123' },
        { email: 'test@wrong.com', password: 'wrongpassword' }
    ];

    for (const account of testAccounts) {
        console.log(`Testing: ${account.email} with password: ${account.password}`);

        try {
            const response = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: account.email,
                    password: account.password
                })
            });

            const result = await response.json();

            console.log(`Status: ${response.status}`);
            console.log(`Response:`, result);

            if (response.ok) {
                console.log('✅ LOGIN SUCCESS\n');

                // Test getting user info with session
                const userResponse = await fetch(`${BASE_URL}/api/auth/user`, {
                    method: 'GET',
                    headers: {
                        'Cookie': response.headers.get('set-cookie') || ''
                    }
                });

                const userData = await userResponse.json();
                console.log('User data:', userData);

            } else {
                console.log('❌ LOGIN FAILED\n');
            }

        } catch (error) {
            console.log(`❌ REQUEST ERROR: ${error.message}\n`);
        }
    }

    // Test quick admin access
    console.log('\n=== Testing Quick Admin Access ===');
    try {
        const response = await fetch(`${BASE_URL}/api/auth/admin-access`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        });

        const result = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Response:`, result);

    } catch (error) {
        console.log(`❌ QUICK ADMIN ERROR: ${error.message}`);
    }
}

// Test if server is running
async function testServerHealth() {
    try {
        const response = await fetch(`${BASE_URL}/healthz`);
        const data = await response.json();
        console.log('✅ Server is running:', data);
        return true;
    } catch (error) {
        console.log('❌ Server not reachable:', error.message);
        return false;
    }
}

// Run tests
async function runTests() {
    console.log('Testing server connectivity...\n');

    const serverUp = await testServerHealth();
    if (!serverUp) {
        console.log('Please start your server first: npm run dev');
        return;
    }

    console.log('\n');
    await testAuth();
}

runTests().catch(console.error);