<?php
@session_start();
if (!isset($_SESSION['user_logged_in']) || $_SESSION['user_logged_in'] !== true || !in_array($_SESSION['user_info']['role'], ['admin', 'kasir'])) {
    header('Location: ../admin/login.html');
    exit;
}
$kasirInfo = $_SESSION['user_info'];
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Kasir Restoran Nusantara</title>
    <link href="../vendor/sb-admin-2/vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">
    <link href="../vendor/sb-admin-2/css/sb-admin-2.min.css" rel="stylesheet">
    <link href="css/style-kasir.css" rel="stylesheet">
</head>
<body class="kasir-page">
    <div class="container-fluid my-3">
        <header class="kasir-header mb-4">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h3 text-gray-900 mb-0 font-weight-bold">Restoran Nusantara</h1>
                <div class="kasir-info text-right">
                    <p class="text-gray-800 mb-0 font-weight-bold" id="namaKasir"><?= htmlspecialchars($kasirInfo['nama_lengkap']) ?></p>
                    <a href="#" id="logoutButtonKasir" class="small text-danger"><i class="fas fa-sign-out-alt fa-sm"></i> Logout</a>
                </div>
            </div>
            <div class="form-row mt-3 align-items-center">
                <div class="col-md-4 mb-2 mb-md-0"><input type="text" class="form-control" id="atasNama" placeholder="Atas Nama Pelanggan" required></div>
                <div class="col-md-3 mb-2 mb-md-0"><select class="form-control" id="tipePesanan"><option value="dine-in" selected>Makan di Sini</option><option value="take-away">Bawa Pulang</option></select></div>
                <div class="col-md-5"><input type="search" id="searchInput" class="form-control" placeholder="Cari nama menu..."></div>
            </div>
        </header>
        <div id="categoryTabs" class="nav nav-pills justify-content-center mb-4" role="tablist"></div>
        <div class="tab-content" id="menuTabContent">
             <div id="loadingIndicatorGlobal" class="col-12 text-center mt-5 py-5"><div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status"><span class="sr-only">Memuat...</span></div><p class="mt-3 text-muted h5">Memuat menu...</p></div>
             <div id="errorMessageGlobal" class="col-12 text-center mt-5" style="display: none;" role="alert"></div>
        </div>
    </div>
    <div id="confirmationArea" class="shadow-lg">
         <div id="cartSummary" class="mb-2 d-none"></div>
         <div class="confirmation-details">
             <div class="totals-section"><div id="totalItemsDisplay" class="font-weight-bold">Total Item: 0</div><div id="totalPriceDisplay" class="h5 mb-0 font-weight-bold">Total: Rp 0</div></div>
             <button id="confirmButton" class="btn btn-success btn-lg" disabled><i class="fas fa-check-circle mr-2"></i>Bayar</button>
         </div>
    </div>
    <div id="successPopup" class="alert alert-success position-fixed" style="bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1060; display: none; box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);" role="alert">
        <i class="fas fa-check-circle mr-2"></i><span></span>
    </div>
    <script src="../vendor/sb-admin-2/vendor/jquery/jquery.min.js"></script>
    <script src="../vendor/sb-admin-2/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="js/kasir.js"></script>
</body>
</html>