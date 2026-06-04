/* ===================================================
   MiniDrive Collection — app.js
   SQLite via sql.js (WebAssembly) + Panier + Avis
   =================================================== */

// ─── CONFIG EMAILJS ─────────────────────────────────
// 1. Crée un compte gratuit sur https://www.emailjs.com/
// 2. Remplace les 3 valeurs ci-dessous par TES propres clés
//    (Service ID, Template ID, Public Key).
// Le template doit utiliser ces variables :
//   {{to_name}} {{to_email}} {{order_total}} {{order_details}} {{order_date}}
// et avoir {{to_email}} dans son champ "To Email".
const EMAILJS_CONFIG = {
  PUBLIC_KEY:  'XvZbJe-pid9tE-Zua',
  SERVICE_ID:  'service_wf926xh',
  TEMPLATE_ID: 'template_93rjdej',
};

// Initialise EmailJS au chargement (si la librairie est présente et configurée)
(function initEmailJS() {
  if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY !== 'TA_PUBLIC_KEY') {
    emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
  }
})();

// ─── COUCHE DONNÉES ─────────────────────────────────
// Les VOITURES sont définies en dur ci-dessous (HTML/CSS/JS, pas de base).
// Seuls les AVIS et les COMMANDES sont stockés dans MySQL via l'API PHP /api/.

const API_BASE = 'api'; // chemin relatif vers le dossier de l'API PHP

let DB = null;            // drapeau : non-null = initialisé
let CARS_CACHE = [];      // catalogue (rempli en dur au chargement)
let AVIS_CACHE = [];      // avis (chargés depuis MySQL)
let COMMANDES_CACHE = []; // commandes (chargées depuis MySQL)

// ── Catalogue en dur (tableaux positionnels) ──
const CARS_DATA = [
      [1,'Ferrari 250 GTO 1962','Ferrari','250 GTO',1962,'Classique','1:18',189.90,219.00,5.0,42,3,'Rouge Rosso Corsa','Bburago Signature','🏎️',1,1,'La légendaire Ferrari 250 GTO, souvent désignée comme "la voiture la plus belle et la plus précieuse du monde". Ce modèle 1:18 reproduit chaque courbe, chaque aération et chaque détail de carrosserie avec une fidélité époustouflante. Intérieur cuir rouge, jantes filaire chromées, moteur V12 visible sous capot ouvert.','ferrari-250-gto.jpg'],
      [2,'Porsche 911 RSR 2023','Porsche','911 RSR',2023,'Course','1:18',149.90,179.00,4.9,38,7,'Blanc Gulf Racing','Minichamps','🚗',0,1,"La Porsche 911 RSR engagée au Mans 2023. Livrée officielle Gulf Oil Racing, décalcomanies imprimées (non posées), portes et capots ouvrants, suspension fonctionnelle. Un chef-d'œuvre technique à l'échelle 1:18 signé Minichamps.",'porsche-911-rsr.jpg'],
      [3,'Lamborghini Countach LP500S','Lamborghini','Countach LP500S',1982,'Sport','1:24',89.90,null,4.8,27,12,'Jaune Giallo Fly','Kyosho','🟡',0,1,"L'icône absolue des années 80 ! La Countach LP500S en jaune Giallo Fly, avec ses ailes évasées et ses prises d'air caractéristiques. Portes en ciseaux fonctionnelles, intérieur cuir noir détaillé, moteur V12 visible.",'lamborghini-countach.jpg'],
      [4,'McLaren P1 Hypercar','McLaren','P1',2015,'Sport','1:18',219.00,259.00,4.9,19,2,'Volcano Orange','AutoArt','🟠',1,0,"La McLaren P1, hybride de 916 ch, reproduite par AutoArt en édition ultra-premium. Aérofrein actif mobile, diffuseur carbone texturé, intérieur Alcantara orange, moteur bi-turbo V8 + électrique détaillé sous capot ouvert.",'mclaren-p1.jpg'],
      [5,'Bugatti Veyron 16.4 Super Sport','Bugatti','Veyron Super Sport',2010,'Sport','1:18',249.90,299.00,5.0,14,1,'Noir & Carbone','AutoArt','⚫',1,0,"Record du monde de vitesse à 431 km/h. La Bugatti Veyron Super Sport en finition noir mat et carbone visible. W16 quad-turbo visible, 10 radiateurs représentés, intérieur bicolore cuir et alcantara. Édition numérotée 1/1500.",'bugatti-veyron-ss.jpg'],
      [6,'Shelby GT500 Eleanor','Shelby','GT500 Eleanor',1967,'Classique','1:24',79.90,94.00,4.7,33,8,'Gris Argent Bandes Noires','Greenlight','🚙',0,0,"La mythique Eleanor du film '60 secondes chrono'. Muscle car américaine avec sa robe grise et ses bandes noires, roues Torq-Thrust chromées et ses jupes arrière. Moteur V8 Big-Block côté carrosserie déposable.",'shelby-gt500-eleanor.jpg'],
      [7,'Dodge Charger Daytona 1969','Dodge','Charger Daytona',1969,'Course','1:24',74.90,null,4.6,22,5,'Orange B5 NASCAR','Racing Champions','🔶',0,0,"La Dodge Charger Daytona, symbole de la domination NASCAR de 1969. Son nez profilé et son aileron arrière sont fidèlement reproduits. Numéro 88 de Bobby Isaac, champion 1969.",'dodge-charger-daytona.jpg'],
      [8,'Mercedes-AMG GT Black Series','Mercedes','AMG GT Black Series',2021,'Sport','1:18',169.90,199.00,4.8,29,6,'Gris Graphite Mat','iScale','⬛',0,0,"La Mercedes-AMG GT Black Series, 730 ch de V8 biturbo, ailerons actifs, splitter avant en carbone. Capot moteur ouvrant avec V8 ultra-détaillé à l'échelle 1:18.",'mercedes-amg-gt-bs.jpg'],
      [9,'BMW M3 E30 Sport Evolution','BMW','M3 E30 Sport Evo',1990,'Course','1:43',59.90,69.00,4.7,41,15,'Blanc Alpinweiss','Spark','🔵',0,0,"La BMW M3 E30 Sport Evolution, championne DTM 1989 avec Johnny Cecotto. À l'échelle 1:43 par Spark, modèle en résine à la finition irréprochable.",'bmw-m3-e30.jpg'],
      [10,'Aston Martin DB5 James Bond','Aston Martin','DB5 007',1964,'Classique','1:18',199.90,229.00,5.0,56,4,'Silver Birch','Corgi Precision','🥈',1,0,"L'Aston Martin DB5 de James Bond dans Goldfinger ! Mitrailleuses rétractables, siège éjectable, plaques tournantes — tous les gadgets Q sont fonctionnels. Coffret spécial 60 ans de 007.",'aston-martin-db5.jpg'],
      [11,'Ferrari F40 1987','Ferrari','F40',1987,'Sport','1:43',49.90,null,4.9,63,20,'Rouge Corsa','Bburago Heritage','🔴',0,0,"La Ferrari F40, dernière Ferrari supervisée par Enzo Ferrari. 478 ch, 324 km/h, une brutalité absolue. À l'échelle 1:43 avec sa robe rouge iconique et son becquet arrière emblématique.",'ferrari-f40.jpg'],
      [12,'Porsche 917K Le Mans 1970','Porsche','917K',1970,'Course','1:43',69.90,84.00,4.8,35,9,'Gulf Bleu & Orange','Spark','🏁',0,0,"La Porsche 917K victorieuse au Mans 1970, pilotée par Attwood & Herrmann. Livrée Gulf bleu et orange emblématique, reproduite à l'identique par Spark en résine de haute précision.",'porsche-917k.jpg'],
      [13,'Lamborghini Huracán EVO Spyder','Lamborghini','Huracán Spyder',2022,'Sport','1:18',139.90,159.00,4.7,18,5,'Verde Mantis','Maisto SE','🟢',0,0,"La Lamborghini Huracán Evo Spyder en vert Mantis métallisé. Toit repliable, V10 5.2L visible, intérieur biplace cuir noir et vert. Suspension fonctionnelle 4 roues directrices.",'lamborghini-huracan.jpg'],
      [14,'McLaren F1 GTR 1995','McLaren','F1 GTR',1995,'Course','1:64',34.90,null,4.6,47,25,'Gulf Bleu & Orange','Hot Wheels Elite','🔷',0,0,"La McLaren F1 GTR vainqueur des 24h du Mans 1995 à l'échelle 1:64. Série Hot Wheels Elite en die-cast zinc, finition premium, livraison en blister collector.",'mclaren-f1-gtr.jpg'],
      [15,'Bugatti Chiron Super Sport 300+','Bugatti','Chiron SS 300+',2019,'Limité','1:18',299.00,349.00,5.0,8,1,'Bleu Nocturne & Carbone','Bburago Signature Gold','💙',1,0,"La Bugatti Chiron Super Sport 300+, première voiture de série à franchir les 490 km/h. Tirage limité à 30 exemplaires 1:18. Carrosserie die-cast zinc, finition bicolore bleu nuit et carbone. Certificat d'authenticité numéroté.",'bugatti-chiron-ss300.jpg'],
      [16,'Nissan Skyline GT-R R34 V-Spec II','Nissan','Skyline GT-R R34',2002,'Sport','1:18',119.90,null,4.9,25,4,'Bayside Blue','AutoArt','🚗',0,0,'Superbe miniature JDM.','Nissan Skyline GT-R R34 V-Spec II.jpg'],
      [17,'Toyota Supra MK4 A80','Toyota','Supra',1998,'Sport','1:18',109.90,null,4.8,30,6,'Blanc','AutoArt','🚗',0,0,'Icône de la culture japonaise.','toyota supra mk4 a80.webp'],
      [18,'Ford GT40 Mk II Le Mans','Ford','GT40',1966,'Course','1:18',149.90,null,5.0,40,2,'Noir','Shelby Collectibles','🏁',1,0,'Vainqueur des 24h du Mans 1966.','Ford GT40 Mk II Le Mans.webp'],
      [19,'Chevrolet Corvette C8 Stingray','Chevrolet','Corvette C8',2021,'Sport','1:18',89.90,null,4.7,15,8,'Rouge','Maisto','🏎️',0,0,'La première Corvette à moteur central.','Chevrolet Corvette C8 Stingray.webp'],
      [20,'Pagani Zonda Cinque','Pagani','Zonda Cinque',2009,'Sport','1:18',259.90,null,5.0,12,1,'Blanc et Carbone','AutoArt','🏎️',1,0,'Seulement 5 exemplaires dans le monde réel.','Pagani Zonda Cinque.webp'],
      [21,'Koenigsegg Jesko','Koenigsegg','Jesko',2020,'Sport','1:18',279.90,null,4.9,18,2,'Blanc','FrontiArt','🏎️',1,0,'Hypercar suédoise surpuissante.','Koenigsegg Jesko.webp'],
      [22,'Audi Sport Quattro S1','Audi','Quattro S1',1985,'Course','1:18',129.90,null,4.8,22,4,'Blanc et Jaune','AutoArt','🚗',0,0,'Le monstre du Groupe B en rallye.','Audi Sport Quattro S1.webp'],
      [23,'Mazda RX-7 FD3S Spirit R','Mazda','RX-7 FD3S',2002,'Sport','1:18',119.90,null,4.8,28,5,'Gris','AutoArt','🚗',0,0,'Le moteur rotatif ultime.','Mazda RX-7 FD3S Spirit R.webp'],
      [24,'Lancia Stratos HF','Lancia','Stratos HF',1974,'Course','1:18',139.90,null,4.9,20,3,'Alitalia','Kyosho','🏁',0,0,'La reine des rallyes des années 70.','Lancia Stratos HF.webp'],
      [25,'Alfa Romeo 33 Stradale','Alfa Romeo','33 Stradale',1967,'Classique','1:18',199.90,null,5.0,15,2,'Rouge','AutoArt','🏎️',1,0,"L'une des plus belles voitures jamais conçues.",'Alfa Romeo 33 Stradale.webp'],
      [26,'Jaguar E-Type Series 1','Jaguar','E-Type',1961,'Classique','1:18',149.90,null,4.9,35,4,'Vert Anglais','AutoArt','🚗',0,0,'La voiture que Enzo Ferrari appelait "la plus belle".','Jaguar E-Type Series 1.jpg'],
      [27,'Mercedes-Benz 300 SL Gullwing','Mercedes-Benz','300 SL',1954,'Classique','1:18',179.90,null,5.0,45,3,'Argent','Minichamps','🚗',1,0,'Célèbre pour ses portes papillon.','Mercedes-Benz 300 SL Gullwing.jpeg'],
      [28,'Aston Martin Valkyrie','Aston Martin','Valkyrie',2021,'Sport','1:18',299.90,null,4.9,10,1,'Gris','AutoArt','🏎️',1,1,'Formule 1 pour la route.','Aston Martin Valkyrie.webp'],
      [29,'Porsche Carrera GT','Porsche','Carrera GT',2004,'Sport','1:18',159.90,null,4.9,30,5,'Argent','AutoArt','🏎️',0,0,'V10 atmosphérique légendaire.','Porsche Carrera GT.jpg'],
      [30,'Ferrari Enzo','Ferrari','Enzo',2002,'Sport','1:18',249.90,null,5.0,25,2,'Rouge','Bburago','🏎️',1,0,"L'hommage ultime au fondateur.",'Ferrari Enzo.jpg'],
      [31,'Lamborghini Aventador SVJ','Lamborghini','Aventador SVJ',2019,'Sport','1:18',199.90,null,4.8,20,4,'Vert','AutoArt','🏎️',0,0,"Le V12 poussé à l'extrême.",'Lamborghini Aventador SVJ.jpg'],
      [32,'Ford Mustang Boss 429','Ford','Mustang Boss 429',1969,'Classique','1:18',129.90,null,4.8,32,6,'Noir','Greenlight','🚙',0,0,'Muscle car ultime avec un énorme V8.','Ford Mustang Boss 429.webp'],
      [33,'Nissan GT-R Nismo','Nissan','GT-R Nismo',2020,'Sport','1:18',149.90,null,4.8,24,5,'Blanc','AutoArt','🏎️',0,0,'Godzilla dans sa forme ultime.','Nissan GT-R Nismo.jpg'],
      [34,'Bugatti EB110 Super Sport','Bugatti','EB110 SS',1992,'Sport','1:18',219.90,null,4.9,16,2,'Bleu','AutoArt','🏎️',1,0,'La Bugatti des années 90, quadriturbo.','Bugatti EB110 Super Sport.jpg'],
      [35,'De Lorean DMC-12','De Lorean','DMC-12',1981,'Classique','1:18',89.90,null,4.7,40,8,'Acier brossé','AutoArt','🚗',0,0,'Célèbre machine à voyager dans le temps.','De Lorean DMC-12.jpg'],
      [36,'Maserati MC20','Maserati','MC20',2021,'Sport','1:18',139.90,null,4.8,14,5,'Blanc','Bburago','🏎️',0,0,'Le renouveau de Maserati avec le moteur Nettuno.','Maserati MC20.webp'],
      [37,'Lotus Evija','Lotus','Evija',2021,'Sport','1:18',189.90,null,4.7,10,3,'Jaune','AutoArt','🏎️',0,0,"L'hypercar électrique anglaise de 2000 ch.",'Lotus Evija.webp'],
      [38,'Rimac Nevera','Rimac','Nevera',2021,'Sport','1:18',229.90,null,4.9,12,2,'Bleu','AutoArt','🏎️',0,0,'Monstre électrique croate qui bat tous les records.','Rimac Nevera.webp'],
      [39,'Ferrari LaFerrari','Ferrari','LaFerrari',2013,'Sport','1:18',259.90,null,5.0,22,2,'Rouge','Bburago','🏎️',1,0,'Hypercar hybride iconique de Maranello.','Ferrari LaFerrari.png'],
      [40,'Porsche 959','Porsche','959',1986,'Sport','1:18',169.90,null,4.9,26,4,'Blanc','AutoArt','🚗',0,0,"Chef d'oeuvre technologique des années 80.",'Porsche 959.jpg'],
      [41,'Aston Martin One-77','Aston Martin','One-77',2009,'Sport','1:18',209.90,null,4.8,18,3,'Gris','AutoArt','🏎️',1,0,'Édition ultra limitée à 77 exemplaires.','Aston Martin One-77.jpg'],
      [42,'Ford GT 2017','Ford','GT',2017,'Sport','1:18',149.90,null,4.8,25,5,'Bleu','Maisto','🏎️',0,0,"L'héritière de la légende du Mans.",'Ford GT 2017.jpg'],
      [43,'Lamborghini Sian FKP 37','Lamborghini','Sian',2020,'Sport','1:18',239.90,null,4.9,15,3,'Vert olive','Bburago','🏎️',1,0,'Première supercar hybride de Lamborghini.','Lamborghini Sian FKP 37.jpg'],
      [44,'Bugatti Divo','Bugatti','Divo',2019,'Sport','1:18',289.90,null,5.0,11,1,'Gris et Bleu','Bburago','🏎️',1,0,"Pensée pour l'agilité dans les virages.",'Bugatti Divo.png'],
      [45,'McLaren Senna','McLaren','Senna',2019,'Sport','1:18',219.90,null,4.9,18,2,'Orange','AutoArt','🏎️',1,0,"L'hypercar ultime pour la piste, en hommage à Ayrton Senna.",'McLaren Senna.png'],
      [46,'Koenigsegg Agera RS','Koenigsegg','Agera RS',2015,'Sport','1:18',269.90,null,4.9,14,2,'Rouge et Noir','AutoArt','🏎️',1,0,'Ancienne détentrice du record mondial de vitesse.','Koenigsegg Agera RS.webp'],
      [47,'Nissan Fairlady Z (S30)','Nissan','Fairlady Z',1969,'Classique','1:18',109.90,null,4.8,28,6,'Orange','AutoArt','🚗',0,0,"L'une des voitures de sport japonaises les plus célèbres.",'Nissan Fairlady Z (S30).jpg'],
      [48,'Honda NSX Type R','Honda','NSX Type R',1992,'Sport','1:18',139.90,null,4.9,25,4,'Blanc','AutoArt','🚗',0,0,'La supercar japonaise qui a défié les Ferrari.','Honda NSX Type R.webp'],
      [49,'Dodge Viper ACR','Dodge','Viper ACR',2016,'Sport','1:18',159.90,null,4.8,20,4,'Noir avec bandes','AutoArt','🏎️',0,0,'V10 de 8.4L, conçue pour écraser les chronos sur piste.','Dodge Viper ACR.jpg'],
      [50,'Chevrolet Camaro ZL1 1LE','Chevrolet','Camaro ZL1 1LE',2018,'Sport','1:18',119.90,null,4.7,24,5,'Noir','AutoArt','🏎️',0,0,'Muscle car taillée pour le circuit.','Chevrolet Camaro ZL1 1LE.jpg']
];

// Convertit un tableau positionnel en objet voiture
function rowToCar(row) {
  return {
    id:          row[0],
    name:        row[1],
    brand:       row[2],
    model:       row[3],
    year:        row[4],
    type:        row[5],
    scale:       row[6],
    price:       row[7],
    oldPrice:    row[8],
    rating:      row[9],
    reviews:     row[10],
    stock:       row[11],
    color:       row[12],
    maker:       row[13],
    emoji:       row[14],
    limited:     !!row[15],
    featured:    !!row[16],
    description: row[17],
    image:       row[18] || null,
  };
}

// Remplit le cache des voitures immédiatement (synchrone)
CARS_CACHE = CARS_DATA.map(rowToCar);

async function initDB() {
  if (DB) return DB;

  // Les voitures sont déjà chargées (en dur). On ne récupère depuis MySQL
  // que les avis et les commandes.
  try {
    const [avisRes, cmdRes] = await Promise.all([
      fetch(`${API_BASE}/avis.php`),
      fetch(`${API_BASE}/commandes.php`),
    ]);
    const avisJson = await avisRes.json();
    AVIS_CACHE = Array.isArray(avisJson) ? avisJson : [];
    const cmdJson = await cmdRes.json();
    COMMANDES_CACHE = Array.isArray(cmdJson) ? cmdJson : [];
  } catch (e) {
    // Si le serveur PHP n'est pas lancé, le catalogue marche quand même ;
    // seuls avis/commandes seront vides.
    console.warn('API MySQL injoignable (avis/commandes vides) :', e);
  }

  DB = true;
  return DB;
}

// ─── REQUÊTES VOITURES (lecture depuis le cache mémoire) ──

function queryCars(filters = {}) {
  const { brand, scale, type, search, maxPrice, sortBy } = filters;
  let list = CARS_CACHE.slice();

  if (brand === 'other') {
    const mainBrands = ['Ferrari', 'Porsche', 'Lamborghini', 'McLaren', 'Bugatti', 'Shelby', 'Dodge', 'Mercedes', 'BMW', 'Aston Martin'];
    list = list.filter(c => !mainBrands.includes(c.brand));
  } else if (brand && brand !== 'all') {
    list = list.filter(c => c.brand === brand);
  }
  if (scale && scale !== 'all') list = list.filter(c => c.scale === scale);
  if (type  && type  !== 'all') list = list.filter(c => c.type  === type);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.brand.toLowerCase().includes(q) ||
      c.model.toLowerCase().includes(q));
  }
  if (maxPrice) list = list.filter(c => c.price <= maxPrice);

  const sorters = {
    'price-asc':   (a, b) => a.price - b.price,
    'price-desc':  (a, b) => b.price - a.price,
    'name-asc':    (a, b) => a.name.localeCompare(b.name),
    'name-desc':   (a, b) => b.name.localeCompare(a.name),
    'year-desc':   (a, b) => b.year - a.year,
    'year-asc':    (a, b) => a.year - b.year,
    'rating-desc': (a, b) => b.rating - a.rating,
  };
  list.sort(sorters[sortBy] || ((a, b) => a.id - b.id));
  return list;
}

function queryFeatured() {
  return CARS_CACHE.filter(c => c.featured).slice(0, 4);
}

function queryCarById(id) {
  return CARS_CACHE.find(c => c.id === Number(id)) || null;
}

function queryAllCarsForSelect() {
  return CARS_CACHE
    .map(c => ({ id: c.id, name: c.name, emoji: c.emoji }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ─── REQUÊTES AVIS ──────────────────────────────────

function queryAllAvis() {
  // Plus récents d'abord
  return AVIS_CACHE.slice().sort((a, b) => b.id - a.id);
}

function insertAvis(avis) {
  const date = new Date().toISOString();
  // Mise à jour immédiate du cache (affichage instantané)
  const optimistic = {
    id: (AVIS_CACHE.reduce((m, a) => Math.max(m, a.id), 0) + 1),
    name: avis.name, product: avis.product, rating: avis.rating, text: avis.text, date,
  };
  AVIS_CACHE.push(optimistic);
  // Envoi vers MySQL via l'API
  fetch(`${API_BASE}/avis.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: avis.name, product: avis.product, rating: avis.rating, text: avis.text }),
  })
  .then(r => r.json())
  .then(res => { if (res && res.id) optimistic.id = res.id; })
  .catch(err => console.error('insertAvis API:', err));
}

// ─── REQUÊTES COMMANDES ─────────────────────────────

function queryAllCommandes() {
  return COMMANDES_CACHE.slice().sort((a, b) => b.id - a.id);
}

function insertCommande(commande) {
  const date = new Date().toISOString();
  const optimistic = {
    id: (COMMANDES_CACHE.reduce((m, c) => Math.max(m, c.id), 0) + 1),
    client: commande.client,
    email: commande.email || '',
    telephone: commande.telephone || '',
    adresse: commande.adresse || '',
    articles: commande.articles,
    total: commande.total,
    statut: 'En attente',
    date,
  };
  COMMANDES_CACHE.push(optimistic);
  // Envoi vers MySQL via l'API
  fetch(`${API_BASE}/commandes.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client: commande.client,
      email: commande.email || '',
      telephone: commande.telephone || '',
      adresse: commande.adresse || '',
      articles: commande.articles,
      total: commande.total,
    }),
  })
  .then(r => r.json())
  .then(res => { if (res && res.id) optimistic.id = res.id; })
  .catch(err => console.error('insertCommande API:', err));
}

// ─── PANIER (localStorage) ──────────────────────────
const CART_KEY = 'minidrive_cart';

function getCart()       { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function saveCart(cart)  { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function addToCart(id) {
  const car = queryCarById(id);
  if (!car) return;
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    if (existing.qty < car.stock) existing.qty++;
    else { showToast('Stock maximum atteint pour ce modèle.', 'error'); return; }
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart(cart);
  updateCartUI();
  showToast(`${car.emoji} ${car.name} ajouté au panier !`, 'success');
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
  updateCartUI();
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const car = queryCarById(id);
  item.qty = Math.max(0, Math.min(item.qty + delta, car ? car.stock : 99));
  if (item.qty === 0) return removeFromCart(id);
  saveCart(cart);
  updateCartUI();
}

window.currentPromoCode = '';

function applyPromoCode() {
  const code = document.getElementById('promoCodeInput').value.trim().toUpperCase();
  if (code === 'MINI10') {
    window.currentPromoCode = 'MINI10';
    showToast('Code promo appliqué ! -10%', 'success');
  } else {
    window.currentPromoCode = '';
    if (code !== '') showToast('Code promo invalide', 'error');
  }
  updateCartUI();
}

function updateCartUI() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#cartCount').forEach(el => { el.textContent = total; });

  const itemsEl  = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  if (!itemsEl) return;

  if (!cart.length) {
    itemsEl.innerHTML = `<div class="cart-empty"><div class="empty-icon">🛒</div><p>Votre panier est vide</p></div>`;
    if (footerEl) footerEl.innerHTML = '';
    return;
  }

  const totalPrice = cart.reduce((s, i) => {
    const car = queryCarById(i.id);
    return s + (car ? car.price * i.qty : 0);
  }, 0);

  let discount = 0;
  if (window.currentPromoCode === 'MINI10') {
    discount = totalPrice * 0.10;
  }
  const finalPrice = totalPrice - discount;

  itemsEl.innerHTML = cart.map(item => {
    const car = queryCarById(item.id);
    if (!car) return '';
    const wishlist = getWishlist();
    const isFav = wishlist.includes(car.id);
    const favIcon = isFav ? '♥' : '♡';
    const favClass = isFav ? 'active' : '';

    return `<div class="cart-item">
      <span class="cart-item-emoji">${car.emoji}</span>
      <div class="cart-item-info">
        <div class="cart-item-name">${car.name}</div>
        <div class="cart-item-price">${car.price.toFixed(2)}€</div>
      </div>
      <div class="cart-item-actions" style="display: flex; align-items: center; gap: 10px;">
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${car.id}, -1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${car.id}, 1)">+</button>
        </div>
        <button class="cart-wishlist-btn ${favClass}" onclick="toggleWishlist(event, ${car.id})" title="Favoris" style="border: none; background: transparent; font-size: 1.5rem; cursor: pointer; color: ${isFav ? 'var(--or)' : 'var(--text-muted)'}; transition: color 0.3s; padding: 0 5px;">${favIcon}</button>
      </div>
    </div>`;
  }).join('');

  if (footerEl) {
    let promoHtml = `
      <div class="promo-code-section" style="margin-bottom: 15px; display: flex; gap: 10px;">
        <input type="text" id="promoCodeInput" placeholder="Code promo" style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid var(--border); background: rgba(255,255,255,0.03); color: var(--creme); font-size: 0.9rem;" value="${window.currentPromoCode || ''}">
        <button onclick="applyPromoCode()" style="padding: 10px 15px; background: var(--or-dark); border: none; border-radius: 6px; color: var(--noir); cursor: pointer; font-weight: bold; transition: opacity 0.3s;">Appliquer</button>
      </div>
    `;

    let totalHtml = `
      <div class="cart-total" style="margin-bottom: 5px; font-size: 0.9rem;">
        <span>Sous-total</span>
        <span class="total-amount" style="font-size: 1.1rem;">${totalPrice.toFixed(2)}€</span>
      </div>
    `;

    if (discount > 0) {
      totalHtml += `
        <div class="cart-total" style="margin-bottom: 5px; color: #5a5; font-size: 0.9rem;">
          <span>Remise (MINI10)</span>
          <span class="total-amount" style="font-size: 1.1rem; color: #5a5;">- ${discount.toFixed(2)}€</span>
        </div>
        <div class="cart-total" style="font-weight: bold; border-top: 1px solid var(--border); padding-top: 10px; margin-top: 10px; margin-bottom: 1.2rem;">
          <span>Total</span>
          <span class="total-amount">${finalPrice.toFixed(2)}€</span>
        </div>
      `;
    } else {
      totalHtml = `
        <div class="cart-total" style="font-weight: bold; margin-top: 10px; margin-bottom: 1.2rem;">
          <span>Total</span>
          <span class="total-amount">${totalPrice.toFixed(2)}€</span>
        </div>
      `;
    }

    footerEl.innerHTML = promoHtml + totalHtml + `
      <button class="btn-checkout" onclick="openCheckoutModal()">
        💳 Commander
      </button>`;
  }
}

// ─── WISHLIST (localStorage) ────────────────────────
const WISH_KEY = 'minidrive_wishlist';
function getWishlist() { try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; } catch { return []; } }

function toggleWishlist(e, id) {
  e.stopPropagation();
  const btn = e.currentTarget;
  const list = getWishlist();
  const idx  = list.indexOf(id);
  if (idx === -1) {
    list.push(id);
    btn.textContent = '♥';
    btn.classList.add('active');
    showToast('Ajouté aux favoris ❤️', 'success');
  } else {
    list.splice(idx, 1);
    btn.textContent = '♡';
    btn.classList.remove('active');
    showToast('Retiré des favoris', 'success');
  }
  localStorage.setItem(WISH_KEY, JSON.stringify(list));
  
  if (document.getElementById('cartViewFavoris') && document.getElementById('cartViewFavoris').style.display !== 'none') {
    updateFavUI();
  }
}

// ─── GESTION ONGLETS PANIER / FAVORIS ─────────────────
function switchCartTab(tab) {
  const tabPanier = document.getElementById('tabPanier');
  const tabFavoris = document.getElementById('tabFavoris');
  const viewPanier = document.getElementById('cartViewPanier');
  const viewFavoris = document.getElementById('cartViewFavoris');
  const title = document.getElementById('cartModalTitle');

  if (tab === 'panier') {
    tabPanier.classList.add('active');
    tabFavoris.classList.remove('active');
    viewPanier.style.display = 'flex';
    viewFavoris.style.display = 'none';
    title.textContent = '🛒 Mon Panier';
  } else {
    tabFavoris.classList.add('active');
    tabPanier.classList.remove('active');
    viewFavoris.style.display = 'flex';
    viewPanier.style.display = 'none';
    title.textContent = '❤️ Mes Favoris';
    updateFavUI();
  }
}

function updateFavUI() {
  const container = document.getElementById('favItems');
  if (!container) return;
  const list = getWishlist();
  
  if (list.length === 0) {
    container.innerHTML = `
      <div style="padding:2rem;text-align:center;color:#888;">
        <div style="font-size:3rem;margin-bottom:1rem;">💔</div>
        Aucun favori pour le moment.
      </div>
    `;
    return;
  }

  const inClause = list.map(() => '?').join(',');
  const stmt = DB.prepare(`SELECT id, name, price, image, emoji FROM voitures WHERE id IN (${inClause})`);
  stmt.bind(list);

  let html = '';
  while (stmt.step()) {
    const car = stmt.getAsObject();
    const imgSrc = car.image ? `images/${car.image}` : '';
    html += `
      <div class="cart-item">
        <div class="cart-item-img">
          ${car.image ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"> <span style="display:none;font-size:2.5rem;line-height:60px;text-align:center;">${car.emoji}</span>` : `<span style="font-size:2.5rem;line-height:60px;text-align:center;">${car.emoji}</span>`}
        </div>
        <div class="cart-item-info">
          <h4 style="font-family:'Georgia',serif;color:var(--creme);font-size:1.1rem;margin-bottom:0.2rem;">${car.name}</h4>
          <p class="price" style="color:var(--or);font-weight:600;">${car.price.toFixed(2)}€</p>
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <button class="btn-add-cart" style="padding: 6px 12px; font-size: 0.85rem;" onclick="addToCart(${car.id})">🛒 Ajouter</button>
          <button class="cart-item-remove" onclick="removeFavoris(${car.id})" title="Retirer des favoris">✕</button>
        </div>
      </div>
    `;
  }
  stmt.free();
  container.innerHTML = html;
}

function removeFavoris(id) {
  const list = getWishlist();
  const idx = list.indexOf(id);
  if (idx !== -1) {
    list.splice(idx, 1);
    localStorage.setItem(WISH_KEY, JSON.stringify(list));
    showToast('Retiré des favoris', 'success');
    updateFavUI();
    
    // Mettre à jour les icônes coeur sur la page
    const buttons = document.querySelectorAll(`.card-wishlist[data-id="${id}"]`);
    buttons.forEach(btn => {
      btn.textContent = '♡';
      btn.classList.remove('active');
    });
  }
}

// ─── RENDU CARTE VOITURE ────────────────────────────
// PNG dans images/<nom>, fallback emoji si fichier absent.
function buildCard(car) {
  const stars = Array.from({length: 5}, (_, i) =>
    `<span class="star${i < Math.floor(car.rating) ? '' : ' empty'}">★</span>`
  ).join('');

  const mediaHtml = car.image
    ? `<img
         src="images/${car.image}"
         alt="${car.name}"
         class="car-card-img"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
       />
       <div class="car-emoji" style="display:none">${car.emoji}</div>`
    : `<div class="car-emoji">${car.emoji}</div>`;

  return `<div class="car-card" data-id="${car.id}">
    <div class="card-image-wrap">
      <span class="card-brand-badge">${car.brand}</span>
      <span class="card-scale-badge">${car.scale}</span>
      ${mediaHtml}
      <button class="card-wishlist" data-id="${car.id}" onclick="toggleWishlist(event, ${car.id})">♡</button>
    </div>
    <div class="card-body">
      <div class="card-name">${car.name}</div>
      <div class="card-meta">
        <span class="card-year">${car.year}</span>
        <span class="card-dot"></span>
        <span class="card-model">${car.model}</span>
        ${car.limited ? '<span class="card-dot"></span><span class="card-model" style="color:var(--or)">Limité</span>' : ''}
      </div>
      <p class="card-desc">${car.description}</p>
      <div class="card-stars">${stars}<span class="star-count">(${car.reviews})</span></div>
      <div class="card-footer">
        <div class="card-price">
          ${car.oldPrice ? `<span class="price-original">${car.oldPrice.toFixed(2)}€</span>` : ''}
          <span class="price-current">${car.price.toFixed(2)}€</span>
        </div>
        <button class="btn-add-cart" onclick="addToCart(${car.id})">🛒 Ajouter</button>
      </div>
    </div>
  </div>`;
}

function setupCardEvents(container) {
  const wishlist = getWishlist();
  container.querySelectorAll('.card-wishlist').forEach(btn => {
    if (wishlist.includes(parseInt(btn.dataset.id))) {
      btn.textContent = '♥';
      btn.classList.add('active');
    }
  });
}

// ─── PANIER MODAL ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const cartBtn     = document.getElementById('cartBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose   = document.getElementById('cartClose');

  const closeCart = () => { cartOverlay.classList.remove('open'); document.body.style.overflow = ''; };

  if (cartBtn)     cartBtn.addEventListener('click', () => { cartOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; updateCartUI(); });
  if (cartClose)   cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', e => { if (e.target === cartOverlay) closeCart(); });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
});

// ─── MODAL COMMANDE ─────────────────────────────────

function openCheckoutModal() {
  const cart = getCart();
  if (!cart.length) return;

  // Calcul total
  const totalPrice = cart.reduce((s, i) => {
    const car = queryCarById(i.id);
    return s + (car ? car.price * i.qty : 0);
  }, 0);

  let discount = 0;
  if (window.currentPromoCode === 'MINI10') {
    discount = totalPrice * 0.10;
  }
  const finalPrice = totalPrice - discount;

  // Résumé articles
  let articlesHtml = cart.map(item => {
    const car = queryCarById(item.id);
    if (!car) return '';
    return `<div class="checkout-article">
      <span>${car.emoji} ${car.name} × ${item.qty}</span>
      <span>${(car.price * item.qty).toFixed(2)} €</span>
    </div>`;
  }).join('');
  
  if (discount > 0) {
    articlesHtml += `<div class="checkout-article" style="color: #5a5;">
      <span>Code promo (MINI10)</span>
      <span>- ${discount.toFixed(2)} €</span>
    </div>`;
  }

  // Injecter le modal dans le DOM
  let modal = document.getElementById('checkoutModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'checkoutModal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="checkout-overlay" id="checkoutOverlay">
      <div class="checkout-panel">
        <div class="checkout-header">
          <h2>📋 Finaliser la commande</h2>
          <button class="btn-close" onclick="closeCheckoutModal()">✕</button>
        </div>
        <div class="checkout-body">

          <div class="checkout-summary">
            <div class="checkout-summary-title">Récapitulatif</div>
            ${articlesHtml}
            <div class="checkout-total-line">
              <span>Total</span>
              <span class="checkout-total-val">${finalPrice.toFixed(2)} €</span>
            </div>
          </div>

          <div class="checkout-form">
            <div class="checkout-form-title">Vos informations</div>

            <div class="form-group">
              <label class="form-label">Nom complet *</label>
              <input type="text" class="form-input" id="co-name" placeholder="Jean Dupont" />
            </div>
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input type="email" class="form-input" id="co-email" placeholder="jean@email.com" />
            </div>
            <div class="form-group">
              <label class="form-label">Téléphone</label>
              <input type="tel" class="form-input" id="co-tel" placeholder="06 XX XX XX XX" />
            </div>
            <div class="form-group">
              <label class="form-label">Adresse de livraison *</label>
              <textarea class="form-textarea" id="co-adresse" placeholder="12 Rue des Artisans, 69001 Lyon" style="min-height:70px"></textarea>
            </div>

            <button class="btn-submit-avis" id="btnConfirmOrder" onclick="confirmOrder(${finalPrice.toFixed(2)})">
              ✅ Confirmer la commande
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
  modal.querySelector('#checkoutOverlay').addEventListener('click', e => {
    if (e.target.id === 'checkoutOverlay') closeCheckoutModal();
  });
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.innerHTML = '';
  document.body.style.overflow = '';
}

// ─── VALIDATION HELPERS ─────────────────────────────
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
function validatePhone(phone) {
  if (!phone) return true; // facultatif
  const cleaned = phone.replace(/[\s\-\.]/g, '');
  return /^(\+33|0033)?[0-9]{9,10}$/.test(cleaned);
}
function setInputFeedback(id, isValid) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = isValid ? '#5a5' : '#e55';
  el.style.background  = isValid ? 'rgba(80,200,80,0.05)' : 'rgba(255,80,80,0.05)';
}
function clearInputFeedback(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = '';
  el.style.background  = '';
}

// Live feedback sur les champs commande
document.addEventListener('DOMContentLoaded', () => {
  ['co-name','co-email','co-tel','co-adresse'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => clearInputFeedback(id));
  });
});

// ─── ENVOI E-MAIL DE CONFIRMATION (EmailJS) ─────────
// Envoie un e-mail récapitulatif au client. Asynchrone : n'empêche
// jamais l'enregistrement de la commande même si l'envoi échoue.
function sendOrderEmail({ name, email, articles, total }) {
  // Si EmailJS n'est pas chargé ou pas encore configuré, on n'envoie rien.
  if (typeof emailjs === 'undefined' || EMAILJS_CONFIG.PUBLIC_KEY === 'TA_PUBLIC_KEY') {
    console.warn('EmailJS non configuré : e-mail de confirmation non envoyé.');
    return;
  }

  const orderDetails = articles
    .map(a => `${a.name} × ${a.qty} — ${(a.prix * a.qty).toFixed(2)} €`)
    .join('\n');

  const params = {
    to_name:       name,
    to_email:      email,
    order_total:   `${Number(total).toFixed(2)} €`,
    order_details: orderDetails,
    order_date:    new Date().toLocaleString('fr-FR'),
  };

  console.log('📤 Envoi EmailJS avec params:', params);

  emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, params)
    .then(()  => showToast('📧 E-mail de confirmation envoyé à ' + email, 'success'))
    .catch(err => {
      // Affiche le détail complet de l'erreur EmailJS (status + message)
      console.error('❌ Échec envoi e-mail — status:', err && err.status, '| message:', err && err.text);
      console.error('Objet erreur complet:', JSON.stringify(err));
      showToast("⚠️ La commande est enregistrée, mais l'e-mail n'a pas pu être envoyé.", 'error');
    });
}

function confirmOrder(total) {
  const name    = document.getElementById('co-name').value.trim();
  const email   = document.getElementById('co-email').value.trim();
  const tel     = document.getElementById('co-tel').value.trim();
  const adresse = document.getElementById('co-adresse').value.trim();

  let hasError = false;
  if (!name) {
    setInputFeedback('co-name', false);
    showToast('⚠️ Veuillez entrer votre nom.', 'error');
    hasError = true;
  }
  if (!validateEmail(email)) {
    setInputFeedback('co-email', false);
    showToast('⚠️ Adresse email invalide (ex: jean@email.com).', 'error');
    hasError = true;
  }
  if (tel && !validatePhone(tel)) {
    setInputFeedback('co-tel', false);
    showToast('⚠️ Numéro de téléphone invalide (ex: 06 12 34 56 78).', 'error');
    hasError = true;
  }
  if (!adresse) {
    setInputFeedback('co-adresse', false);
    showToast('⚠️ Veuillez entrer votre adresse de livraison.', 'error');
    hasError = true;
  }
  if (hasError) return;

  const cart     = getCart();
  const articles = cart.map(item => {
    const car = queryCarById(item.id);
    return { id: item.id, name: car ? car.name : '', qty: item.qty, prix: car ? car.price : 0 };
  });

  insertCommande({ client: name, email, telephone: tel, adresse, articles, total });

  // Envoyer l'e-mail de confirmation au client (asynchrone, ne bloque pas)
  sendOrderEmail({ name, email, articles, total });

  // Vider le panier
  saveCart([]);
  updateCartUI();
  closeCheckoutModal();

  // Fermer le panneau panier
  const overlay = document.getElementById('cartOverlay');
  if (overlay) overlay.classList.remove('open');

  showToast('🎉 Commande enregistrée ! Nous vous contactons sous 24h.', 'success');
}

// ─── TOAST ──────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✅' : '⚠️'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2900);
}
