<?php
echo "<h1>Tes Koneksi Database Lokal</h1>";
require_once 'config.php'; // Menggunakan config.php Anda

if ($mysqli && !$mysqli->connect_errno) {
    echo "<h2 style='color: green;'>Koneksi BERHASIL!</h2>";
    echo "<p>Anda berhasil terhubung ke database '<strong>" . DB_NAME . "</strong>' di server '<strong>" . DB_SERVER . "</strong>'.</p>";
    $mysqli->close();
} else {
    // Jika require 'config.php' gagal atau $mysqli tidak terdefinisi
    echo "<h2 style='color: red;'>Koneksi GAGAL!</h2>";
    echo "<p>Periksa kembali detail di file <strong>/api/config.php</strong>.</p>";
    if (isset($mysqli)) {
        echo "<p>Error: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error . "</p>";
    }
}
