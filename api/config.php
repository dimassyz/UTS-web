<?php
date_default_timezone_set('Asia/Jakarta');
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'tugasid_indonesiafood');
define('DB_PASSWORD', 'j@S]VNMOO4ZY');
define('DB_NAME', 'tugasid_indonesiafood');
$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
if ($mysqli->connect_errno) {
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Koneksi Database Gagal.']);
    exit;
}
$mysqli->set_charset("utf8mb4");
