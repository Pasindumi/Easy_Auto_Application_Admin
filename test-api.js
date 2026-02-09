// Quick API Test Script
// Run this in your browser console (F12 → Console) to test the connection

async function testDashboardAPI() {
    console.log('🔍 Testing Dashboard API Connection...\n');
    
    const baseURL = 'http://localhost:5000';
    const token = localStorage.getItem('adminToken');
    
    console.log('📍 Base URL:', baseURL);
    console.log('🔑 Token:', token ? 'Present' : 'Missing');
    
    try {
        // Test 1: Root endpoint
        console.log('\n✅ Test 1: Root Endpoint');
        const rootResponse = await fetch(baseURL);
        const rootData = await rootResponse.json();
        console.log('Response:', rootData);
        
        // Test 2: Stats endpoint
        console.log('\n✅ Test 2: Stats Endpoint');
        const statsResponse = await fetch(`${baseURL}/api/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Status:', statsResponse.status);
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('✅ SUCCESS! Stats Data:', statsData);
        } else {
            const errorText = await statsResponse.text();
            console.log('❌ ERROR Response:', errorText);
            
            if (statsResponse.status === 404) {
                console.log('\n💡 The /api/admin/stats endpoint does not exist!');
                console.log('📝 You need to create this endpoint in your backend.');
            } else if (statsResponse.status === 401) {
                console.log('\n💡 Unauthorized - Check your token');
            }
        }
        
    } catch (error) {
        console.error('❌ Connection failed:', error);
        console.log('\n💡 Make sure backend is running on http://localhost:5000');
    }
}

// Run the test
testDashboardAPI();
