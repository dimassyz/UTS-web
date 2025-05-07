document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('adminNameDisplay')) {
        document.getElementById('adminNameDisplay').textContent = 'Admin Resto';
    }

    const stafTableBodyAdmin = document.getElementById('stafTableBodyAdmin');
    const loadingStafAdmin = document.getElementById('loadingStafAdmin');
    const tableStafContainerAdmin = document.getElementById('tableStafContainerAdmin');
    const noStafMessageAdmin = document.getElementById('noStafMessageAdmin');

    const tambahStafModal = $('#tambahStafModal');
    const formTambahStafAdmin = document.getElementById('formTambahStafAdmin');
    const submitTambahStafAdminBtn = document.getElementById('submitTambahStafAdmin');
    const tambahStafSpinner = submitTambahStafAdminBtn ? submitTambahStafAdminBtn.querySelector('.spinner-border') : null;
    const addStafErrorAdmin = document.getElementById('addStafErrorAdmin');
    const addNamaStafInput = document.getElementById('addNamaStafAdmin');
    const addUsernameStafInput = document.getElementById('addUsernameStafAdmin');
    const addPasswordStafInput = document.getElementById('addPasswordStafAdmin');
    const addRoleStafSelect = document.getElementById('addRoleStafAdmin');

    const editStafModal = $('#editStafModal');
    const formEditStafAdmin = document.getElementById('formEditStafAdmin');
    const submitEditStafAdminBtn = document.getElementById('submitEditStafAdmin');
    const editStafSpinner = submitEditStafAdminBtn ? submitEditStafAdminBtn.querySelector('.spinner-border') : null;
    const editStafErrorAdmin = document.getElementById('editStafErrorAdmin');
    const editIdStafInput = document.getElementById('editIdStafAdmin');
    const editUsernameDisplayInput = document.getElementById('editUsernameStafDisplayAdmin');
    const editNamaStafInput = document.getElementById('editNamaStafAdmin');
    const editPasswordStafInput = document.getElementById('editPasswordStafAdmin');
    const editRoleStafSelect = document.getElementById('editRoleStafAdmin');

    let STAF_DUMMY_ADMIN = [
        { id: 1, username: 'admin', nama_lengkap: 'Admin Utama', role: 'admin' },
        { id: 2, username: 'kasir01', nama_lengkap: 'Budi Kasir', role: 'kasir' },
        { id: 3, username: 'kasir02', nama_lengkap: 'Citra Kasir', role: 'kasir' }
    ];

    function displayStafAdmin() {
        if (!stafTableBodyAdmin) return;
        stafTableBodyAdmin.innerHTML = '';
        if (noStafMessageAdmin) noStafMessageAdmin.style.display = 'none';
        if (!STAF_DUMMY_ADMIN || STAF_DUMMY_ADMIN.length === 0) {
            if (noStafMessageAdmin) noStafMessageAdmin.style.display = 'block';
            if (tableStafContainerAdmin) tableStafContainerAdmin.style.display = 'none';
            return;
        }
        if (tableStafContainerAdmin) tableStafContainerAdmin.style.display = '';

        STAF_DUMMY_ADMIN.forEach((staf, index) => {
            const row = stafTableBodyAdmin.insertRow();
            const roleText = staf.role === 'admin' ? 'Administrator' : (staf.role === 'kasir' ? 'Kasir' : staf.role);
            row.innerHTML = `
                <td class="text-center align-middle">${index + 1}</td>
                <td class="align-middle">${staf.nama_lengkap}</td>
                <td class="align-middle"><code>${staf.username}</code></td>
                <td class="align-middle">${roleText}</td>
                <td class="text-center align-middle">
                    <button class="btn btn-sm btn-warning btn-edit-staf-admin" data-id="${staf.id}" title="Edit Staf"><i class="fas fa-user-edit fa-fw"></i></button>
                    <button class="btn btn-sm btn-danger btn-hapus-staf-admin" data-id="${staf.id}" data-nama="${staf.nama_lengkap}" title="Hapus Staf"><i class="fas fa-user-times fa-fw"></i></button>
                </td>
            `;
        });
    }

    function setButtonLoading(button, spinner, isLoading) { if (button && spinner) { button.disabled = isLoading; spinner.style.display = isLoading ? 'inline-block' : 'none'; } }
    function showErrorModal(errorElement, message) { if(errorElement) { errorElement.innerHTML = message.replace(/\n/g, '<br>'); errorElement.style.display = 'block'; } }
    function hideErrorModal(errorElement) { if(errorElement) errorElement.style.display = 'none'; }

    if (formTambahStafAdmin) {
        formTambahStafAdmin.addEventListener('submit', function(e) {
            e.preventDefault(); hideErrorModal(addStafErrorAdmin);
            setButtonLoading(submitTambahStafAdminBtn, tambahStafSpinner, true);

            const nama = addNamaStafInput.value.trim();
            const username = addUsernameStafInput.value.trim();
            const password = addPasswordStafInput.value;
            const role = addRoleStafSelect.value;

            if (!nama || !username || !password || !role) { showErrorModal(addStafErrorAdmin, 'Semua field wajib diisi.'); setButtonLoading(submitTambahStafAdminBtn, tambahStafSpinner, false); return; }
            if (password.length < 6) { showErrorModal(addStafErrorAdmin, 'Password minimal 6 karakter.'); setButtonLoading(submitTambahStafAdminBtn, tambahStafSpinner, false); return; }
            if (!/^[a-zA-Z0-9_]+$/.test(username)) { showErrorModal(addStafErrorAdmin, 'Username hanya boleh berisi huruf, angka, dan underscore.'); setButtonLoading(submitTambahStafAdminBtn, tambahStafSpinner, false); return; }
            if (STAF_DUMMY_ADMIN.some(s => s.username === username)) { showErrorModal(addStafErrorAdmin, 'Username sudah digunakan.'); setButtonLoading(submitTambahStafAdminBtn, tambahStafSpinner, false); return; }


            setTimeout(() => {
                const newId = Math.max(0, ...STAF_DUMMY_ADMIN.map(s => s.id)) + 1;
                STAF_DUMMY_ADMIN.push({ id: newId, username: username, nama_lengkap: nama, role: role, password_hash: `hashed_${password}` });
                displayStafAdmin();
                tambahStafModal.modal('hide');
                setButtonLoading(submitTambahStafAdminBtn, tambahStafSpinner, false);
                alert('Staf baru berhasil ditambahkan! (Simulasi)');
            }, 500);
        });
    }

     if (stafTableBodyAdmin) {
        stafTableBodyAdmin.addEventListener('click', function(e) {
            const editButton = e.target.closest('.btn-edit-staf-admin');
            const deleteButton = e.target.closest('.btn-hapus-staf-admin');

            if (editButton) {
                hideErrorModal(editStafErrorAdmin);
                const stafId = parseInt(editButton.dataset.id);
                const stafToEdit = STAF_DUMMY_ADMIN.find(s => s.id === stafId);
                if (stafToEdit) {
                    editIdStafInput.value = stafToEdit.id;
                    editUsernameDisplayInput.value = stafToEdit.username;
                    editNamaStafInput.value = stafToEdit.nama_lengkap;
                    editPasswordStafInput.value = '';
                    editRoleStafSelect.value = stafToEdit.role;
                    editStafModal.modal('show');
                }
            }

            if (deleteButton) {
                const stafId = parseInt(deleteButton.dataset.id);
                const stafNama = deleteButton.dataset.nama;
                if (stafId === 1 && STAF_DUMMY_ADMIN.find(s => s.id === 1)?.username === 'admin') {
                     alert('User admin utama tidak dapat dihapus.');
                     return;
                }
                if (confirm(`Yakin ingin menghapus staf "${stafNama}"?`)) {
                    STAF_DUMMY_ADMIN = STAF_DUMMY_ADMIN.filter(s => s.id !== stafId);
                    displayStafAdmin();
                    alert(`Staf "${stafNama}" berhasil dihapus! (Simulasi)`);
                }
            }
        });
    }


    if (formEditStafAdmin) {
        formEditStafAdmin.addEventListener('submit', function(e) {
            e.preventDefault(); hideErrorModal(editStafErrorAdmin);
            setButtonLoading(submitEditStafAdminBtn, editStafSpinner, true);

            const id = parseInt(editIdStafInput.value);
            const nama = editNamaStafInput.value.trim();
            const password_baru = editPasswordStafInput.value;
            const role = editRoleStafSelect.value;

            if (!nama || !role) { showErrorModal(editStafErrorAdmin, 'Nama Lengkap dan Peran wajib diisi.'); setButtonLoading(submitEditStafAdminBtn, editStafSpinner, false); return; }
            if (password_baru && password_baru.length < 6) { showErrorModal(editStafErrorAdmin, 'Password baru minimal 6 karakter.'); setButtonLoading(submitEditStafAdminBtn, editStafSpinner, false); return; }

            setTimeout(() => {
                const stafIndex = STAF_DUMMY_ADMIN.findIndex(s => s.id === id);
                if (stafIndex > -1) {
                    STAF_DUMMY_ADMIN[stafIndex].nama_lengkap = nama;
                    STAF_DUMMY_ADMIN[stafIndex].role = role;
                    if (password_baru) {
                        STAF_DUMMY_ADMIN[stafIndex].password_hash = `newly_hashed_${password_baru}`;
                    }
                }
                displayStafAdmin();
                editStafModal.modal('hide');
                setButtonLoading(submitEditStafAdminBtn, editStafSpinner, false);
                alert('Perubahan data staf berhasil disimpan! (Simulasi)');
            }, 500);
        });
    }

    $('#tambahStafModal').on('hidden.bs.modal', function () { if(formTambahStafAdmin) formTambahStafAdmin.reset(); hideErrorModal(addStafErrorAdmin); });
    $('#editStafModal').on('hidden.bs.modal', function () { if(formEditStafAdmin) formEditStafAdmin.reset(); hideErrorModal(editStafErrorAdmin); });

    if(loadingStafAdmin) loadingStafAdmin.style.display = 'block';
    setTimeout(() => {
        displayStafAdmin();
        if(loadingStafAdmin) loadingStafAdmin.style.display = 'none';
        if(document.getElementById('dataTableStaf')) {
 
        }
    }, 200);
});