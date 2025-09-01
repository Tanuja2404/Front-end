const backendURL = 'https://daf4313b1e72.ngrok-free.app';
console.log("✅ Backend URL:", backendURL);

const userEmail = localStorage.getItem('currentUserId');
console.log("✅ Current User ID:", userEmail);

if (!userEmail) {
    console.error("❌ No user ID found. Redirecting to login.");
    alert("Please login first!");
    window.location.href = 'login.html';
}

const allTokens = JSON.parse(localStorage.getItem('user_tokens') || '{}');
const token = allTokens[userEmail];
console.log("✅ Token retrieved:", token);

if (!token) {
    console.error("❌ No token found for user. Redirecting.");
    alert("Session expired. Please login again.");
    window.location.href = 'login.html';
}

const axiosHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420'
};
console.log("✅ Axios Headers:", axiosHeaders);

// Prefill patient details
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🔍 Fetching patient details...");
    try {
        const response = await axios.get(`${backendURL}/patients/me`, { headers: axiosHeaders });
        console.log("✅ Patient details response:", response.data);
        const patient = response.data;
        document.getElementById('name').value = patient.name || '';
        document.getElementById('email').value = patient.email || '';
        document.querySelector('input[name="phone"]').value = patient.contact_number || '';
    } catch (error) {
        console.error("❌ Error fetching patient details:", error.response?.data || error);
    }
});

// Load time slots
document.getElementById('speciality').addEventListener('change', loadTimeSlots);
document.getElementById('date').addEventListener('change', loadTimeSlots);

async function loadTimeSlots() {
    const speciality = document.getElementById('speciality').value;
    const date = document.getElementById('date').value;
    const timeSelect = document.getElementById('time');
    const messageBox = document.getElementById('message');
    console.log("🔍 Loading slots for:", { speciality, date });
    
    messageBox.innerHTML = '';
    timeSelect.innerHTML = '<option value="">Loading slots...</option>';
    timeSelect.disabled = true;

    if (!speciality || !date) {
        console.warn("⚠️ Speciality or Date missing. Cannot load slots.");
        return;
    }

    try {
        const response = await axios.get(`${backendURL}/appointments/slots`, {
            params: { speciality, date },
            headers: axiosHeaders
        });
        console.log("✅ Slots API Response:", response.data);

        let slotsData = response.data.slots || response.data || [];
        if (!Array.isArray(slotsData)) slotsData = Object.values(slotsData);
        console.log("✅ Parsed slots:", slotsData);

        timeSelect.innerHTML = '<option value="">-- Select Time --</option>';
        if (slotsData.length === 0) {
            console.warn("⚠️ No slots available.");
            const option = document.createElement('option');
            option.value = '';
            option.text = 'No slots available';
            timeSelect.add(option);
            timeSelect.disabled = true;
        } else {
            slotsData.forEach(slot => {
                const datetime = slot.datetime || slot.time || slot.start_time;
                const doctor = slot.doctor_name || 'Unknown';
                if (datetime) {
                    const parsedDate = new Date(datetime);
                    if (!isNaN(parsedDate.getTime())) {
                        const option = document.createElement('option');
                        option.value = slot.id;
                        option.text = `${parsedDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} (${doctor})`;
                        if (slot.is_booked) {
                            option.text += ' (Already Booked)';
                            option.disabled = true;
                            option.classList.add('booked');
                        }
                        timeSelect.add(option);
                    }
                }
            });
            console.log("✅ Time slots populated.");
            timeSelect.disabled = false;
        }
    } catch (error) {
        console.error("❌ Error fetching slots:", error.response?.data || error);
        timeSelect.innerHTML = '<option value="">Error loading slots</option>';
        timeSelect.disabled = true;
    }
}

// Book appointment
document.getElementById('appointmentForm').addEventListener('submit', async e => {
    e.preventDefault();
    console.log("📦 Submitting appointment booking...");

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.querySelector('input[name="phone"]').value.trim();
    const speciality = document.getElementById('speciality').value;
    const date = document.getElementById('date').value;
    const slotId = document.getElementById('time').value;
    const doctor = document.getElementById('doctor').value || null;
    const reason = document.getElementById('reason').value || null;
    const messageBox = document.getElementById('message');

    console.log("✅ Booking data:", { name, email, phone, speciality, date, slotId, doctor, reason });

    if (!name || !email || !phone || !speciality || !date || !slotId) {
        console.error("❌ Missing required fields.");
        messageBox.innerHTML = '<span style="color:red;">All fields are required!</span>';
        return;
    }

    const payload = { name, email, phone, speciality, slot_id: slotId, doctor, reason };
    console.log("📤 Payload:", payload);

    try {
        const response = await axios.post(`${backendURL}/appointments/`, payload, { headers: axiosHeaders });
        console.log("✅ Appointment booked successfully:", response.data);
        messageBox.innerHTML = '<span style="color:green;">Appointment booked successfully!</span>';
        window.location.href = `Patient_Portal.html?user=${encodeURIComponent(email)}`;
        document.getElementById('appointmentForm').reset();
        document.getElementById('time').innerHTML = '<option value="">-- Select Time --</option>';
    } catch (error) {
        console.error("❌ Booking error:", error.response?.data || error);
        if (error.response?.data?.detail) {
            messageBox.innerHTML = `<span style="color:red;">${error.response.data.detail}</span>`;
        } else {
            messageBox.innerHTML = '<span style="color:red;">Failed to book appointment!</span>';
        }
    }
});

// Logout
function logout() {
    console.log("🔍 Logging out user...");
    localStorage.clear();
    window.location.href = 'login.html';
}
