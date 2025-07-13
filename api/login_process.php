<?php
@session_start();
require_once 'config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metode harus POST.']);
    exit;
}
$response = ['success' => false, 'message' => 'Username atau password salah.'];
$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['username']) || empty($data['password'])) {
    http_response_code(400);
    $response['message'] = 'Username & Password wajib diisi.';
    echo json_encode($response);
    exit;
}
$username = trim($data['username']);
$password = $data['password'];
$sql = "SELECT id, username, password_hash, nama_lengkap, role FROM staff WHERE username = ?";
$stmt = $mysqli->prepare($sql);
if ($stmt) {
    $stmt->bind_param("s", $username);
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            if (password_verify($password, $user['password_hash'])) {
                session_regenerate_id(true);
                unset($user['password_hash']);
                $_SESSION['user_logged_in'] = true;
                $_SESSION['user_info'] = $user;
                $response['success'] = true;
                $response['message'] = 'Login berhasil!';
                $response['role'] = $user['role'];
            }
        }
    }
    $stmt->close();
} else {
    http_response_code(500);
    $response['message'] = 'Error server.';
}
$mysqli->close();
echo json_encode($response);
