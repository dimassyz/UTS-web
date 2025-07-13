<?php
@session_start();
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
    sendJsonResponse(['success' => false, 'message' => 'Akses ditolak.'], 403);
}
$response = ['success' => false, 'message' => 'Aksi tidak diketahui.'];
$http_status_code = 500;
try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $sql = "SELECT id, username, nama_lengkap, role FROM staff ORDER BY nama_lengkap ASC";
        $result = $mysqli->query($sql);
        if (!$result) {
            throw new Exception("Gagal menjalankan query ambil staf: " . $mysqli->error);
        }
        $staff_data = [];
        while ($row = $result->fetch_assoc()) {
            $staff_data[] = $row;
        }
        $result->free();
        $response = ['success' => true, 'data' => $staff_data];
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
                if (empty($data['username']) || empty($data['nama_lengkap']) || empty($data['password']) || empty($data['role'])) {
                    throw new Exception('Semua field wajib diisi.');
                }
                if (strlen($data['password']) < 6) {
                    throw new Exception('Password minimal 6 karakter.');
                }
                if (!preg_match('/^[a-zA-Z0-9_]+$/', $data['username'])) {
                    throw new Exception('Username hanya boleh huruf, angka, dan underscore.');
                }
                $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
                $sql = "INSERT INTO staff (username, password_hash, nama_lengkap, role) VALUES (?, ?, ?, ?)";
                $stmt = $mysqli->prepare($sql);
                $stmt->bind_param("ssss", $data['username'], $password_hash, $data['nama_lengkap'], $data['role']);
                if ($stmt->execute()) {
                    $response = ['success' => true, 'message' => 'Staf baru berhasil ditambahkan!'];
                } else {
                    if ($stmt->errno == 1062) {
                        http_response_code(409);
                        throw new Exception('Username sudah digunakan.');
                    } else {
                        throw new Exception("Gagal simpan: " . $stmt->error);
                    }
                }
                break;
            case 'update':
                if (empty($data['id']) || empty($data['nama_lengkap']) || empty($data['role'])) {
                    throw new Exception('Data tidak lengkap.');
                }
                $id = filter_var($data['id'], FILTER_VALIDATE_INT);
                if (!$id) throw new Exception('ID staf tidak valid.');
                $sql_parts = ["nama_lengkap = ?", "role = ?"];
                $params = [$data['nama_lengkap'], $data['role']];
                $types = "ss";
                if (!empty($data['password'])) {
                    if (strlen($data['password']) < 6) {
                        throw new Exception('Password baru minimal 6 karakter.');
                    }
                    $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
                    $sql_parts[] = "password_hash = ?";
                    $params[] = $password_hash;
                    $types .= "s";
                }
                $params[] = $id;
                $types .= "i";
                $sql = "UPDATE staff SET " . implode(", ", $sql_parts) . ", updated_at = NOW() WHERE id = ?";
                $stmt = $mysqli->prepare($sql);
                if (!$stmt) {
                    throw new Exception("Gagal prepare statement update: " . $mysqli->error);
                }
                $stmt->bind_param($types, ...$params);
                if ($stmt->execute()) {
                    $response = ['success' => true, 'message' => 'Data staf berhasil diperbarui!'];
                } else {
                    throw new Exception("Gagal update: " . $stmt->error);
                }
                break;
            case 'delete':
                if (empty($data['id'])) {
                    throw new Exception('ID staf tidak ada.');
                }
                $id = filter_var($data['id'], FILTER_VALIDATE_INT);
                if (!$id) throw new Exception('ID staf tidak valid.');
                if ($id == $_SESSION['user_info']['id']) {
                    http_response_code(403);
                    throw new Exception('Tidak dapat menghapus diri sendiri.');
                }
                if ($id == 1) {
                    http_response_code(403);
                    throw new Exception('User admin utama (ID 1) tidak dapat dihapus.');
                }
                $sql = "DELETE FROM staff WHERE id = ?";
                $stmt = $mysqli->prepare($sql);
                $stmt->bind_param("i", $id);
                if ($stmt->execute()) {
                    if ($stmt->affected_rows > 0) {
                        $response = ['success' => true, 'message' => 'Staf berhasil dihapus!'];
                    } else {
                        $response = ['success' => false, 'message' => 'Staf tidak ditemukan.'];
                        http_response_code(404);
                    }
                } else {
                    throw new Exception("Gagal hapus: " . $stmt->error);
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
    if ($http_status_code === 500 && $e->getCode() >= 400 && $e->getCode() < 500) {
        $http_status_code = $e->getCode();
    }
    $response['message'] = $e->getMessage();
    error_log("Error crud_staf.php: " . $e->getMessage());
} finally {
    if (isset($mysqli) && $mysqli instanceof mysqli) $mysqli->close();
}
sendJsonResponse($response, $http_status_code);
