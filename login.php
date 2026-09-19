<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$school = getSchoolData();
$error = null;

// Handle quick login or form post
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    // Allow quick logins
    if ($username === 'admin') {
        $_SESSION['user_id'] = 1;
        $_SESSION['username'] = 'admin';
        $_SESSION['full_name'] = 'นายพิเชษฐ์ ปัญญาวงศ์';
        $_SESSION['user_role'] = 'admin';
        header('Location: dashboard.php');
        exit;
    } elseif ($username === 'director') {
        $_SESSION['user_id'] = 2;
        $_SESSION['username'] = 'director';
        $_SESSION['full_name'] = 'ดร.สมศักดิ์ พัฒนศึกษา';
        $_SESSION['user_role'] = 'director';
        header('Location: dashboard.php');
        exit;
    } elseif ($username === 'teacher') {
        $_SESSION['user_id'] = 3;
        $_SESSION['username'] = 'teacher';
        $_SESSION['full_name'] = 'นางสาวกนกพร ใจมั่น';
        $_SESSION['user_role'] = 'teacher';
        header('Location: dashboard.php');
        exit;
    } else {
        $error = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (ทดสอบเข้าสู่ระบบโดยกดปุ่มด่วนด้านล่างได้)';
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>เข้าสู่ระบบ - <?= htmlspecialchars($school['name']) ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>body { font-family: 'Sarabun', sans-serif; }</style>
</head>
<body class="bg-slate-100 min-h-screen flex items-center justify-center p-4">

    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-slate-200">
        <div class="text-center mb-6">
            <img src="<?= htmlspecialchars($school['logo_url']) ?>" alt="Logo" class="w-16 h-16 rounded-xl mx-auto mb-3 object-cover shadow-xs border border-slate-200">
            <h1 class="text-lg font-bold text-slate-900 leading-snug"><?= htmlspecialchars($school['name']) ?></h1>
            <p class="text-xs text-slate-500 mt-1">ระบบแผนปฏิบัติการประจำปีและจัดสรรงบประมาณ</p>
        </div>

        <?php if ($error): ?>
            <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <form method="POST" class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อผู้ใช้งาน</label>
                <input type="text" name="username" class="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" value="admin" required>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">รหัสผ่าน</label>
                <input type="password" name="password" class="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" value="123456" required>
            </div>

            <button type="submit" class="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all">
                เข้าสู่ระบบ
            </button>
        </form>

        <!-- Quick Demo Accounts -->
        <div class="mt-6 pt-6 border-t border-slate-100 text-center">
            <span class="text-xs font-semibold text-slate-500 block mb-3">เข้าสู่ระบบด่วน (สำหรับทดสอบ):</span>
            <div class="grid grid-cols-3 gap-2">
                <form method="POST">
                    <input type="hidden" name="username" value="admin">
                    <input type="hidden" name="password" value="123456">
                    <button type="submit" class="w-full py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold rounded-lg transition-colors border border-blue-200">
                        ผู้ดูแลระบบ
                    </button>
                </form>
                <form method="POST">
                    <input type="hidden" name="username" value="director">
                    <input type="hidden" name="password" value="123456">
                    <button type="submit" class="w-full py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold rounded-lg transition-colors border border-purple-200">
                        ผู้อำนวยการ
                    </button>
                </form>
                <form method="POST">
                    <input type="hidden" name="username" value="teacher">
                    <input type="hidden" name="password" value="123456">
                    <button type="submit" class="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg transition-colors border border-emerald-200">
                        ครูผู้สอน
                    </button>
                </form>
            </div>
        </div>
    </div>

</body>
</html>
