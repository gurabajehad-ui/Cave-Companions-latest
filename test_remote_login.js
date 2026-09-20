import axios from 'axios';

async function testRemote() {
  const url = 'https://ais-pre-vcbws6us32r6sun33hsm2p-846159832143.asia-southeast1.run.app/api/auth/login';
  console.log('Sending login request to Deployed Pilot URL:', url);

  try {
    const res = await axios.post(url, {
      identifier: '01792927471',
      password: 'SecretPass123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      maxRedirects: 5,
      validateStatus: () => true
    });

    console.log('Response Status:', res.status);
    console.log('Response Headers:', res.headers);
    console.log('Response Data:', typeof res.data === 'object' ? JSON.stringify(res.data) : String(res.data).slice(0, 300));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testRemote();
