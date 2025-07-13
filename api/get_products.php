<?php
require_once 'config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
$response = ['success' => false, 'data' => [], 'message' => ''];
$sql = "SELECT id, category_id, nama, deskripsi, stok, harga, gambar_url, status_ketersediaan FROM products ORDER BY nama ASC";
$result = $mysqli->query($sql);
if ($result) {
    if ($result->num_rows > 0) {
        $products_data = [];
        while ($row = $result->fetch_assoc()) {
            $row['stok'] = (int)$row['stok'];
            $row['harga'] = (float)$row['harga'];
            $products_data[] = $row;
        }
        $response['success'] = true;
        $response['data'] = $products_data;
    } else {
        $response['success'] = true;
        $response['message'] = 'Belum ada produk.';
    }
    $result->free();
} else {
    http_response_code(500);
    $response['message'] = "Gagal ambil data produk: " . $mysqli->error;
}
$mysqli->close();
echo json_encode($response);
