<?php
@session_start();
ob_start();
require_once 'config.php';
function sendJsonResponse($data, $statusCode = 200)
{
    if (ob_get_level() > 0) ob_end_clean();
    if (!headers_sent()) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept');
    }
    echo json_encode($data);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJsonResponse(null, 200);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'message' => 'Metode harus POST.'], 405);
}
if (!isset($_SESSION['user_logged_in']) || $_SESSION['user_info']['role'] !== 'admin') {
    sendJsonResponse(['success' => false, 'message' => 'Akses ditolak.'], 403);
}
$data = json_decode(file_get_contents('php://input'), true);
if ($data === null || !isset($data['action'])) {
    sendJsonResponse(['success' => false, 'message' => 'Aksi tidak valid.'], 400);
}
$action = $data['action'];
$response = ['success' => false, 'message' => 'Aksi tidak diketahui.'];
$http_status_code = 500;
try {
    switch ($action) {
        case 'add':
            if (empty($data['nama']) || empty($data['kategori_id']) || !isset($data['harga']) || !isset($data['stok'])) {
                $http_status_code = 400;
                throw new Exception('Data tidak lengkap.');
            }
            $sql = "INSERT INTO products (category_id, nama, deskripsi, harga, stok, gambar_url, status_ketersediaan) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $mysqli->prepare($sql);
            $status = (int)$data['stok'] > 0 ? 'tersedia' : 'habis';
            $gambar_url = !empty($data['gambar_url']) ? $data['gambar_url'] : null;
            $deskripsi = !empty($data['deskripsi']) ? $data['deskripsi'] : null;
            $stmt->bind_param("sssdiss", $data['kategori_id'], $data['nama'], $deskripsi, $data['harga'], $data['stok'], $gambar_url, $status);
            if ($stmt->execute()) {
                $response = ['success' => true, 'message' => 'Menu berhasil ditambahkan!'];
                $http_status_code = 200;
            } else {
                throw new Exception("Gagal menyimpan: " . $stmt->error);
            }
            break;
        case 'update':
            if (empty($data['id']) || empty($data['nama']) || empty($data['kategori_id']) || !isset($data['harga']) || !isset($data['stok'])) {
                $http_status_code = 400;
                throw new Exception('Data tidak lengkap.');
            }
            $sql = "UPDATE products SET category_id = ?, nama = ?, deskripsi = ?, harga = ?, stok = ?, gambar_url = ?, status_ketersediaan = ?, updated_at = NOW() WHERE id = ?";
            $stmt = $mysqli->prepare($sql);
            $status = (int)$data['stok'] > 0 ? 'tersedia' : 'habis';
            $gambar_url = !empty($data['gambar_url']) ? $data['gambar_url'] : null;
            $deskripsi = !empty($data['deskripsi']) ? $data['deskripsi'] : null;
            $stmt->bind_param("sssdissi", $data['kategori_id'], $data['nama'], $deskripsi, $data['harga'], $data['stok'], $gambar_url, $status, $data['id']);
            if ($stmt->execute()) {
                $response = ['success' => true, 'message' => 'Perubahan berhasil disimpan!'];
                $http_status_code = 200;
            } else {
                throw new Exception("Gagal update: " . $stmt->error);
            }
            break;
        case 'delete':
            if (empty($data['id'])) {
                $http_status_code = 400;
                throw new Exception('ID produk tidak ada.');
            }
            $id = (int)$data['id'];
            $sql = "DELETE FROM products WHERE id = ?";
            $stmt = $mysqli->prepare($sql);
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    $response = ['success' => true, 'message' => 'Menu berhasil dihapus!'];
                    $http_status_code = 200;
                } else {
                    $response = ['success' => false, 'message' => 'Produk tidak ditemukan.'];
                    $http_status_code = 404;
                }
            } else {
                if ($stmt->errno == 1451) {
                    http_response_code(409);
                    throw new Exception("Gagal hapus: Menu ini ada di riwayat transaksi.");
                } else {
                    throw new Exception("Gagal hapus: " . $stmt->error);
                }
            }
            break;
        default:
            $http_status_code = 400;
            throw new Exception('Aksi tidak valid.');
    }
    if (isset($stmt)) $stmt->close();
} catch (Throwable $e) {
    if ($http_status_code === 500 && $e->getCode() >= 400) {
        $http_status_code = $e->getCode();
    }
    $response['message'] = $e->getMessage();
    error_log("Error crud_produk.php: " . $e->getMessage());
} finally {
    if (isset($mysqli)) $mysqli->close();
}
sendJsonResponse($response, $http_status_code);
