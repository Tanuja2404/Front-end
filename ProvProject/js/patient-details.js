document.addEventListener('DOMContentLoaded', () => {
    const backendURL = 'https://healthcare-backend-cbehh5f8gmb8awbg.centralindia-01.azurewebsites.net';
    const dobInput = document.getElementById('dob');
    dobInput.setAttribute('max', new Date().toISOString().split('T')[0]);

    const currentUserId = localStorage.getItem('currentUserId');
    const allTokens = JSON.parse(localStorage.getItem('user_tokens') || '{}');
    const token = allTokens[currentUserId];

    if (!token) {
        alert('Session expired. Please login again.');
        window.location.href = 'login.html';
        return;
    }

    if (currentUserId) {
        document.getElementById('email').value = currentUserId;
    }

    // Logout function
    document.getElementById('logoutBtn').addEventListener('click', () => {
        const allTokens = JSON.parse(localStorage.getItem('user_tokens') || '{}');
        delete allTokens[currentUserId];
        localStorage.setItem('user_tokens', JSON.stringify(allTokens));
        localStorage.removeItem('currentUserId');
        window.location.href = 'login.html';
    });

    // Save patient details
    document.getElementById('patientForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const data = {
            name: document.getElementById('name').value.trim(),
            age: document.getElementById('age').value,
            dob: document.getElementById('dob').value,
            gender: document.getElementById('gender').value,
            contact_number: document.getElementById('contact_number').value.trim(),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim()
        };

        try {
            await axios.post(`${backendURL}/patients`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });

            localStorage.setItem(`patient_${currentUserId}`, JSON.stringify(data));

            const messageDiv = document.getElementById('message');
            messageDiv.style.color = 'green';
            messageDiv.innerText = "Patient details saved successfully!";

            setTimeout(() => {
                window.location.href = `dashboard.html?user=${encodeURIComponent(currentUserId)}`;
            }, 1500);

        } catch (error) {
            console.error('Error saving profile:', error);

            if (error.response) {
                alert(`Failed to save profile! 
Status: ${error.response.status}
Message: ${error.response.data.message || 'Unknown error from server'}`);
            } else if (error.request) {
                alert('No response from server. Please check your internet or server.');
            } else {
                alert(`Unexpected error: ${error.message}`);
            }
        }
    });
    
});
