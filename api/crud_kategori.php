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
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept');
    }
    echo json_encode($data);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJsonResponse(null, 200);
}

if (!isset($_SESSION['user_logged_in']) || !isset($_SESSION['user_info']['role']) || $_SESSION['user_info']['role'] !== 'admin') {
    sendJsonResponse(['success' => false, 'message' => 'Akses ditolak. Sesi tidak valid.'], 403);
}

$response = ['success' => false, 'message' => 'Aksi tidak diketahui.'];
$http_status_code = 500;

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $sql = "SELECT id, nama_kategori FROM categories ORDER BY nama_kategori ASC";
        $result = $mysqli->query($sql);
        if (!$result) throw new Exception("Gagal mengambil data kategori: " . $mysqli->error);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        $result->free();
        $response = ['success' => true, 'data' => $data];
        $http_status_code = 200;
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if ($data === null || !isset($data['action'])) {
            $http_status_code = 400;
            throw new Exception('Aksi tidak valid.');
        }
        $action = $data['action'];

        switch ($action) {
            case 'add':
                if (empty($data['id']) || empty($data['nama_kategori'])) {
                    throw new Exception('ID dan Nama Kategori wajib diisi.');
                }
                if (!preg_match('/^[a-z0-9_]+$/', $data['id'])) {
                    throw new Exception('ID Kategori hanya boleh huruf kecil, angka, dan underscore.');
                }
                $sql = "INSERT INTO categories (id, nama_kategori) VALUES (?, ?)";
                $stmt = $mysqli->prepare($sql);
                $stmt->bind_param("ss", $data['id'], $data['nama_kategori']);
                if ($stmt->execute()) {
                    $response = ['success' => true, 'message' => 'Kategori berhasil ditambahkan!'];
                } else {
                    if ($stmt->errno == 1062) {
                        http_response_code(409);
                        throw new Exception('ID Kategori sudah digunakan.');
                    } else {
                        throw new Exception("Gagal simpan: " . $stmt->error);
                    }
                }
                break;
            case 'update':
                if (empty($data['id']) || empty($data['nama_kategori'])) {
                    throw new Exception('ID dan Nama Kategori wajib diisi.');
                }
                $sql = "UPDATE categories SET nama_kategori = ? WHERE id = ?";
                $stmt = $mysqli->prepare($sql);
                $stmt->bind_param("ss", $data['nama_kategori'], $data['id']);
                if ($stmt->execute()) {
                    $response = ['success' => true, 'message' => 'Kategori berhasil diperbarui!'];
                } else {
                    throw new Exception("Gagal update: " . $stmt->error);
                }
                break;
            case 'delete':
                if (empty($data['id'])) {
                    throw new Exception('ID kategori tidak ada.');
                }
                $sql = "DELETE FROM categories WHERE id = ?";
                $stmt = $mysqli->prepare($sql);
                $stmt->bind_param("s", $data['id']);
                if ($stmt->execute()) {
                    if ($stmt->affected_rows > 0) {
                        $response = ['success' => true, 'message' => 'Kategori berhasil dihapus!'];
                    } else {
                        $response = ['success' => false, 'message' => 'Kategori tidak ditemukan.'];
                        http_response_code(404);
                    }
                } else {
                    if ($stmt->errno == 1451) {
                        http_response_code(409);
                        throw new Exception("Gagal hapus: Kategori ini sedang digunakan oleh produk.");
                    } else {
                        throw new Exception("Gagal hapus: " . $stmt->error);
                    }
                }
                break;
            default:
                http_response_code(400);
                throw new Exception('Aksi tidak valid.');
        }
        if (isset($stmt)) $stmt->close();
        $http_status_code = 200;
    }
} catch (Throwable $e) {
    if ($http_status_code === 500 && $e->getCode() >= 400) {
        $http_status_code = $e->getCode();
    }
    $response['message'] = $e->getMessage();
    error_log("Error crud_kategori.php: " . $e->getMessage());
} finally {
    if (isset($mysqli) && $mysqli instanceof mysqli) $mysqli->close();
}
sendJsonResponse($response, $http_status_code);
