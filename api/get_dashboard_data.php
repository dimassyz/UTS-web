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

$today_start = date('Y-m-d 00:00:00');
$today_end = date('Y-m-d 23:59:59');
$week_start = date('Y-m-d 00:00:00', strtotime('-6 days'));

$response = [
    'success' => false,
    'data' => [
        'summary' => [
            'total_pendapatan_hari_ini' => 0.0,
            'total_transaksi_hari_ini' => 0,
            'menu_terjual_hari_ini' => 0,
            'stok_kritis' => 0
        ],
        'top_products_today' => [],
        'weekly_revenue' => []
    ]
];

try {
    // 1. Data Ringkasan (Kartu) untuk Hari Ini
    $stmt = $mysqli->prepare("SELECT COUNT(id) as total_transaksi, SUM(grand_total) as total_pendapatan FROM orders WHERE waktu_pesan BETWEEN ? AND ?");
    $stmt->bind_param("ss", $today_start, $today_end);
    $stmt->execute();
    $summary = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $response['data']['summary']['total_transaksi_hari_ini'] = (int)($summary['total_transaksi'] ?? 0);
    $response['data']['summary']['total_pendapatan_hari_ini'] = (float)($summary['total_pendapatan'] ?? 0.0);

    $stmt = $mysqli->prepare("SELECT SUM(oi.jumlah) as total_item FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.waktu_pesan BETWEEN ? AND ?");
    $stmt->bind_param("ss", $today_start, $today_end);
    $stmt->execute();
    $response['data']['summary']['menu_terjual_hari_ini'] = (int)($stmt->get_result()->fetch_assoc()['total_item'] ?? 0);
    $stmt->close();

    // === PERBAIKAN LOGIKA STOK KRITIS DI SINI ===
    // Stok Kritis adalah produk yang stoknya HAMPIR habis (misal: antara 1 dan 5)
    // Produk dengan stok 0 dianggap HABIS, bukan kritis.
    $sql_stok = "SELECT COUNT(id) as jumlah_stok_kritis FROM products WHERE stok <= 5";
    // ===========================================
    $response['data']['summary']['stok_kritis'] = (int)($mysqli->query($sql_stok)->fetch_assoc()['jumlah_stok_kritis'] ?? 0);

    // 2. Data Produk Terlaris Hari Ini (Untuk Progress Bar/Pie Chart)
    $sql_top_items = "SELECT p.nama as nama_produk, SUM(oi.jumlah) as jumlah_terjual FROM order_items oi JOIN products p ON oi.product_id = p.id JOIN orders o ON oi.order_id = o.id WHERE o.waktu_pesan BETWEEN ? AND ? GROUP BY p.id, p.nama ORDER BY jumlah_terjual DESC LIMIT 3";
    $stmt_top_items = $mysqli->prepare($sql_top_items);
    $stmt_top_items->bind_param("ss", $today_start, $today_end);
    $stmt_top_items->execute();
    $result_top_items = $stmt_top_items->get_result();
    $top_products = [];
    while ($item = $result_top_items->fetch_assoc()) {
        $top_products[] = $item;
    }
    $response['data']['top_products_today'] = $top_products;
    $stmt_top_items->close();

    // 3. Data Pendapatan Mingguan (Untuk Area Chart)
    $sql_weekly = "SELECT DATE(waktu_pesan) as tanggal, SUM(grand_total) as total FROM orders WHERE waktu_pesan >= ? GROUP BY DATE(waktu_pesan) ORDER BY tanggal ASC";
    $stmt_weekly = $mysqli->prepare($sql_weekly);
    $stmt_weekly->bind_param("s", $week_start);
    $stmt_weekly->execute();
    $result_weekly = $stmt_weekly->get_result();
    $weekly_revenue = [];
    while ($day = $result_weekly->fetch_assoc()) {
        $weekly_revenue[] = $day;
    }
    $response['data']['weekly_revenue'] = $weekly_revenue;
    $stmt_weekly->close();

    $response['success'] = true;
} catch (Throwable $e) {
    http_response_code(500);
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error get_dashboard_data.php: " . $e->getMessage());
} finally {
    if (isset($mysqli)) $mysqli->close();
}

echo json_encode($response);
