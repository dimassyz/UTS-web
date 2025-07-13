document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    const loginLoading = document.getElementById('loginLoading');
    const loginErrorMessage = document.getElementById('loginErrorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmLogoutButton = document.getElementById('confirmLogoutButton');
    const adminNameDisplay = document.getElementById('adminNameDisplay');
    const API_ADMIN_URL = '../api/';

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
                try {
                    responseText = await responseClone.text();
                } catch (e) {}
                throw new Error(`Format respons tidak valid (Status: ${response.status}). ${responseText.substring(0,150)}...`);
            }
        } catch (networkError) {
            throw new Error(`Tidak dapat terhubung ke server: ${networkError.message}`);
        }
    }

    function showLoginError(message) {
        if (loginErrorMessage) {
            loginErrorMessage.textContent = message;
            loginErrorMessage.style.display = 'block';
        }
    }

    function hideLoginError() {
        if (loginErrorMessage) {
            loginErrorMessage.style.display = 'none';
        }
    }

    function setLoginButtonLoading(isLoading) {
        if (loginButton) {
            loginButton.disabled = isLoading;
            loginButton.innerHTML = isLoading ? `<span class="spinner-border spinner-border-sm"></span> Loading...` : 'Login';
        }
        if (loginLoading) {
            loginLoading.style.display = isLoading ? 'block' : 'none';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            hideLoginError();
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            if (!username || !password) {
                showLoginError('Username dan password wajib diisi.');
                return;
            }
            setLoginButtonLoading(true);
            try {
                const apiUrl = `${API_ADMIN_URL}login_process.php`;
                const { ok, status, result } = await fetchAndParse(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ username: username, password: password })
                });

                if (!ok || !result.success) {
                    throw new Error(result.message || `Error (Status: ${status})`);
                }
                
                if (result.user_info) {
                    sessionStorage.setItem('userInfo', JSON.stringify(result.user_info));
                }

                if (result.role === 'admin') {
                    window.location.href = 'index.html';
                } else if (result.role === 'kasir') {
                    window.location.href = '../kasir/index.php';
                } else {
                    throw new Error('Peran pengguna tidak dikenali.');
                }
            } catch (error) {
                showLoginError(error.message);
                setLoginButtonLoading(false);
            }
        });
    }

    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (userInfo && adminNameDisplay) {
        adminNameDisplay.textContent = userInfo.nama_lengkap || userInfo.username;
    }

    if (confirmLogoutButton) {
        confirmLogoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const originalText = confirmLogoutButton.textContent;
            confirmLogoutButton.disabled = true;
            confirmLogoutButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Logout...`;
            try {
                const {ok, result} = await fetchAndParse(`${API_ADMIN_URL}logout_process.php`, {method:'POST'});
                sessionStorage.removeItem('userInfo');
                if(ok && result.success) {
                    window.location.href = 'login.html';
                } else {
                    throw new Error(result.message || 'Gagal logout');
                }
            } catch(err) {
                alert('Gagal logout: ' + err.message);
                sessionStorage.removeItem('userInfo');
                window.location.href = 'login.html';
                confirmLogoutButton.disabled = false;
                confirmLogoutButton.innerHTML = originalText;
            }
        });
    }
});