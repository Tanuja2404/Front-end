const backendURL = 'https://healthcare-backend-cbehh5f8gmb8awbg.centralindia-01.azurewebsites.net';
let editId = null;

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = localStorage.getItem('currentUserId');
    const allTokens = JSON.parse(localStorage.getItem('user_tokens') || '{}');
    const token = allTokens[currentUserId];
    const historyList = document.getElementById('historyList');
    const form = document.getElementById('medicalHistoryForm');
    const showFormBtn = document.getElementById('showFormBtn');
    const submitBtn = document.getElementById('submitBtn');
    const formHeading = document.getElementById('formHeading');

    if (!token) {
        alert('Session expired. Please login again.');
        window.location.href = 'login.html';
        return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';

    async function fetchMedicalHistory() {
        try {
            const response = await axios.get(`${backendURL}/medical-history/`);
            const records = response.data;
            historyList.innerHTML = '';
            
            if (!Array.isArray(records) || records.length === 0) {
                historyList.innerHTML = `<p>No medical history found. Please add a new record.</p>`;
                return;
            }

            records.forEach(record => renderHistory(record));
        } catch (error) {
            console.error('Error fetching medical history:', error);
            historyList.innerHTML = `<p style="color:red;">Failed to load medical history.</p>`;
        }
    }

    async function addOrUpdateHistory(event) {
        event.preventDefault();

        const record = {
            condition: document.getElementById('condition').value,
            diagnosis_date: document.getElementById('diagnosis_date').value,
            medications: document.getElementById('medications').value,
            allergies: document.getElementById('allergies').value,
            treatment: document.getElementById('treatment').value,
            notes: document.getElementById('notes').value
        };

        try {
            if (editId) {
                await axios.put(`${backendURL}/medical-history/${editId}`, record);
                alert('Medical history updated successfully!');
            } else {
                await axios.post(`${backendURL}/medical-history/`, record);
                alert('Medical history added successfully!');
            }
            editId = null;
            submitBtn.textContent = 'Save Record';
            formHeading.textContent = 'Add New Medical History';
            form.reset();
            form.style.display = 'none';
            showFormBtn.style.display = 'inline-block';
            fetchMedicalHistory();
        } catch (error) {
            console.error('Error saving history:', error);
            alert('Failed to save medical history.');
        }
    }

    function editHistory(id, record) {
        editId = id;
        document.getElementById('condition').value = record.condition;
        document.getElementById('diagnosis_date').value = record.diagnosis_date;
        document.getElementById('medications').value = record.medications;
        document.getElementById('allergies').value = record.allergies;
        document.getElementById('treatment').value = record.treatment;
        document.getElementById('notes').value = record.notes;

        formHeading.textContent = 'Update Medical History';
        submitBtn.textContent = 'Update History';
        form.style.display = 'block';
        showFormBtn.style.display = 'none';
    }

    async function deleteHistory(id) {
        if (!confirm('Are you sure you want to delete this record?')) return;

        try {
            await axios.delete(`${backendURL}/medical-history/${id}`);
            document.getElementById(`history-${id}`).remove();
            alert('Record deleted successfully!');
        } catch (error) {
            console.error('Error deleting history:', error);
            alert('Failed to delete record.');
        }
    }

    function renderHistory(record) {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.id = `history-${record.id}`;

        card.innerHTML = `
            <p><strong>Condition:</strong> ${record.condition}</p>
            <p><strong>Diagnosis Date:</strong> ${record.diagnosis_date}</p>
            <p><strong>Medications:</strong> ${record.medications}</p>
            <p><strong>Allergies:</strong> ${record.allergies}</p>
            <p><strong>Treatment:</strong> ${record.treatment}</p>
            <p><strong>Notes:</strong> ${record.notes}</p>
            <button class="btn btn-edit">Edit</button>
            <button class="btn btn-delete">Delete</button>
        `;

        card.querySelector('.btn-edit').addEventListener('click', () => editHistory(record.id, record));
        card.querySelector('.btn-delete').addEventListener('click', () => deleteHistory(record.id));

        historyList.appendChild(card);
    }

    showFormBtn.addEventListener('click', () => {
        form.style.display = 'block';
        showFormBtn.style.display = 'none';
    });

    form.addEventListener('submit', addOrUpdateHistory);

    fetchMedicalHistory();
    function logout() {
    const currentUserId = localStorage.getItem('currentUserId');
    const allTokens = JSON.parse(localStorage.getItem('user_tokens') || '{}');
    delete allTokens[currentUserId];
    localStorage.setItem('user_tokens', JSON.stringify(allTokens));
    localStorage.removeItem('currentUserId');
    window.location.href = 'login.html';
}
});
