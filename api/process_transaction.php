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
    sendJsonResponse(['success' => false, 'message' => 'Metode request harus POST.'], 405);
}

$response = ['success' => false, 'message' => 'Error tidak diketahui.'];
$http_status_code = 500;

try {
    if (!isset($_SESSION['user_logged_in']) || $_SESSION['user_logged_in'] !== true) {
        $http_status_code = 403;
        throw new Exception('Sesi tidak valid atau Anda belum login.');
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if ($data === null || !isset($data['cart']) || !is_array($data['cart']) || empty($data['cart'])) {
        $http_status_code = 400;
        throw new Exception('Data keranjang (cart) tidak valid atau kosong.');
    }

    if (empty($data['atas_nama'])) {
        $http_status_code = 400;
        throw new Exception('Atas Nama pelanggan wajib diisi.');
    }

    $cart = $data['cart'];
    $nama_pemesan = trim($data['atas_nama']);
    $tipe_pesanan = $data['tipe_pesanan'] ?? 'dine-in';
    $staff_id = $_SESSION['user_info']['id'] ?? 0;

    if ($staff_id === 0) {
        $http_status_code = 403;
        throw new Exception('Sesi kasir tidak valid. Silakan login ulang.');
    }

    if (!$mysqli->begin_transaction()) {
        throw new Exception("Gagal memulai transaksi database: " . $mysqli->error);
    }

    $total_harga_transaksi = 0.0;
    $items_to_insert = [];
    $stok_updates = [];

    $stmt_check_product = $mysqli->prepare("SELECT nama, stok, harga FROM products WHERE id = ? FOR UPDATE");
    if (!$stmt_check_product) {
        throw new Exception("Prepare Gagal (Cek Produk): " . $mysqli->error);
    }

    foreach ($cart as $productId_str => $quantity_val) {
        $productId = filter_var($productId_str, FILTER_VALIDATE_INT);
        $quantity = filter_var($quantity_val, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1]]);

        if ($productId === false || $quantity === false) {
            $http_status_code = 400;
            throw new Exception("Data produk atau jumlah tidak valid.");
        }

        $stmt_check_product->bind_param("i", $productId);
        if (!$stmt_check_product->execute()) {
            throw new Exception("Eksekusi Gagal (Cek ID: $productId): " . $stmt_check_product->error);
        }

        $result_check = $stmt_check_product->get_result();
        if ($result_check->num_rows === 0) {
            $http_status_code = 400;
            throw new Exception("Produk dengan ID $productId tidak ditemukan.");
        }

        $product = $result_check->fetch_assoc();
        if ($product['stok'] < $quantity) {
            $http_status_code = 400;
            throw new Exception("Stok produk \"{$product['nama']}\" tidak mencukupi (sisa: {$product['stok']}, perlu: $quantity).");
        }

        $harga_satuan = (float)$product['harga'];
        $total_harga_transaksi += $harga_satuan * $quantity;
        $items_to_insert[] = ['product_id' => $productId, 'jumlah' => $quantity, 'harga_satuan' => $harga_satuan];
        $stok_updates[] = ['id' => $productId, 'new_stock' => $product['stok'] - $quantity];
    }
    $stmt_check_product->close();

    $stmt_insert_trans = $mysqli->prepare("INSERT INTO orders (staff_id, nama_pemesan, tipe_pesanan, grand_total, metode_pembayaran, waktu_pesan) VALUES (?, ?, ?, ?, ?, NOW())");
    $metode_pembayaran = $data['metode_pembayaran'] ?? 'tunai';
    if (!$stmt_insert_trans) {
        throw new Exception("Prepare Gagal (Insert Order): " . $mysqli->error);
    }
    $stmt_insert_trans->bind_param("issds", $staff_id, $nama_pemesan, $tipe_pesanan, $total_harga_transaksi, $metode_pembayaran);
    if (!$stmt_insert_trans->execute()) {
        throw new Exception("Gagal menyimpan order: " . $stmt_insert_trans->error);
    }
    $order_id = $mysqli->insert_id;
    $stmt_insert_trans->close();

    $stmt_insert_item = $mysqli->prepare("INSERT INTO order_items (order_id, product_id, jumlah, harga_satuan_saat_pesan) VALUES (?, ?, ?, ?)");
    if (!$stmt_insert_item) {
        throw new Exception("Prepare Gagal (Insert Item): " . $mysqli->error);
    }
    foreach ($items_to_insert as $item) {
        $stmt_insert_item->bind_param("iiid", $order_id, $item['product_id'], $item['jumlah'], $item['harga_satuan']);
        if (!$stmt_insert_item->execute()) {
            throw new Exception("Gagal menyimpan item (Produk ID: {$item['product_id']}): " . $stmt_insert_item->error);
        }
    }
    $stmt_insert_item->close();

    $stmt_update_stock = $mysqli->prepare("UPDATE products SET stok = ?, updated_at = NOW() WHERE id = ?");
    if (!$stmt_update_stock) {
        throw new Exception("Prepare Gagal (Update Stok): " . $mysqli->error);
    }
    foreach ($stok_updates as $update) {
        $new_stock_val = max(0, $update['new_stock']);
        $stmt_update_stock->bind_param("ii", $new_stock_val, $update['id']);
        if (!$stmt_update_stock->execute()) {
            throw new Exception("Gagal update stok (Produk ID: {$update['id']}): " . $stmt_update_stock->error);
        }
    }
    $stmt_update_stock->close();

    if (!$mysqli->commit()) {
        throw new Exception("Gagal melakukan commit transaksi: " . $mysqli->error);
    }

    $response['success'] = true;
    $response['message'] = 'Transaksi berhasil diproses.';
    $response['transaction_id'] = $order_id;
    $http_status_code = 200;
} catch (Throwable $e) {
    if (isset($mysqli) && $mysqli->thread_id) {
        @$mysqli->rollback();
    }
    if ($http_status_code === 500 && $e->getCode() >= 400 && $e->getCode() < 500) {
        $http_status_code = $e->getCode();
    }
    $response['message'] = $e->getMessage();
    error_log("Error process_transaction.php: " . $e->getMessage());
} finally {
    if (isset($mysqli) && $mysqli instanceof mysqli) {
        $mysqli->close();
    }
}

sendJsonResponse($response, $http_status_code);
