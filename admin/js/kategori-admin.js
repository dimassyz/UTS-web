document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('adminNameDisplay')) {
        document.getElementById('adminNameDisplay').textContent = 'Admin Resto';
    }

    const kategoriTableBodyAdmin = document.getElementById('kategoriTableBodyAdmin');
    const loadingKategoriAdmin = document.getElementById('loadingKategoriAdmin');
    const tableKategoriContainerAdmin = document.getElementById('tableKategoriContainerAdmin');
    const noKategoriMessageAdmin = document.getElementById('noKategoriMessageAdmin');

    const tambahKategoriModal = $('#tambahKategoriModal');
    const formTambahKategoriAdmin = document.getElementById('formTambahKategoriAdmin');
    const submitTambahKategoriAdminBtn = document.getElementById('submitTambahKategoriAdmin');
    const tambahKategoriSpinner = submitTambahKategoriAdminBtn ? submitTambahKategoriAdminBtn.querySelector('.spinner-border') : null;
    const addKategoriErrorAdmin = document.getElementById('addKategoriErrorAdmin');
    const addNamaKategoriInput = document.getElementById('addNamaKategoriAdmin');
    const addIdKategoriInput = document.getElementById('addIdKategoriAdmin');

    const editKategoriModal = $('#editKategoriModal');
    const formEditKategoriAdmin = document.getElementById('formEditKategoriAdmin');
    const submitEditKategoriAdminBtn = document.getElementById('submitEditKategoriAdmin');
    const editKategoriSpinner = submitEditKategoriAdminBtn ? submitEditKategoriAdminBtn.querySelector('.spinner-border') : null;
    const editKategoriErrorAdmin = document.getElementById('editKategoriErrorAdmin');
    const editIdKategoriInput = document.getElementById('editIdKategoriAdmin');
    const displayIdKategoriInput = document.getElementById('displayIdKategoriAdmin');
    const editNamaKategoriInput = document.getElementById('editNamaKategoriAdmin');


    let kategori = [
        { id: 'makanan_berat', nama_kategori: 'Makanan Berat' },
        { id: 'makanan_ringan', nama_kategori: 'Cemilan' },
        { id: 'minuman_dingin', nama_kategori: 'Minuman Dingin' },
        { id: 'minuman_panas', nama_kategori: 'Minuman Panas' },
        { id: 'dessert', nama_kategori: 'Penutup' }
    ];

    function displayKategoriAdmin() {
        if (!kategoriTableBodyAdmin) return;
        kategoriTableBodyAdmin.innerHTML = '';
        if (noKategoriMessageAdmin) noKategoriMessageAdmin.style.display = 'none';
        if (!kategori || kategori.length === 0) {
            if (noKategoriMessageAdmin) noKategoriMessageAdmin.style.display = 'block';
            if (tableKategoriContainerAdmin) tableKategoriContainerAdmin.style.display = 'none';
            return;
        }
        if (tableKategoriContainerAdmin) tableKategoriContainerAdmin.style.display = '';

        kategori.forEach((kat, index) => {
            const row = kategoriTableBodyAdmin.insertRow();
            row.innerHTML = `
                <td class="text-center">${index + 1}</td>
                <td><code>${kat.id}</code></td>
                <td>${kat.nama_kategori}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-warning btn-edit-kategori-admin" data-id="${kat.id}" title="Edit Kategori"><i class="fas fa-edit fa-fw"></i></button>
                    <button class="btn btn-sm btn-danger btn-hapus-kategori-admin" data-id="${kat.id}" data-nama="${kat.nama_kategori}" title="Hapus Kategori"><i class="fas fa-trash fa-fw"></i></button>
                </td>
            `;
        });
    }

    function setButtonLoading(button, spinner, isLoading) { if (button && spinner) { button.disabled = isLoading; spinner.style.display = isLoading ? 'inline-block' : 'none'; } }
    function showErrorModal(errorElement, message) { if(errorElement) { errorElement.innerHTML = message.replace(/\n/g, '<br>'); errorElement.style.display = 'block'; } }
    function hideErrorModal(errorElement) { if(errorElement) errorElement.style.display = 'none'; }

    if (formTambahKategoriAdmin) {
        formTambahKategoriAdmin.addEventListener('submit', function(e) {
            e.preventDefault();
            hideErrorModal(addKategoriErrorAdmin);
            setButtonLoading(submitTambahKategoriAdminBtn, tambahKategoriSpinner, true);

            const nama = addNamaKategoriInput.value.trim();
            const id = addIdKategoriInput.value.trim().toLowerCase().replace(/\s+/g, '_');

            if (!nama || !id) { showErrorModal(addKategoriErrorAdmin, 'ID dan Nama Kategori wajib diisi.'); setButtonLoading(submitTambahKategoriAdminBtn, tambahKategoriSpinner, false); return; }
            if (!/^[a-z0-9_]+$/.test(id)) { showErrorModal(addKategoriErrorAdmin, 'ID Kategori hanya boleh berisi huruf kecil, angka, dan underscore (_).'); setButtonLoading(submitTambahKategoriAdminBtn, tambahKategoriSpinner, false); return; }
            if (kategori.some(k => k.id === id)) { showErrorModal(addKategoriErrorAdmin, 'ID Kategori sudah digunakan.'); setButtonLoading(submitTambahKategoriAdminBtn, tambahKategoriSpinner, false); return; }

            setTimeout(() => {
                kategori.push({ id: id, nama_kategori: nama });
                displayKategoriAdmin();
                tambahKategoriModal.modal('hide');
                setButtonLoading(submitTambahKategoriAdminBtn, tambahKategoriSpinner, false);
                alert('Kategori baru berhasil ditambahkan! (Simulasi)');
            }, 500);
        });
    }

    if (kategoriTableBodyAdmin) {
        kategoriTableBodyAdmin.addEventListener('click', function(e) {
            const editButton = e.target.closest('.btn-edit-kategori-admin');
            const deleteButton = e.target.closest('.btn-hapus-kategori-admin');

            if (editButton) {
                hideErrorModal(editKategoriErrorAdmin);
                const katId = editButton.dataset.id;
                const katToEdit = kategori.find(k => k.id === katId);
                if (katToEdit) {
                    editIdKategoriInput.value = katToEdit.id;
                    displayIdKategoriInput.value = katToEdit.id;
                    editNamaKategoriInput.value = katToEdit.nama_kategori;
                    editKategoriModal.modal('show');
                }
            }

            if (deleteButton) {
                const katId = deleteButton.dataset.id;
                const katNama = deleteButton.dataset.nama;
                if (confirm(`Yakin ingin menghapus kategori "${katNama}"? Menghapus kategori mungkin mempengaruhi produk terkait.`)) {
                    kategori = kategori.filter(k => k.id !== katId);
                    displayKategoriAdmin();
                    alert(`Kategori "${katNama}" berhasil dihapus! (Simulasi)`);
                }
            }
        });
    }

    if (formEditKategoriAdmin) {
        formEditKategoriAdmin.addEventListener('submit', function(e) {
            e.preventDefault();
            hideErrorModal(editKategoriErrorAdmin);
            setButtonLoading(submitEditKategoriAdminBtn, editKategoriSpinner, true);

            const id = editIdKategoriInput.value;
            const nama = editNamaKategoriInput.value.trim();

            if (!nama) { showErrorModal(editKategoriErrorAdmin, 'Nama Kategori wajib diisi.'); setButtonLoading(submitEditKategoriAdminBtn, editKategoriSpinner, false); return; }

            setTimeout(() => {
                const katIndex = kategori.findIndex(k => k.id === id);
                if (katIndex > -1) {
                    kategori[katIndex].nama_kategori = nama;
                }
                displayKategoriAdmin();
                editKategoriModal.modal('hide');
                setButtonLoading(submitEditKategoriAdminBtn, editKategoriSpinner, false);
                alert('Perubahan kategori berhasil disimpan! (Simulasi)');
            }, 500);
        });
    }

    $('#tambahKategoriModal').on('hidden.bs.modal', function () { if(formTambahKategoriAdmin) formTambahKategoriAdmin.reset(); hideErrorModal(addKategoriErrorAdmin); });
    $('#editKategoriModal').on('hidden.bs.modal', function () { if(formEditKategoriAdmin) formEditKategoriAdmin.reset(); hideErrorModal(editKategoriErrorAdmin); });


    if(loadingKategoriAdmin) loadingKategoriAdmin.style.display = 'block';
    setTimeout(() => {
        displayKategoriAdmin();
        if(loadingKategoriAdmin) loadingKategoriAdmin.style.display = 'none';
        if(document.getElementById('dataTableKategori')) {
        }
    }, 200);
});