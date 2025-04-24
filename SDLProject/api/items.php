<?php
require '../lib/db.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $query = "SELECT * FROM items ORDER BY created_at DESC";
        
        if (isset($_GET['search'])) {
            $search = $conn->real_escape_string($_GET['search']);
            $query = "SELECT * FROM items 
                      WHERE title LIKE '%$search%' 
                      OR description LIKE '%$search%'
                      OR location LIKE '%$search%'
                      ORDER BY created_at DESC";
        }
        
        $result = $conn->query($query);
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        echo json_encode(['success' => true, 'data' => $items]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// POST new item
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $response = ['success' => false];
        $imagePath = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = dirname(__DIR__) . '/uploads/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $allowedTypes = ['image/jpeg', 'image/png'];
            $fileType = $_FILES['image']['type'];
            
            if (in_array($fileType, $allowedTypes)) {
                $extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
                $filename = uniqid() . '.' . $extension;
                $targetPath = $uploadDir . $filename;
                
                if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                    $imagePath = 'uploads/' . $filename;
                }
            }
        }
        
        // Get form data
        $title = $conn->real_escape_string($_POST['title'] ?? '');
        $type = $conn->real_escape_string($_POST['type'] ?? '');
        $description = $conn->real_escape_string($_POST['description'] ?? '');
        $location = $conn->real_escape_string($_POST['location'] ?? '');
        $date = $conn->real_escape_string($_POST['itemDate'] ?? date('Y-m-d'));
        
        // Validate required fields
        if (empty($title) || empty($type) || empty($description)) {
            throw new Exception('Title, type, and description are required');
        }
        
        // Insert into database
        $stmt = $conn->prepare("
            INSERT INTO items 
            (title, type, description, image_url, location, date_lost_found) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->bind_param("ssssss", $title, $type, $description, $imagePath, $location, $date);
        
        if ($stmt->execute()) {
            $response = [
                'success' => true,
                'id' => $stmt->insert_id,
                'image_url' => $imagePath
            ];
        } else {
            throw new Exception('Database error: ' . $stmt->error);
        }
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage(),
            'debug' => [
                'post' => $_POST,
                'files' => $_FILES
            ]
        ]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
?>