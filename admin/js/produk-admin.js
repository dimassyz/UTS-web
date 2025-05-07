document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('adminNameDisplay')) {
        document.getElementById('adminNameDisplay').textContent = 'Admin Resto';
    }
    const confirmLogoutButton = document.getElementById('confirmLogoutButton');
    if (confirmLogoutButton) {
        confirmLogoutButton.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = 'login.html';
        });
    }

    const kategori = [
        { id: 'all', nama_kategori: 'Semua Menu' }, 
        { id: 'makanan_berat', nama_kategori: 'Makanan Berat' },
        { id: 'makanan_ringan', nama_kategori: 'Cemilan' },
        { id: 'minuman_dingin', nama_kategori: 'Minuman Dingin' },
        { id: 'minuman_panas', nama_kategori: 'Minuman Panas' },
        { id: 'dessert', nama_kategori: 'Penutup' }
    ];

    let produk = [
        { id: 'prod001', nama: 'Nasi Goreng Spesial Nusantara', stok: 20, harga: 28000, gambar_url: '../assets/img/nasreng.jpg', category_id: 'makanan_berat', deskripsi: 'Nasi goreng dengan bumbu rempah khas, udang, ayam, dan telur.' },
        { id: 'prod002', nama: 'Soto Ayam Lamongan Kuah Bening', stok: 15, harga: 22000, gambar_url: '../assets/img/soto.png', category_id: 'makanan_berat', deskripsi: 'Soto ayam dengan kuah kaldu bening, suwiran ayam, soun, dan telur rebus.' },
        { id: 'prod003', nama: 'Gado-Gado Siram Bumbu Kacang', stok: 25, harga: 20000, gambar_url: '../assets/img/gado.png', category_id: 'makanan_ringan', deskripsi: 'Sayuran segar direbus disiram bumbu kacang mede yang gurih.' },
        { id: 'prod004', nama: 'Sate Ayam Madura (10 Tusuk)', stok: 30, harga: 30000, gambar_url: '../assets/img/sate.png', category_id: 'makanan_berat', deskripsi: 'Sate ayam dengan bumbu kacang khas Madura, disajikan dengan lontong atau nasi.' },
        { id: 'prod005', nama: 'Es Teh Manis Jumbo', stok: 50, harga: 8000, gambar_url: '../assets/img/esteh.png', category_id: 'minuman_dingin', deskripsi: 'Es teh manis dengan ukuran jumbo yang menyegarkan.' },
        { id: 'prod006', nama: 'Kopi Hitam Tubruk', stok: 0, harga: 10000, gambar_url: '../assets/img/kopi.png', category_id: 'minuman_panas', deskripsi: 'Kopi hitam tubruk tradisional dengan aroma kuat.' },
        { id: 'prod007', nama: 'Pisang Goreng Crispy (Isi 5)', stok: 18, harga: 15000, gambar_url: '../assets/img/pisreng.png', category_id: 'makanan_ringan', deskripsi: 'Pisang goreng renyah dengan taburan keju dan coklat.' },
        { id: 'prod008', nama: 'Es Cendol Durian', stok: 12, harga: 25000, gambar_url: '../assets/img/cendol.png', category_id: 'dessert', deskripsi: 'Es cendol dengan tambahan daging durian asli dan santan gurih.' },
    ];

    const produkTableBodyAdmin = document.getElementById('produkTableBodyAdmin');
    const loadingProdukAdmin = document.getElementById('loadingProdukAdmin');
    const tableProdukContainerAdmin = document.getElementById('tableProdukContainerAdmin');
    const noProdukMessageAdmin = document.getElementById('noProdukMessageAdmin');

    const addKategoriSelect = document.getElementById('addKategoriProdukAdmin');
    const editKategoriSelect = document.getElementById('editKategoriProdukAdmin');

    const formTambahProdukAdmin = document.getElementById('formTambahProdukAdmin');
    const submitTambahProdukAdminBtn = document.getElementById('submitTambahProdukAdmin');
    const tambahProdukSpinnerAdmin = submitTambahProdukAdminBtn ? submitTambahProdukAdminBtn.querySelector('.spinner-border') : null;
    const addProdukErrorAdmin = document.getElementById('addProdukErrorAdmin');

    const formEditProdukAdmin = document.getElementById('formEditProdukAdmin');
    const submitEditProdukAdminBtn = document.getElementById('submitEditProdukAdmin');
    const editProdukSpinnerAdmin = submitEditProdukAdminBtn ? submitEditProdukAdminBtn.querySelector('.spinner-border') : null;
    const editProdukErrorAdmin = document.getElementById('editProdukErrorAdmin');
    const editProdukIdAdminInput = document.getElementById('editProdukIdAdmin');

    function populateKategoriSelect(selectElement) {
        if (!selectElement) return;
        selectElement.innerHTML = '<option value="">Pilih Kategori...</option>';
        kategori.forEach(kat => {
            if (kat.id !== 'all') {
                const option = document.createElement('option');
                option.value = kat.id;
                option.textContent = kat.nama_kategori;
                selectElement.appendChild(option);
            }
        });
    }

    function formatRupiahAdmin(angka) {
         if (angka === null || angka === undefined || isNaN(parseFloat(angka))) return 'Rp 0';
         var number_string = Math.round(parseFloat(angka)).toString(), sisa = number_string.length % 3, rupiah = number_string.substr(0, sisa), ribuan = number_string.substr(sisa).match(/\d{3}/g);
         if (ribuan) { let separator = sisa ? '.' : ''; rupiah += separator + ribuan.join('.'); }
         return 'Rp ' + (rupiah || '0');
    }

    function displayProdukAdmin() {
        if (!produkTableBodyAdmin) return;
        produkTableBodyAdmin.innerHTML = '';
        if (noProdukMessageAdmin) noProdukMessageAdmin.style.display = 'none';

        if (!produk || produk.length === 0) {
            if (noProdukMessageAdmin) noProdukMessageAdmin.style.display = 'block';
            if (tableProdukContainerAdmin) tableProdukContainerAdmin.style.display = 'none';
            return;
        }
        if (tableProdukContainerAdmin) tableProdukContainerAdmin.style.display = '';

        produk.forEach((prod, index) => {

            const kategoriProduk = kategori.find(k => k.id === prod.category_id);
            const kategoriNama = kategoriProduk ? kategoriProduk.nama_kategori : 'Tidak Diketahui';

            const row = produkTableBodyAdmin.insertRow();
            row.innerHTML = `
                <td class="text-center align-middle">${index + 1}</td>
                <td class="text-center align-middle"><img src="${prod.gambar_url || 'https://via.placeholder.com/50'}" alt="${prod.nama}" style="width:50px; height:auto; max-height:50px; object-fit:cover;" class="rounded"></td>
                <td class="align-middle">${prod.nama}</td>
                <td class="align-middle">${kategoriNama}</td>
                <td class="text-center align-middle">${prod.stok}</td>
                <td class="text-right align-middle">${formatRupiahAdmin(prod.harga)}</td>
                <td class="text-center align-middle">
                    <button class="btn btn-sm btn-warning btn-edit-produk-admin" data-id="${prod.id}" title="Edit Menu"><i class="fas fa-edit fa-fw"></i></button>
                    <button class="btn btn-sm btn-danger btn-hapus-produk-admin" data-id="${prod.id}" data-nama="${prod.nama}" title="Hapus Menu"><i class="fas fa-trash fa-fw"></i></button>
                </td>
            `;
        });
    }

    function setButtonLoadingAdmin(button, spinner, isLoading) {
        if (button && spinner) {
            button.disabled = isLoading;
            spinner.style.display = isLoading ? 'inline-block' : 'none';
        }
    }
    function showErrorModalAdmin(errorElement, message) {
        if(errorElement) { errorElement.innerHTML = message.replace(/\n/g, '<br>'); errorElement.style.display = 'block';}
    }
    function hideErrorModalAdmin(errorElement) {
        if(errorElement) errorElement.style.display = 'none';
    }

    if (formTambahProdukAdmin) {
        formTambahProdukAdmin.addEventListener('submit', function(e) {
            e.preventDefault();
            hideErrorModalAdmin(addProdukErrorAdmin);
            setButtonLoadingAdmin(submitTambahProdukAdminBtn, tambahProdukSpinnerAdmin, true);

            const nama = document.getElementById('addNamaProdukAdmin').value.trim();
            const kategori_id = document.getElementById('addKategoriProdukAdmin').value;
            const harga = parseFloat(document.getElementById('addHargaProdukAdmin').value);
            const stok = parseInt(document.getElementById('addStokProdukAdmin').value);
            const gambar_url = document.getElementById('addGambarUrlProdukAdmin').value.trim();
            const deskripsi = document.getElementById('addDeskripsiProdukAdmin').value.trim();

            if (!nama || !kategori_id || isNaN(harga) || isNaN(stok) || harga < 0 || stok < 0) {
                showErrorModalAdmin(addProdukErrorAdmin, 'Nama, Kategori, Harga (>=0), dan Stok (>=0) wajib diisi dengan benar.');
                setButtonLoadingAdmin(submitTambahProdukAdminBtn, tambahProdukSpinnerAdmin, false);
                return;
            }

            setTimeout(() => {
                const newId = 'prod' + String(Date.now()).slice(-5);
                const selectedKategori = kategori.find(k => k.id === kategori_id);
                produk.push({
                    id: newId,
                    nama: nama,
                    kategori_id: kategori_id,
                    kategori_nama: selectedKategori ? selectedKategori.nama_kategori : 'Tidak Diketahui',
                    stok: stok,
                    harga: harga,
                    gambar_url: gambar_url || null,
                    deskripsi: deskripsi
                });
                displayProdukAdmin();
                $('#tambahProdukModal').modal('hide');
                setButtonLoadingAdmin(submitTambahProdukAdminBtn, tambahProdukSpinnerAdmin, false);
                alert('Menu baru berhasil ditambahkan! (Simulasi)');
            }, 500);
        });
    }

     if (produkTableBodyAdmin) {
        produkTableBodyAdmin.addEventListener('click', function(e) {
            const editButton = e.target.closest('.btn-edit-produk-admin');
            const deleteButton = e.target.closest('.btn-hapus-produk-admin');

            if (editButton) {
                hideErrorModalAdmin(editProdukErrorAdmin);
                const produkId = editButton.dataset.id;
                const produkToEdit = produk.find(p => p.id === produkId);
                if (produkToEdit) {
                    editProdukIdAdminInput.value = produkToEdit.id;
                    document.getElementById('editNamaProdukAdmin').value = produkToEdit.nama;
                    document.getElementById('editKategoriProdukAdmin').value = produkToEdit.kategori_id;
                    document.getElementById('editHargaProdukAdmin').value = produkToEdit.harga;
                    document.getElementById('editStokProdukAdmin').value = produkToEdit.stok;
                    document.getElementById('editGambarUrlProdukAdmin').value = produkToEdit.gambar_url || '';
                    document.getElementById('editDeskripsiProdukAdmin').value = produkToEdit.deskripsi || '';
                    $('#editProdukModal').modal('show');
                } else {
                    alert('Data produk tidak ditemukan untuk diedit.');
                }
            }

            if (deleteButton) {
                const produkId = deleteButton.dataset.id;
                const produkNama = deleteButton.dataset.nama;
                if (confirm(`Yakin ingin menghapus menu "${produkNama}"?`)) {
                    produk = produk.filter(p => p.id !== produkId);
                    displayProdukAdmin();
                    alert(`Menu "${produkNama}" berhasil dihapus! (Simulasi)`);
                }
            }
        });
    }

     if (formEditProdukAdmin) {
        formEditProdukAdmin.addEventListener('submit', function(e) {
            e.preventDefault();
            hideErrorModalAdmin(editProdukErrorAdmin);
            setButtonLoadingAdmin(submitEditProdukAdminBtn, editProdukSpinnerAdmin, true);

            const id = editProdukIdAdminInput.value;
            const nama = document.getElementById('editNamaProdukAdmin').value.trim();
            const kategori_id = document.getElementById('editKategoriProdukAdmin').value;
            const harga = parseFloat(document.getElementById('editHargaProdukAdmin').value);
            const stok = parseInt(document.getElementById('editStokProdukAdmin').value);
            const gambar_url = document.getElementById('editGambarUrlProdukAdmin').value.trim();
            const deskripsi = document.getElementById('editDeskripsiProdukAdmin').value.trim();

             if (!nama || !kategori_id || isNaN(harga) || isNaN(stok) || harga < 0 || stok < 0) {
                showErrorModalAdmin(editProdukErrorAdmin, 'Nama, Kategori, Harga (>=0), dan Stok (>=0) wajib diisi dengan benar.');
                setButtonLoadingAdmin(submitEditProdukAdminBtn, editProdukSpinnerAdmin, false);
                return;
            }

            setTimeout(() => {
                const produkIndex = produk.findIndex(p => p.id === id);
                if (produkIndex > -1) {
                    const selectedKategori = kategori.find(k => k.id === kategori_id);
                    produk[produkIndex] = {
                        ...produk[produkIndex],
                        nama,
                        kategori_id,
                        kategori_nama: selectedKategori ? selectedKategori.nama_kategori : 'Tidak Diketahui',
                        harga,
                        stok,
                        gambar_url: gambar_url || null,
                        deskripsi
                    };
                }
                displayProdukAdmin();
                $('#editProdukModal').modal('hide');
                setButtonLoadingAdmin(submitEditProdukAdminBtn, editProdukSpinnerAdmin, false);
                alert('Perubahan menu berhasil disimpan! (Simulasi)');
            }, 500);
        });
    }

    $('#tambahProdukModal').on('hidden.bs.modal', function () { if(formTambahProdukAdmin) formTambahProdukAdmin.reset(); hideErrorModalAdmin(addProdukErrorAdmin); });
    $('#editProdukModal').on('hidden.bs.modal', function () { if(formEditProdukAdmin) formEditProdukAdmin.reset(); hideErrorModalAdmin(editProdukErrorAdmin); });


    if(loadingProdukAdmin) loadingProdukAdmin.style.display = 'block';
    setTimeout(() => {
        populateKategoriSelect(addKategoriSelect);
        populateKategoriSelect(editKategoriSelect);
        displayProdukAdmin();
        if(loadingProdukAdmin) loadingProdukAdmin.style.display = 'none';
        if(document.getElementById('dataTableProduk')) {

        }
    }, 200);
});