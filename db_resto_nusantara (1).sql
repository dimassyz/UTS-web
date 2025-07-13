-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 11 Jul 2025 pada 05.01
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_resto_nusantara`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `categories`
--

CREATE TABLE `categories` (
  `id` varchar(50) NOT NULL,
  `nama_kategori` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `categories`
--

INSERT INTO `categories` (`id`, `nama_kategori`) VALUES
('dessert', 'Penutup njir'),
('makanan_berat', 'Makanan Berat'),
('makanan_ringan', 'Cemilan'),
('minuman_dingin', 'Minuman Dingin'),
('minuman_panas', 'Minuman Panas');

-- --------------------------------------------------------

--
-- Struktur dari tabel `orders`
--

CREATE TABLE `orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `staff_id` int(10) UNSIGNED NOT NULL,
  `nama_pemesan` varchar(150) NOT NULL,
  `tipe_pesanan` enum('dine-in','take-away') NOT NULL DEFAULT 'dine-in',
  `grand_total` decimal(12,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `metode_pembayaran` varchar(50) DEFAULT NULL,
  `status_pesanan` enum('dibayar_menunggu_disiapkan','sedang_disiapkan','siap_diambil_disajikan','selesai','dibatalkan') NOT NULL DEFAULT 'dibayar_menunggu_disiapkan',
  `waktu_pesan` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `orders`
--

INSERT INTO `orders` (`id`, `staff_id`, `nama_pemesan`, `tipe_pesanan`, `grand_total`, `metode_pembayaran`, `status_pesanan`, `waktu_pesan`) VALUES
(1, 2, 'DIMAS', 'take-away', 77000.00, 'tunai', 'dibayar_menunggu_disiapkan', '2025-07-11 02:07:42'),
(2, 1, 'alok', 'dine-in', 615615.00, 'tunai', 'dibayar_menunggu_disiapkan', '2025-07-11 03:00:12');

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_items`
--

CREATE TABLE `order_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `jumlah` int(10) UNSIGNED NOT NULL,
  `harga_satuan_saat_pesan` decimal(10,2) UNSIGNED NOT NULL,
  `catatan_item` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `jumlah`, `harga_satuan_saat_pesan`, `catatan_item`) VALUES
(1, 1, 1, 1, 28000.00, NULL),
(2, 1, 5, 3, 8000.00, NULL),
(3, 1, 8, 1, 25000.00, NULL),
(4, 2, 9, 5, 123123.00, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `category_id` varchar(50) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `harga` decimal(10,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `stok` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `gambar_url` varchar(255) DEFAULT NULL,
  `status_ketersediaan` enum('tersedia','habis') NOT NULL DEFAULT 'tersedia',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `category_id`, `nama`, `deskripsi`, `harga`, `stok`, `gambar_url`, `status_ketersediaan`, `created_at`, `updated_at`) VALUES
(1, 'makanan_berat', 'Nasi Goreng Spesial Nusantara', 'Nasi goreng dengan bumbu rempah khas, udang, ayam, dan telur.', 28000.00, 19, '../assets/img/nasreng.jpg', 'tersedia', '2025-07-11 01:46:31', '2025-07-11 02:07:42'),
(2, 'makanan_berat', 'Soto Ayam Lamongan Kuah Butek', 'Soto ayam dengan kuah kaldu bening, suwiran ayam, soun, dan telur rebus.', 22000.00, 15, '../assets/img/soto.png', 'tersedia', '2025-07-11 01:46:31', '2025-07-11 01:46:53'),
(3, 'makanan_ringan', 'Gado-Gado Siram Bumbu Kacang', 'Sayuran segar direbus disiram bumbu kacang mede yang gurih.', 20000.00, 25, '../assets/img/gado.png', 'tersedia', '2025-07-11 01:46:31', '2025-07-11 01:46:31'),
(4, 'makanan_berat', 'Sate Ayam Madura (10 Tusuk)', 'Sate ayam dengan bumbu kacang khas Madura, disajikan dengan lontong atau nasi.', 30000.00, 30, '../assets/img/sate.png', 'tersedia', '2025-07-11 01:46:31', '2025-07-11 01:46:31'),
(5, 'minuman_dingin', 'Es Teh Manis Jumbo', 'Es teh manis dengan ukuran jumbo yang menyegarkan.', 8000.00, 47, '../assets/img/esteh.png', 'tersedia', '2025-07-11 01:46:31', '2025-07-11 02:07:42'),
(6, 'minuman_panas', 'Kopi Hitam Tubruk', 'Kopi hitam tubruk tradisional dengan aroma kuat.', 10000.00, 0, '../assets/img/kopi.png', 'habis', '2025-07-11 01:46:31', '2025-07-11 01:46:31'),
(7, 'makanan_ringan', 'Pisang Goreng Crispy (Isi 5)', 'Pisang goreng renyah dengan taburan keju dan coklat.', 15000.00, 18, '../assets/img/pisreng.png', 'tersedia', '2025-07-11 01:46:31', '2025-07-11 01:46:31'),
(8, 'dessert', 'Es Cendol Durian', 'Es cendol dengan tambahan daging durian asli dan santan gurih.', 25000.00, 11, '../assets/img/cendol.png', 'tersedia', '2025-07-11 01:46:31', '2025-07-11 02:07:42'),
(9, 'dessert', 'sigmanuk', 'asd', 123123.00, 7, NULL, 'tersedia', '2025-07-11 01:51:17', '2025-07-11 03:00:12');

-- --------------------------------------------------------

--
-- Struktur dari tabel `staff`
--

CREATE TABLE `staff` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nama_lengkap` varchar(150) DEFAULT NULL,
  `role` enum('admin','kasir') NOT NULL DEFAULT 'kasir',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `staff`
--

INSERT INTO `staff` (`id`, `username`, `password_hash`, `nama_lengkap`, `role`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2y$10$TxM0amXQBSDvre6vsjZ4e.qxeBPIwVxuvMbuZFrMVHGfZIhCLusEm', 'Admin Utama', 'admin', '2025-07-09 13:04:07', '2025-07-11 01:53:20'),
(2, 'kasir01', '$2y$10$TxM0amXQBSDvre6vsjZ4e.qxeBPIwVxuvMbuZFrMVHGfZIhCLusEm', 'Budi Santoso1gaming', 'kasir', '2025-07-09 13:04:07', '2025-07-11 01:53:26');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_staff` (`staff_id`);

--
-- Indeks untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_product_category` (`category_id`);

--
-- Indeks untuk tabel `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `staff`
--
ALTER TABLE `staff`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_orderitem_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orderitem_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
