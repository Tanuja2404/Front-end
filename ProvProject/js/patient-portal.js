const backendURL = 'https://healthcare-backend-cbehh5f8gmb8awbg.centralindia-01.azurewebsites.net';
const urlParams = new URLSearchParams(window.location.search);
const currentUserId = urlParams.get('user');
const appointmentId = urlParams.get('appointmentId');
const allTokens = JSON.parse(localStorage.getItem('user_tokens') || '{}');
const token = currentUserId ? allTokens[currentUserId] : null;

if (!token) {
  alert('Session expired. Please login again.');
  window.location.href = 'login.html';
}

const headers = { Authorization: `Bearer ${token}` };
if (backendURL.includes('ngrok')) headers['ngrok-skip-browser-warning'] = '69420';

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  delete allTokens[currentUserId];
  localStorage.setItem('user_tokens', JSON.stringify(allTokens));
  localStorage.removeItem('currentUserId');
  window.location.href = 'login.html';
});

// Load Patient
async function loadPatient() {
  let patient = null;
  try {
    const res = await axios.get(`${backendURL}/patients/me`, { headers });
    patient = res.data.patient || res.data;
  } catch {
    patient = JSON.parse(localStorage.getItem(`patient_${currentUserId}`));
  }
  if (!patient) return;

  document.getElementById('patientName').innerText = patient.name || '-';
  document.getElementById('patientAge').innerText = patient.age || '-';
  document.getElementById('patientDOB').innerText = patient.dob || '-';
  document.getElementById('patientGender').innerText = patient.gender || '-';
  document.getElementById('patientPhone').innerText = patient.contact_number || '-';
  document.getElementById('patientEmail').innerText = patient.email || '-';
  document.getElementById('patientAddress').innerText = patient.address || '-';

  document.getElementById('editName').value = patient.name || '';
  document.getElementById('editAge').value = patient.age || '';
  document.getElementById('editDOB').value = patient.dob || '';
  document.getElementById('editGender').value = patient.gender || '';
  document.getElementById('editPhone').value = patient.contact_number || '';
  document.getElementById('editEmail').value = patient.email || '';
  document.getElementById('editAddress').value = patient.address || '';
}
loadPatient();

// Load Appointments
async function loadAppointments() {
  const container = document.getElementById('appointmentsSection');
  container.innerHTML = '<p>Loading appointments...</p>';

  try {
    const res = await axios.get(`${backendURL}/appointments/me`, { headers });
    const upcoming = res.data.upcoming || [];
    const past = res.data.past || [];

    function renderTable(appointments, allowDelete=false) {
      let html = '<table><tr><th>Date</th><th>Time</th><th>Doctor</th><th>Specialty</th><th>Reason</th>';
      if (allowDelete) html += '<th>Action</th>';
      html += '</tr>';

      appointments.forEach(a => {
        const dt = new Date(a.slot.datetime);
        html += `<tr${appointmentId===a.id?' style="background:#ffe3b3"':''}>
          <td>${dt.toLocaleDateString()}</td>
          <td>${dt.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit'})}</td>
          <td>${a.slot.doctor_name||'-'}</td>
          <td>${a.slot.specialty||'-'}</td>
          <td>${a.reason||'-'}</td>`;
        if (allowDelete) html += `<td><button class="delete-appt" data-id="${a.id}">Delete</button></td>`;
        html += '</tr>';
      });
      html += '</table>'; return html;
    }

    let html = '';
    html += upcoming.length ? `<h3>Upcoming Appointments</h3>${renderTable(upcoming, true)}` : '<p>No upcoming appointments.</p>';
    html += past.length ? `<h3 style="margin-top:20px;">Past Appointments</h3>${renderTable(past)}` : '<p>No past appointments.</p>';

    container.innerHTML = html;

    document.querySelectorAll('.delete-appt').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm('Delete this appointment?')) return;
        try { await axios.delete(`${backendURL}/appointments/${id}`, { headers }); loadAppointments(); }
        catch { alert('Failed to delete appointment'); }
      });
    });

    if(appointmentId){
      const row = document.querySelector(`tr[style*="background:#ffe3b3"]`);
      if(row) row.scrollIntoView({behavior:'smooth'});
    }

  } catch {
    container.innerHTML = '<p>Failed to load appointments.</p>';
  }
}
loadAppointments();

