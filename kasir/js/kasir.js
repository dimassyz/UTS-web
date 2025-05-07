document.addEventListener('DOMContentLoaded', () => {
    const categoryTabsContainer = document.getElementById('categoryTabs');
    const menuTabContentContainer = document.getElementById('menuTabContent');
    const searchInput = document.getElementById('searchInput');
    const confirmButton = document.getElementById('confirmButton');
    const cartSummaryEl = document.getElementById('cartSummary');
    const totalItemsDisplay = document.getElementById('totalItemsDisplay');
    const totalPriceDisplay = document.getElementById('totalPriceDisplay');
    const loadingIndicatorGlobal = document.getElementById('loadingIndicatorGlobal');
    const errorMessageGlobal = document.getElementById('errorMessageGlobal');
    const successPopup = document.getElementById('successPopup');
    const atasNamaInput = document.getElementById('atasNama');
    const tipePesananSelect = document.getElementById('tipePesanan');
    const kasirInfoSpan = document.getElementById('kasirInfo');

    let allProducts = [];
    let allCategories = [];
    let cart = {};
    let currentActiveCategoryId = null;
    let popupTimeout;

    const kategori = [
        { id: 'all', nama_kategori: 'Semua Menu' },
        { id: 'makanan_berat', nama_kategori: 'Makanan Berat' },
        { id: 'makanan_ringan', nama_kategori: 'Cemilan' },
        { id: 'minuman_dingin', nama_kategori: 'Minuman Dingin' },
        { id: 'minuman_panas', nama_kategori: 'Minuman Panas' },
        { id: 'dessert', nama_kategori: 'Penutup' },
    ];

    const produk = [
        { id: 'prod001', nama: 'Nasi Goreng Spesial Nusantara', stok: 20, harga: 28000, gambar_url: '../assets/img/nasreng.jpg', category_id: 'makanan_berat', deskripsi: 'Nasi goreng dengan bumbu rempah khas, udang, ayam, dan telur.' },
        { id: 'prod002', nama: 'Soto Ayam Lamongan Kuah Bening', stok: 15, harga: 22000, gambar_url: '../assets/img/soto.png', category_id: 'makanan_berat', deskripsi: 'Soto ayam dengan kuah kaldu bening, suwiran ayam, soun, dan telur rebus.' },
        { id: 'prod003', nama: 'Gado-Gado Siram Bumbu Kacang', stok: 25, harga: 20000, gambar_url: '../assets/img/gado.png', category_id: 'makanan_ringan', deskripsi: 'Sayuran segar direbus disiram bumbu kacang mede yang gurih.' },
        { id: 'prod004', nama: 'Sate Ayam Madura (10 Tusuk)', stok: 30, harga: 30000, gambar_url: '../assets/img/sate.png', category_id: 'makanan_berat', deskripsi: 'Sate ayam dengan bumbu kacang khas Madura, disajikan dengan lontong atau nasi.' },
        { id: 'prod005', nama: 'Es Teh Manis Jumbo', stok: 50, harga: 8000, gambar_url: '../assets/img/esteh.png', category_id: 'minuman_dingin', deskripsi: 'Es teh manis dengan ukuran jumbo yang menyegarkan.' },
        { id: 'prod006', nama: 'Kopi Hitam Tubruk', stok: 0, harga: 10000, gambar_url: '../assets/img/kopi.png', category_id: 'minuman_panas', deskripsi: 'Kopi hitam tubruk tradisional dengan aroma kuat.' },
        { id: 'prod007', nama: 'Pisang Goreng Crispy (Isi 5)', stok: 18, harga: 15000, gambar_url: '../assets/img/pisreng.png', category_id: 'makanan_ringan', deskripsi: 'Pisang goreng renyah dengan taburan keju dan coklat.' },
        { id: 'prod008', nama: 'Es Cendol Durian', stok: 12, harga: 25000, gambar_url: '../assets/img/cendol.png', category_id: 'dessert', deskripsi: 'Es cendol dengan tambahan daging durian asli dan santan gurih.' },
    ];

    function formatRupiah(angka) { if (angka === null || angka === undefined || isNaN(parseFloat(angka))) return 'Rp 0'; var number_string = Math.round(parseFloat(angka)).toString(), sisa = number_string.length % 3, rupiah = number_string.substr(0, sisa), ribuan = number_string.substr(sisa).match(/\d{3}/g); if (ribuan) { let separator = sisa ? '.' : ''; rupiah += separator + ribuan.join('.'); } return 'Rp ' + (rupiah || '0'); }
    function showSuccessPopup(message = 'Transaksi Berhasil!', duration = 3000) { if (successPopup) { const msgEl = successPopup.querySelector('span') || successPopup; if (msgEl) msgEl.textContent = message; successPopup.style.display = 'block'; clearTimeout(popupTimeout); popupTimeout = setTimeout(() => { successPopup.style.display = 'none'; }, duration); } else { alert(message); } }
    function displayGlobalError(message) { if (errorMessageGlobal) { errorMessageGlobal.textContent = message; errorMessageGlobal.style.display = 'block'; if (menuTabContentContainer) menuTabContentContainer.innerHTML = ''; if (loadingIndicatorGlobal) loadingIndicatorGlobal.style.display = 'none'; } else { alert(message); } }
    function setConfirmButtonLoading(isLoading) { if (!confirmButton) return; if (isLoading) { confirmButton.disabled = true; confirmButton.innerHTML = `<span class="spinner-border spinner-border-sm mr-2"></span>Memproses...`; } else { confirmButton.disabled = (Object.keys(cart).length === 0); confirmButton.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Bayar'; } }

    function renderCategoryTabs(categoriesData) {
        if (!categoryTabsContainer || !menuTabContentContainer) { return; }
        categoryTabsContainer.innerHTML = '';
        menuTabContentContainer.innerHTML = '';

        categoriesData.forEach((category, index) => {
            const tabButton = document.createElement('a');
            tabButton.className = `nav-link ${index === 0 ? 'active' : ''}`;
            tabButton.id = `category-tab-${category.id}`;
            tabButton.href = `#menu-content-category-${category.id}`;
            tabButton.setAttribute('data-toggle', 'pill');
            tabButton.setAttribute('role', 'tab');
            tabButton.setAttribute('aria-controls', `menu-content-category-${category.id}`);
            tabButton.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            tabButton.textContent = category.nama_kategori;

            tabButton.addEventListener('click', function(e) {
                e.preventDefault();
                const targetPaneId = this.getAttribute('href').substring(1);
                const newCategoryId = targetPaneId.replace('menu-content-category-', '');
                currentActiveCategoryId = newCategoryId;
                filterAndDisplayProducts();
                if (typeof $ !== 'undefined' && $.fn.tab) {
                    $(this).tab('show');
                } else {
                    document.querySelectorAll('#categoryTabs .nav-link.active').forEach(l => l.classList.remove('active'));
                    document.querySelectorAll('#menuTabContent .tab-pane.active').forEach(p => { p.classList.remove('active', 'show'); });
                    this.classList.add('active');
                    const targetPane = document.getElementById(targetPaneId);
                    if (targetPane) { targetPane.classList.add('active', 'show');}
                }
            });
            categoryTabsContainer.appendChild(tabButton);

            const tabPane = document.createElement('div');
            tabPane.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
            tabPane.id = `menu-content-category-${category.id}`;
            tabPane.setAttribute('role', 'tabpanel');
            tabPane.setAttribute('aria-labelledby', `category-tab-${category.id}`);
            const menuItemsGrid = document.createElement('div');
            menuItemsGrid.className = 'row gx-3 gy-3 menu-items-grid';
            tabPane.appendChild(menuItemsGrid);
            menuTabContentContainer.appendChild(tabPane);
        });
        if (categoriesData.length > 0) {
            currentActiveCategoryId = categoriesData[0].id;
        }
    }

    function displayProducts(productsData) {
        const targetPaneId = `menu-content-category-${currentActiveCategoryId}`;
        const activeTabPane = document.getElementById(targetPaneId);

        if (!activeTabPane) {
             if(menuTabContentContainer) menuTabContentContainer.innerHTML = `<p class="col-12 text-center text-danger">Error: Konten untuk kategori ID '${currentActiveCategoryId}' tidak ditemukan.</p>`;
            return;
        }

        const menuContainerInTab = activeTabPane.querySelector('.menu-items-grid');
        if (!menuContainerInTab) { activeTabPane.innerHTML = `<p class="col-12 text-center text-danger">Error: Struktur grid produk tidak ditemukan.</p>`; return; }
        menuContainerInTab.innerHTML = '';

        const searchActive = searchInput ? searchInput.value.trim() !== '' : false;
        const existingNoResultMessage = activeTabPane.querySelector('.no-products-message');
        if (existingNoResultMessage) existingNoResultMessage.remove();

        if (!productsData || productsData.length === 0) {
            let message = 'Belum ada menu di kategori ini.';
            if (searchActive) message = 'Menu yang cocok tidak ditemukan di kategori ini.';
            menuContainerInTab.innerHTML = `<p class="col-12 text-center text-muted no-products-message">${message}</p>`;
            return;
        }

        productsData.forEach(product => {
            if (!product || typeof product.id === 'undefined' || typeof product.nama === 'undefined' || typeof product.stok === 'undefined' || typeof product.harga === 'undefined') { return; }
            const productId = product.id; const currentQuantity = cart[productId] || 0;
            const imageUrl = product.gambar_url || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=N/A';
            const stok = product.stok; const cardCol = document.createElement('div');
            cardCol.className = 'col-sm-6 col-md-4 col-lg-2 mb-4 product-item-col';
            let stokColorClass = 'text-muted';
            if (stok <= 5 && stok > 0) { stokColorClass = 'text-warning font-weight-bold'; }
            else if (stok <= 0) { stokColorClass = 'text-danger font-weight-bold'; }

            cardCol.innerHTML = `
            <div class="card product-card h-100 shadow-sm ${stok <= 0 ? 'bg-light' : ''}">

                <div class="product-image-aspect-wrapper">
                    <img src="${imageUrl}" class="product-image-responsive ${stok <= 0 ? 'opacity-50' : ''}" alt="${product.nama}">
                </div>
              
                <div class="card-body p-3 d-flex flex-column">
                    <h5 class="card-title product-name">${product.nama}</h5>
                    <p class="card-text mb- product-stock ${stokColorClass}">Stok: <span class="stock-display">${stok}</span></p>
                    <p class="card-text font-weight-bold mb-3 product-price">${formatRupiah(product.harga)}</p>
                    <div class="quantity-controls mt-auto d-flex justify-content-center align-items-center">
                        ${currentQuantity > 0 ? `<button class="btn btn-outline-danger btn-sm decrement-btn" data-id="${productId}"><i class="fas fa-minus fa-xs"></i></button><span class="quantity-display mx-2" id="qty-${productId}">${currentQuantity}</span>` : ''}
                        <button class="btn btn-primary btn-sm increment-btn ${currentQuantity === 0 ? 'w-100' : ''}" data-id="${productId}" ${stok <= 0 || currentQuantity >= stok ? 'disabled' : ''}>
                            <i class="fas fa-plus fa-xs"></i>${currentQuantity === 0 ? '<span class="btn-add-text">Tambah</span>' : ''}
                        </button>
                    </div>
                </div>
            </div>
        `;
        menuContainerInTab.appendChild(cardCol);
        });
        updateQuantitiesOnDisplay();
    }

    function loadProductsAndCategories() {
        if (loadingIndicatorGlobal) loadingIndicatorGlobal.style.display = 'block';
        if (errorMessageGlobal) errorMessageGlobal.style.display = 'none';
        if (menuTabContentContainer) menuTabContentContainer.innerHTML = '';

        setTimeout(() => {
            try {
                allCategories = kategori;
                if (allCategories.length > 0) {
                    renderCategoryTabs(allCategories);
                } else {
                    if (categoryTabsContainer) categoryTabsContainer.innerHTML = '<p class="text-muted">Belum ada kategori.</p>';
                }
                allProducts = produk;
                if (currentActiveCategoryId) { 
                    filterAndDisplayProducts();
                } else if (allCategories.length > 0) {
                    currentActiveCategoryId = allCategories[0].id;
                    filterAndDisplayProducts();
                }

            } catch (error) {
                displayGlobalError(`Terjadi kesalahan internal: ${error.message}.`);
            } finally {
                if (loadingIndicatorGlobal) loadingIndicatorGlobal.style.display = 'none';
                updateCartSummary();
            }
        }, 100);
    }

    function updateCartSummary() {
        if (!cartSummaryEl || !confirmButton || !totalItemsDisplay || !totalPriceDisplay) { return; }
        let totalItems = 0; let totalPrice = 0.0;
        const cartIsEmpty = Object.keys(cart).length === 0;
        if (!cartIsEmpty) {
            let summaryHtml = '<ul class="list-unstyled mb-0">';
            for (const productId in cart) {
                const quantity = cart[productId]; const product = allProducts.find(p => p && p.id == productId);
                if (product && typeof product.harga !== 'undefined' && typeof quantity !== 'undefined') {
                    const itemPrice = parseFloat(product.harga); const itemQuantity = parseInt(quantity);
                    if (!isNaN(itemPrice) && !isNaN(itemQuantity) && itemQuantity > 0) {
                        totalItems += itemQuantity; totalPrice += itemPrice * itemQuantity;
                        summaryHtml += `<li class="d-flex justify-content-between small"><span>${product.nama} x ${itemQuantity}</span><span class="text-nowrap">${formatRupiah(itemPrice * itemQuantity)}</span></li>`;
                    } else { delete cart[productId]; }
                } else { delete cart[productId]; }
            }
            summaryHtml += '</ul>'; cartSummaryEl.innerHTML = summaryHtml; cartSummaryEl.classList.remove('d-none');
        } else { cartSummaryEl.innerHTML = ''; cartSummaryEl.classList.add('d-none'); }
        totalItemsDisplay.textContent = `Total Item: ${totalItems}`;
        totalPriceDisplay.textContent = `Total: ${formatRupiah(totalPrice)}`;
        confirmButton.disabled = cartIsEmpty;
    }

    function handleQuantityChange(event) {
        const button = event.target.closest('.increment-btn, .decrement-btn'); if (!button) return;
        const menuContainerInTab = button.closest('.menu-items-grid'); if (!menuContainerInTab) return;
        const productId = button.dataset.id; if (!productId) return;
        const isIncrement = button.classList.contains('increment-btn');
        const product = allProducts.find(p => p && p.id == productId); if (!product) { return; }
        const stock = product.stok; let currentQuantity = cart[productId] || 0;
        if (isIncrement) { if (currentQuantity < stock) currentQuantity++; else { return;} }
        else { if (currentQuantity > 0) currentQuantity--; else return; }
        if (currentQuantity > 0) cart[productId] = currentQuantity; else delete cart[productId];
        updateQuantitiesOnDisplay(); updateCartSummary();
    }

    function updateQuantitiesOnDisplay() {
        const targetPaneId = `menu-content-category-${currentActiveCategoryId}`;
        const activeTabPane = document.getElementById(targetPaneId);
        if (!activeTabPane) return;
        const menuContainerInTab = activeTabPane.querySelector('.menu-items-grid');
        if (!menuContainerInTab) return;

        const productCards = menuContainerInTab.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const incrementBtn = card.querySelector('.increment-btn'); if (!incrementBtn || !incrementBtn.dataset.id) return;
            const productId = incrementBtn.dataset.id; const currentQuantity = cart[productId] || 0;
            const product = allProducts.find(p => p && p.id == productId); const stock = product ? product.stok : 0;
            const controlsContainer = card.querySelector('.quantity-controls');
            if (controlsContainer) {
                let existingDecrement = controlsContainer.querySelector('.decrement-btn'); let existingQty = controlsContainer.querySelector(`#qty-${productId}`);
                if (currentQuantity > 0) {
                    if (!existingDecrement) { const decBtn = document.createElement('button'); decBtn.className = 'btn btn-outline-danger btn-sm decrement-btn'; decBtn.dataset.id = productId; decBtn.innerHTML = '<i class="fas fa-minus fa-xs"></i>'; controlsContainer.insertBefore(decBtn, incrementBtn); existingDecrement = decBtn; }
                    if (!existingQty) { const qtySpan = document.createElement('span'); qtySpan.className = 'quantity-display mx-2'; qtySpan.id = `qty-${productId}`; controlsContainer.insertBefore(qtySpan, incrementBtn); existingQty = qtySpan; }
                    if (existingQty) existingQty.textContent = currentQuantity; if (existingDecrement) existingDecrement.disabled = false;
                    incrementBtn.classList.remove('w-100');
                    const plusText = incrementBtn.querySelector('.btn-add-text'); if (plusText) plusText.remove();
                } else {
                    if (existingDecrement) existingDecrement.remove(); if (existingQty) existingQty.remove();
                    incrementBtn.classList.add('w-100');
                    if (!incrementBtn.querySelector('.btn-add-text')) { const addText = document.createElement('span'); addText.className = 'btn-add-text'; addText.textContent = 'Tambah'; incrementBtn.appendChild(addText); }
                }
                incrementBtn.disabled = (currentQuantity >= stock || stock <= 0);
            }
            const stockDisplay = card.querySelector('.stock-display');
            if (stockDisplay && product) {
                stockDisplay.textContent = stock;
                const stockP = card.querySelector('.product-stock');
                if (stockP) {
                    stockP.classList.remove('text-muted', 'text-warning', 'text-danger', 'font-weight-bold');
                    if (stock <= 0) { stockP.classList.add('text-danger', 'font-weight-bold'); }
                    else if (stock <= 5) { stockP.classList.add('text-warning', 'font-weight-bold'); }
                    else { stockP.classList.add('text-muted'); }
                }
                const cardElement = card.closest('.product-card'); const imgElement = card.querySelector('.product-image-responsive');
                if (cardElement && imgElement) { if (stock <= 0) { cardElement.classList.add('bg-light'); imgElement.classList.add('opacity-50'); } else { cardElement.classList.remove('bg-light'); imgElement.classList.remove('opacity-50'); } }
            }
        });
    }

    function filterAndDisplayProducts() {
        if (!menuTabContentContainer && !document.getElementById(`menu-content-category-${currentActiveCategoryId}`)) { return; }
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let productsToDisplay = [...allProducts];

        if (currentActiveCategoryId && currentActiveCategoryId !== 'all') {
            productsToDisplay = productsToDisplay.filter(p => p && p.category_id === currentActiveCategoryId);
        }
        if (searchTerm) {
            productsToDisplay = productsToDisplay.filter(p => p && p.nama && p.nama.toLowerCase().includes(searchTerm));
        }
        displayProducts(productsToDisplay);
    }

    function handleConfirmOrder() {
        if (atasNamaInput && atasNamaInput.value.trim() === '') { alert('Harap masukkan "Atas Nama Pelanggan".'); atasNamaInput.focus(); return; }
        if (!confirmButton || Object.keys(cart).length === 0) { alert("Keranjang kosong!"); return; }
        setConfirmButtonLoading(true);
        console.log("Pesanan Dikonfirmasi (Frontend Simulation):");
        console.log("Atas Nama:", atasNamaInput ? atasNamaInput.value.trim() : 'N/A');
        console.log("Tipe Pesanan:", tipePesananSelect ? tipePesananSelect.value : 'N/A');
        console.log("Isi Keranjang:", JSON.stringify(cart));
        for (const productId in cart) {
            const product = allProducts.find(p => p.id === productId);
            if (product) { product.stok -= cart[productId]; if (product.stok < 0) product.stok = 0; }
        }
        setTimeout(() => {
            showSuccessPopup('Pesanan berhasil diproses (Simulasi)!');
            cart = {}; if (atasNamaInput) atasNamaInput.value = '';
            filterAndDisplayProducts(); updateCartSummary(); setConfirmButtonLoading(false);
        }, 1000);
    }

    if (menuTabContentContainer) { menuTabContentContainer.addEventListener('click', handleQuantityChange); }
    if (searchInput) { let searchTimeout; searchInput.addEventListener('input', () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(filterAndDisplayProducts, 300); }); }
    if (confirmButton) confirmButton.addEventListener('click', handleConfirmOrder);
    if (kasirInfoSpan) kasirInfoSpan.textContent = "Kasir Tes";

    loadProductsAndCategories();
});