import React, { useState } from 'react';
import { 
  X, 
  DownloadCloud, 
  FileCode, 
  Copy, 
  Check, 
  Server, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface PhpPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhpPackageModal: React.FC<PhpPackageModalProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<string>('cpanel_guide');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const files: Record<string, { title: string; filename: string; content: string }> = {
    cpanel_guide: {
      title: '📖 คู่มือติดตั้งบน cPanel / Web Hosting',
      filename: 'INSTALL_CPANEL.txt',
      content: `========================================================================
คู่มือการติดตั้งระบบแผนปฏิบัติการและงบประมาณโรงเรียน บน Web Hosting (cPanel)
========================================================================

1. ความต้องการของระบบ:
   - PHP 8.0, 8.1, 8.2 หรือ 8.3
   - MySQL 5.7 / 8.0 หรือ MariaDB 10.4+
   - รองรับ Apache / LiteSpeed / Nginx
   - PHP Extensions: pdo, pdo_mysql, mbstring, json, session

2. ขั้นตอนการติดตั้งบน cPanel:
   ขั้นตอนที่ 1: เข้า cPanel -> File Manager
   ขั้นตอนที่ 2: อัปโหลดและแตกไฟล์ ZIP ลงในโฟลเดอร์ public_html หรือ Subdomain
   ขั้นตอนที่ 3: ไปที่เมนู "MySQL® Databases"
                - สร้าง Database ใหม่ เช่น "school_budget_db"
                - สร้าง User และ Password
                - Add User to Database และติ๊กเลือก "ALL PRIVILEGES"
   ขั้นตอนที่ 4: ไปที่เมนู "phpMyAdmin"
                - เลือก Database ที่เพิ่งสร้าง
                - คลิกแท็บ "Import" -> นำเข้าไฟล์ database/schema.sql
                - นำเข้าไฟล์ database/seed.sql (ข้อมูลเริ่มต้น)
   ขั้นตอนที่ 5: แก้ไขไฟล์ config/database.php:
                define('DB_HOST', 'localhost');
                define('DB_NAME', 'ชื่อ_database_ที่สร้าง');
                define('DB_USER', 'ชื่อ_user_ที่สร้าง');
                define('DB_PASS', 'รหัสผ่าน');
   ขั้นตอนที่ 6: เปิดเว็บบราวเซอร์ เข้าสู่ URL ของคุณ เช่น https://yourschool.ac.th
                เข้าสู่ระบบด้วย Username: admin / Password: 123456
`,
    },
    schema_sql: {
      title: '🗄️ โครงสร้างฐานข้อมูล (schema.sql)',
      filename: 'database/schema.sql',
      content: `-- Schema SQL สำหรับ MySQL / MariaDB (utf8mb4)
CREATE TABLE IF NOT EXISTS schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    school_code VARCHAR(50) NOT NULL UNIQUE,
    address TEXT,
    subdistrict VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100),
    zipcode VARCHAR(20),
    affiliation VARCHAR(255) NOT NULL,
    education_area VARCHAR(255) NOT NULL,
    director_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fiscal_years (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    year INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active TINYINT(1) DEFAULT 0,
    teacher_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- (ดูไฟล์เต็มใน /database/schema.sql)`,
    },
    config_db: {
      title: '⚙️ ไฟล์เชื่อมต่อฐานข้อมูล (config/database.php)',
      filename: 'config/database.php',
      content: `<?php
/**
 * การตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL สำหรับ Web Hosting / cPanel
 */

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'school_budget_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_PORT', getenv('DB_PORT') ?: 3306);
define('DB_CHARSET', 'utf8mb4');

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                die("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล: " . $e->getMessage());
            }
        }
        return self::$instance;
    }
}`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFile].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const f = files[activeFile];
    const blob = new Blob([f.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = f.filename.split('/').pop() || 'file.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                แพ็กเกจการติดตั้งสำหรับ cPanel & PHP 8.x + MySQL
              </h3>
              <p className="text-xs text-slate-300">
                ไฟล์ซอร์สโค้ดและคำแนะนำสำหรับติดตั้งบน Web Hosting ทั่วไป
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          {Object.entries(files).map(([k, item]) => (
            <button
              key={k}
              type="button"
              onClick={() => setActiveFile(k)}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeFile === k
                  ? 'border-blue-600 bg-white text-blue-900 shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Code / Content Viewer */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 font-mono text-xs text-slate-200 custom-scrollbar">
          <pre className="whitespace-pre-wrap">{files[activeFile].content}</pre>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500">
            ไฟล์: <code>{files[activeFile].filename}</code>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-xs font-semibold text-white transition-colors"
            >
              <DownloadCloud className="h-4 w-4" />
              <span>ดาวน์โหลดไฟล์นี้</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
