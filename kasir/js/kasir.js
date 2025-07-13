document.addEventListener('DOMContentLoaded', function() {
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
    const logoutButtonKasir = document.getElementById('logoutButtonKasir');
    let allProducts = [];
    let allCategories = [];
    let cart = {};
    let currentActiveCategoryId = null;
    let popupTimeout;
    const API_BASE_URL = '../api/';

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

    function formatRupiah(angka) {
        if (angka === null || isNaN(parseFloat(angka))) return 'Rp 0';
        var s = Math.round(parseFloat(angka)).toString(), p = s.length % 3, r = s.substr(0, p), t = s.substr(p).match(/\d{3}/g);
        if (t) { r += (p ? '.' : '') + t.join('.'); }
        return 'Rp ' + (r || '0');
    }

    function showSuccessPopup(message = 'Aksi Berhasil!', duration = 3000) {
        if (successPopup) {
            const msgEl = successPopup.querySelector('span') || successPopup;
            if (msgEl) msgEl.textContent = message;
            successPopup.style.display = 'block';
            clearTimeout(popupTimeout);
            popupTimeout = setTimeout(() => { successPopup.style.display = 'none'; }, duration);
        } else {
            alert(message);
        }
    }

    function displayGlobalError(message) {
        if (errorMessageGlobal) {
            errorMessageGlobal.textContent = message;
            errorMessageGlobal.style.display = 'block';
            if (menuTabContentContainer) menuTabContentContainer.innerHTML = '';
            if (loadingIndicatorGlobal) loadingIndicatorGlobal.style.display = 'none';
        } else {
            alert(message);
        }
    }

    function setConfirmButtonLoading(isLoading) {
        if (!confirmButton) return;
        if (isLoading) {
            confirmButton.disabled = true;
            confirmButton.innerHTML = `<span class="spinner-border spinner-border-sm mr-2"></span>Memproses...`;
        } else {
            confirmButton.disabled = (Object.keys(cart).length === 0);
            confirmButton.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Bayar';
        }
    }

    function renderCategoryTabs(categoriesData) {
        if (!categoryTabsContainer || !menuTabContentContainer) return;
        categoryTabsContainer.innerHTML = '';
        menuTabContentContainer.innerHTML = '';
        categoriesData.forEach((category, index) => {
            const tabButton = document.createElement('a');
            tabButton.className = `nav-link ${index === 0 ? 'active' : ''}`;
            tabButton.id = `category-tab-${category.id}`;
            tabButton.href = `#menu-content-category-${category.id}`;
            tabButton.setAttribute('data-toggle', 'pill');
            tabButton.setAttribute('role', 'tab');
            tabButton.textContent = category.nama_kategori;
            tabButton.addEventListener('click', function(e) {
                e.preventDefault();
                const targetPaneId = this.getAttribute('href').substring(1);
                currentActiveCategoryId = targetPaneId.replace('menu-content-category-', '');
                filterAndDisplayProducts();
                if (typeof $ !== 'undefined' && $.fn.tab) {
                    $(this).tab('show');
                }
            });
            categoryTabsContainer.appendChild(tabButton);
            const tabPane = document.createElement('div');
            tabPane.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
            tabPane.id = `menu-content-category-${category.id}`;
            tabPane.setAttribute('role', 'tabpanel');
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
            if(menuTabContentContainer) menuTabContentContainer.innerHTML = `<p class="col-12 text-center text-danger">Error: Konten untuk kategori tidak ditemukan.</p>`;
            return;
        }
        const menuContainerInTab = activeTabPane.querySelector('.menu-items-grid');
        if (!menuContainerInTab) return;
        menuContainerInTab.innerHTML = '';
        const searchActive = searchInput ? searchInput.value.trim() !== '' : false;
        if (!productsData || productsData.length === 0) {
            let message = 'Belum ada menu di kategori ini.';
            if (searchActive) message = 'Menu yang cocok tidak ditemukan.';
            menuContainerInTab.innerHTML = `<p class="col-12 text-center text-muted p-5">${message}</p>`;
            return;
        }
        productsData.forEach(product => {
            if (!product || typeof product.id === 'undefined') return;
            const productId = product.id;
            const currentQuantity = cart[productId] || 0;
            const imageUrl = product.gambar_url || 'https://via.placeholder.com/150';
            const stok = product.stok;
            const cardCol = document.createElement('div');
            cardCol.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
            let stokColorClass = 'text-muted';
            if (stok <= 5 && stok > 0) {
                stokColorClass = 'text-warning font-weight-bold';
            } else if (stok <= 0) {
                stokColorClass = 'text-danger font-weight-bold';
            }
            cardCol.innerHTML = `
                <div class="card product-card h-100 shadow-sm ${stok <= 0 ? 'bg-light' : ''}">
                    <img src="${imageUrl}" class="card-img-top product-image-responsive ${stok <= 0 ? 'opacity-50' : ''}" alt="${product.nama}">
                    <div class="card-body p-3 d-flex flex-column">
                        <h5 class="card-title product-name">${product.nama}</h5>
                        <p class="card-text mb-1 product-stock ${stokColorClass}">Stok: <span class="stock-display">${stok}</span></p>
                        <p class="card-text font-weight-bold mb-3 product-price">${formatRupiah(product.harga)}</p>
                        <div class="quantity-controls mt-auto d-flex justify-content-center align-items-center">
                            ${currentQuantity > 0 ? `<button class="btn btn-outline-danger btn-sm decrement-btn" data-id="${productId}"><i class="fas fa-minus fa-xs"></i></button><span class="quantity-display mx-2" id="qty-${productId}">${currentQuantity}</span>` : ''}
                            <button class="btn btn-primary btn-sm increment-btn ${currentQuantity === 0 ? 'w-100' : ''}" data-id="${productId}" ${stok <= 0 || currentQuantity >= stok ? 'disabled' : ''}>
                                <i class="fas fa-plus fa-xs"></i>${currentQuantity === 0 ? '<span class="btn-add-text">Tambah</span>' : ''}
                            </button>
                        </div>
                    </div>
                </div>`;
            menuContainerInTab.appendChild(cardCol);
        });
        updateQuantitiesOnDisplay();
    }

    async function loadData() {
        if (loadingIndicatorGlobal) loadingIndicatorGlobal.style.display = 'block';
        if (errorMessageGlobal) errorMessageGlobal.style.display = 'none';
        if (menuTabContentContainer) menuTabContentContainer.style.display = 'none';
        try {
            const [categoriesRes, productsRes] = await Promise.all([
                fetchAndParse(`${API_BASE_URL}get_categories.php`),
                fetchAndParse(`${API_BASE_URL}get_products.php`)
            ]);
            if (!categoriesRes.ok || !categoriesRes.result.success) throw new Error(categoriesRes.result.message || 'Gagal memuat kategori.');
            if (!productsRes.ok || !productsRes.result.success) throw new Error(productsRes.result.message || 'Gagal memuat produk.');
            allCategories = categoriesRes.result.data || [];
            allProducts = productsRes.result.data || [];
            renderCategoryTabs(allCategories);
            if (currentActiveCategoryId) {
                filterAndDisplayProducts();
            }
        } catch (error) {
            displayGlobalError(`Terjadi kesalahan saat memuat data: ${error.message}`);
        } finally {
            if (loadingIndicatorGlobal) loadingIndicatorGlobal.style.display = 'none';
            if (menuTabContentContainer) menuTabContentContainer.style.display = 'block';
            updateCartSummary();
        }
    }

    function updateCartSummary() {
        if (!cartSummaryEl || !confirmButton || !totalItemsDisplay || !totalPriceDisplay) return;
        let totalItems = 0; let totalPrice = 0.0;
        const cartIsEmpty = Object.keys(cart).length === 0;
        if (!cartIsEmpty) {
            let summaryHtml = '<ul class="list-unstyled mb-0">';
            for (const productId in cart) {
                const quantity = cart[productId]; const product = allProducts.find(p => p && p.id == productId);
                if (product) {
                    totalItems += quantity; totalPrice += product.harga * quantity;
                    summaryHtml += `<li class="d-flex justify-content-between small"><span>${product.nama} x ${quantity}</span><span class="text-nowrap">${formatRupiah(product.harga * quantity)}</span></li>`;
                } else { delete cart[productId]; }
            }
            summaryHtml += '</ul>'; cartSummaryEl.innerHTML = summaryHtml;
            cartSummaryEl.classList.remove('d-none');
        } else {
            cartSummaryEl.innerHTML = '';
            cartSummaryEl.classList.add('d-none');
        }
        totalItemsDisplay.textContent = `Total Item: ${totalItems}`;
        totalPriceDisplay.textContent = `Total: ${formatRupiah(totalPrice)}`;
        confirmButton.disabled = cartIsEmpty;
    }

    function handleQuantityChange(event) {
        const button = event.target.closest('.increment-btn, .decrement-btn'); if (!button) return;
        const productId = button.dataset.id; if (!productId) return;
        const isIncrement = button.classList.contains('increment-btn');
        const product = allProducts.find(p => p && p.id == productId); if (!product) return;
        const stock = product.stok; let currentQuantity = cart[productId] || 0;
        if (isIncrement) { if (currentQuantity < stock) currentQuantity++; else return; } 
        else { if (currentQuantity > 0) currentQuantity--; else return; }
        if (currentQuantity > 0) cart[productId] = currentQuantity; else delete cart[productId];
        updateQuantitiesOnDisplay(); updateCartSummary();
    }

    function updateQuantitiesOnDisplay() {
        const activeTabPane = document.querySelector(`.tab-pane#menu-content-category-${currentActiveCategoryId}.active`);
        if (!activeTabPane) return;
        const productCards = activeTabPane.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const incrementBtn = card.querySelector('.increment-btn'); if (!incrementBtn || !incrementBtn.dataset.id) return;
            const productId = incrementBtn.dataset.id; const currentQuantity = cart[productId] || 0;
            const product = allProducts.find(p => p && p.id == productId); const stock = product ? product.stok : 0;
            const controlsContainer = card.querySelector('.quantity-controls');
            if (controlsContainer) {
                let existingDecrement = controlsContainer.querySelector('.decrement-btn');
                let existingQty = controlsContainer.querySelector(`#qty-${productId}`);
                if (currentQuantity > 0) {
                    if (!existingDecrement) { const decBtn = document.createElement('button'); decBtn.className = 'btn btn-outline-danger btn-sm decrement-btn'; decBtn.dataset.id = productId; decBtn.innerHTML = '<i class="fas fa-minus fa-xs"></i>'; controlsContainer.insertBefore(decBtn, incrementBtn); }
                    if (!existingQty) { const qtySpan = document.createElement('span'); qtySpan.className = 'quantity-display mx-2'; qtySpan.id = `qty-${productId}`; controlsContainer.insertBefore(qtySpan, incrementBtn); }
                    controlsContainer.querySelector(`#qty-${productId}`).textContent = currentQuantity;
                    if(controlsContainer.querySelector('.decrement-btn')) controlsContainer.querySelector('.decrement-btn').disabled = false;
                    incrementBtn.classList.remove('w-100');
                    const plusText = incrementBtn.querySelector('.btn-add-text'); if (plusText) plusText.remove();
                } else {
                    if (existingDecrement) existingDecrement.remove();
                    if (existingQty) existingQty.remove();
                    incrementBtn.classList.add('w-100');
                    if (!incrementBtn.querySelector('.btn-add-text')) { const addText = document.createElement('span'); addText.className = 'btn-add-text'; addText.textContent = 'Tambah'; incrementBtn.appendChild(addText); }
                }
                incrementBtn.disabled = (currentQuantity >= stock || stock <= 0);
            }
        });
    }

    function filterAndDisplayProducts() {
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

    async function handleConfirmOrder() {
        if (atasNamaInput && atasNamaInput.value.trim() === '') { alert('Harap masukkan "Atas Nama Pelanggan".'); atasNamaInput.focus(); return; }
        if (!confirmButton || Object.keys(cart).length === 0) { alert("Keranjang kosong!"); return; }
        setConfirmButtonLoading(true);
        try {
            const apiUrl = `${API_BASE_URL}process_transaction.php`;
            const payload = { cart: cart, atas_nama: atasNamaInput ? atasNamaInput.value.trim() : 'Pelanggan', tipe_pesanan: tipePesananSelect ? tipePesananSelect.value : 'dine-in' };
            const { ok, status, result } = await fetchAndParse(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) });
            if (!ok || !result.success) { throw new Error(result.message || `Gagal proses transaksi (Status: ${status})`); }
            showSuccessPopup(result.message || 'Transaksi Berhasil!');
            cart = {}; if (atasNamaInput) atasNamaInput.value = '';
            await loadData();
        } catch (error) { alert(`Gagal memproses transaksi:\n${error.message}`);
        } finally { setConfirmButtonLoading(false); }
    }

    if (menuTabContentContainer) { menuTabContentContainer.addEventListener('click', handleQuantityChange); }
    if (searchInput) { let searchTimeout; searchInput.addEventListener('input', () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(filterAndDisplayProducts, 300); }); }
    if (confirmButton) confirmButton.addEventListener('click', handleConfirmOrder);
    if (logoutButtonKasir) { logoutButtonKasir.addEventListener('click', async (e) => { e.preventDefault(); if(confirm('Yakin ingin logout?')) { try { const {ok,result} = await fetchAndParse(`${API_BASE_URL}logout_process.php`, {method:'POST'}); if(ok && result.success) window.location.href = '../admin/login.html'; else throw new Error(result.message || 'Gagal logout'); } catch(err) { alert(err.message); window.location.href = '../admin/login.html'; } } }); }
    
    loadData();
});