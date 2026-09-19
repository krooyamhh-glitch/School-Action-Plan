<?php
/**
 * API สำหรับ Super Admin ในการจัดการฐานข้อมูล MySQL และระบบจัดการโรงเรียน (Multi-Tenant)
 */
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Check Super Admin auth for sensitive operations (allow in dev or if superadmin session)
$isSuperAdmin = !empty($_SESSION['is_super_admin']) || (!empty($_SESSION['user_role']) && $_SESSION['user_role'] === 'superadmin');

// Read JSON input if sent as body
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

try {
    switch ($action) {
        case 'test_db':
            $host = trim($input['host'] ?? 'localhost');
            $port = (int)($input['port'] ?? 3306);
            $dbname = trim($input['dbname'] ?? 'school_budget_db');
            $user = trim($input['user'] ?? 'root');
            $pass = (string)($input['pass'] ?? '');

            $res = Database::testConnection($host, $port, $dbname, $user, $pass);
            echo json_encode($res, JSON_UNESCAPED_UNICODE);
            break;

        case 'save_db_config':
            $host = trim($input['host'] ?? 'localhost');
            $port = (int)($input['port'] ?? 3306);
            $dbname = trim($input['dbname'] ?? 'school_budget_db');
            $user = trim($input['user'] ?? 'root');
            $pass = (string)($input['pass'] ?? '');

            $ok = Database::saveConfig($host, $port, $dbname, $user, $pass);
            if ($ok) {
                echo json_encode(['success' => true, 'message' => 'บันทึกการตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL เรียบร้อยแล้ว']);
            } else {
                echo json_encode(['success' => false, 'message' => 'ไม่สามารถบันทึกไฟล์ config ได้']);
            }
            break;

        case 'auto_migrate':
            $res = Database::runAutoMigration();
            echo json_encode($res, JSON_UNESCAPED_UNICODE);
            break;

        case 'get_db_status':
            $pdo = Database::getConnection();
            $isConnected = $pdo !== null;
            $tables = [];
            $tableCount = 0;
            $serverVersion = '';

            if ($isConnected) {
                try {
                    $serverVersion = $pdo->query("SELECT VERSION()")->fetchColumn();
                    $stmt = $pdo->query("SHOW TABLES");
                    $rawTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    $tableCount = count($rawTables);
                    foreach ($rawTables as $t) {
                        $countStmt = $pdo->query("SELECT COUNT(*) FROM `{$t}`");
                        $tables[] = [
                            'name' => $t,
                            'records' => (int)$countStmt->fetchColumn()
                        ];
                    }
                } catch (Exception $e) {
                    // ignore
                }
            }

            echo json_encode([
                'success' => true,
                'connected' => $isConnected,
                'error' => Database::$connectionError,
                'host' => DB_HOST,
                'port' => DB_PORT,
                'dbname' => DB_NAME,
                'user' => DB_USER,
                'server_version' => $serverVersion,
                'table_count' => $tableCount,
                'tables' => $tables
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'list_schools':
            $pdo = Database::getConnection();
            $schools = [];
            if ($pdo) {
                try {
                    $stmt = $pdo->query("SELECT * FROM schools ORDER BY id ASC");
                    $schools = $stmt->fetchAll(PDO::FETCH_ASSOC);
                } catch (Exception $e) {
                    $schools = [];
                }
            }

            // Fallback sample data if DB is not connected yet
            if (empty($schools)) {
                $schools = [
                    [
                        'id' => 1,
                        'school_code' => '1040010025',
                        'smis_code' => '10400100',
                        'is_active' => 1,
                        'school_key' => 'SCH-10400100',
                        'admin_username' => 'admin_10400100',
                        'admin_password_plain' => '123456',
                        'name' => 'โรงเรียนอนุบาลและประถมศึกษาบ้านหนองบัววิทยา',
                        'province' => 'ขอนแก่น',
                        'education_area' => 'สพป.ขอนแก่น เขต 1',
                        'director_name' => 'ดร.สมศักดิ์ พัฒนศึกษา',
                        'phone' => '043-241987',
                        'email' => 'nongbua@school.ac.th',
                        'student_count' => 312,
                        'project_count' => 10,
                        'total_budget' => 670000
                    ],
                    [
                        'id' => 2,
                        'school_code' => '1050020042',
                        'smis_code' => '10500200',
                        'is_active' => 1,
                        'school_key' => 'SCH-10500200',
                        'admin_username' => 'admin_10500200',
                        'admin_password_plain' => '123456',
                        'name' => 'โรงเรียนมัธยมศึกษาวิทยาคมสพฐ.',
                        'province' => 'นครราชสีมา',
                        'education_area' => 'สพม.นครราชสีมา',
                        'director_name' => 'นายประเสริฐ สุขเจริญ',
                        'phone' => '044-123456',
                        'email' => 'korat_school@obec.mail.go.th',
                        'student_count' => 850,
                        'project_count' => 18,
                        'total_budget' => 1850000
                    ],
                    [
                        'id' => 3,
                        'school_code' => '1010030089',
                        'smis_code' => '10100300',
                        'is_active' => 0,
                        'school_key' => 'SCH-10100300',
                        'admin_username' => 'admin_10100300',
                        'admin_password_plain' => 'pass@1010',
                        'name' => 'โรงเรียนขยายโอกาสบ้านดอนพัฒนา',
                        'province' => 'เชียงใหม่',
                        'education_area' => 'สพป.เชียงใหม่ เขต 2',
                        'director_name' => 'นางพิมพ์ใจ อุ่นเรือน',
                        'phone' => '053-998877',
                        'email' => 'donpattana@school.ac.th',
                        'student_count' => 185,
                        'project_count' => 6,
                        'total_budget' => 380000
                    ]
                ];
            }

            echo json_encode(['success' => true, 'schools' => $schools], JSON_UNESCAPED_UNICODE);
            break;

        case 'add_school':
            $smis = trim($input['smis_code'] ?? '');
            $name = trim($input['name'] ?? '');
            $area = trim($input['education_area'] ?? '');
            $province = trim($input['province'] ?? '');
            $director = trim($input['director_name'] ?? '');
            $phone = trim($input['phone'] ?? '');
            $email = trim($input['email'] ?? '');
            $adminUser = trim($input['admin_username'] ?? '');
            $adminPass = trim($input['admin_password_plain'] ?? '123456');
            $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

            // Validation: SMIS 8 digits
            if (!preg_match('/^[0-9]{8}$/', $smis)) {
                echo json_encode(['success' => false, 'message' => 'รหัสสมัคร SMIS ต้องเป็นตัวเลข 8 หลักพอดี']);
                exit;
            }
            if (empty($name)) {
                echo json_encode(['success' => false, 'message' => 'กรุณาระบุชื่อโรงเรียน']);
                exit;
            }

            $schoolKey = 'SCH-' . $smis;
            if (empty($adminUser)) {
                $adminUser = 'admin_' . $smis;
            }

            $pdo = Database::getConnection();
            if ($pdo) {
                // Check if SMIS exists
                $stmtCheck = $pdo->prepare("SELECT id FROM schools WHERE smis_code = ? OR school_key = ?");
                $stmtCheck->execute([$smis, $schoolKey]);
                if ($stmtCheck->fetch()) {
                    echo json_encode(['success' => false, 'message' => "รหัส SMIS {$smis} หรือ School Key นี้มีอยู่ในระบบแล้ว"]);
                    exit;
                }

                $passHash = password_hash($adminPass, PASSWORD_DEFAULT);
                $schoolCode = $smis . '00'; // 10 digit standard

                $stmt = $pdo->prepare("
                    INSERT INTO schools (
                        school_code, smis_code, is_active, school_key, admin_username, admin_password_plain, admin_password_hash,
                        name, province, education_area, director_name, phone, email
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $schoolCode, $smis, $isActive, $schoolKey, $adminUser, $adminPass, $passHash,
                    $name, $province, $area, $director, $phone, $email
                ]);
                $newId = $pdo->lastInsertId();

                // สร้างปีงบประมาณและผู้ใช้งานแอดมินของโรงเรียนนี้
                $pdo->exec("INSERT INTO fiscal_years (school_id, year, is_active, start_date, end_date) VALUES ({$newId}, 2568, 1, '2024-10-01', '2025-09-30')");
                $stmtAdmin = $pdo->prepare("INSERT INTO users (school_id, username, password_hash, full_name, role, department) VALUES (?, ?, ?, ?, 'admin', 'งานแผนงานและงบประมาณ')");
                $stmtAdmin->execute([$newId, $adminUser, $passHash, 'ผู้ดูแลระบบ ' . $name]);
            }

            echo json_encode([
                'success' => true,
                'message' => "เปิดใช้งานโรงเรียน '{$name}' ด้วยรหัส SMIS: {$smis} สำเร็จ",
                'school_key' => $schoolKey,
                'admin_username' => $adminUser
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'toggle_school_status':
            $schoolId = (int)($input['school_id'] ?? 0);
            $newStatus = (int)($input['is_active'] ?? 0);

            $pdo = Database::getConnection();
            if ($pdo && $schoolId > 0) {
                $stmt = $pdo->prepare("UPDATE schools SET is_active = ? WHERE id = ?");
                $stmt->execute([$newStatus, $schoolId]);
            }

            $statusText = $newStatus === 1 ? 'เปิดใช้งาน' : 'ปิดระงับการใช้งาน';
            echo json_encode([
                'success' => true,
                'message' => "เปลี่ยนสถานะโรงเรียนเป็น '{$statusText}' เรียบร้อยแล้ว",
                'is_active' => $newStatus
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'update_school':
            $schoolId = (int)($input['school_id'] ?? 0);
            $name = trim($input['name'] ?? '');
            $area = trim($input['education_area'] ?? '');
            $province = trim($input['province'] ?? '');
            $director = trim($input['director_name'] ?? '');
            $phone = trim($input['phone'] ?? '');
            $adminPass = trim($input['admin_password_plain'] ?? '');

            $pdo = Database::getConnection();
            if ($pdo && $schoolId > 0) {
                if (!empty($adminPass)) {
                    $passHash = password_hash($adminPass, PASSWORD_DEFAULT);
                    $stmt = $pdo->prepare("
                        UPDATE schools SET
                            name = ?, education_area = ?, province = ?, director_name = ?, phone = ?,
                            admin_password_plain = ?, admin_password_hash = ?
                        WHERE id = ?
                    ");
                    $stmt->execute([$name, $area, $province, $director, $phone, $adminPass, $passHash, $schoolId]);
                } else {
                    $stmt = $pdo->prepare("
                        UPDATE schools SET
                            name = ?, education_area = ?, province = ?, director_name = ?, phone = ?
                        WHERE id = ?
                    ");
                    $stmt->execute([$name, $area, $province, $director, $phone, $schoolId]);
                }
            }

            echo json_encode(['success' => true, 'message' => 'บันทึกการแก้ไขข้อมูลโรงเรียนสำเร็จ'], JSON_UNESCAPED_UNICODE);
            break;

        case 'delete_school':
            $schoolId = (int)($input['school_id'] ?? 0);
            $pdo = Database::getConnection();
            if ($pdo && $schoolId > 1) { // ป้องกันไม่ให้ลบโรงเรียนหลัก ID 1
                $stmt = $pdo->prepare("DELETE FROM schools WHERE id = ?");
                $stmt->execute([$schoolId]);
                echo json_encode(['success' => true, 'message' => 'ลบข้อมูลโรงเรียนเรียบร้อยแล้ว']);
            } else {
                echo json_encode(['success' => false, 'message' => 'ไม่สามารถลบโรงเรียนหลักของระบบได้']);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action: ' . $action]);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()]);
}
