document.addEventListener('DOMContentLoaded', function() {
    let staffData = [];
    const tableBody = document.getElementById('stafTableBodyAdmin');
    const form = document.getElementById('formStaf');
    const modal = $('#formModalStaf');
    const modalLabel = document.getElementById('formModalStafLabel');
    const errorDiv = document.getElementById('formErrorStaf');
    const submitBtn = document.getElementById('submitBtnStaf');
    const spinner = submitBtn.querySelector('.spinner-border');
    const API_URL = '../api/crud_staf.php';
    let dataTableInstance;

    async function fetchAndParse(url, options = {}) {
        let response;
        try {
            response = await fetch(url, options);
            const responseClone = response.clone();
            try {
                const result = await response.json();
                return { ok: response.ok, result };
            } catch (e) {
                const text = await responseClone.text();
                throw new Error(`Format respons tidak valid. Server: ${text.substring(0,150)}...`);
            }
        } catch (e) {
            throw new Error(`Tidak dapat terhubung ke server: ${e.message}`);
        }
    }

    function setButtonLoading(isLoading) {
        if(submitBtn && spinner) {
            submitBtn.disabled = isLoading;
            spinner.style.display = isLoading ? 'inline-block' : 'none';
        }
    }

    function showError(message) {
        if(errorDiv) {
            errorDiv.innerHTML = message.replace(/\n/g, '<br>');
            errorDiv.style.display = 'block';
        }
    }

    function hideError() {
        if(errorDiv) errorDiv.style.display = 'none';
    }

    function displayData(data) {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Belum ada data staf.</td></tr>';
            return;
        }
        data.forEach((staf, index) => {
            const roleText = staf.role.charAt(0).toUpperCase() + staf.role.slice(1);
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td class="text-center align-middle">${index + 1}</td>
                <td class="align-middle">${staf.nama_lengkap}</td>
                <td class="align-middle"><code>${staf.username}</code></td>
                <td class="align-middle">${roleText}</td>
                <td class="text-center align-middle">
                    <button class="btn btn-sm btn-warning btn-edit" data-id="${staf.id}" title="Edit Staf"><i class="fas fa-user-edit"></i></button> 
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${staf.id}" data-nama="${staf.nama_lengkap}" title="Hapus Staf"><i class="fas fa-user-times"></i></button>
                </td>
            `;
        });
    }

    async function loadData() {
        if(tableBody) tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted"><div class="spinner-border spinner-border-sm"></div> Memuat...</td></tr>';
        try {
            const { ok, result } = await fetchAndParse(API_URL);
            if (!ok || !result.success) throw new Error(result.message || 'Gagal memuat data staf.');
            staffData = result.data || [];
            staffData.forEach(staf => {
                staf.id = parseInt(staf.id, 10);
            });
            displayData(staffData);
        } catch (error) {
            if(tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Gagal memuat: ${error.message}</td></tr>`;
        }
    }

    async function handleFormSubmit(data) {
        setButtonLoading(true);
        try {
            const { ok, result } = await fetchAndParse(API_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            if (!ok || !result.success) {
                throw new Error(result.message || 'Aksi gagal di server.');
            }
            modal.modal('hide');
            alert(result.message);
            await loadData();
        } catch (error) {
            showError(error.message);
        } finally {
            setButtonLoading(false);
        }
    }

    document.getElementById('btnTambahStaf').addEventListener('click', () => {
        form.reset();
        form.querySelector('#stafId').value = '';
        modalLabel.textContent = 'Tambah Staf Baru';
        form.querySelector('#password').required = true;
        form.querySelector('#passwordHelper').textContent = 'Password wajib diisi (min. 6 karakter).';
        form.querySelector('#username').readOnly = false;
        hideError();
        modal.modal('show');
    });

    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');
            if (editBtn) {
                const stafIdToFind = parseInt(editBtn.dataset.id, 10);
                const stafToEdit = staffData.find(s => s.id === stafIdToFind);
                if (stafToEdit) {
                    form.reset(); 
                    hideError();
                    form.querySelector('#stafId').value = stafToEdit.id;
                    form.querySelector('#nama_lengkap').value = stafToEdit.nama_lengkap;
                    form.querySelector('#username').value = stafToEdit.username;
                    form.querySelector('#username').readOnly = true;
                    form.querySelector('#role').value = stafToEdit.role;
                    const passwordInput = form.querySelector('#password');
                    const passwordHelper = form.querySelector('#passwordHelper');
                    passwordInput.required = false;
                    passwordInput.value = '';
                    if(passwordHelper) passwordHelper.textContent = 'Kosongkan jika tidak ingin mengubah password.';
                    modalLabel.textContent = 'Edit Staf';
                    modal.modal('show');
                } else {
                    alert('Data staf tidak ditemukan. Mungkin sudah dihapus. Tabel akan dimuat ulang.');
                    loadData();
                }
            }

            if (deleteBtn) {
                const id = parseInt(deleteBtn.dataset.id, 10);
                const nama = deleteBtn.dataset.nama;
                if (confirm(`Yakin ingin menghapus staf "${nama}"?`)) {
                    handleFormSubmit({ action: 'delete', id: id });
                }
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = form.querySelector('#stafId').value;
            const action = id ? 'update' : 'add';
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.action = action;
            if (action === 'update') {
                data.id = parseInt(data.id, 10);
                if (!data.password) {
                    delete data.password;
                }
            }
            handleFormSubmit(data);
        });
    }
    
    modal.on('hidden.bs.modal', () => {
        hideError();
        form.reset();
    });

    loadData();
});