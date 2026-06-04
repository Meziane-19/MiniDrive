<?php
/* ============================================================
   avis.php — Enregistrer / lister les avis clients
   GET  api/avis.php                 → tous les avis
   POST api/avis.php                 → enregistre un avis
        body JSON: { name, product, rating, text }
   ============================================================ */
require __DIR__ . '/config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data) || empty($data['name']) || empty($data['text']) || !isset($data['rating'])) {
            json_out(['error' => 'Avis invalide'], 400);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO avis (name, product, rating, text, date) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['name'],
            $data['product'] ?? '',
            (int) $data['rating'],
            $data['text'],
            date('Y-m-d H:i:s'),
        ]);

        json_out(['success' => true, 'id' => (int) $pdo->lastInsertId()], 201);
    }

    // GET → liste des avis
    $rows = $pdo->query('SELECT * FROM avis ORDER BY id DESC')->fetchAll();
    json_out($rows);

} catch (PDOException $e) {
    json_out(['error' => $e->getMessage()], 500);
}