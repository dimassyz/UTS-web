<?php
@session_start();
require_once 'config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
$response = ['success' => false, 'data' => []];
try {
    $sql = "SELECT id, nama_kategori FROM categories ORDER BY nama_kategori ASC";
    $result = $mysqli->query($sql);
    if (!$result) throw new Exception("Gagal mengambil data kategori.");
    $categories_data = [['id' => 'all', 'nama_kategori' => 'Semua Menu']];
    while ($row = $result->fetch_assoc()) {
        $categories_data[] = $row;
    }
    $response = ['success' => true, 'data' => $categories_data];
    $result->free();
} catch (Throwable $e) {
    http_response_code(500);
    $response['message'] = $e->getMessage();
    error_log("Error get_categories.php: " . $e->getMessage());
} finally {
    if (isset($mysqli)) $mysqli->close();
}
echo json_encode($response);
