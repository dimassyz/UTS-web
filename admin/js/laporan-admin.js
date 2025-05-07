// /Restoran/admin/js/laporan-admin.js
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('adminNameDisplay')) {
        document.getElementById('adminNameDisplay').textContent = 'Admin Resto';
    }
    const confirmLogoutButton = document.getElementById('confirmLogoutButton');
    if (confirmLogoutButton) {
        confirmLogoutButton.addEventListener('click', function(event) {
            event.preventDefault(); window.location.href = 'login.html';
        });
    }

    const laporanTableBodyAdmin = document.getElementById('laporanTableBodyAdmin');
    const loadingLaporanAdmin = document.getElementById('loadingLaporanAdmin');
    const tableLaporanContainerAdmin = document.getElementById('tableLaporanContainerAdmin');
    const noLaporanMessageAdmin = document.getElementById('noLaporanMessageAdmin');
    const filterLaporanFormAdmin = document.getElementById('filterLaporanFormAdmin');
    const filterTanggalMulaiAdmin = document.getElementById('filterTanggalMulaiAdmin');
    const filterTanggalAkhirAdmin = document.getElementById('filterTanggalAkhirAdmin');
    const resetFilterButtonAdmin = document.getElementById('resetFilterButtonAdmin');

    const transaksi = [
        {
            id: 'TRX004', waktu: '2024-10-27 11:30:15', atas_nama: 'Budi S.', tipe: 'Makan di Sini', kasir: 'Budi Kasir',
            items: [
                { nama: 'Nasi Goreng Spesial', jumlah: 1, harga: 28000 },
                { nama: 'Es Teh Manis', jumlah: 1, harga: 8000 }
            ], total: 36000
        },
        {
            id: 'TRX003', waktu: '2024-10-27 10:15:05', atas_nama: 'Citra', tipe: 'Bawa Pulang', kasir: 'Citra',
            items: [
                { nama: 'Soto Ayam Lamongan', jumlah: 2, harga: 22000 }
            ], total: 44000
        },
         {
            id: 'TRX002', waktu: '2024-10-26 19:45:50', atas_nama: 'Dewi', tipe: 'Makan di Sini', kasir: 'Budi Kasir',
            items: [
                { nama: 'Sate Ayam Madura', jumlah: 1, harga: 30000 },
                { nama: 'Kopi Hitam', jumlah: 1, harga: 10000 }
            ], total: 40000
        },
         {
            id: 'TRX001', waktu: '2024-10-26 12:05:22', atas_nama: 'Eko', tipe: 'Bawa Pulang', kasir: 'Citra',
            items: [
                { nama: 'Gado-Gado Siram', jumlah: 1, harga: 20000 },
                { nama: 'Pisang Goreng Crispy', jumlah: 1, harga: 15000 },
                { nama: 'Es Cendol Durian', jumlah: 1, harga: 25000 }
            ], total: 60000
        }
    ];

    function formatRupiahAdmin(angka) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka); }
    function formatWaktuLaporan(dateTimeString) {
        if (!dateTimeString) return '-';
        try { const date = new Date(dateTimeString); if (isNaN(date.getTime())) return dateTimeString;
            const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return date.toLocaleString('id-ID', options);
        } catch (e) { return dateTimeString; }
    }

    function displayLaporanAdmin(transactions) {
        if (!laporanTableBodyAdmin) return;
        laporanTableBodyAdmin.innerHTML = '';
        if (noLaporanMessageAdmin) noLaporanMessageAdmin.style.display = 'none';
        if (!transactions || transactions.length === 0) {
            if (noLaporanMessageAdmin) noLaporanMessageAdmin.style.display = 'block';
            if (tableLaporanContainerAdmin) tableLaporanContainerAdmin.style.display = 'none';
            return;
        }
        if (tableLaporanContainerAdmin) tableLaporanContainerAdmin.style.display = '';

        transactions.forEach((trx, index) => {
            const row = laporanTableBodyAdmin.insertRow();
            let itemsHtml = '<ul class="list-unstyled mb-0 small">';
            if(trx.items && trx.items.length > 0) {
                trx.items.forEach(item => {
                    itemsHtml += `<li>${item.nama} x ${item.jumlah}</li>`;
                });
            } else { itemsHtml += '<li>- Tidak ada item -</li>'; }
            itemsHtml += '</ul>';

            row.innerHTML = `
                <td class="text-center align-middle">${index + 1}</td>
                <td class="align-middle text-nowrap">${formatWaktuLaporan(trx.waktu)}</td>
                <td class="align-middle">${trx.atas_nama || '-'}</td>
                <td class="align-middle">${trx.tipe || '-'}</td>
                <td class="align-middle">${trx.kasir || '-'}</td>
                <td class="align-middle">${itemsHtml}</td>
                <td class="text-right align-middle font-weight-bold">${formatRupiahAdmin(trx.total)}</td>
                <td class="text-center align-middle">
                    <button class="btn btn-sm btn-info btn-detail-trx" data-id="${trx.id}" title="Lihat Detail"><i class="fas fa-eye fa-fw"></i></button>
                </td>
            `;
        });
    }

    function loadAndDisplayLaporan() {
        if (loadingLaporanAdmin) loadingLaporanAdmin.style.display = 'block';
        if (tableLaporanContainerAdmin) tableLaporanContainerAdmin.style.display = 'none';
        if (noLaporanMessageAdmin) noLaporanMessageAdmin.style.display = 'none';
        if (laporanTableBodyAdmin) laporanTableBodyAdmin.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Memuat data...</td></tr>`;

        const startDate = filterTanggalMulaiAdmin ? filterTanggalMulaiAdmin.value : null;
        const endDate = filterTanggalAkhirAdmin ? filterTanggalAkhirAdmin.value : null;

        setTimeout(() => {
            let filteredTransactions = [...transaksi];

            if (startDate) {
                filteredTransactions = filteredTransactions.filter(trx => {
                    const trxDate = trx.waktu.split(' ')[0]; // Ambil YYYY-MM-DD
                    return trxDate >= startDate;
                });
            }
            if (endDate) {
                filteredTransactions = filteredTransactions.filter(trx => {
                    const trxDate = trx.waktu.split(' ')[0];
                    return trxDate <= endDate;
                });
            }

            displayLaporanAdmin(filteredTransactions);
            if(loadingLaporanAdmin) loadingLaporanAdmin.style.display = 'none';

            // Inisialisasi DataTables setelah data dimuat (jika library disertakan)
            if ($.fn.DataTable && !$.fn.DataTable.isDataTable('#dataTableLaporan')) {
                 $('#dataTableLaporan').DataTable({
                     "order": [[ 1, "desc" ]], // Urutkan berdasarkan waktu terbaru dulu
                     "language": { // Contoh opsi bahasa Indonesia
                         "search": "Cari:",
                         "lengthMenu": "Tampilkan _MENU_ data per halaman",
                         "zeroRecords": "Data tidak ditemukan",
                         "info": "Menampilkan halaman _PAGE_ dari _PAGES_",
                         "infoEmpty": "Tidak ada data tersedia",
                         "infoFiltered": "(difilter dari _MAX_ total data)",
                         "paginate": { "first": "Pertama", "last": "Terakhir", "next": "Berikutnya", "previous": "Sebelumnya" }
                     }
                 });
            } else if ($.fn.DataTable) {
                // Jika sudah ada, mungkin perlu redraw atau clear/add data jika filter
                 $('#dataTableLaporan').DataTable().clear().rows.add(filteredTransactions).draw(); // Cara redraw jika pakai data array
            }

        }, 300); // Simulasi loading
    }

    if(filterLaporanFormAdmin) {
        filterLaporanFormAdmin.addEventListener('submit', (e) => {
            e.preventDefault();
             // Hancurkan DataTable lama sebelum memuat data baru jika pakai DataTables
             if ($.fn.DataTable && $.fn.DataTable.isDataTable('#dataTableLaporan')) {
                  $('#dataTableLaporan').DataTable().destroy();
                  // Kosongkan tbody secara manual setelah destroy
                  if(laporanTableBodyAdmin) laporanTableBodyAdmin.innerHTML = '';
             }
            loadAndDisplayLaporan();
        });
    }
    if (resetFilterButtonAdmin) {
        resetFilterButtonAdmin.addEventListener('click', () => {
             if ($.fn.DataTable && $.fn.DataTable.isDataTable('#dataTableLaporan')) {
                  $('#dataTableLaporan').DataTable().destroy();
                  if(laporanTableBodyAdmin) laporanTableBodyAdmin.innerHTML = '';
             }
            if(filterTanggalMulaiAdmin) filterTanggalMulaiAdmin.value = '';
            if(filterTanggalAkhirAdmin) filterTanggalAkhirAdmin.value = '';
            loadAndDisplayLaporan();
        });
    }

    loadAndDisplayLaporan(); // Muat data awal
});