<?php
/**
 * ฟังก์ชันกลางสำหรับระบบแผนปฏิบัติการประจำปีและจัดสรรงบประมาณโรงเรียน
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * ป้องกัน XSS
 */
function sanitize(string $data): string {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

/**
 * สร้างและตรวจสอบ CSRF Token
 */
function generateCsrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrfToken(?string $token): bool {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], (string)$token);
}

/**
 * จัดรูปแบบตัวเลขเงินบาท
 */
function formatMoney($amount): string {
    return number_format((float)$amount, 2, '.', ',');
}

/**
 * แปลงวันที่ ค.ศ. เป็น วันที่ภาษาไทย พ.ศ.
 */
function formatThaiDate(?string $dateStr): string {
    if (!$dateStr) return '-';
    $thaiMonths = [
        1 => 'ม.ค.', 2 => 'ก.พ.', 3 => 'มี.ค.', 4 => 'เม.ย.',
        5 => 'พ.ค.', 6 => 'มิ.ย.', 7 => 'ก.ค.', 8 => 'ส.ค.',
        9 => 'ก.ย.', 10 => 'ต.ค.', 11 => 'พ.ย.', 12 => 'ธ.ค.'
    ];
    $ts = strtotime($dateStr);
    if (!$ts) return $dateStr;
    $d = date('j', $ts);
    $m = (int)date('n', $ts);
    $y = (int)date('Y', $ts) + 543;
    return "$d {$thaiMonths[$m]} $y";
}

/**
 * แปลงตัวเลขเป็นคำอ่านเงินบาทไทย
 */
function bahtText(float $number): string {
    $number = number_format($number, 2, '.', '');
    [$integer, $fraction] = explode('.', $number);
    
    $digits = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    $positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
    
    $convert = function ($numStr) use ($digits, $positions) {
        $len = strlen($numStr);
        $res = '';
        for ($i = 0; $i < $len; $i++) {
            $d = (int)$numStr[$i];
            $pos = $len - $i - 1;
            if ($d !== 0) {
                if ($pos % 6 === 1 && $d === 1 && $len > 1) {
                    $res .= 'สิบ';
                } elseif ($pos % 6 === 1 && $d === 2) {
                    $res .= 'ยี่สิบ';
                } elseif ($pos % 6 === 0 && $d === 1 && $len > 1 && $i === $len - 1) {
                    $res .= 'เอ็ด';
                } else {
                    $res .= $digits[$d] . $positions[$pos % 6];
                }
            }
            if ($pos % 6 === 0 && $pos > 0) {
                $res .= 'ล้าน';
            }
        }
        return $res;
    };

    $intPart = (int)$integer === 0 ? 'ศูนย์บาท' : $convert($integer) . 'บาท';
    $fracPart = (int)$fraction === 0 ? 'ถ้วน' : $convert($fraction) . 'สตางค์';
    return $intPart . $fracPart;
}

/**
 * ดึงข้อมูลโรงเรียน (จาก DB หรือข้อมูลเริ่มต้น)
 */
function getSchoolData(): array {
    $db = Database::getConnection();
    if ($db) {
        try {
            $stmt = $db->query("SELECT * FROM schools LIMIT 1");
            $row = $stmt->fetch();
            if ($row) return $row;
        } catch (Exception $e) {
            // fallback
        }
    }
    return [
        'id' => 1,
        'school_code' => '1040010025',
        'name' => 'โรงเรียนอนุบาลและประถมศึกษาบ้านหนองบัววิทยา',
        'address' => '124 หมู่ที่ 3 ถนนมิตรภาพ',
        'subdistrict' => 'ศิลา',
        'district' => 'เมืองขอนแก่น',
        'province' => 'ขอนแก่น',
        'zipcode' => '40000',
        'affiliation' => 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)',
        'education_area' => 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาขอนแก่น เขต 1',
        'fiscal_year' => 2568,
        'director_name' => 'ดร.สมศักดิ์ พัฒนศึกษา',
        'phone' => '043-241987',
        'email' => 'nongbua_school@obec.mail.go.th',
        'logo_url' => 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80'
    ];
}

/**
 * ดึงข้อมูลปีงบประมาณ
 */
function getFiscalYearData(): array {
    $db = Database::getConnection();
    if ($db) {
        try {
            $stmt = $db->query("SELECT * FROM fiscal_years WHERE is_active = 1 LIMIT 1");
            $row = $stmt->fetch();
            if ($row) return $row;
        } catch (Exception $e) {
            // fallback
        }
    }
    return [
        'id' => 1,
        'year' => 2568,
        'is_active' => 1,
        'start_date' => '2024-10-01',
        'end_date' => '2025-09-30',
        'total_students' => 312,
        'teacher_count' => 22
    ];
}

/**
 * ดึงข้อมูลนักเรียน
 */
function getStudentsData(): array {
    $db = Database::getConnection();
    if ($db) {
        try {
            $stmt = $db->query("SELECT * FROM students ORDER BY id ASC");
            $rows = $stmt->fetchAll();
            if (!empty($rows)) return $rows;
        } catch (Exception $e) {
            // fallback
        }
    }
    return [
        ['id' => 1, 'grade_level' => 'อนุบาล 1', 'stage' => 'อนุบาล', 'male_count' => 12, 'female_count' => 14, 'total_count' => 26],
        ['id' => 2, 'grade_level' => 'อนุบาล 2', 'stage' => 'อนุบาล', 'male_count' => 15, 'female_count' => 16, 'total_count' => 31],
        ['id' => 3, 'grade_level' => 'อนุบาล 3', 'stage' => 'อนุบาล', 'male_count' => 14, 'female_count' => 15, 'total_count' => 29],
        ['id' => 4, 'grade_level' => 'ประถมศึกษาปีที่ 1', 'stage' => 'ประถม', 'male_count' => 20, 'female_count' => 18, 'total_count' => 38],
        ['id' => 5, 'grade_level' => 'ประถมศึกษาปีที่ 2', 'stage' => 'ประถม', 'male_count' => 19, 'female_count' => 17, 'total_count' => 36],
        ['id' => 6, 'grade_level' => 'ประถมศึกษาปีที่ 3', 'stage' => 'ประถม', 'male_count' => 21, 'female_count' => 19, 'total_count' => 40],
        ['id' => 7, 'grade_level' => 'ประถมศึกษาปีที่ 4', 'stage' => 'ประถม', 'male_count' => 18, 'female_count' => 20, 'total_count' => 38],
        ['id' => 8, 'grade_level' => 'ประถมศึกษาปีที่ 5', 'stage' => 'ประถม', 'male_count' => 20, 'female_count' => 18, 'total_count' => 38],
        ['id' => 9, 'grade_level' => 'ประถมศึกษาปีที่ 6', 'stage' => 'ประถม', 'male_count' => 19, 'female_count' => 17, 'total_count' => 36],
    ];
}

/**
 * ดึงข้อมูลรายรับ
 */
function getRevenuesData(): array {
    $db = Database::getConnection();
    if ($db) {
        try {
            $stmt = $db->query("SELECT * FROM revenues ORDER BY id ASC");
            $rows = $stmt->fetchAll();
            if (!empty($rows)) return $rows;
        } catch (Exception $e) {
            // fallback
        }
    }
    return [
        ['id' => 1, 'category' => 'subsidy', 'item_name' => '1. เงินอุดหนุนรายหัว (การจัดการศึกษาขั้นพื้นฐาน)', 'rate_per_head' => 1980, 'eligible_count' => 312, 'calculated_amount' => 617760, 'note' => 'เฉลี่ยรวม อ.1-3 และ ป.1-6'],
        ['id' => 2, 'category' => 'subsidy', 'item_name' => '2. เงินอุดหนุนรายหัวส่วนเพิ่ม (Top Up) โรงเรียนคุณภาพประจำตำบล', 'rate_per_head' => 500, 'eligible_count' => 312, 'calculated_amount' => 156000, 'note' => 'สนับสนุนพัฒนาคุณภาพการศึกษา สพฐ.'],
        ['id' => 3, 'category' => 'welfare', 'item_name' => '3. ค่าหนังสือเรียน (โครงการเรียนฟรี 15 ปี)', 'rate_per_head' => 650, 'eligible_count' => 312, 'calculated_amount' => 202800, 'note' => 'จัดสรรตามเกณฑ์ระดับการศึกษา สพฐ.'],
        ['id' => 4, 'category' => 'welfare', 'item_name' => '4. ค่าเครื่องแบบนักเรียน (2 ชุด/คน/ปี)', 'rate_per_head' => 380, 'eligible_count' => 312, 'calculated_amount' => 118560, 'note' => 'อนุบาล 325 บ., ประถม 400 บ.'],
        ['id' => 5, 'category' => 'welfare', 'item_name' => '5. ค่าอุปกรณ์การเรียน (สมุด ดินสอ ยางลบ สี ไม้บรรทัด)', 'rate_per_head' => 400, 'eligible_count' => 312, 'calculated_amount' => 124800, 'note' => 'อนุบาล 290 บ./ปี, ประถม 440 บ./ปี'],
        ['id' => 6, 'category' => 'activity', 'item_name' => '6. ค่ากิจกรรมพัฒนาผู้เรียน (4 กิจกรรมหลัก สพฐ.)', 'rate_per_head' => 460, 'eligible_count' => 312, 'calculated_amount' => 143520, 'note' => 'วิชาการ, คุณธรรม, ทัศนศึกษา, เทคโนโลยี ICT'],
        ['id' => 7, 'category' => 'welfare', 'item_name' => '7. เงินปัจจัยพื้นฐานนักเรียนยากจน (กสศ. / สพฐ.)', 'rate_per_head' => 1500, 'eligible_count' => 145, 'calculated_amount' => 217500, 'note' => 'จำนวนนักเรียนที่ผ่านเกณฑ์คัดกรอง 145 คน'],
        ['id' => 8, 'category' => 'lunch', 'item_name' => '8. ค่าอาหารกลางวัน (อปท. จัดสรรผ่าน อบต./เทศบาล)', 'rate_per_head' => 4800, 'eligible_count' => 312, 'calculated_amount' => 1497600, 'note' => 'อัตรา 24 บ./วัน จำนวน 200 วันทำการ'],
        ['id' => 9, 'category' => 'fundraising', 'item_name' => '9. เงินระดมทรัพยากร / เงินบริจาค / ผ้าป่าเพื่อการศึกษา', 'rate_per_head' => 0, 'eligible_count' => 1, 'calculated_amount' => 185000, 'note' => 'ศิษย์เก่าและคณะกรรมการสถานศึกษาจัดทอดผ้าป่า'],
        ['id' => 10, 'category' => 'revenue', 'item_name' => '10. เงินรายได้สถานศึกษา (ค่าเช่าร้านค้าสหกรณ์, ดอกเบี้ย)', 'rate_per_head' => 0, 'eligible_count' => 1, 'calculated_amount' => 64000, 'note' => 'ดอกเบี้ยเงินฝากธนาคาร และเงินบำรุงสหกรณ์'],
        ['id' => 11, 'category' => 'other', 'item_name' => '11. รายรับอื่น ๆ (เงินอุดหนุนเฉพาะกิจ/โครงการพิเศษ)', 'rate_per_head' => 0, 'eligible_count' => 1, 'calculated_amount' => 50000, 'note' => 'เงินสนับสนุนจาก อบจ. โครงการส่งเสริมดนตรีพื้นบ้าน'],
    ];
}

/**
 * ดึงข้อมูลการจัดสรรงบประมาณตามฝ่าย
 */
function getBudgetAllocations(): array {
    $db = Database::getConnection();
    if ($db) {
        try {
            $stmt = $db->query("SELECT * FROM budget_allocations ORDER BY id ASC");
            $rows = $stmt->fetchAll();
            if (!empty($rows)) return $rows;
        } catch (Exception $e) {
            // fallback
        }
    }
    return [
        ['id' => 1, 'department_name' => 'ฝ่ายบริหารงานวิชาการ', 'percentage' => 60.0, 'allocated_amount' => 1050000, 'spent_amount' => 432500, 'remaining_amount' => 617500, 'color_hex' => '#2563eb', 'description' => 'พัฒนาหลักสูตร การจัดการเรียนการสอน สื่อ นวัตกรรม'],
        ['id' => 2, 'department_name' => 'ฝ่ายบริหารงานงบประมาณ', 'percentage' => 5.0, 'allocated_amount' => 87500, 'spent_amount' => 35000, 'remaining_amount' => 52500, 'color_hex' => '#0284c7', 'description' => 'การเงิน บัญชี พัสดุ สินทรัพย์ และแผนงานงบประมาณ'],
        ['id' => 3, 'department_name' => 'ฝ่ายบริหารงานบุคคล', 'percentage' => 12.0, 'allocated_amount' => 210000, 'spent_amount' => 78000, 'remaining_amount' => 132000, 'color_hex' => '#059669', 'description' => 'พัฒนาครู วินัย สวัสดิการ ทัศนศึกษาดูงาน และสรรหาบุคลากร'],
        ['id' => 4, 'department_name' => 'ฝ่ายบริหารงานทั่วไป', 'percentage' => 8.0, 'allocated_amount' => 140000, 'spent_amount' => 65400, 'remaining_amount' => 74600, 'color_hex' => '#d97706', 'description' => 'อาคารสถานที่ สิ่งแวดล้อม ประชาสัมพันธ์ และชุมชนสัมพันธ์'],
        ['id' => 5, 'department_name' => 'งบกลาง / สำรองจ่ายฉุกเฉิน', 'percentage' => 15.0, 'allocated_amount' => 262500, 'spent_amount' => 42000, 'remaining_amount' => 220500, 'color_hex' => '#7c3aed', 'description' => 'กรณีภัยพิบัติ ซ่อมแซมฉุกเฉิน และกิจกรรมที่มิได้คาดหมายล่วงหน้า'],
    ];
}

/**
 * ดึงข้อมูลโครงการ
 */
function getProjectsData(): array {
    // ตรวจสอบ session หากมีการเพิ่มโครงการใหม่
    if (!isset($_SESSION['projects'])) {
        $db = Database::getConnection();
        if ($db) {
            try {
                $stmt = $db->query("SELECT * FROM projects ORDER BY id DESC");
                $rows = $stmt->fetchAll();
                if (!empty($rows)) {
                    $_SESSION['projects'] = $rows;
                    return $rows;
                }
            } catch (Exception $e) {
                // fallback
            }
        }
        $_SESSION['projects'] = [
            [
                'id' => 1,
                'project_code' => 'กค.01/2568',
                'project_name' => 'โครงการยกระดับผลสัมฤทธิ์ทางการเรียนและการทดสอบระดับชาติ (O-NET / NT)',
                'department' => 'ฝ่ายบริหารงานวิชาการ',
                'responsible_person' => 'นางสาวกนกพร ใจมั่น',
                'allocated_budget' => 45000,
                'spent_budget' => 35000,
                'remaining_budget' => 10000,
                'status' => 'in_progress',
                'approval_status' => 'approved',
                'duration' => 'พ.ย. 2567 - ก.พ. 2568',
                'rationale' => 'เพื่อพัฒนายกระดับผลคะแนนการทดสอบ O-NET และ NT ของนักเรียนชั้น ป.3 และ ป.6 ให้สูงกว่าค่าเฉลี่ยระดับประเทศ',
            ],
            [
                'id' => 2,
                'project_code' => 'กค.02/2568',
                'project_name' => 'โครงการพัฒนาทักษะดิจิทัลและการรู้เท่าทันปัญญาประดิษฐ์ (AI Literacy) เพื่อการเรียนรู้ในศตวรรษที่ 21',
                'department' => 'ฝ่ายบริหารงานวิชาการ',
                'responsible_person' => 'นายพิเชษฐ์ ปัญญาวงศ์',
                'allocated_budget' => 40000,
                'spent_budget' => 28000,
                'remaining_budget' => 12000,
                'status' => 'in_progress',
                'approval_status' => 'approved',
                'duration' => 'ตลอดปีการศึกษา 2568',
                'rationale' => 'ส่งเสริมให้นักเรียนและครูสามารถใช้เครื่องมือ AI และเทคโนโลยีดิจิทัลในการสืบค้น การเรียนรู้ และการสร้างสรรค์ผลงานอย่างมีจริยธรรม',
            ],
            [
                'id' => 3,
                'project_code' => 'กค.03/2568',
                'project_name' => 'โครงการส่งเสริมคุณธรรม จริยธรรม และวิถีประชาธิปไตยในสถานศึกษา (โรงเรียนสุจริต)',
                'department' => 'ฝ่ายบริหารงานบุคคล',
                'responsible_person' => 'นายสมชาย วงศ์สว่าง',
                'allocated_budget' => 25000,
                'spent_budget' => 12000,
                'remaining_budget' => 13000,
                'status' => 'in_progress',
                'approval_status' => 'approved',
                'duration' => 'ตลอดปีการศึกษา 2568',
                'rationale' => 'ปลูกฝังความซื่อสัตย์สุจริต วินัย และความเป็นพลเมืองดีตามวิถีประชาธิปไตย',
            ],
            [
                'id' => 4,
                'project_code' => 'กค.04/2568',
                'project_name' => 'โครงการปรับปรุงซ่อมแซมอาคารสถานที่และพัฒนาสิ่งแวดล้อมเพื่อความปลอดภัย (Safety School)',
                'department' => 'ฝ่ายบริหารงานทั่วไป',
                'responsible_person' => 'นายอำนวย สุขเกษม',
                'allocated_budget' => 50000,
                'spent_budget' => 50000,
                'remaining_budget' => 0,
                'status' => 'completed',
                'approval_status' => 'approved',
                'duration' => 'ต.ค. 2567 - ธ.ค. 2567',
                'rationale' => 'เพื่อปรับปรุงจุดเสี่ยง ซ่อมแซมระบบไฟฟ้า ห้องน้ำ และทาสีอาคารเรียนให้มีความปลอดภัยและเอื้อต่อการเรียนรู้',
            ],
            [
                'id' => 5,
                'project_code' => 'กค.05/2568',
                'project_name' => 'โครงการพัฒนาศักยภาพครูสู่การจัดการเรียนรู้เชิงรุก (Active Learning)',
                'department' => 'ฝ่ายบริหารงานบุคคล',
                'responsible_person' => 'นางสาวกนกพร ใจมั่น',
                'allocated_budget' => 30000,
                'spent_budget' => 0,
                'remaining_budget' => 30000,
                'status' => 'not_started',
                'approval_status' => 'pending',
                'duration' => 'มี.ค. 2568 - พ.ค. 2568',
                'rationale' => 'อบรมเชิงปฏิบัติการพัฒนาครูด้านการจัดกิจกรรมการเรียนรู้แบบ Active Learning และการวัดผลประเมินผลตามสภาพจริง',
            ]
        ];
    }
    return $_SESSION['projects'];
}

