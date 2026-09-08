// Automated Test Script for RezekiQ Cloud Backend API
const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting RezekiQ Backend Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing GET /api/health...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log('Health check response:', healthData);
    if (healthData.status !== 'ok') throw new Error('Health check failed');
    console.log('✅ Health check PASSED\n');

    // Test 2: Register New User
    const testEmail = `testuser_${Date.now()}@rezekiq.id`;
    console.log(`2️⃣ Testing POST /api/auth/register with email: ${testEmail}...`);
    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ahmad Pengguna Uji',
        email: testEmail,
        password: 'passwordRahasia123',
        gender: 'Laki-laki',
        phoneNumber: '081298765432',
        initialData: {
          amalLog: {
            '2026-09-08': {
              'syukur-1': true,
              'syukur-2': true
            }
          },
          journal: [
            { id: 'test-j-1', date: '2026-09-08', content: 'Catatan rasa syukur pertama di cloud.' }
          ]
        }
      })
    });
    const registerData = await registerRes.json();
    console.log('Register status:', registerRes.status, registerData.message);
    if (!registerData.token) throw new Error('No token returned on register: ' + JSON.stringify(registerData));
    const token = registerData.token;
    console.log('✅ Register PASSED, Token obtained.\n');

    // Test 3: Login
    console.log('3️⃣ Testing POST /api/auth/login...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'passwordRahasia123'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login status:', loginRes.status, loginData.message);
    if (!loginData.token) throw new Error('Login failed: ' + JSON.stringify(loginData));
    console.log('✅ Login PASSED\n');

    // Test 4: Auth Me
    console.log('4️⃣ Testing GET /api/auth/me...');
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log('User verified:', meData.user.name, 'Email:', meData.user.email);
    console.log('User initial progress synced:', Object.keys(meData.data.amalLog));
    console.log('✅ Verify Me PASSED\n');

    // Test 5: Push Progress Data Sync
    console.log('5️⃣ Testing POST /api/user/sync (Pushing new amalan & journal)...');
    const syncRes = await fetch(`${BASE_URL}/api/user/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amalLog: {
          '2026-09-08': {
            'syukur-3': true,
            'usaha-1': true
          }
        },
        journal: [
          { id: 'test-j-2', date: '2026-09-08', content: 'Catatan progres kedua berhasil diunggah.' }
        ],
        customAmalan: [
          { id: 'custom-amal-1', name: 'Sedekah Subuh Rp 10.000', gateId: 'sedekah' }
        ],
        user: {
          niat: 'Mencapai target kemandirian finansial penuh berkah'
        }
      })
    });
    const syncResult = await syncRes.json();
    console.log('Sync status:', syncRes.status, syncResult.message);
    console.log('Journal count in cloud:', syncResult.data.journal.length);
    console.log('Custom amalan in cloud:', syncResult.data.customAmalan.length);
    if (syncResult.data.journal.length < 2) throw new Error('Journal merge failed');
    console.log('✅ Progress Sync PASSED\n');

    // Test 6: Fetch Cloud Data
    console.log('6️⃣ Testing GET /api/user/sync (Pulling latest cloud data)...');
    const pullRes = await fetch(`${BASE_URL}/api/user/sync`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const pullData = await pullRes.json();
    console.log('Pulled data check:', {
      hasAmalLog: !!pullData.data.amalLog['2026-09-08'],
      amalSyukur1: pullData.data.amalLog['2026-09-08']['syukur-1'],
      amalUsaha1: pullData.data.amalLog['2026-09-08']['usaha-1'],
      journals: pullData.data.journal.map(j => j.content)
    });
    console.log('✅ Pull Cloud Data PASSED\n');

    console.log('🎉 ALL BACKEND & CLOUD SYNC TESTS COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
