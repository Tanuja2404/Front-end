const backendURL = 'https://daf4313b1e72.ngrok-free.app';

function signup() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const messageEl = document.getElementById('message');

  if (!email || !password) {
    messageEl.innerHTML = `<span style="color:red;">Please fill all fields!</span>`;
    return;
  }

  axios.post(`${backendURL}/auth/signup`, { email, password }, {
    headers: { 
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    }
  })
  .then(response => {
    const token = response.data.access_token;
    if (token) {
      let allTokens = JSON.parse(localStorage.getItem('user_tokens')) || {};
      allTokens[email] = token;
      localStorage.setItem('user_tokens', JSON.stringify(allTokens));
    }

    messageEl.innerHTML = `<span style="color:green;">Signup Successful!</span>`;
    console.log('Response:', response.data);
    setTimeout(() => {
      window.location.href = `Login1.html?user=${encodeURIComponent(email)}`;
    }, 1500);
  })
  .catch(error => {
    if (error.response) {
      messageEl.innerHTML = `<span style="color:red;">${error.response.data.detail || 'Signup Failed!'}</span>`;
    } else {
      messageEl.innerHTML = `<span style="color:red;">Signup Failed! (Network Error)</span>`;
    }
    console.error('Signup error:', error);
  });
}
