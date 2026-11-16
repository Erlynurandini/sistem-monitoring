<?php
$host = 'autorack.proxy.rlwy.net';
$port = '32750';
$db   = 'railway'; // sesuaikan dengan MYSQLDATABASE di Railway
$user = 'root';    // sesuaikan dengan MYSQLUSER di Railway
$pass = 'IkapENrkMpydUQNWpdyFlBRDmKHAMEPg'; // ganti dengan MYSQLPASSWORD

try {
    $pdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $pdo->exec("USE `$db`");

    $sqlFile = 'C:/Users/lenovo/Downloads/simonpkl_db (1).sql';
    if (!file_exists($sqlFile)) {
        die("File .sql tidak ditemukan di folder Downloads!\n");
    }

    $sql = file_get_contents($sqlFile);
    $pdo->exec($sql);
    echo "\nSUKSES: Database berhasil di-import ke Railway!\n";
} catch (Exception $e) {
    echo "\nERROR: " . $e->getMessage() . "\n";
}