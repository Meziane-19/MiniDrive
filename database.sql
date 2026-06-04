-- ============================================================
--  MiniDrive Collection — Base de données MySQL
--  À exécuter dans MySQL (Workbench ou ligne de commande).
--  Crée la base `minidrive`, ses 3 tables, et insère le catalogue.
-- ============================================================

CREATE DATABASE IF NOT EXISTS minidrive
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE minidrive;

-- ── Nettoyage (si on relance le script) ──
DROP TABLE IF EXISTS commandes;
DROP TABLE IF EXISTS avis;
DROP TABLE IF EXISTS voitures;

-- ── Table : voitures (catalogue) ──
CREATE TABLE voitures (
  id          INT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  brand       VARCHAR(120) NOT NULL,
  model       VARCHAR(120) NOT NULL,
  year        INT,
  type        VARCHAR(60),
  scale       VARCHAR(20),
  price       DECIMAL(10,2),
  old_price   DECIMAL(10,2),
  rating      DECIMAL(2,1),
  reviews     INT,
  stock       INT,
  color       VARCHAR(120),
  maker       VARCHAR(120),
  emoji       VARCHAR(20),
  limited     TINYINT(1) DEFAULT 0,
  featured    TINYINT(1) DEFAULT 0,
  description TEXT,
  image       VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Table : avis (commentaires clients) ──
CREATE TABLE avis (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  name    VARCHAR(120) NOT NULL,
  product VARCHAR(255),
  rating  INT NOT NULL,
  text    TEXT NOT NULL,
  date    VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Table : commandes ──
CREATE TABLE commandes (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  client    VARCHAR(160) NOT NULL,
  email     VARCHAR(160),
  telephone VARCHAR(40),
  adresse   TEXT,
  articles  TEXT NOT NULL,
  total     DECIMAL(10,2) NOT NULL,
  statut    VARCHAR(40) DEFAULT 'En attente',
  date      VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Catalogue : 50 voitures ──
INSERT INTO voitures
  (id, name, brand, model, year, type, scale, price, old_price, rating, reviews, stock, color, maker, emoji, limited, featured, description, image)
VALUES
  (1,'Ferrari 250 GTO 1962','Ferrari','250 GTO',1962,'Classique','1:18',189.90,219.00,5.0,42,3,'Rouge Rosso Corsa','Bburago Signature','🏎️',1,1,'La légendaire Ferrari 250 GTO, considérée comme l''une des plus belles et précieuses voitures du monde.','ferrari-250-gto.jpg'),
  (2,'Porsche 911 RSR 2023','Porsche','911 RSR',2023,'Course','1:18',149.90,179.00,4.9,38,7,'Blanc Gulf Racing','Minichamps','🚗',0,1,'La Porsche 911 RSR engagée au Mans 2023, livrée Gulf Racing.','porsche-911-rsr.jpg'),
  (3,'Lamborghini Countach LP500S','Lamborghini','Countach LP500S',1982,'Sport','1:24',89.90,NULL,4.8,27,12,'Jaune Giallo Fly','Kyosho','🟡',0,1,'L''icône absolue des années 80, portes en ciseaux fonctionnelles.','lamborghini-countach.jpg'),
  (4,'McLaren P1 Hypercar','McLaren','P1',2015,'Sport','1:18',219.00,259.00,4.9,19,2,'Volcano Orange','AutoArt','🟠',1,0,'La McLaren P1, hybride de 916 ch, édition ultra-premium AutoArt.','mclaren-p1.jpg'),
  (5,'Bugatti Veyron 16.4 Super Sport','Bugatti','Veyron Super Sport',2010,'Sport','1:18',249.90,299.00,5.0,14,1,'Noir & Carbone','AutoArt','⚫',1,0,'Record du monde de vitesse à 431 km/h. Édition numérotée.','bugatti-veyron-ss.jpg'),
  (6,'Shelby GT500 Eleanor','Shelby','GT500 Eleanor',1967,'Classique','1:24',79.90,94.00,4.7,33,8,'Gris Argent Bandes Noires','Greenlight','🚙',0,0,'La mythique Eleanor du film 60 secondes chrono.','shelby-gt500-eleanor.jpg'),
  (7,'Dodge Charger Daytona 1969','Dodge','Charger Daytona',1969,'Course','1:24',74.90,NULL,4.6,22,5,'Orange B5 NASCAR','Racing Champions','🔶',0,0,'Symbole de la domination NASCAR de 1969, n°88 de Bobby Isaac.','dodge-charger-daytona.jpg'),
  (8,'Mercedes-AMG GT Black Series','Mercedes','AMG GT Black Series',2021,'Sport','1:18',169.90,199.00,4.8,29,6,'Gris Graphite Mat','iScale','⬛',0,0,'730 ch de V8 biturbo, ailerons actifs, splitter carbone.','mercedes-amg-gt-bs.jpg'),
  (9,'BMW M3 E30 Sport Evolution','BMW','M3 E30 Sport Evo',1990,'Course','1:43',59.90,69.00,4.7,41,15,'Blanc Alpinweiss','Spark','🔵',0,0,'Championne DTM 1989 avec Johnny Cecotto, modèle résine.','bmw-m3-e30.jpg'),
  (10,'Aston Martin DB5 James Bond','Aston Martin','DB5 007',1964,'Classique','1:18',199.90,229.00,5.0,56,4,'Silver Birch','Corgi Precision','🥈',1,0,'L''Aston Martin DB5 de James Bond dans Goldfinger, gadgets fonctionnels.','aston-martin-db5.jpg'),
  (11,'Ferrari F40 1987','Ferrari','F40',1987,'Sport','1:43',49.90,NULL,4.9,63,20,'Rouge Corsa','Bburago Heritage','🔴',0,0,'Dernière Ferrari supervisée par Enzo Ferrari. 478 ch, 324 km/h.','ferrari-f40.jpg'),
  (12,'Porsche 917K Le Mans 1970','Porsche','917K',1970,'Course','1:43',69.90,84.00,4.8,35,9,'Gulf Bleu & Orange','Spark','🏁',0,0,'Victorieuse au Mans 1970, livrée Gulf emblématique.','porsche-917k.jpg'),
  (13,'Lamborghini Huracán EVO Spyder','Lamborghini','Huracán Spyder',2022,'Sport','1:18',139.90,159.00,4.7,18,5,'Verde Mantis','Maisto SE','🟢',0,0,'Huracán Evo Spyder, toit repliable, V10 5.2L visible.','lamborghini-huracan.jpg'),
  (14,'McLaren F1 GTR 1995','McLaren','F1 GTR',1995,'Course','1:64',34.90,NULL,4.6,47,25,'Gulf Bleu & Orange','Hot Wheels Elite','🔷',0,0,'Vainqueur des 24h du Mans 1995, die-cast premium.','mclaren-f1-gtr.jpg'),
  (15,'Bugatti Chiron Super Sport 300+','Bugatti','Chiron SS 300+',2019,'Limité','1:18',299.00,349.00,5.0,8,1,'Bleu Nocturne & Carbone','Bburago Signature Gold','💙',1,0,'Première voiture de série à franchir les 490 km/h. Tirage limité.','bugatti-chiron-ss300.jpg'),
  (16,'Nissan Skyline GT-R R34 V-Spec II','Nissan','Skyline GT-R R34',2002,'Sport','1:18',119.90,NULL,4.9,25,4,'Bayside Blue','AutoArt','🚗',0,0,'Superbe miniature JDM.','Nissan Skyline GT-R R34 V-Spec II.jpg'),
  (17,'Toyota Supra MK4 A80','Toyota','Supra',1998,'Sport','1:18',109.90,NULL,4.8,30,6,'Blanc','AutoArt','🚗',0,0,'Icône de la culture japonaise.','toyota supra mk4 a80.webp'),
  (18,'Ford GT40 Mk II Le Mans','Ford','GT40',1966,'Course','1:18',149.90,NULL,5.0,40,2,'Noir','Shelby Collectibles','🏁',1,0,'Vainqueur des 24h du Mans 1966.','Ford GT40 Mk II Le Mans.webp'),
  (19,'Chevrolet Corvette C8 Stingray','Chevrolet','Corvette C8',2021,'Sport','1:18',89.90,NULL,4.7,15,8,'Rouge','Maisto','🏎️',0,0,'La première Corvette à moteur central.','Chevrolet Corvette C8 Stingray.webp'),
  (20,'Pagani Zonda Cinque','Pagani','Zonda Cinque',2009,'Sport','1:18',259.90,NULL,5.0,12,1,'Blanc et Carbone','AutoArt','🏎️',1,0,'Seulement 5 exemplaires dans le monde réel.','Pagani Zonda Cinque.webp'),
  (21,'Koenigsegg Jesko','Koenigsegg','Jesko',2020,'Sport','1:18',279.90,NULL,4.9,18,2,'Blanc','FrontiArt','🏎️',1,0,'Hypercar suédoise surpuissante.','Koenigsegg Jesko.webp'),
  (22,'Audi Sport Quattro S1','Audi','Quattro S1',1985,'Course','1:18',129.90,NULL,4.8,22,4,'Blanc et Jaune','AutoArt','🚗',0,0,'Le monstre du Groupe B en rallye.','Audi Sport Quattro S1.webp'),
  (23,'Mazda RX-7 FD3S Spirit R','Mazda','RX-7 FD3S',2002,'Sport','1:18',119.90,NULL,4.8,28,5,'Gris','AutoArt','🚗',0,0,'Le moteur rotatif ultime.','Mazda RX-7 FD3S Spirit R.webp'),
  (24,'Lancia Stratos HF','Lancia','Stratos HF',1974,'Course','1:18',139.90,NULL,4.9,20,3,'Alitalia','Kyosho','🏁',0,0,'La reine des rallyes des années 70.','Lancia Stratos HF.webp'),
  (25,'Alfa Romeo 33 Stradale','Alfa Romeo','33 Stradale',1967,'Classique','1:18',199.90,NULL,5.0,15,2,'Rouge','AutoArt','🏎️',1,0,'L''une des plus belles voitures jamais conçues.','Alfa Romeo 33 Stradale.webp'),
  (26,'Jaguar E-Type Series 1','Jaguar','E-Type',1961,'Classique','1:18',149.90,NULL,4.9,35,4,'Vert Anglais','AutoArt','🚗',0,0,'La voiture que Enzo Ferrari appelait la plus belle.','Jaguar E-Type Series 1.jpg'),
  (27,'Mercedes-Benz 300 SL Gullwing','Mercedes-Benz','300 SL',1954,'Classique','1:18',179.90,NULL,5.0,45,3,'Argent','Minichamps','🚗',1,0,'Célèbre pour ses portes papillon.','Mercedes-Benz 300 SL Gullwing.jpeg'),
  (28,'Aston Martin Valkyrie','Aston Martin','Valkyrie',2021,'Sport','1:18',299.90,NULL,4.9,10,1,'Gris','AutoArt','🏎️',1,1,'Formule 1 pour la route.','Aston Martin Valkyrie.webp'),
  (29,'Porsche Carrera GT','Porsche','Carrera GT',2004,'Sport','1:18',159.90,NULL,4.9,30,5,'Argent','AutoArt','🏎️',0,0,'V10 atmosphérique légendaire.','Porsche Carrera GT.jpg'),
  (30,'Ferrari Enzo','Ferrari','Enzo',2002,'Sport','1:18',249.90,NULL,5.0,25,2,'Rouge','Bburago','🏎️',1,0,'L''hommage ultime au fondateur.','Ferrari Enzo.jpg'),
  (31,'Lamborghini Aventador SVJ','Lamborghini','Aventador SVJ',2019,'Sport','1:18',199.90,NULL,4.8,20,4,'Vert','AutoArt','🏎️',0,0,'Le V12 poussé à l''extrême.','Lamborghini Aventador SVJ.jpg'),
  (32,'Ford Mustang Boss 429','Ford','Mustang Boss 429',1969,'Classique','1:18',129.90,NULL,4.8,32,6,'Noir','Greenlight','🚙',0,0,'Muscle car ultime avec un énorme V8.','Ford Mustang Boss 429.webp'),
  (33,'Nissan GT-R Nismo','Nissan','GT-R Nismo',2020,'Sport','1:18',149.90,NULL,4.8,24,5,'Blanc','AutoArt','🏎️',0,0,'Godzilla dans sa forme ultime.','Nissan GT-R Nismo.jpg'),
  (34,'Bugatti EB110 Super Sport','Bugatti','EB110 SS',1992,'Sport','1:18',219.90,NULL,4.9,16,2,'Bleu','AutoArt','🏎️',1,0,'La Bugatti des années 90, quadriturbo.','Bugatti EB110 Super Sport.jpg'),
  (35,'De Lorean DMC-12','De Lorean','DMC-12',1981,'Classique','1:18',89.90,NULL,4.7,40,8,'Acier brossé','AutoArt','🚗',0,0,'Célèbre machine à voyager dans le temps.','De Lorean DMC-12.jpg'),
  (36,'Maserati MC20','Maserati','MC20',2021,'Sport','1:18',139.90,NULL,4.8,14,5,'Blanc','Bburago','🏎️',0,0,'Le renouveau de Maserati avec le moteur Nettuno.','Maserati MC20.webp'),
  (37,'Lotus Evija','Lotus','Evija',2021,'Sport','1:18',189.90,NULL,4.7,10,3,'Jaune','AutoArt','🏎️',0,0,'L''hypercar électrique anglaise de 2000 ch.','Lotus Evija.webp'),
  (38,'Rimac Nevera','Rimac','Nevera',2021,'Sport','1:18',229.90,NULL,4.9,12,2,'Bleu','AutoArt','🏎️',0,0,'Monstre électrique croate qui bat tous les records.','Rimac Nevera.webp'),
  (39,'Ferrari LaFerrari','Ferrari','LaFerrari',2013,'Sport','1:18',259.90,NULL,5.0,22,2,'Rouge','Bburago','🏎️',1,0,'Hypercar hybride iconique de Maranello.','Ferrari LaFerrari.png'),
  (40,'Porsche 959','Porsche','959',1986,'Sport','1:18',169.90,NULL,4.9,26,4,'Blanc','AutoArt','🚗',0,0,'Chef d''oeuvre technologique des années 80.','Porsche 959.jpg'),
  (41,'Aston Martin One-77','Aston Martin','One-77',2009,'Sport','1:18',209.90,NULL,4.8,18,3,'Gris','AutoArt','🏎️',1,0,'Édition ultra limitée à 77 exemplaires.','Aston Martin One-77.jpg'),
  (42,'Ford GT 2017','Ford','GT',2017,'Sport','1:18',149.90,NULL,4.8,25,5,'Bleu','Maisto','🏎️',0,0,'L''héritière de la légende du Mans.','Ford GT 2017.jpg'),
  (43,'Lamborghini Sian FKP 37','Lamborghini','Sian',2020,'Sport','1:18',239.90,NULL,4.9,15,3,'Vert olive','Bburago','🏎️',1,0,'Première supercar hybride de Lamborghini.','Lamborghini Sian FKP 37.jpg'),
  (44,'Bugatti Divo','Bugatti','Divo',2019,'Sport','1:18',289.90,NULL,5.0,11,1,'Gris et Bleu','Bburago','🏎️',1,0,'Pensée pour l''agilité dans les virages.','Bugatti Divo.png'),
  (45,'McLaren Senna','McLaren','Senna',2019,'Sport','1:18',219.90,NULL,4.9,18,2,'Orange','AutoArt','🏎️',1,0,'L''hypercar ultime pour la piste, hommage à Ayrton Senna.','McLaren Senna.png'),
  (46,'Koenigsegg Agera RS','Koenigsegg','Agera RS',2015,'Sport','1:18',269.90,NULL,4.9,14,2,'Rouge et Noir','AutoArt','🏎️',1,0,'Ancienne détentrice du record mondial de vitesse.','Koenigsegg Agera RS.webp'),
  (47,'Nissan Fairlady Z (S30)','Nissan','Fairlady Z',1969,'Classique','1:18',109.90,NULL,4.8,28,6,'Orange','AutoArt','🚗',0,0,'L''une des voitures de sport japonaises les plus célèbres.','Nissan Fairlady Z (S30).jpg'),
  (48,'Honda NSX Type R','Honda','NSX Type R',1992,'Sport','1:18',139.90,NULL,4.9,25,4,'Blanc','AutoArt','🚗',0,0,'La supercar japonaise qui a défié les Ferrari.','Honda NSX Type R.webp'),
  (49,'Dodge Viper ACR','Dodge','Viper ACR',2016,'Sport','1:18',159.90,NULL,4.8,20,4,'Noir avec bandes','AutoArt','🏎️',0,0,'V10 de 8.4L, conçue pour écraser les chronos sur piste.','Dodge Viper ACR.jpg'),
  (50,'Chevrolet Camaro ZL1 1LE','Chevrolet','Camaro ZL1 1LE',2018,'Sport','1:18',119.90,NULL,4.7,24,5,'Noir','AutoArt','🏎️',0,0,'Muscle car taillée pour le circuit.','Chevrolet Camaro ZL1 1LE.jpg');