document.addEventListener('DOMContentLoaded', function() {
    let productsData = [];
    let categoriesData = [];
    const tableBody = document.getElementById('produkTableBodyAdmin');
    const form = document.getElementById('formProduk');
    const modal = $('#formModal');
    const modalLabel = document.getElementById('formModalLabel');
    const errorDiv = document.getElementById('formError');
    const submitBtn = document.getElementById('submitBtn');
    const spinner = submitBtn ? submitBtn.querySelector('.spinner-border') : null;
    const API_CRUD_URL = '../api/crud_produk.php';
    const API_GET_URL = '../api/get_products.php';
    const API_CAT_URL = '../api/get_categories.php';
    let dataTableInstance;

    async function fetchAndParse(url, options = {}) {
        let response;
        try {
            response = await fetch(url, options);
            const responseClone = response.clone();
            try {
                const result = await response.json();
                return { ok: response.ok, status: response.status, result };
            } catch (jsonError) {
                let responseText = '';
                try { responseText = await responseClone.text(); } catch (e) {}
                throw new Error(`Format respons tidak valid (Status: ${response.status}). ${responseText.substring(0,150)}...`);
            }
        } catch (networkError) {
            throw new Error(`Tidak dapat terhubung ke server: ${networkError.message}`);
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

    function formatRupiah(angka) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
    }

    async function loadData() {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                fetchAndParse(API_GET_URL),
                fetchAndParse(API_CAT_URL)
            ]);
            if (!productsRes.ok || !productsRes.result.success) throw new Error(productsRes.result.message || 'Gagal memuat produk.');
            if (!categoriesRes.ok || !categoriesRes.result.success) throw new Error(categoriesRes.result.message || 'Gagal memuat kategori.');
            productsData = productsRes.result.data || [];
            categoriesData = categoriesRes.result.data || [];
            populateKategoriSelect(document.getElementById('kategori_id'));
            displayData();
        } catch (error) {
            if(tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Gagal memuat data: ${error.message}</td></tr>`;
        }
    }

    function populateKategoriSelect(selectElement) {
        if (!selectElement) return;
        const currentValue = selectElement.value;
        selectElement.innerHTML = '<option value="">Pilih Kategori...</option>';
        categoriesData.forEach(kat => {
            if (kat.id !== 'all') {
                const option = document.createElement('option');
                option.value = kat.id;
                option.textContent = kat.nama_kategori;
                selectElement.appendChild(option);
            }
        });
        selectElement.value = currentValue;
    }

    function displayData() {
        if (!tableBody) return;
        if ($.fn.DataTable.isDataTable('#dataTableProduk')) {
            dataTableInstance = $('#dataTableProduk').DataTable();
            dataTableInstance.clear();
        } else {
            dataTableInstance = $('#dataTableProduk').DataTable({
                "language": { "url": "//cdn.datatables.net/plug-ins/1.10.25/i18n/Indonesian.json" },
                "order": [[2, "asc"]]
            });
        }
        productsData.forEach((produk, index) => {
            const kategoriNama = (categoriesData.find(k => k.id === produk.category_id) || {}).nama_kategori || 'Tidak Diketahui';
            dataTableInstance.row.add([
                index + 1,
                `<img src="${produk.gambar_url || 'https://via.placeholder.com/50'}" alt="${produk.nama}" style="width:50px; height:50px; object-fit:cover;" class="rounded">`,
                produk.nama,
                kategoriNama,
                produk.stok,
                formatRupiah(produk.harga),
                `<button class="btn btn-sm btn-warning btn-edit" data-id="${produk.id}"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger btn-delete" data-id="${produk.id}" data-nama="${produk.nama}"><i class="fas fa-trash"></i></button>`
            ]).draw(false);
        });
    }

    document.getElementById('btnTambahProduk').addEventListener('click', () => {
        form.reset();
        form.querySelector('#produkId').value = '';
        modalLabel.textContent = 'Tambah Menu Baru';
        hideError();
        populateKategoriSelect(form.querySelector('#kategori_id'));
        modal.modal('show');
    });

    tableBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');
        if (editBtn) {
            const id = editBtn.dataset.id;
            const produk = productsData.find(p => p.id === id);
            if (produk) {
                form.reset();
                hideError();
                populateKategoriSelect(form.querySelector('#kategori_id'));
                form.querySelector('#produkId').value = produk.id;
                form.querySelector('#nama').value = produk.nama;
                form.querySelector('#kategori_id').value = produk.category_id;
                form.querySelector('#harga').value = produk.harga;
                form.querySelector('#stok').value = produk.stok;
                form.querySelector('#gambar_url').value = produk.gambar_url || '';
                form.querySelector('#deskripsi').value = produk.deskripsi || '';
                modalLabel.textContent = 'Edit Menu';
                modal.modal('show');
            }
        }
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            const nama = deleteBtn.dataset.nama;
            if (confirm(`Yakin ingin menghapus menu "${nama}"?`)) {
                handleFormSubmit({ action: 'delete', id: id });
            }
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = form.querySelector('#produkId').value;
        const action = id ? 'update' : 'add';
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.action = action;
        handleFormSubmit(data);
    });

    async function handleFormSubmit(data) {
        setButtonLoading(true);
        try {
            const { ok, status, result } = await fetchAndParse(API_CRUD_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            if (!ok || !result.success) {
                throw new Error(result.message || `Error (Status: ${status})`);
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
    
    loadData();
});