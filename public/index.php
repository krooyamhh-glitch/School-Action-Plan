<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

if (!empty($_SESSION['user_id'])) {
    header('Location: /public/dashboard.php');
} else {
    header('Location: /public/login.php');
}
exit;
