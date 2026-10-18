// Het leertraject: lessen in vaste volgorde, van eenvoudig naar complex.
//
// Notatie in teksten: {{Nf3}} wordt getoond als zet met stukfiguurtje (♘f3).
// Elke les: uitleg (blokken), voorbeelden (stap voor stap), oefeningen en een korte literatuurverwijzing.
// Alle stellingen en zetten worden gecontroleerd door tools/check_lessons.mjs.

export const PARTS = [
    {id: "basis", title: "Deel 1 · Basis", sub: "Materiaal, veiligheid en de eerste matten"},
    {id: "tactiek", title: "Deel 2 · Tactische motieven", sub: "De wapens waarmee partijen beslist worden"},
    {id: "denken", title: "Deel 3 · Denken en openen", sub: "Een vaste denkroutine en een gezonde opening"},
    {id: "eindspel", title: "Deel 4 · Eindspel", sub: "De technieken die elke schaker moet beheersen"},
]

export const LESSONS = [
    // ───────────── Deel 1 ─────────────
    {
        id: "waarde",
        part: "basis",
        title: "Wat zijn de stukken waard?",
        goal: "Je kunt ruilen beoordelen met de puntentelling 1-3-3-5-9.",
        uitleg: [
            {p: "Schaakstukken hebben geen vaste prijs, maar een vuistregel helpt enorm bij beslissingen. Bijna alle lesmethodes beginnen ermee:"},
            {table: [["Pion", "1"], ["Paard", "3"], ["Loper", "3"], ["Toren", "5"], ["Dame", "9"], ["Koning", "onbetaalbaar"]]},
            {p: "Bij elke slagzet tel je: <b>wat krijg ik, en wat kan ik terug verliezen?</b> Een paard (3) slaan met je dame (9) is alleen goed als het paard niet gedekt is. Anders verlies je 9 punten en win je er 3."},
            {rule: "Sla met het goedkoopste stuk dat kan, en tel altijd de terugslag mee."},
        ],
        voorbeelden: [{
            fen: "4k3/8/4p3/3n4/2P5/8/8/3QK3 w - - 0 1",
            intro: "Het zwarte paard op d5 wordt gedekt door de pion op e6. Wit kan het paard op twee manieren slaan.",
            arrows: [["d1", "d5", "danger"], ["c4", "d5", "success"]],
            steps: [
                {san: "cxd5", text: "Wit slaat met de <b>pion</b> (1 punt). Rood was {{Qxd5}}: dan slaat zwart terug met {{exd5}} en verliest wit zijn dame (9) voor een paard (3)."},
                {san: "exd5", text: "Zwart slaat terug. Balans: wit won een paard (3) en verloor een pion (1). Netto <b>+2</b> voor wit."},
            ],
        }],
        literatuur: "Vrijwel elk beginnersboek, van de Stappenmethode tot Seirawans <i>Winning Chess</i>-reeks, start met deze puntentelling.",
        oefeningen: {puzzles: {themes: ["hangingPiece"], min: 400, max: 900, count: 5}},
    },
    {
        id: "veilig",
        part: "basis",
        title: "Is het veilig? Aanvallers en verdedigers tellen",
        goal: "Je ziet of een stuk of pion verloren gaat door aanvallers en verdedigers te tellen.",
        uitleg: [
            {p: "De meeste partijen op jouw niveau worden niet beslist door diepe combinaties, maar door <b>stukken die zomaar weggegeven worden</b>. De Amerikaanse schaakleraar Dan Heisman noemt de vraag \"Is het veilig?\" daarom de belangrijkste vraag van elke zet."},
            {p: "Tel bij een stuk hoeveel vijandelijke stukken het aanvallen en hoeveel eigen stukken het verdedigen. Zijn er <b>meer aanvallers dan verdedigers</b>, dan gaat het stuk meestal verloren. Let ook op de waarde: een verdediger die duurder is dan wat hij beschermt, slaat liever niet terug."},
            {rule: "Voor je een zet doet: staat het stuk op het nieuwe veld veilig? En staat alles wat achterblijft nog gedekt?"},
        ],
        voorbeelden: [{
            fen: "6k1/8/2n5/4p3/8/5N2/8/4R1K1 w - - 0 1",
            intro: "De pion op e5 wordt <b>twee keer</b> aangevallen (paard f3 en toren e1) en maar <b>één keer</b> verdedigd (paard c6).",
            arrows: [["f3", "e5", "danger"], ["e1", "e5", "danger"], ["c6", "e5", "success"]],
            steps: [
                {san: "Nxe5", text: "Wit slaat met het paard: +1."},
                {san: "Nxe5", text: "Zwart slaat terug: het witte paard (3) is weg."},
                {san: "Rxe5", text: "Wit slaat opnieuw. Wit won pion + paard (4) en verloor een paard (3). <b>Twee aanvallers tegen één verdediger: de pion valt.</b>"},
            ],
        }],
        literatuur: "Dan Heisman, <i>The Improving Chess Thinker</i> en zijn columns \"Novice Nook\": de veiligheidscheck als vaste gewoonte.",
        oefeningen: {puzzles: {themes: ["hangingPiece"], min: 700, max: 1200, count: 5}},
    },
    {
        id: "mat1",
        part: "basis",
        title: "Schaakmat in één zet",
        goal: "Je herkent mat met de drie vragen: weglopen, tussenzetten, slaan.",
        uitleg: [
            {p: "Een schaak is pas <b>mat</b> als de koning op geen enkele manier kan ontsnappen. Controleer bij elk schaak drie dingen:"},
            {list: ["Kan de koning <b>weglopen</b> naar een veilig veld?", "Kan er een stuk <b>tussen</b> gezet worden?", "Kan het schaakgevende stuk <b>geslagen</b> worden?"]},
            {p: "Is het antwoord drie keer nee, dan is het mat. Pas op voor <b>pat</b>: als de tegenstander niet schaak staat maar geen enkele zet meer heeft, is het remise."},
            {rule: "Bekijk elke zet eerst al je schaakjes. Een mat mis je nooit als je ze allemaal controleert."},
        ],
        voorbeelden: [{
            fen: "k7/8/1K6/8/8/8/8/7Q w - - 0 1",
            intro: "Wit heeft twee schaakjes met de dame: {{Qa1+}} en {{Qh8+}}. Welke is mat?",
            arrows: [["h1", "a1", "danger"], ["h1", "h8", "success"]],
            steps: [
                {san: "Qh8#", text: "{{Qh8}} is mat: de dame beheerst de hele achtste rij (dus ook b8), en de witte koning dekt a7 en b7. Met {{Qa1+}} kon de koning nog naar b8 ontsnappen."},
            ],
        }],
        literatuur: "László Polgár, <i>Chess: 5334 Problems, Combinations and Games</i>: honderden matopgaven in één zet, het klassieke trainingsmateriaal hiervoor.",
        oefeningen: {puzzles: {themes: ["mateIn1"], min: 400, max: 900, count: 5}},
    },
    {
        id: "achterrij",
        part: "basis",
        title: "Mat op de achterste rij",
        goal: "Je herkent (en voorkomt) het matpatroon op de achterste rij.",
        uitleg: [
            {p: "Na de rokade staat de koning vaak achter drie pionnen. Dat is veilig, totdat een toren of dame de <b>achterste rij</b> bereikt. De eigen pionnen blokkeren dan alle vluchtvelden."},
            {p: "Je kunt dit voorkomen met een <b>luchtgat</b>: één pion voor de koning (bijvoorbeeld h3 of h6) een veld vooruit, zodat de koning kan ontsnappen."},
            {rule: "Zit de koning van de tegenstander opgesloten achter zijn pionnen? Kijk of je de achterste rij kunt bereiken. Zit die van jou opgesloten? Maak op tijd een luchtgat."},
        ],
        voorbeelden: [{
            fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
            intro: "De zwarte koning heeft geen luchtgat. Niemand verdedigt de achtste rij.",
            arrows: [["e1", "e8", "success"]],
            steps: [
                {san: "Re8#", text: "Mat! De toren beheerst f8 en h8, en de eigen pionnen op f7, g7 en h7 versperren de rest. Had zwart eerder <b>…h6</b> gespeeld, dan kon de koning naar h7."},
            ],
        }],
        literatuur: "Elk tactiekboek behandelt dit patroon vroeg, bijvoorbeeld John Bain, <i>Chess Tactics for Students</i>.",
        oefeningen: {puzzles: {themes: ["backRankMate"], min: 400, max: 1100, count: 5}},
    },

    // ───────────── Deel 2 ─────────────
    {
        id: "vork",
        part: "tactiek",
        title: "De vork",
        goal: "Je vindt zetten waarmee één stuk twee doelen tegelijk aanvalt.",
        uitleg: [
            {p: "Bij een <b>vork</b> valt één stuk twee (of meer) vijandelijke stukken tegelijk aan. De tegenstander kan maar één ervan redden. Het sterkst is een vork <b>met schaak</b>: de koning moet eerst weg, en daarna sla je het andere stuk."},
            {p: "Het paard is de vorkspecialist, omdat het over stukken heen springt en zijn aanval moeilijk te zien is. Maar ook pionnen, lopers, torens en de dame kunnen vorken."},
            {rule: "Zoek naar velden waar je stuk de koning én een onbeschermd of duurder stuk tegelijk raakt."},
        ],
        voorbeelden: [{
            fen: "r3k2r/8/8/3N4/8/8/5PPP/6K1 w - - 0 1",
            intro: "Het witte paard kan naar c7. Wat valt het daar aan?",
            steps: [
                {san: "Nc7+", text: "Schaak én een aanval op de toren a8: een <b>koningsvork</b>.", arrows: [["c7", "e8", "danger"], ["c7", "a8", "danger"]]},
                {san: "Ke7", text: "Zwart moet eerst het schaak oplossen."},
                {san: "Nxa8", text: "Wit wint een hele toren (5 punten)."},
            ],
        }],
        literatuur: "John Bain, <i>Chess Tactics for Students</i>, en de Stappenmethode behandelen elk tactisch motief in een eigen hoofdstuk, met veel oefenstof per motief.",
        oefeningen: {puzzles: {themes: ["fork"], min: 500, max: 1100, count: 5}},
    },
    {
        id: "penning",
        part: "tactiek",
        title: "De penning",
        goal: "Je herkent gepende stukken en buit ze uit.",
        uitleg: [
            {p: "Een stuk is <b>gepend</b> als het niet kan (of beter niet kan) bewegen, omdat er een waardevoller stuk achter staat. Lopers, torens en de dame kunnen pennen."},
            {list: ["<b>Absolute penning</b>: achter het stuk staat de koning. Bewegen is dan zelfs verboden.", "<b>Relatieve penning</b>: achter het stuk staat bijvoorbeeld de dame. Bewegen mag, maar kost veel."]},
            {p: "Een gepend stuk is een slecht verdediger en een makkelijk doelwit. Val het daarom <b>nog een keer aan</b>, het liefst met een pion."},
            {rule: "Pin het vast, val het opnieuw aan."},
        ],
        voorbeelden: [{
            fen: "4k3/8/2n5/1B6/3P4/8/8/4K3 w - - 0 1",
            intro: "Het paard op c6 staat tussen de witte loper en de zwarte koning. Het is <b>absoluut gepend</b>.",
            arrows: [["b5", "e8", "danger"]],
            steps: [
                {san: "d5", text: "De pion valt het gepende paard aan. Het paard mag niet weg.", arrows: [["d5", "c6", "danger"]]},
                {san: "Kd7", text: "Zwart stapt opzij, maar de koning staat nu op d7, nog steeds op dezelfde diagonaal. Het paard blijft gepend."},
                {san: "dxc6+", text: "Wit wint het paard, en het is ook nog schaak."},
            ],
        }],
        literatuur: "Bain (<i>Chess Tactics for Students</i>) en de Stappenmethode: penning en spies worden daar als tweelingmotieven samen geoefend.",
        oefeningen: {puzzles: {themes: ["pin"], min: 500, max: 1200, count: 5}},
    },
    {
        id: "spies",
        part: "tactiek",
        title: "De spies",
        goal: "Je ziet wanneer een aanval op een waardevol stuk het stuk erachter oplevert.",
        uitleg: [
            {p: "Een <b>spies</b> is een omgekeerde penning: het <b>waardevolle</b> stuk staat vooraan. Als het wegloopt, sla je het stuk dat erachter stond."},
            {p: "De sterkste spies is een schaak: de koning móét weg, en het stuk erachter valt."},
            {rule: "Staan de koning (of dame) en een ander stuk op één lijn? Zet je loper, toren of dame op die lijn."},
        ],
        voorbeelden: [{
            fen: "8/8/8/4k2r/8/8/8/R5K1 w - - 0 1",
            intro: "De zwarte koning en toren staan samen op de vijfde rij.",
            steps: [
                {san: "Ra5+", text: "Schaak langs de vijfde rij. De koning moet de rij verlaten.", arrows: [["a5", "e5", "danger"], ["e5", "h5", "danger"]]},
                {san: "Kf4", text: "De koning stapt weg en laat de toren onbeschermd achter."},
                {san: "Rxh5", text: "Wit wint de toren."},
            ],
        }],
        literatuur: "Bain, <i>Chess Tactics for Students</i>, hoofdstuk over de spies (Engels: <i>skewer</i>).",
        oefeningen: {puzzles: {themes: ["skewer"], min: 500, max: 1300, count: 5}},
    },
    {
        id: "aftrek",
        part: "tactiek",
        title: "Aftrekaanval en aftrekschaak",
        goal: "Je gebruikt een stuk dat 'in de weg staat' om twee dreigingen tegelijk te maken.",
        uitleg: [
            {p: "Bij een <b>aftrekaanval</b> verzet je een stuk, waardoor een ander stuk erachter (loper, toren of dame) ineens iets aanvalt. Je maakt zo <b>twee dreigingen in één zet</b>: één met het stuk dat wegloopt en één met het stuk erachter."},
            {p: "Is de onthulde aanval een schaak, dan heet het <b>aftrekschaak</b>. Het wegspringende stuk mag dan bijna alles doen, zelfs de dame slaan, omdat de tegenstander eerst het schaak moet oplossen."},
            {rule: "Staat een eigen stuk tussen jouw toren/loper/dame en de vijandelijke koning? Dan heb je een geladen kanon."},
        ],
        voorbeelden: [{
            fen: "q3k3/8/8/8/4B3/8/8/4R1K1 w - - 0 1",
            intro: "De witte loper op e4 staat tussen de toren e1 en de zwarte koning. De zwarte dame staat op a8, op dezelfde diagonaal als de loper.",
            arrows: [["e1", "e8", "danger"], ["e4", "a8", "success"]],
            steps: [
                {san: "Bxa8+", text: "De loper slaat de dame, en tegelijk geeft de toren schaak. Zwart moet het schaak oplossen en kan de loper niet terugslaan."},
            ],
        }],
        literatuur: "Bain, <i>Chess Tactics for Students</i>: aftrekaanval en dubbelschaak als aparte hoofdstukken.",
        oefeningen: {puzzles: {themes: ["discoveredAttack"], min: 500, max: 1300, count: 5}},
    },
    {
        id: "mat2",
        part: "tactiek",
        title: "Mat in twee: offers en afleiding",
        goal: "Je combineert een gedwongen eerste zet (vaak een offer) met een mat.",
        uitleg: [
            {p: "Bij mat in twee is de eerste zet meestal <b>gedwongen</b>: een schaak, een slagzet of een offer dat de tegenstander moet aannemen. Daarmee lok je een verdediger weg (<b>afleiding</b>) of sluit je de laatste vluchtweg af."},
            {p: "Durf te offeren: een dame weggeven is prima als het daarna mat is. Materiaal telt niet meer als de koning valt."},
            {rule: "Zoek de matstelling eerst en werk dan terug: welk stuk staat in de weg, en hoe dwing ik het weg?"},
        ],
        voorbeelden: [{
            fen: "2r3k1/5ppp/8/3Q4/8/8/5PPP/3R2K1 w - - 0 1",
            intro: "Zwart verdedigt de achterste rij met de toren op c8. Kan wit die verdediger weglokken?",
            steps: [
                {san: "Qd8+", text: "Een dameoffer met schaak! De koning kan nergens heen, dus zwart moet slaan.", arrows: [["d8", "g8", "danger"]]},
                {san: "Rxd8", text: "De zwarte toren is weggelokt van zijn taak."},
                {san: "Rxd8#", text: "Mat op de achterste rij. Wit gaf 9 punten weg en won de partij."},
            ],
        }],
        literatuur: "Polgár, <i>Chess: 5334 Problems, Combinations and Games</i>, bevat ruim duizend opgaven mat in twee.",
        oefeningen: {puzzles: {themes: ["mateIn2"], min: 600, max: 1200, count: 5}},
    },

    // ───────────── Deel 3 ─────────────
    {
        id: "denkproces",
        part: "denken",
        title: "Het denkproces: schaak, slag, dreiging",
        goal: "Je doorloopt bij elke zet een vaste denkroutine.",
        uitleg: [
            {p: "Al in 1946 onderzocht de Nederlandse psycholoog Adriaan de Groot hoe schakers denken (<i>Het denken van den schaker</i>). Sterke spelers bekijken niet méér zetten, maar wel <b>de goede</b>, en ze doen dat systematisch."},
            {p: "Voor beginners werkt deze vaste routine bij elke zet:"},
            {list: [
                "<b>Wat wil de tegenstander?</b> Wat dreigt zijn laatste zet?",
                "<b>Schaakjes</b>: welke schaakjes heb ik?",
                "<b>Slagzetten</b>: wat kan ik slaan, en is dat veilig?",
                "<b>Dreigingen</b>: wat kan ik aanvallen?",
                "<b>Veiligheidscheck</b>: staat na mijn zet alles nog gedekt?",
            ]},
            {rule: "Gedwongen zetten eerst: schaak, slag, dreiging. Daarna pas de rest."},
        ],
        voorbeelden: [{
            fen: "7k/8/8/r7/8/8/8/4Q1K1 w - - 0 1",
            intro: "Doorloop de routine. Schaakjes: {{Qe5+}} en {{Qh4+}}. Welke doet méér?",
            steps: [
                {san: "Qe5+", text: "Schaak én een aanval op de toren a5: een damevork. Bij het checken van je schaakjes vind je zulke zetten vanzelf.", arrows: [["e5", "h8", "danger"], ["e5", "a5", "danger"]]},
                {san: "Kg8", text: "De koning moet weg."},
                {san: "Qxa5", text: "Wit wint de toren."},
            ],
        }],
        literatuur: "A.D. de Groot, <i>Het denken van den schaker</i> (1946); Dan Heisman, <i>The Improving Chess Thinker</i>, over denkroutines van spelers op verschillend niveau.",
        oefeningen: {puzzles: {themes: null, min: 600, max: 1000, count: 5}},
    },
    {
        id: "opening",
        part: "denken",
        title: "Openingsprincipes",
        goal: "Je speelt de opening volgens de vaste principes en trapt niet in herdersmat.",
        uitleg: [
            {p: "Je hoeft geen openingen uit je hoofd te leren. Deze principes gelden in elke opening:"},
            {list: [
                "Bezet het <b>centrum</b> met een pion (e4/d4 of e5/d5).",
                "<b>Ontwikkel</b> je paarden en lopers, liefst elk stuk één keer.",
                "<b>Rokeer</b> vroeg, zodat je koning veilig staat.",
                "Haal je <b>dame</b> niet te vroeg naar buiten.",
                "Let op het zwakke veld <b>f7</b> (f2 voor wit): het wordt alleen door de koning gedekt.",
            ]},
            {rule: "Centrum, ontwikkelen, rokeren. Pas daarna aanvallen."},
        ],
        voorbeelden: [
            {
                fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                intro: "Een gezonde opening (de Italiaanse partij), zet voor zet:",
                steps: [
                    {san: "e4", text: "Een pion in het centrum. Dame en loper krijgen ruimte."},
                    {san: "e5", text: "Zwart doet hetzelfde."},
                    {san: "Nf3", text: "Ontwikkelt een stuk en valt e5 aan."},
                    {san: "Nc6", text: "Ontwikkelt en verdedigt e5."},
                    {san: "Bc4", text: "De loper richt zich op f7, het zwakke punt."},
                    {san: "Bc5", text: "Zwart ontwikkelt ook zijn loper actief."},
                    {san: "O-O", text: "Rokade: de koning staat veilig en de toren doet mee. In vier zetten: centrum, twee stukken ontwikkeld, gerokeerd."},
                ],
            },
            {
                fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                intro: "Pas op voor <b>herdersmat</b>: een vroege aanval op f7.",
                steps: [
                    {san: "e4", text: ""},
                    {san: "e5", text: ""},
                    {san: "Bc4", text: "De loper mikt op f7."},
                    {san: "Nc6", text: ""},
                    {san: "Qh5", text: "Ook de dame mikt op f7. Dreiging: {{Qxf7#}}.", arrows: [["h5", "f7", "danger"], ["c4", "f7", "danger"]]},
                    {san: "Nf6", text: "Een fout: het paard valt de dame aan, maar verdedigt f7 niet. Goed was {{Qe7}} of {{g6}}."},
                    {san: "Qxf7#", text: "Mat. Onthoud: <b>als de dame en loper samen op f7 mikken, verdedig f7.</b>"},
                ],
            },
        ],
        literatuur: "Irving Chernev, <i>Logical Chess: Move by Move</i>: volledige partijen waarin élke zet wordt uitgelegd, met veel aandacht voor deze principes.",
        oefeningen: {puzzles: {themes: ["opening", "attackingF2F7"], min: 400, max: 1100, count: 5}},
    },

    // ───────────── Deel 4 ─────────────
    {
        id: "matdame",
        part: "eindspel",
        title: "Mat met koning en dame",
        goal: "Je zet zelfstandig mat met koning en dame tegen een koning.",
        uitleg: [
            {p: "Capablanca, wereldkampioen van 1921 tot 1927, begint zijn leerboek <i>Chess Fundamentals</i> met precies dit eindspel. Wie het beheerst, laat nooit meer een gewonnen partij liggen."},
            {list: [
                "<b>Verklein de doos</b>: zet de dame een paardsprong van de koning af. Zo krijgt de koning steeds minder ruimte.",
                "Volg de koning terwijl hij naar de rand gaat, totdat hij <b>op de rand</b> staat.",
                "Haal dan je <b>eigen koning</b> erbij: de dame kan niet alleen mat geven.",
                "Geef mat met steun van je koning.",
            ]},
            {p: "<b>Pas op voor pat!</b> Als de vijandelijke koning niet schaak staat maar geen veld meer heeft, is het remise. Kijk vlak voor het mat altijd of de tegenstander nog een zet heeft."},
            {rule: "Dame een paardsprong ervandaan, koning naar de rand, eigen koning erbij, en pas op voor pat."},
            {board: {fen: "k7/8/1Q6/8/8/8/8/6K1 b - - 0 1", caption: "Pat! Zwart is aan zet, staat niet schaak en kan niets. Remise."}},
        ],
        voorbeelden: [{
            fen: "7k/8/6K1/8/8/8/8/1Q6 w - - 0 1",
            intro: "De eindstelling: de zwarte koning staat op de rand, de witte koning dekt g7 en h7.",
            steps: [
                {san: "Qb8#", text: "Mat: de dame beheerst de achtste rij, de koning de zevende."},
            ],
        }],
        literatuur: "J.R. Capablanca, <i>Chess Fundamentals</i> (1921), hoofdstuk 1: de elementaire matten.",
        oefeningen: {drills: [
            {fen: "8/8/8/4k3/8/8/8/3QK3 w - - 0 1", maxMoves: 25, title: "Zet mat met koning en dame"},
            {fen: "8/2k5/8/8/8/8/8/5KQ1 w - - 0 1", maxMoves: 25, title: "Nog een keer, vanuit een andere stelling"},
        ]},
    },
    {
        id: "mattoren",
        part: "eindspel",
        title: "Mat met koning en toren",
        goal: "Je zet zelfstandig mat met koning en toren tegen een koning.",
        uitleg: [
            {p: "Met een toren gaat het langzamer, maar het lukt altijd. De toren kan alleen rechte lijnen afsluiten, dus de koningen doen meer werk."},
            {list: [
                "Snijd de vijandelijke koning af met de toren op een rij of lijn: dat is zijn <b>doos</b>.",
                "Breng je koning dichterbij.",
                "Staan de koningen <b>tegenover elkaar</b> (oppositie), geef dan schaak met de toren. De koning moet een rij terug.",
                "Staan ze niet tegenover elkaar, doe dan een <b>wachtzet</b> met de toren of breng je koning verder.",
                "Herhaal tot de koning op de rand staat en mat is.",
            ]},
            {rule: "Toren snijdt af, koningen tegenover elkaar, en dan pas schaak."},
        ],
        voorbeelden: [{
            fen: "4k3/8/4K3/8/8/8/8/R7 w - - 0 1",
            intro: "De koningen staan tegenover elkaar (oppositie). Nu is het tijd voor schaak.",
            steps: [
                {san: "Ra8#", text: "Mat: de toren beheerst de achtste rij, de witte koning dekt d7, e7 en f7."},
            ],
        }],
        literatuur: "Capablanca, <i>Chess Fundamentals</i>, hoofdstuk 1, en vrijwel elk eindspelboek.",
        oefeningen: {drills: [
            {fen: "8/8/8/4k3/8/8/8/R3K3 w - - 0 1", maxMoves: 40, title: "Zet mat met koning en toren"},
        ]},
    },
    {
        id: "pionnen",
        part: "eindspel",
        title: "Pionnen promoveren: de vierkantsregel",
        goal: "Je berekent of een koning een vrijpion nog kan inhalen.",
        uitleg: [
            {p: "In het eindspel wordt een pion die de overkant haalt een dame. Of de vijandelijke koning op tijd is, hoef je niet uit te rekenen: gebruik de <b>vierkantsregel</b>."},
            {p: "Teken in gedachten een vierkant van de pion tot de promotierij, met de afstand tot de promotierij als zijde. Kan de koning (als hij aan zet is) in dat vierkant stappen, dan haalt hij de pion in. Zo niet, dan promoveert de pion."},
            {rule: "Koning binnen het vierkant: pion gestopt. Koning erbuiten: pion promoveert."},
        ],
        voorbeelden: [{
            fen: "8/8/8/P7/8/5k2/8/6K1 w - - 0 1",
            intro: "Het vierkant van de pion a5 loopt van a5 tot d8. De zwarte koning op f3 staat er ver buiten.",
            steps: [
                {san: "a6", text: "Het vierkant wordt kleiner: a6 tot c8."},
                {san: "Ke4", text: "De koning rent, maar is te laat."},
                {san: "a7", text: ""},
                {san: "Kd5", text: ""},
                {san: "a8=Q+", text: "Een nieuwe dame. De koning kwam twee stappen tekort, precies zoals de vierkantsregel voorspelde."},
            ],
        }],
        literatuur: "De vierkantsregel staat in elk eindspelboek, bijvoorbeeld Capablanca, <i>Chess Fundamentals</i>, en Jeremy Silman, <i>Silman's Complete Endgame Course</i>.",
        oefeningen: {puzzles: {themes: ["pawnEndgame", "promotion"], min: 500, max: 1400, count: 5}},
    },
]

// Welke les hoort bij een puzzelthema (voor "zwakste thema's" in de voortgang).
export const THEME_LESSON = {
    hangingPiece: "veilig", mateIn1: "mat1", backRankMate: "achterrij", fork: "vork", pin: "penning",
    skewer: "spies", discoveredAttack: "aftrek", doubleCheck: "aftrek", mateIn2: "mat2", deflection: "mat2",
    attraction: "mat2", sacrifice: "mat2", attackingF2F7: "opening", promotion: "pionnen", advancedPawn: "pionnen",
}

// Leerpsychologische onderbouwing, getoond op de pagina "Over deze methode".
export const METHOD = [
    {title: "Chunking: patronen herkennen", text: "Chase en Simon (1973) toonden aan dat sterke schakers stellingen onthouden als <b>patronen</b> (\"chunks\"), niet als losse stukken. Daarom oefen je per motief veel vergelijkbare stellingen: elk patroon dat je herkent, hoef je niet meer uit te rekenen."},
    {title: "Uitgewerkte voorbeelden", text: "Beginners leren meer van een <b>stap voor stap uitgewerkt voorbeeld</b> dan van direct zelf zoeken (het <i>worked example effect</i>, Sweller). Elke les toont eerst een voorbeeld met uitleg per zet, en pas daarna oefen je zelf."},
    {title: "Toetsen is leren", text: "Jezelf testen versterkt het geheugen meer dan herlezen (het <i>testing effect</i>, Roediger en Karpicke, 2006). Daarom eindigt elke les met opgaven in plaats van een samenvatting."},
    {title: "Gespreide herhaling", text: "Vergeten verloopt volgens een voorspelbare curve (Ebbinghaus, 1885). Fout gemaakte opgaven komen terug na 1, 3, 7, 14 en 30 dagen, telkens net voordat je ze zou vergeten."},
    {title: "Beheersingsleren", text: "Volgens Bloom (1968) kom je verder als je een onderwerp <b>beheerst</b> voordat je verdergaat. Een les telt als beheerst bij 80% goed. Lukt dat niet, herhaal de les dan. Dat is geen falen, maar precies hoe leren werkt."},
    {title: "Doelgericht oefenen", text: "Ericsson e.a. (1993) lieten zien dat expertise vooral komt van <b>gericht oefenen</b> op je zwakke punten, met directe feedback. Het voortgangsscherm toont je zwakste thema's, en de partij-review geeft directe feedback op je eigen fouten."},
]

export const BOOKS = [
    {title: "De Stappenmethode", author: "Rob Brunia & Cor van Wijgerden", text: "De Nederlandse schaaklesmethode, ook internationaal veel gebruikt. De leerstof wordt in kleine stappen opgebouwd, met veel oefenbladen per onderwerp. Dat principe volgt dit leertraject."},
    {title: "Chess Fundamentals (1921)", author: "José Raúl Capablanca", text: "Klassiek leerboek van een wereldkampioen. Begint opvallend genoeg met eindspelen, omdat je daar de kracht van elk stuk het zuiverst leert kennen."},
    {title: "Chess Tactics for Students", author: "John Bain", text: "Behandelt per hoofdstuk één tactisch motief (vork, penning, spies…) met uitleg en veel oefeningen. Een veelgebruikt boek in schaakonderwijs."},
    {title: "Chess: 5334 Problems, Combinations and Games", author: "László Polgár", text: "Een dikke verzameling opgaven, vooral mat in één en twee, waarmee Polgár zijn dochters trainde (onder wie Judit Polgár, de sterkste schaakster ooit)."},
    {title: "Logical Chess: Move by Move", author: "Irving Chernev", text: "Volledige meesterpartijen waarin elke zet wordt uitgelegd. Ideaal om openingsprincipes en plannen in de praktijk te zien."},
    {title: "Het denken van den schaker (1946)", author: "Adriaan D. de Groot", text: "Wetenschappelijk onderzoek naar hoe schakers denken. De basis van veel latere cognitieve psychologie, en van het idee dat patroonherkenning de kern van schaakvaardigheid is."},
    {title: "The Improving Chess Thinker", author: "Dan Heisman", text: "Onderzoekt de denkprocessen van spelers van beginner tot meester en pleit voor een vaste denkroutine met veiligheidscheck."},
]
