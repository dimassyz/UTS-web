<?php
// /api/buat_hash_lokal.php (HAPUS FILE INI SETELAH SELESAI)

// Password yang ingin Anda gunakan untuk login
$passwordAsli = '123';

// Buat hash menggunakan algoritma default dari PHP di XAMPP/MAMP Anda
$hashPassword = password_hash($passwordAsli, PASSWORD_DEFAULT);

// Tampilkan hasilnya agar bisa disalin
echo "<h3>Gunakan Hash Ini untuk Database Lokal Anda</h3>";
echo "<p>Password asli: <strong>" . htmlspecialchars($passwordAsli) . "</strong></p>";
echo "<p>Hasil Hash di server lokal ini adalah:</p>";
// Gunakan textarea agar mudah di-copy
echo "<textarea rows='3' cols='80' readonly onclick='this.select()'>" . htmlspecialchars($hashPassword) . "</textarea>";
echo "<p><small>Salin seluruh teks di atas (yang dimulai dengan $2y$...) dan ganti nilai di kolom 'password_hash' untuk user 'admin' di phpMyAdmin.</small></p>";
