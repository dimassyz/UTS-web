<?php
date_default_timezone_set('Asia/Jakarta');
@session_start();
if (!isset($_SESSION['user_logged_in']) || $_SESSION['user_info']['role'] !== 'admin') {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Akses ditolak.']);
    exit;
}
require_once 'config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
$start_date_str = $_GET['start_date'] ?? null;
$end_date_str = $_GET['end_date'] ?? null;
$has_filter = false;
$filter_start_time = null;
$filter_end_time = null;
$param_types = "";
$params = [];
if (!empty($start_date_str) && ($start_dt = DateTime::createFromFormat('Y-m-d', $start_date_str))) {
    $filter_start_time = $start_dt->format('Y-m-d 00:00:00');
    $has_filter = true;
    $param_types .= "s";
    $params[] = &$filter_start_time;
}
if (!empty($end_date_str) && ($end_dt = DateTime::createFromFormat('Y-m-d', $end_date_str))) {
    $filter_end_time = $end_dt->format('Y-m-d 23:59:59');
    if ($filter_start_time) {
        $param_types .= "s";
        $params[] = &$filter_end_time;
    } else {
        $has_filter = false;
    }
} elseif ($has_filter && $filter_start_time) {
    $filter_end_time = $start_dt->format('Y-m-d 23:59:59');
    $param_types .= "s";
    $params[] = &$filter_end_time;
}
if (count($params) !== 2) {
    $has_filter = false;
}
$response = ['success' => false, 'data' => []];
try {
    $mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    $mysqli->set_charset("utf8mb4");
    if ($mysqli->connect_errno) {
        throw new Exception("Koneksi DB gagal.");
    }
    $sql_trans = "SELECT o.id, o.nama_pemesan, o.tipe_pesanan, o.grand_total, o.waktu_pesan, s.nama_lengkap as nama_kasir FROM orders o JOIN staff s ON o.staff_id = s.id";
    if ($has_filter) {
        $sql_trans .= " WHERE o.waktu_pesan BETWEEN ? AND ?";
    }
    $sql_trans .= " ORDER BY o.waktu_pesan DESC";
    $stmt_trans = $mysqli->prepare($sql_trans);
    if ($has_filter) {
        call_user_func_array([$stmt_trans, 'bind_param'], array_merge([$param_types], $params));
    }
    $stmt_trans->execute();
    $result_trans = $stmt_trans->get_result();
    $transactions_data = [];
    $sql_items = "SELECT oi.jumlah, oi.harga_satuan_saat_pesan, p.nama as nama_produk FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?";
    $stmt_items = $mysqli->prepare($sql_items);
    while ($trans = $result_trans->fetch_assoc()) {
        $order_id = $trans['id'];
        $items_detail = [];
        $stmt_items->bind_param("i", $order_id);
        $stmt_items->execute();
        $result_items = $stmt_items->get_result();
        while ($item = $result_items->fetch_assoc()) {
            $items_detail[] = ['nama_produk' => $item['nama_produk'], 'jumlah' => (int)$item['jumlah'], 'harga_satuan' => (float)$item['harga_satuan_saat_pesan']];
        }
        $transactions_data[] = ['id' => (int)$trans['id'], 'waktu' => $trans['waktu_pesan'], 'total_harga' => (float)$trans['grand_total'], 'items' => $items_detail, 'nama_pemesan' => $trans['nama_pemesan'], 'tipe_pesanan' => $trans['tipe_pesanan'], 'nama_kasir' => $trans['nama_kasir']];
    }
    $stmt_trans->close();
    $stmt_items->close();
    $response['success'] = true;
    $response['data'] = $transactions_data;
} catch (Throwable $e) {
    http_response_code(500);
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error get_report_data.php: " . $e->getMessage());
} finally {
    if (isset($mysqli)) $mysqli->close();
}
echo json_encode($response);
