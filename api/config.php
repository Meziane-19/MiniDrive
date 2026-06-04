<?php
/* ============================================================
   config.php — Connexion à la base MySQL (PDO)
   Inclus par tous les autres fichiers de l'API.
   ============================================================ */

// ── Paramètres de connexion (adapte si besoin) ──
$DB_HOST = '127.0.0.1';
$DB_PORT = '3306';
$DB_NAME = 'minidrive';
$DB_USER = 'root';
$DB_PASS = 'votre_mot_de_passe'; // ← À REMPLACER par votre mot de passe MySQL local

// ── En-têtes : autorise le front à appeler l'API + réponses JSON ──
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Les navigateurs envoient une requête OPTIONS avant un POST : on répond OK.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Connexion PDO ──
try {
    $dsn = "mysql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME;charset=utf8mb4";
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Connexion MySQL échouée : ' . $e->getMessage()]);
    exit;
}

// ── Petit utilitaire pour renvoyer du JSON et stopper ──
function json_out($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}