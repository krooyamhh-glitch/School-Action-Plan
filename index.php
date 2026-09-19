<?php
/**
 * Root Entry Point for PHP Web Server
 * ระบบแผนปฏิบัติการประจำปีและจัดสรรงบประมาณโรงเรียน
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Load dashboard directly to prevent 404 or redirect issues
require_once __DIR__ . '/dashboard.php';

