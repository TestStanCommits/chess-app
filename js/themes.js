// Uitleg van de Lichess-puzzelthema's in eenvoudige taal.
// name: korte naam, uitleg: wat het is, tip: waar je op let tijdens een partij.

export const THEMES = {
    mateIn1: {name: "Mat in 1", uitleg: "Je kunt in één zet mat geven.", tip: "Bekijk eerst álle schaakjes. Kan de koning nog weg, slaan of blokkeren?"},
    mateIn2: {name: "Mat in 2", uitleg: "Met twee zetten zet je mat, wat de tegenstander ook doet.", tip: "Zoek een zet die de koning vastzet. Vaak is dat een schaak of een offer."},
    mateIn3: {name: "Mat in 3", uitleg: "Een matcombinatie van drie zetten.", tip: "Ga door met schaak geven zolang de koning steeds minder vluchtvelden heeft."},
    mateIn4: {name: "Mat in 4", uitleg: "Een lange matcombinatie.", tip: "Tel de vluchtvelden van de koning en sluit ze één voor één af."},
    mateIn5: {name: "Mat in 5+", uitleg: "Een zeer lange matcombinatie.", tip: "Schaakjes dwingen de tegenstander. Begin daarmee."},
    backRankMate: {name: "Mat op de achterste rij", uitleg: "De koning zit opgesloten achter zijn eigen pionnen, en een toren of dame geeft mat op de achterste rij.", tip: "Staat de koning achter drie pionnen zonder ontsnappingsveld? Kijk of je de achterste rij kunt bereiken."},
    smotheredMate: {name: "Stikmat", uitleg: "Een paard geeft mat aan een koning die volledig ingesloten is door eigen stukken.", tip: "Kijk naar paardschaakjes als de koning in de hoek zit."},
    fork: {name: "Vork", uitleg: "Eén stuk valt twee (of meer) stukken tegelijk aan. De tegenstander kan er maar één redden.", tip: "Zoek velden waar je stuk de koning en een ander stuk tegelijk aanvalt. Paarden zijn vorkspecialisten."},
    pin: {name: "Penning", uitleg: "Een stuk kan niet (of liever niet) bewegen, omdat er een waardevoller stuk achter staat.", tip: "Staan de koning of dame op één lijn met een ander stuk? Een loper of toren kan dat stuk vastpinnen."},
    skewer: {name: "Spies", uitleg: "Je valt een waardevol stuk aan. Als het wegloopt, win je het stuk erachter.", tip: "Het omgekeerde van een penning: het waardevolle stuk staat vóór, het goedkopere erachter."},
    discoveredAttack: {name: "Aftrekaanval", uitleg: "Je verplaatst een stuk en daardoor valt een ander stuk erachter iets aan.", tip: "Staat er een eigen stuk in de weg van je loper, toren of dame? Haal het weg met dreiging."},
    doubleCheck: {name: "Dubbelschaak", uitleg: "Twee stukken geven tegelijk schaak. De koning móét lopen.", tip: "Een aftrekschaak waarbij het weggaande stuk óók schaak geeft is bijna altijd sterk."},
    hangingPiece: {name: "Ongedekt stuk", uitleg: "Een stuk van de tegenstander staat onbeschermd en kun je gewoon slaan.", tip: "Vraag na elke zet van de tegenstander: wat staat er ongedekt?"},
    trappedPiece: {name: "Ingesloten stuk", uitleg: "Een stuk heeft geen veilige velden meer en gaat verloren.", tip: "Kijk of een aangevallen stuk nog ergens heen kan."},
    capturingDefender: {name: "Verdediger slaan", uitleg: "Je slaat het stuk dat iets anders beschermt, zodat dat daarna valt.", tip: "Vraag: wat houdt deze verdediging overeind? Sla dát stuk."},
    deflection: {name: "Afleiding", uitleg: "Je lokt een verdedigend stuk weg van zijn taak.", tip: "Een stuk dat twee dingen moet verdedigen is overbelast. Geef het een extra taak."},
    attraction: {name: "Aanlokking", uitleg: "Je lokt een stuk (vaak de koning) naar een slecht veld, meestal met een offer.", tip: "Na het offer volgt vaak een vork of mat."},
    sacrifice: {name: "Offer", uitleg: "Je geeft bewust materiaal weg om er meer voor terug te krijgen.", tip: "Reken het door: wat win je na het offer?"},
    clearance: {name: "Vrijmaken", uitleg: "Je haalt een eigen stuk weg om ruimte te maken voor een ander stuk.", tip: "Welk veld of welke lijn zou je willen gebruiken, en wat staat er nu in de weg?"},
    interference: {name: "Onderbreking", uitleg: "Je zet een stuk tussen twee stukken van de tegenstander, zodat ze elkaar niet meer kunnen beschermen.", tip: "Zoek lijnen waarlangs de tegenstander verdedigt."},
    intermezzo: {name: "Tussenzet", uitleg: "In plaats van direct terug te slaan doe je eerst een sterkere zet, vaak een schaak.", tip: "Voor je automatisch terugslaat: is er iets beters?"},
    xRayAttack: {name: "Röntgenaanval", uitleg: "Een stuk werkt door een ander stuk heen en valt een veld daarachter aan.", tip: "Een toren achter een andere toren of dame is extra sterk."},
    quietMove: {name: "Stille zet", uitleg: "De beste zet is geen schaak of slagzet, maar een rustige zet met een venijnige dreiging.", tip: "Als schaakjes niet werken: welke dreiging kan de tegenstander niet meer stoppen?"},
    defensiveMove: {name: "Verdedigen", uitleg: "Hier moet je eerst een dreiging stoppen.", tip: "Kijk altijd eerst wat de tegenstander met zijn laatste zet wil."},
    promotion: {name: "Promotie", uitleg: "Een pion bereikt de laatste rij en wordt een dame (of ander stuk).", tip: "Een pion die bijna promoveert is vaak meer waard dan een stuk."},
    underPromotion: {name: "Minderpromotie", uitleg: "Je promoveert niet naar een dame, maar bijvoorbeeld naar een paard.", tip: "Een paard kan schaak geven op een manier die een dame niet kan."},
    advancedPawn: {name: "Ver opgerukte pion", uitleg: "Een pion vlak voor de promotie speelt de hoofdrol.", tip: "Help je pion vooruit of stop die van de tegenstander."},
    exposedKing: {name: "Onveilige koning", uitleg: "De koning staat open zonder pionnen om zich heen en is makkelijk aan te vallen.", tip: "Breng snel stukken naar de open koning."},
    kingsideAttack: {name: "Aanval op de koningsvleugel", uitleg: "Een aanval op de koning nadat hij gerokeerd heeft.", tip: "Tel de aanvallers en verdedigers rond de koning."},
    queensideAttack: {name: "Aanval op de damevleugel", uitleg: "Een aanval op de koning na lange rokade.", tip: "Tel de aanvallers en verdedigers rond de koning."},
    attackingF2F7: {name: "Aanval op f2/f7", uitleg: "Het veld f7 (of f2) wordt in het begin alleen door de koning gedekt: een zwakke plek.", tip: "Richt in de opening een loper en dame of paard op f7."},
    zugzwang: {name: "Zetdwang", uitleg: "De tegenstander moet een zet doen, maar elke zet verslechtert zijn stelling.", tip: "Soms is de beste zet een wachtzet."},
    enPassant: {name: "En passant", uitleg: "Een speciale manier van pion slaan, direct nadat een pion twee velden vooruit is gegaan.", tip: "Alleen mogelijk direct na de tweestapszet van de andere pion."},
    castling: {name: "Rokeren", uitleg: "De rokade speelt een rol in de oplossing.", tip: "Rokeren brengt je koning in veiligheid en je toren in het spel."},
    anastasiaMate: {name: "Anastasia-mat", uitleg: "Een paard en toren (of dame) zetten samen mat aan de rand.", tip: "Paard sluit de vluchtvelden af, de toren geeft mat."},
    arabianMate: {name: "Arabische mat", uitleg: "Een toren en paard geven samen mat in de hoek.", tip: "Paard dekt het matveld van de toren."},
    bodenMate: {name: "Boden-mat", uitleg: "Twee lopers geven mat op kruisende diagonalen.", tip: "Let op een gerokeerde koning met eigen stukken naast zich."},
    doubleBishopMate: {name: "Mat met twee lopers", uitleg: "Twee lopers geven samen mat.", tip: "Lopers op naast elkaar liggende diagonalen zijn dodelijk."},
    dovetailMate: {name: "Zwaluwstaartmat", uitleg: "Een dame geeft mat terwijl de koning door eigen stukken wordt ingesloten.", tip: "Dame vlak naast de koning, gedekt door een ander stuk."},
    hookMate: {name: "Haakmat", uitleg: "Toren, paard en pion werken samen voor mat.", tip: "Een gedekt paard dekt het matveld van de toren."},
    killBoxMate: {name: "Kill box-mat", uitleg: "Toren en dame sluiten de koning in een vak in.", tip: "Toren en dame naast elkaar zijn een sterke combinatie."},
    vukovicMate: {name: "Vuković-mat", uitleg: "Toren en paard geven mat aan de rand.", tip: "Paard dekt het matveld."},
    cornerMate: {name: "Hoekmat", uitleg: "De koning wordt in de hoek matgezet.", tip: "In de hoek heeft de koning maar weinig velden."},
    operaMate: {name: "Opera-mat", uitleg: "Een toren geeft mat op de achterste rij, gedekt door een loper.", tip: "Loper en toren samen op de achterste rij."},
}

// Spelfase-thema's tonen we wel als label, maar tellen niet mee als "zwak motief".
const PHASES = new Set(["opening", "middlegame", "endgame", "rookEndgame", "pawnEndgame", "queenEndgame",
    "bishopEndgame", "knightEndgame", "queenRookEndgame"])

/** Het belangrijkste thema van een puzzel om uit te leggen. */
export function mainTheme(themes) {
    const list = themes.split(" ").filter((t) => THEMES[t])
    // Een specifiek motief (vork, penning...) is leerzamer dan "mat in 2".
    const motif = list.find((t) => !t.startsWith("mateIn"))
    return motif || list[0] || null
}

/** Thema's die we bijhouden voor de statistiek "zwakste thema's". */
export function trackedThemes(themes) {
    return themes.split(" ").filter((t) => THEMES[t] && !PHASES.has(t))
}
