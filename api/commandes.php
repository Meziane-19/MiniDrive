<?php
/* ============================================================
   commandes.php — Enregistrer / lister les commandes
   GET  api/commandes.php            → toutes les commandes (admin)
   POST api/commandes.php            → enregistre une commande
        body JSON: { client, email, telephone, adresse, articles, total }
   ============================================================ */
require __DIR__ . '/config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data) || empty($data['client']) || !isset($data['total'])) {
            json_out(['error' => 'Données de commande invalides'], 400);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO commandes (client, email, telephone, adresse, articles, total, statut, date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['client'],
            $data['email']      ?? '',
            $data['telephone']  ?? '',
            $data['adresse']    ?? '',
            json_encode($data['articles'] ?? [], JSON_UNESCAPED_UNICODE),
            $data['total'],
            'En attente',
            date('Y-m-d H:i:s'),
        ]);

        json_out(['success' => true, 'id' => (int) $pdo->lastInsertId()], 201);
    }

    // GET → liste des commandes
    $rows = $pdo->query('SELECT * FROM commandes ORDER BY id DESC')->fetchAll();
    foreach ($rows as &$r) {
        $r['articles'] = json_decode($r['articles'], true);
    }
    json_out($rows);

} catch (PDOException $e) {
    json_out(['error' => $e->getMessage()], 500);
}