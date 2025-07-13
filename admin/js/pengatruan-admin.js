document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formPengaturan');
    const loadingDiv = document.getElementById('loadingPengaturan');
    const errorDiv = document.getElementById('errorPengaturan');
    const submitBtn = document.getElementById('submitPengaturan');
    const spinner = submitBtn.querySelector('.spinner-border');
    const successMsg = document.getElementById('saveSuccessMessage');
    const API_URL = '../api/crud_pengaturan.php';
    async function fetchAndParse(url, options = {}) { let response; try { response = await fetch(url, options); const responseClone = response.clone(); try { const result = await response.json(); return { ok: response.ok, status: response.status, result }; } catch (jsonError) { let responseText = ''; try { responseText = await responseClone.text(); } catch (e) {} throw new Error(`Format respons tidak valid (Status: ${response.status}). ${responseText.substring(0,150)}...`); } } catch (networkError) { throw new Error(`Tidak dapat terhubung ke server: ${networkError.message}`); } }
    function setButtonLoading(isLoading) { if(submitBtn && spinner) { submitBtn.disabled = isLoading; spinner.style.display = isLoading ? 'inline-block' : 'none'; } }
    function showError(message) { if(errorDiv) { errorDiv.textContent = message; errorDiv.style.display = 'block'; } }
    function hideError() { if(errorDiv) errorDiv.style.display = 'none'; }
    function showSaveSuccess() { if (successMsg) { successMsg.style.display = 'inline'; setTimeout(() => { successMsg.style.display = 'none'; }, 2500); } }
    async function loadSettings() {
        if(loadingDiv) loadingDiv.style.display = 'block'; if(form) form.style.display = 'none'; hideError();
        try {
            const { ok, result } = await fetchAndParse(API_URL);
            if (!ok || !result.success) throw new Error(result.message || 'Gagal memuat pengaturan.');
            const settings = result.data || {};
            for (const key in settings) {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = settings[key];
            }
        } catch (error) { showError(error.message);
        } finally { if(loadingDiv) loadingDiv.style.display = 'none'; if(form) form.style.display = 'block'; }
    }
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); hideError(); setButtonLoading(true);
            try {
                const formData = new FormData(form); const data = Object.fromEntries(formData.entries());
                const { ok, result } = await fetchAndParse(API_URL, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
                if (!ok || !result.success) throw new Error(result.message || 'Gagal menyimpan pengaturan.');
                showSaveSuccess(); alert(result.message);
            } catch (error) { showError(error.message);
            } finally { setButtonLoading(false); }
        });
    }
    loadSettings();
});