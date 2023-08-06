/*

Envoyez l'objet suivant au format json sur le port 3000 :
{
    tirage: "tarot",// est soit "tarot" soit "dé"
    nombreDeTirage: 3,// le nombre de tirage (nombre de cartes pichés pour le tarot ou de lancé de dé)
    
    // -- pour un tirage de cartes --
    cartesMineurs: true, // mettre les cartes mineurs dans le jeu (de 1 a AS)
    atouts: true, // mettre les atouts dans le jeu
    setDeCouleurs: "moderne",// est soit "moderne" (cœur, carreau, pique, trèfle) soit "historique" (deniers, coupes, épées, bâtons)
    
    // -- pour un lancé de dé --
    nombreDeLancées: null,// le nombre de lancées de dé
    nombreDeFace: 6,
}

*/

nomMarseille = [
    "Le Fou ou Le Mat",
    "I-Le Bateleur",
    "II-La Papesse",
    "III-L'Impératrice",
    "IIII-L'Empereur",
    "V-Le Pape",
    "VI-L'Amoureux",
    "VII-Le Chariot",
    "VIII-La Justice",
    "VIIII-L'Ermite",
    "X-La Roue de Fortune",
    "XI-La Force",
    "XII-Le Pendu",
    "XIII-La Mort",
    "XIIII-Tempérance",
    "XV-Le Diable",
    "XVI-La Maison Dieu",
    "XVII-L'Étoile",
    "XVIII-La Lune",
    "XVIIII-Le Soleil",
    "XX-Le Jugement",
    "XXI-Le Monde",
]
nomTetes = ["valet", "damme", "roi", "as"]

class carte {
    constructor(couleur = "atout", position = "1") {
        this.couleur = couleur
        this.isAtout = couleur == "atout"
        this.position =
            this.isAtout || position < 11 ?
                +position :
                nomTetes[position-11]
        this.nomMarseille = (this.isAtout && this.position == 0) ?
            "Excuse" :
            this.couleur == "atout" ?
                nomMarseille[this.position] :
                this.couleur == "épées" ?
                    `${this.position} d'${this.couleur}` :
                    `${this.position} de ${this.couleur}`
        this.nomComplet = (this.isAtout && this.position == 0) ?
            "Excuse" :
            this.couleur == "atout" || this.couleur == "épées" ?
                `${this.position} d'${this.couleur}` :
                `${this.position} de ${this.couleur}`
    }
}

class jeuTarot {
    constructor(cartesMineurs = false, setDeCouleurs = "moderne", atouts = true) {
        this.cartesMineurs = cartesMineurs
        this.setDeCouleurs = setDeCouleurs
        this.setDeCartes = []
        this.cartesPiochées = []

        switch (setDeCouleurs.toLowerCase()) {
            case "moderne":
                this.couleurs = ["cœur", "carreau", "pique", "trèfle"]
                break
            case "historique":
                this.couleurs = ["deniers", "coupes", "épées", "bâtons"]
                break
            default:
                this.couleurs = ["cœur", "carreau", "pique", "trèfle"]
        }
        if (cartesMineurs) for (let couleur of this.couleurs) for (let i = 1; i < 15; i++) this.setDeCartes.push( new carte(couleur, i) )

        if (atouts) for (let i = 0; i < 21; i++) this.setDeCartes.push( new carte("atout", i) )

        this.nombreDeCartesDepart = this.setDeCartes.length
    }

    get nombreDeCartesActuel() {
        return this.setDeCartes.length
    }

    piocheCarte() {
        let numeroCartePiochée = Math.floor(Math.random() * this.nombreDeCartesActuel)
        let CartePiochée = this.setDeCartes[numeroCartePiochée]
        this.setDeCartes.splice(numeroCartePiochée, 1)
        this.cartesPiochées.push(CartePiochée)
        return CartePiochée
    }
}


/* tirage Tarot de Marseille */
var tirageDeTarot = ($data) => {
    $jeu = new jeuTarot($data.cartesMineurs, $data.setDeCouleurs, $data.atouts)
    tiragesRestant = $data.nombreDeTirage
    while(tiragesRestant-- > 0) $jeu.piocheCarte()
    return $jeu.cartesPiochées
}
/* tirage dé */
var lancéDeDés = ($data) => {
    $lancés = []
    nbLancésDeDés = $data.nombreDeLancées ?? $data.nombreDeTirage
    while(nbLancésDeDés-- > 0) $lancés.push(Math.floor(Math.random() * $data.nombreDeFace + 1))
    return $lancés
}


//      --  SERVEUR  --

const server = require('http').createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/') {

        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            console.log(body)

            $user = JSON.parse(body)

            res.writeHead(200, { 'Content-Type': 'application/json' })

            var result = {}

            result.erreur = false
            result.type = $user.tirage
            if($user.tirage == "tarot") result.resultat = tirageDeTarot($user)
            else if($user.tirage == "dé") result.resultat = tirageDeTarot($user)

            JSONresult = JSON.stringify(result)
            res.end(JSONresult)
        });

    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('ERREUR')
    }
})

server.listen(3000, () => {
    console.log('Le serveur est en cours d\'exécution sur http://localhost:3000/');
})