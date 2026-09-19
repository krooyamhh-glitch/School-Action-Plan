<?php
/**
 * Root Entry Point for PHP Web Server
 * ระบบแผนปฏิบัติการประจำปีและจัดสรรงบประมาณโรงเรียน
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Redirect to dashboard
header('Location: dashboard.php');
exit;
