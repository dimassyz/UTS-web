document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('laporanTableBodyAdmin');
    const loadingDiv = document.getElementById('loadingLaporan');
    const tableContainer = document.getElementById('tableLaporanContainerAdmin');
    const noDataMessage = document.getElementById('noLaporanMessageAdmin');
    const filterForm = document.getElementById('filterLaporanFormAdmin');
    const startDateInput = document.getElementById('filterTanggalMulaiAdmin');
    const endDateInput = document.getElementById('filterTanggalAkhirAdmin');
    const resetBtn = document.getElementById('resetFilterButtonAdmin');
    const API_URL = '../api/get_report_data.php';

    async function fetchAndParse(url, options = {}) { let response; try { response = await fetch(url, options); const responseClone = response.clone(); try { const result = await response.json(); return { ok: response.ok, result }; } catch (e) { const text = await responseClone.text(); throw new Error(`Format respons tidak valid. Server: ${text.substring(0,150)}...`); } } catch (e) { throw new Error(`Tidak dapat terhubung ke server: ${e.message}`); } }
    function formatRupiah(angka) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0); }
    function formatWaktu(dateTimeString) { if (!dateTimeString) return '-'; try { const date = new Date(dateTimeString); if (isNaN(date.getTime())) return dateTimeString; const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }; return date.toLocaleString('id-ID', options); } catch (e) { return dateTimeString; } }

    function displayData(transactions) {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        if (noDataMessage) noDataMessage.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'none';
        if (!transactions || transactions.length === 0) { if (noDataMessage) noDataMessage.style.display = 'block'; return; }
        if (tableContainer) tableContainer.style.display = '';

        transactions.forEach((trx, index) => {
            let itemsHtml = '<ul class="list-unstyled mb-0 small">';
            if(trx.items && trx.items.length > 0) { trx.items.forEach(item => { itemsHtml += `<li>${item.nama_produk || 'N/A'} x ${item.jumlah}</li>`; }); }
            else { itemsHtml += '<li>-</li>'; }
            itemsHtml += '</ul>';

            const row = tableBody.insertRow();
            row.innerHTML = `
                <td class="text-center align-middle">${trx.id}</td>
                <td class="align-middle text-nowrap">${formatWaktu(trx.waktu)}</td>
                <td class="align-middle">${trx.nama_pemesan || '-'}</td>
                <td class="align-middle">${trx.tipe_pesanan || '-'}</td>
                <td class="align-middle">${trx.nama_kasir || '-'}</td>
                <td class="align-middle">${itemsHtml}</td>
                <td class="text-right align-middle font-weight-bold">${formatRupiah(trx.total_harga)}</td>
                <td class="text-center align-middle">
                    <button class="btn btn-sm btn-info" title="Cetak Struk" disabled><i class="fas fa-print fa-fw"></i></button>
                </td>
            `;
        });
    }

    async function loadData() {
        if(tableBody) tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted"><div class="spinner-border spinner-border-sm"></div> Memuat...</td></tr>';
        if (noDataMessage) noDataMessage.style.display = 'none';

        const params = new URLSearchParams();
        if (startDateInput && startDateInput.value) params.append('start_date', startDateInput.value);
        if (endDateInput && endDateInput.value) params.append('end_date', endDateInput.value);
        const queryString = params.toString();
        const apiUrl = `${API_URL}${queryString ? '?' + queryString : ''}`;

        try {
            const { ok, result } = await fetchAndParse(apiUrl);
            if (!ok || !result.success) throw new Error(result.message || 'Gagal memuat laporan.');
            displayData(result.data || []);
        } catch (error) {
            if(tableBody) tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Gagal memuat: ${error.message}</td></tr>`;
        }
    }
    
    if(filterForm) { filterForm.addEventListener('submit', (e) => { e.preventDefault(); loadData(); }); }
    if (resetBtn) { resetBtn.addEventListener('click', () => { if(startDateInput) startDateInput.value = ''; if(endDateInput) endDateInput.value = ''; loadData(); }); }
    loadData();
});