document.addEventListener('DOMContentLoaded', function() {
    const adminNameDisplay = document.getElementById('adminNameDisplay');
    const pendapatanEl = document.getElementById('pendapatanHariIni');
    const transaksiEl = document.getElementById('transaksiHariIni');
    const menuTerjualEl = document.getElementById('menuTerjualHariIni');
    const stokKritisEl = document.getElementById('stokKritis');
    const areaChartCanvas = document.getElementById("myAreaChart");
    const topProductsContainer = document.querySelector('.col-lg-5 .card-body');
    
    async function fetchAndParse(url, options = {}) { let response; try { response = await fetch(url, options); const responseClone = response.clone(); try { const result = await response.json(); return { ok: response.ok, result }; } catch (e) { const text = await responseClone.text(); throw new Error(`Format respons tidak valid. Server: ${text.substring(0,150)}...`); } } catch (e) { throw new Error(`Tidak dapat terhubung ke server: ${e.message}`); } }
    function formatRupiah(number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0); }
    
    function showLoading() {
        if(pendapatanEl) pendapatanEl.textContent = '...';
        if(transaksiEl) transaksiEl.textContent = '...';
        if(menuTerjualEl) menuTerjualEl.textContent = '...';
        if(stokKritisEl) stokKritisEl.textContent = '...';
    }

    async function loadDashboardData() {
        showLoading();
        try {
            const { ok, result } = await fetchAndParse('../api/get_dashboard_data.php');
            if (!ok || !result.success) throw new Error(result.message || 'Gagal memuat data.');

            const data = result.data;
            if (pendapatanEl) pendapatanEl.textContent = formatRupiah(data.summary.total_pendapatan_hari_ini);
            if (transaksiEl) transaksiEl.textContent = data.summary.total_transaksi_hari_ini;
            if (menuTerjualEl) menuTerjualEl.textContent = `${data.summary.menu_terjual_hari_ini} Pcs`;
            if (stokKritisEl) stokKritisEl.textContent = `${data.summary.stok_kritis} Produk`;

            renderTopProducts(data.top_products_today);
            renderAreaChart(data.weekly_revenue);
        } catch (error) {
            console.error("Error loading dashboard:", error);
            if(pendapatanEl) pendapatanEl.textContent = 'Error';
            if(transaksiEl) transaksiEl.textContent = 'Error';
        }
    }
    
    function renderAreaChart(weeklyData) {
        if (!areaChartCanvas) return;
        Chart.defaults.global.defaultFontFamily = 'Nunito, sans-serif'; Chart.defaults.global.defaultFontColor = '#858796';
        const labels = []; const dataValues = [];
        const date = new Date();
        date.setDate(date.getDate() - 6);
        for (let i = 0; i < 7; i++) {
            const currentDateStr = date.toISOString().split('T')[0];
            labels.push(new Date(currentDateStr).toLocaleDateString('id-ID', {weekday: 'short'}));
            const dayData = weeklyData.find(d => d.tanggal === currentDateStr);
            dataValues.push(dayData ? parseFloat(dayData.total) : 0);
            date.setDate(date.getDate() + 1);
        }
        
        new Chart(areaChartCanvas, {
            type: 'line', data: { labels: labels, datasets: [{ label: "Pendapatan", lineTension: 0.3, backgroundColor: "rgba(78, 115, 223, 0.05)", borderColor: "rgba(78, 115, 223, 1)", pointRadius: 3, pointBackgroundColor: "rgba(78, 115, 223, 1)", pointBorderColor: "rgba(78, 115, 223, 1)", data: dataValues, }], },
            options: { maintainAspectRatio: false, scales: { xAxes: [{ gridLines: { display: false, drawBorder: false }, ticks: { maxTicksLimit: 7 } }], yAxes: [{ ticks: { maxTicksLimit: 5, padding: 10, callback: function(value) { return formatRupiah(value); } }, gridLines: { color: "rgb(234, 236, 244)", zeroLineColor: "rgb(234, 236, 244)", drawBorder: false, borderDash: [2], zeroLineBorderDash: [2] } }], }, legend: { display: false }, tooltips: { mode: 'index', intersect: false, callbacks: { label: function(tooltipItem, chart) { return chart.datasets[tooltipItem.datasetIndex].label + ': ' + formatRupiah(tooltipItem.yLabel); } } } }
        });
    }

    function renderTopProducts(topProducts) {
        if (!topProductsContainer) return;
        topProductsContainer.innerHTML = '';
        if (!topProducts || topProducts.length === 0) {
            topProductsContainer.innerHTML = '<p class="text-center text-muted small mt-4">Tidak ada produk terlaris hari ini.</p>';
            return;
        }

        const maxSold = Math.max(...topProducts.map(item => parseInt(item.jumlah_terjual, 10)), 0);
        const colors = ['bg-danger', 'bg-warning', 'bg-info'];

        topProducts.forEach((item, index) => {
            const percentage = maxSold > 0 ? ((parseInt(item.jumlah_terjual, 10) / maxSold) * 100).toFixed(0) : 0;
            const progressHtml = `
                <h4 class="small font-weight-bold">${item.nama_produk} <span class="float-right">${item.jumlah_terjual} Pcs</span></h4>
                <div class="progress mb-4">
                    <div class="progress-bar ${colors[index % colors.length]}" role="progressbar" style="width: ${percentage}%" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>`;
            topProductsContainer.innerHTML += progressHtml;
        });
    }

    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (userInfo && adminNameDisplay) {
        adminNameDisplay.textContent = userInfo.nama_lengkap || userInfo.username;
    }

    loadDashboardData();
});