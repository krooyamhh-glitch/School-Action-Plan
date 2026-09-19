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
function formatMoney(float|int $amount): string {
    return number_format($amount, 2, '.', ',');
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
