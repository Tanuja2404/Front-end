document.addEventListener('DOMContentLoaded', () => {
  const currentUserId = localStorage.getItem('currentUserId');
  const allTokens = JSON.parse(localStorage.getItem('user_tokens') || '{}');
  const token = currentUserId ? allTokens[currentUserId] : null;
  const dashboardLink = document.getElementById('dashboard-link');

  if (token) {
    document.getElementById('login-link').style.display = 'none';
    document.getElementById('signup-link').style.display = 'none';
    dashboardLink.style.display = 'inline-block';
    document.getElementById('logout-link').style.display = 'inline-block';
    dashboardLink.href = `pages/Dashboard.html?user=${encodeURIComponent(currentUserId)}`;
  } else {
    document.getElementById('login-link').style.display = 'inline-block';
    document.getElementById('signup-link').style.display = 'inline-block';
    dashboardLink.style.display = 'none';
    document.getElementById('logout-link').style.display = 'none';
  }
});

function logout() {
  const currentUserId = localStorage.getItem('currentUserId');
  let allTokens = JSON.parse(localStorage.getItem('user_tokens') || '{}');

  if (currentUserId && allTokens[currentUserId]) {
    delete allTokens[currentUserId];
    localStorage.setItem('user_tokens', JSON.stringify(allTokens));
  }

  localStorage.removeItem('currentUserId');
  window.location.href = '../index.html';
}
