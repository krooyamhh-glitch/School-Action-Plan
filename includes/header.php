<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/functions.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Auto demo login if not logged in (to ensure immediate access on any PHP server)
if (empty($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 1;
    $_SESSION['username'] = 'admin';
    $_SESSION['full_name'] = 'นายพิเชษฐ์ ปัญญาวงศ์ (หัวหน้างานแผนงาน)';
    $_SESSION['user_role'] = 'admin';
    $_SESSION['school_id'] = 1;
    $_SESSION['fiscal_year_id'] = 1;
}

$school = getSchoolData();
$fiscalYear = getFiscalYearData();
$currentPage = basename($_SERVER['PHP_SELF'], '.php');
$isDbConnected = Database::isConnected();
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle ?? 'ระบบแผนปฏิบัติการประจำปีและจัดสรรงบประมาณโรงเรียน') ?> - <?= htmlspecialchars($school['name']) ?></title>
    
    <!-- Google Fonts: Sarabun -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Sarabun', 'sans-serif'],
                    },
                    colors: {
                        primary: {
                            50: '#eff6ff',
                            100: '#dbeafe',
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8',
                            800: '#1e40af',
                            900: '#1e3a8a',
                        }
                    }
                }
            }
        }
    </script>
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        body { font-family: 'Sarabun', sans-serif; }
        @media print {
            .no-print { display: none !important; }
            .printable-area { width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; }
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col">

    <!-- Top Navigation Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
        <div class="px-4 sm:px-6 py-2.5 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button id="mobile-menu-btn" type="button" class="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                    <i data-lucide="menu" class="w-5 h-5"></i>
                </button>
                <div class="flex items-center gap-3">
                    <img src="<?= htmlspecialchars($school['logo_url']) ?>" alt="Logo" class="w-9 h-9 rounded-lg object-cover border border-slate-200 shadow-xs">
                    <div>
                        <h1 class="text-sm font-bold text-slate-900 leading-tight"><?= htmlspecialchars($school['name']) ?></h1>
                        <p class="text-xs text-slate-500 hidden sm:block"><?= htmlspecialchars($school['affiliation']) ?> • ปีงบประมาณ <?= $fiscalYear['year'] ?></p>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <!-- Fiscal Year Badge -->
                <div class="hidden md:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
                    <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                    <span>ปีงบประมาณ พ.ศ. <?= $fiscalYear['year'] ?></span>
                </div>

                <!-- Database Status Badge -->
                <?php if ($isDbConnected): ?>
                    <span class="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200" title="เชื่อมต่อฐานข้อมูล MySQL แล้ว">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span class="hidden md:inline">MySQL Online</span>
                    </span>
                <?php else: ?>
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200" title="ทำงานในโหมดสาธิต (สามารถตั้งค่า config/database.php เพื่อเชื่อมต่อ MySQL)">
                        <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span class="hidden md:inline">Demo Mode</span>
                    </span>
                <?php endif; ?>

                <!-- User Profile -->
                <div class="flex items-center gap-2 pl-2 border-l border-slate-200">
                    <div class="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                        <?= mb_substr($_SESSION['username'] ?? 'A', 0, 1, 'UTF-8') ?>
                    </div>
                    <div class="text-left hidden lg:block">
                        <div class="text-xs font-bold text-slate-800"><?= htmlspecialchars($_SESSION['username'] ?? 'admin') ?></div>
                        <div class="text-[10px] text-slate-500"><?= htmlspecialchars($_SESSION['user_role'] ?? 'ผู้ดูแลระบบ') ?></div>
                    </div>
                    <a href="logout.php" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg" title="ออกจากระบบ">
                        <i data-lucide="log-out" class="w-4 h-4"></i>
                    </a>
                </div>
            </div>
        </div>

        <!-- Offline/Demo Notice banner if MySQL is not connected -->
        <?php if (!$isDbConnected): ?>
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between no-print">
            <div class="flex items-center gap-2">
                <i data-lucide="info" class="w-4 h-4 text-amber-600 shrink-0"></i>
                <span>ระบบกำลังทำงานในโหมดสาธิต (ไม่จำเป็นต้องมี MySQL ก็ใช้งานได้ทันที) หากต้องการเชื่อมต่อฐานข้อมูล ให้สร้างฐานข้อมูล นำเข้า <code>database/schema.sql</code> และแก้ <code>config/database.php</code></span>
            </div>
            <a href="settings.php" class="underline font-semibold hover:text-amber-950 shrink-0 ml-2">ดูวิธีตั้งค่า DB</a>
        </div>
        <?php endif; ?>
    </header>

    <div class="flex-1 flex flex-col lg:flex-row">
