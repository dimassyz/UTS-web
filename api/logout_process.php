<?php
@session_start();
$_SESSION = array();
if (session_destroy()) {
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'message' => 'Logout berhasil.']);
} else {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal logout.']);
}
exit;
