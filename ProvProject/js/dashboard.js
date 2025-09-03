const backendURL = 'https://healthcare-backend-cbehh5f8gmb8awbg.centralindia-01.azurewebsites.net';
let token = null;

document.addEventListener('DOMContentLoaded', () => {
    const cardLink = document.getElementById('patientCardLink');
    const descriptionElement = document.getElementById('patientDescription');
    const currentUserId = localStorage.getItem('currentUserId');
    const allTokens = JSON.parse(localStorage.getItem('user_tokens') || '{}');
    token = allTokens[currentUserId];

    if (!token) {
        alert('Session expired. Please login again.');
        window.location.href = 'login.html';
        return;
    }

    const axiosHeaders = { Authorization: `Bearer ${token}` };

    async function fetchPatient() {
        try {
            const response = await axios.get(`${backendURL}/patients/me`, { headers: axiosHeaders });
            let patient = response.data.patient || response.data;

            if (patient && Object.keys(patient).length > 0) {
                cardLink.textContent = 'View Patient Details 👀';
                cardLink.href = `Patient-Portal.html?user=${encodeURIComponent(currentUserId)}`;
                descriptionElement.textContent = "You can view or update your patient details.";
            } else {
                cardLink.textContent = 'Fill Patient Details ✍️';
                cardLink.href = 'Patient-Details.html';
                descriptionElement.textContent = "Please fill out your details to complete your profile.";
            }
        } catch {
            cardLink.textContent = 'Fill Patient Details ✍️';
            cardLink.href = 'Patient-Details.html';
            descriptionElement.textContent = "Please fill out your details to complete your profile.";
        }
    }

    fetchPatient().then(() => {
        showUpcomingAppointments();
        setInterval(showUpcomingAppointments, 60000); // periodic refresh
    });
});

function viewAppointment(id) {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId || !token) {
        alert('Session expired. Please login again.');
        window.location.href = 'login.html';
        return;
    }
    window.location.href = `Patient-Portal.html?user=${encodeURIComponent(currentUserId)}&appointmentId=${id}`;
}

async function deleteAppointment(id) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
        await axios.delete(`${backendURL}/appointments/${id}`, {
            headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': '69420' }
        });
        alert('Appointment deleted successfully!');
        showUpcomingAppointments();
    } catch (err) {
        console.error(err);
        alert('Failed to delete appointment. Please try again.');
    }
}

async function showUpcomingAppointments() {
    const toast = document.getElementById('appointmentsToast');
    const list = document.getElementById('upcomingAppointmentsList');
    const closeBtn = document.querySelector('.toast-close');
    list.innerHTML = '<li>Loading appointments...</li>';

    try {
        const response = await axios.get(`${backendURL}/appointments/me`, {
            headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': '69420' }
        });
        const appointments = response.data.upcoming || [];
        list.innerHTML = '';

        if (appointments.length === 0) {
            // Do NOT show toast if there are no appointments
            list.innerHTML = '<li>No upcoming appointments.</li>';
            toast.style.display = 'none';
            return;
        }

        appointments.forEach(app => {
            const dateStr = new Date(app.slot.datetime).toLocaleString([], { dateStyle:'short', timeStyle:'short' });
            const doctor = app.slot.doctor_name || 'Unknown';
            const speciality = app.slot.specialty || 'General';
            const li = document.createElement('li');
            li.innerHTML = `${dateStr} | ${doctor} (${speciality})
                <div class="toast-buttons">
                    <button class="btn-view" onclick="viewAppointment('${app.id}')">View 👁️</button>
                    <button class="btn-delete" onclick="deleteAppointment('${app.id}')">Delete ❌</button>
                </div>`;
            list.appendChild(li);
        });

        // Show toast only if there is at least one appointment
        toast.style.display = 'block';
        closeBtn.onclick = () => toast.style.display = 'none';

    } catch (err) {
        console.error(err);
        list.innerHTML = '<li>Error loading appointments.</li>';
        toast.style.display = 'block';
    }
}


function logout() {
    const currentUserId = localStorage.getItem('currentUserId');
    const allTokens = JSON.parse(localStorage.getItem('user_tokens') || '{}');
    delete allTokens[currentUserId];
    localStorage.setItem('user_tokens', JSON.stringify(allTokens));
    localStorage.removeItem('currentUserId');
    window.location.href = 'login.html';
}
