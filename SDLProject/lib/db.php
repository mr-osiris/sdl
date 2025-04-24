<?php
header("Access-Control-Allow-Origin: *");

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration
$servername = "localhost";
$username = "root";       // Default XAMPP username
$password = "";           // Default XAMPP password (empty)
$dbname = "Lost_and_Found";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    file_put_contents('db_errors.log', date('Y-m-d H:i:s')." - Connection failed: ".$conn->connect_error.PHP_EOL, FILE_APPEND);
    die(json_encode([
        "success" => false,
        "error" => "Database connection failed",
        "debug" => $conn->connect_error
    ]));
}

// Set charset
$conn->set_charset("utf8mb4");
?>