
// Test the analysis API endpoint
const testAnalysisApi = async () => {
    try {
        console.log('Testing http://localhost:5002/api/v1/projects/analysis...');

        // First, we need a token. Let's try to register/login
        const email = `test${Math.floor(Math.random() * 10000)}@example.com`;

        // Register
        const registerRes = await fetch('http://localhost:5002/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'User',
                name: 'Test User',
                email: email,
                password: 'password123',
                role: 'teacher'
            })
        });

        const registerData = await registerRes.json();
        console.log('Register Status:', registerRes.status);

        if (!registerRes.ok) {
            console.log('Register failed:', registerData);
            return;
        }

        const token = registerData.token;
        console.log('Got token:', token.substring(0, 20) + '...');

        // Now test the analysis endpoint
        const analysisPayload = {
            studentName: 'Test Student',
            studentAge: 10,
            gradeLevel: '5th Grade',
            presentLevels: 'Student shows strong reading comprehension',
            currentPerformance: 'Above grade level in math',
            goals: 'Improve writing skills',
            accommodations: 'Extended time on tests',
            relatedServices: ['Speech-language therapy']
            // projectId removed to test if API works without it
        };

        console.log('=== Sending to Analysis API ===');
        console.log(JSON.stringify(analysisPayload, null, 2));

        const analysisRes = await fetch('http://localhost:5002/api/v1/projects/analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(analysisPayload)
        });

        console.log('Analysis Status:', analysisRes.status);
        const analysisData = await analysisRes.json();

        console.log('=== Analysis Response ===');
        console.log(JSON.stringify(analysisData, null, 2));

        if (analysisData.analysis) {
            console.log('=== SUCCESS: Analysis Text ===');
            console.log(analysisData.analysis);
        }

    } catch (err) {
        console.error('Error:', err);
    }
};

testAnalysisApi();
