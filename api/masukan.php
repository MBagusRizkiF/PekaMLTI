<?php
// api/masukan.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Enable CORS
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Set timezone ke Asia/Jakarta (GMT+7)
date_default_timezone_set('Asia/Jakarta');

// Tambahkan di awal file untuk handle error
set_error_handler(function($errno, $errstr) {
  http_response_code(500);
  die(json_encode(['error' => $errstr]));
});

// Handle preflight requests for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database credentials
$db_host = 'localhost';
$db_user = 'simpul_user';
$db_pass = 'password_aman';
$db_name = 'simpul';

// Connect to database
$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to connect to database.']);
    exit();
}

// Admin credentials for Basic Auth
$ADMIN_USER = 'admin';
$ADMIN_PASS = 'adminsimpul';

// Function to check Basic Auth for admin-only requests
function check_auth() {
    global $ADMIN_USER, $ADMIN_PASS;
    if (!isset($_SERVER['PHP_AUTH_USER'])) {
        header('WWW-Authenticate: Basic realm="Masukan Admin Area"');
        http_response_code(401);
        echo json_encode(['message' => 'Authentication required.']);
        exit();
    }
    if ($_SERVER['PHP_AUTH_USER'] !== $ADMIN_USER || $_SERVER['PHP_AUTH_PW'] !== $ADMIN_PASS) {
        header('WWW-Authenticate: Basic realm="Masukan Admin Area"');
        http_response_code(401);
        echo json_encode(['message' => 'Invalid credentials.']);
        exit();
    }
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        // Add new feedback
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid input']);
            exit();
        }
        $type = isset($input['type']) ? $mysqli->real_escape_string($input['type']) : '';
        $category = isset($input['category']) ? $mysqli->real_escape_string($input['category']) : '';
        $message = isset($input['message']) ? trim($input['message']) : '';

        $allowed_types = ['Kritik', 'Keluhan', 'Saran'];
        $allowed_categories = ['Akademik', 'Non-Akademik'];
        if (!in_array($type, $allowed_types) || !in_array($category, $allowed_categories) || strlen($message) < 10) {
            http_response_code(400);
            echo json_encode(['message' => 'Data masukan tidak valid.']);
            exit();
        }

        $stmt = $mysqli->prepare("INSERT INTO masukan (type, category, message, timestamp) VALUES (?, ?, ?, NOW())");
        $stmt->bind_param("sss", $type, $category, $message);
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['message' => 'Masukan berhasil dikirim.']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Gagal menyimpan data.']);
        }
        $stmt->close();
        break;

    case 'GET':
        // Admin only
        check_auth();
        $result = $mysqli->query("SELECT id, type, category, message, timestamp FROM masukan ORDER BY timestamp DESC");
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $row['timestamp'] = date(DATE_ATOM, strtotime($row['timestamp']));
            $data[] = $row;
        }
        echo json_encode($data);
        break;

    case 'DELETE':
        // Admin only
        check_auth();
        if ($mysqli->query("DELETE FROM masukan")) {
            echo json_encode(['message' => 'Semua data masukan telah dihapus.']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Gagal menghapus data.']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed.']);
        break;
}

$mysqli->close();
