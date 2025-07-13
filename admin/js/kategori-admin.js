// /admin/js/kategori-admin.js (Perbaikan untuk 404 Not Found)

document.addEventListener('DOMContentLoaded', function() {
    let categoriesData = [];
    const tableBody = document.getElementById('kategoriTableBodyAdmin');
    const form = document.getElementById('formKategori');
    const modal = $('#formModalKategori');
    const modalLabel = document.getElementById('formModalKategoriLabel');
    const errorDiv = document.getElementById('formErrorKategori');
    const submitBtn = document.getElementById('submitBtnKategori');
    const spinner = submitBtn.querySelector('.spinner-border');
    const idInput = document.getElementById('id');
    const idGroup = document.getElementById('idKategoriGroup');
    
    // --- GUNAKAN SATU URL API UNTUK SEMUA AKSI ---
    const API_URL = '../api/crud_kategori.php';

    async function fetchAndParse(url, options = {}) { let response; try { response = await fetch(url, options); const responseClone = response.clone(); try { const result = await response.json(); return { ok: response.ok, result }; } catch (e) { const text = await responseClone.text(); throw new Error(`Format respons tidak valid. Server: ${text.substring(0,150)}...`); } } catch (e) { throw new Error(`Tidak dapat terhubung ke server: ${e.message}`); } }
    function setButtonLoading(isLoading) { if(submitBtn && spinner) { submitBtn.disabled = isLoading; spinner.style.display = isLoading ? 'inline-block' : 'none'; } }
    function showError(message) { if(errorDiv) { errorDiv.innerHTML = message.replace(/\n/g, '<br>'); errorDiv.style.display = 'block'; } }
    function hideError() { if(errorDiv) errorDiv.style.display = 'none'; }

    function displayData(data) {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Belum ada data kategori.</td></tr>';
            return;
        }
        data.forEach((kat, index) => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td class="text-center align-middle">${index + 1}</td>
                <td class="align-middle"><code>${kat.id}</code></td>
                <td class="align-middle">${kat.nama_kategori}</td>
                <td class="text-center align-middle">
                    <button class="btn btn-sm btn-warning btn-edit" data-id="${kat.id}"><i class="fas fa-edit"></i></button> 
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${kat.id}" data-nama="${kat.nama_kategori}"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });
    }

    async function loadData() {
        if(tableBody) tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted"><div class="spinner-border spinner-border-sm"></div> Memuat...</td></tr>';
        try {
            // Panggil API_URL dengan metode GET (default fetch)
            const { ok, result } = await fetchAndParse(API_URL);
            if (!ok || !result.success) throw new Error(result.message || 'Gagal memuat data.');
            categoriesData = result.data || [];
            displayData(categoriesData);
        } catch (error) {
            console.error("Error saat memuat kategori:", error);
            if(tableBody) tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Gagal memuat: ${error.message}</td></tr>`;
        }
    }

    async function handleFormSubmit(data) {
        setButtonLoading(true);
        try {
            // Panggil API_URL dengan metode POST untuk semua aksi CRUD
            const { ok, result } = await fetchAndParse(API_URL, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
            if (!ok || !result.success) { throw new Error(result.message || 'Aksi gagal di server.'); }
            modal.modal('hide');
            alert(result.message);
            await loadData();
        } catch (error) {
            showError(error.message);
        } finally {
            setButtonLoading(false);
        }
    }

    document.getElementById('btnTambahKategori').addEventListener('click', () => {
        form.reset(); form.querySelector('#kategoriId').value = '';
        modalLabel.textContent = 'Tambah Kategori Baru';
        idInput.readOnly = false; idInput.disabled = false; idGroup.style.display = 'block';
        hideError(); modal.modal('show');
    });

    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');
            if (editBtn) {
                const id = editBtn.dataset.id;
                const kat = categoriesData.find(k => k.id === id);
                if (kat) {
                    form.reset(); hideError();
                    form.querySelector('#kategoriId').value = kat.id;
                    idInput.value = kat.id; idInput.readOnly = true; idInput.disabled = true; idGroup.style.display = 'none'; // Sembunyikan ID saat edit
                    form.querySelector('#nama_kategori').value = kat.nama_kategori;
                    modalLabel.textContent = 'Edit Kategori';
                    modal.modal('show');
                }
            }
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                const nama = deleteBtn.dataset.nama;
                if (confirm(`Yakin ingin menghapus kategori "${nama}"?`)) {
                    handleFormSubmit({ action: 'delete', id: id });
                }
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const idInForm = form.querySelector('#kategoriId').value;
            const action = idInForm ? 'update' : 'add';
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.action = action;
            data.id = idInForm ? idInForm : data.id;
            handleFormSubmit(data);
        });
    }
    
    modal.on('hidden.bs.modal', () => { hideError(); form.reset(); });
    loadData();
});