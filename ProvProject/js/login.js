const backendURL = 'https://healthcare-backend-cbehh5f8gmb8awbg.centralindia-01.azurewebsites.net';

// Prefill email if redirected from signup
const urlParams = new URLSearchParams(window.location.search);
const userEmail = urlParams.get('user');
if (userEmail) document.getElementById('email').value = userEmail;

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    document.getElementById('message').innerText = "Enter username & password";
    return;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    formData.append('scope', '');
    formData.append('client_id', '');
    formData.append('client_secret', '');

    const response = await axios.post(`${backendURL}/auth/login`, formData, {
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'ngrok-skip-browser-warning': '69420'
      }
    });

    const token = response.data.access_token;
    if (!token) throw new Error("No token returned");

    // Store token locally
    let userTokens = JSON.parse(localStorage.getItem('user_tokens')) || {};
    userTokens[username] = token;
    localStorage.setItem('user_tokens', JSON.stringify(userTokens));
    localStorage.setItem('currentUserId', username);

    document.getElementById('message').style.color = "green";
    document.getElementById('message').innerText = "Login successful!";

    // Redirect to dashboard
    window.location.href = `dashboard.html?user=${encodeURIComponent(username)}`;

  } catch (err) {
    if (err.response) {
        const status = err.response.status;
        const detail = err.response.data.detail || err.response.data.message || 'Unknown error';
        
        if (status === 401) {
            document.getElementById('message').innerHTML = `<span style="color:red;">Incorrect username or password.</span>`;
        } else if (status === 400) {
            document.getElementById('message').innerHTML = `<span style="color:red;">Bad request: ${detail}</span>`;
        } else {
            document.getElementById('message').innerHTML = `<span style="color:red;">Server error: ${detail}</span>`;
        }
        console.error('Error Response:', err.response);
    } else if (err.request) {
        document.getElementById('message').innerHTML = `<span style="color:red;">No response from server. Please check your network.</span>`;
        console.error('No Response:', err.request);
    } else {
        document.getElementById('message').innerHTML = `<span style="color:red;">Login failed: ${err.message}</span>`;
        console.error('Error Message:', err.message);
    }
  }
});
