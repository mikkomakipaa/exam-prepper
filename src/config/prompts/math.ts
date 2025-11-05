import { Difficulty } from '@/types';

export function getMathPrompt(
  difficulty: Difficulty,
  questionCount: number,
  grade?: number,
  material?: string
): string {
  const difficultyInstructions = {
    helppo: `
- Peruslaskutoimitukset (yhteen-, vähennys-, kerto- ja jakolasku)
- Yksinkertaiset luvut (kokonaisluvut alle 100)
- Selkeät ja suorat kysymykset
- Perusgeometria (muodot, kehä, pinta-ala)
- Yksivaiheiset ongelmat`,
    normaali: `
- Monivaiheinen laskenta (useita laskutoimituksia)
- Murtoluvut, desimaaliluvut ja prosentit
- Yhtälöiden ratkaiseminen (yksinkertainen algebra)
- Geometria (tilavuus, kulmat, kolmiot)
- Sanallisia tehtäviä (käytännön sovellukset)
- Laskujärjestys ja sulkujen käyttö`,
    vaikea: `
- Monimutkaiset yhtälöt ja yhtälöryhmät
- Funktiot ja kuvaajat
- Trigonometria (sin, cos, tan)
- Kehittynyt geometria (Pythagoraan lause, kolmioiden ratkaiseminen)
- Monivaiheisia sanallisia tehtäviä
- Potenssilaskenta ja juuret`,
    mahdoton: `
- Edistynyt algebra (polynomit, neliöjuuri-yhtälöt)
- Todistukset ja matemaattinen päättely
- Analyyttinen geometria (koordinaatisto, suorat, ympyrät)
- Yhdistelmät useista matematiikan osa-alueista
- Haastavia logiikkatehtäviä
- Epäsuorat ja monimutkaiset ongelmat`,
  };

  const gradeContext = grade ? `Kysymysten tulee olla sopivan haastavuustason ${grade}. luokkalaiselle.` : '';

  return `Analysoi ${material ? 'seuraava materiaali' : 'nämä dokumentit'} ja luo ${questionCount} monipuolista matematiikan kysymystä koevalmistautumiseen.

VAIKEUSTASO: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}

${gradeContext}

VAIKEUSTASON OHJEET:
${difficultyInstructions[difficulty]}

${material ? `MATERIAALI:\n${material}\n\n` : ''}TÄRKEÄÄ - KYSYMYSTEN MUOTO:
- Kysymykset ja selitykset esitetään SUOMEKSI
- Käytä LaTeX-merkintää matematiikan kaavoille ja symboleille
- Vaihtele kysymystyyppejä ja aiheita
- Luo TÄSMÄLLEEN ${questionCount} kysymystä
- Varmista että laskut ovat oikein

MATEMAATTINEN MERKINTÄTAPA:
- Käytä LaTeX-merkintää: $$formula$$  (esim. $$x^2 + 2x + 1 = 0$$)
- Inline-kaavat: $$x + 5$$ tai $$\\frac{1}{2}$$
- Murtoluvut: $$\\frac{osoittaja}{nimittäjä}$$
- Neliöjuuri: $$\\sqrt{x}$$ tai $$\\sqrt[3]{x}$$ (kuutiojuuri)
- Potenssi: $$x^2$$ tai $$2^{10}$$
- Kreikkalaiset kirjaimet: $$\\pi$$, $$\\alpha$$, $$\\theta$$
- Trigonometria: $$\\sin(x)$$, $$\\cos(x)$$, $$\\tan(x)$$
- Erikoismerkit: $$\\times$$ (kertomerkki), $$\\div$$ (jakomerkki), $$\\pm$$ (plus-miinus)

KYSYMYSTYYPIT JA ESIMERKIT:

1. Laskutehtävä (monivalinta):
   Kysymys: "Laske: $$15 \\times 8 + 12$$"
   Vaihtoehdot: ["132", "120", "144", "108"]
   Oikea vastaus: "132"

2. Yhtälö (monivalinta):
   Kysymys: "Ratkaise yhtälö: $$2x + 5 = 13$$"
   Vaihtoehdot: ["4", "6", "8", "9"]
   Oikea vastaus: "4"

3. Sanallinen tehtävä (monivalinta):
   Kysymys: "Liisa ostaa 3 kirjaa, joiden hinta on 12€ kappale. Paljonko hän maksaa yhteensä?"
   Vaihtoehdot: ["36€", "30€", "42€", "24€"]
   Oikea vastaus: "36€"

4. Geometria (monivalinta):
   Kysymys: "Suorakulmion leveys on 5 cm ja pituus 8 cm. Mikä on sen pinta-ala?"
   Vaihtoehdot: ["40 cm²", "26 cm²", "13 cm²", "45 cm²"]
   Oikea vastaus: "40 cm²"

5. Murtoluvut (monivalinta):
   Kysymys: "Laske: $$\\frac{3}{4} + \\frac{1}{2}$$"
   Vaihtoehdot: ["$$\\frac{5}{4}$$", "$$\\frac{4}{6}$$", "$$\\frac{1}{4}$$", "$$\\frac{7}{8}$$"]
   Oikea vastaus: "$$\\frac{5}{4}$$"

6. Täydennystehtävä (numeerinen vastaus):
   Kysymys: "Laske: $$7^2 - 5 \\times 3$$"
   Vastaus: "34"
   Hyväksyttävät vastaukset: ["34", "34.0"]

7. Totta/Epätotta:
   Kysymys: "Totta vai tarua: Neliön kaikki sivut ovat yhtä pitkiä."
   Vastaus: true

8. Prosentit (monivalinta):
   Kysymys: "Paljonko on 25% luvusta 80?"
   Vaihtoehdot: ["20", "25", "15", "30"]
   Oikea vastaus: "20"

NUMEERISTEN VASTAUSTEN KÄSITTELY:
- Anna pääasiallinen oikea vastaus "correct_answer" -kentässä
- Lisää "acceptable_answers" -taulukkoon vaihtoehtoiset hyväksyttävät muodot:
  * Desimaaliluvut ja murtoluvut: "0.5" ja "$$\\frac{1}{2}$$" ja "1/2"
  * Prosentit: "50%" ja "0.5" ja "0,5"
  * Eri merkitsemistavat: "3,14" ja "3.14"
  * Sievennetyt ja sieventämättömät muodot: "$$\\frac{2}{4}$$" ja "$$\\frac{1}{2}$$"
  * Kokonaisluvut: "5" ja "5.0" ja "5,0"

HUOM! VASTAUSVAIHTOEHTOJEN USKOTTAVUUS:
- Väärät vastaukset tulee olla uskottavia (esim. yleisiä laskuvirheitä)
- Esimerkki: Jos oikea vastaus on 24, väärät vaihtoehdot voivat olla:
  * 20 (unohdettu yksi termi)
  * 28 (yhteenlasku kertolaskun sijaan)
  * 12 (jaettu kahdella vahingossa)

Luo kysymykset JSON-muodossa. VASTAA VAIN JSON-MUODOSSA ILMAN MITÄÄN MUUTA TEKSTIÄ:

[
  {
    "question": "kysymysteksti suomeksi (voi sisältää LaTeX-merkintää)",
    "type": "multiple_choice" | "fill_blank" | "true_false",
    "options": ["vaihtoehto1", "vaihtoehto2", "vaihtoehto3", "vaihtoehto4"], // vain multiple_choice
    "correct_answer": "oikea vastaus (voi sisältää LaTeX-merkintää)",
    "acceptable_answers": ["vaihtoehtoinen muoto 1", "vaihtoehtoinen muoto 2"], // vapaaehtoinen, erityisesti fill_blank
    "explanation": "selitys suomeksi kuinka vastaus saadaan (voi sisältää LaTeX-laskuja)"
  }
]

Varmista että:
- Jokainen kysymys on uniikki
- Kaikki laskut on tarkistettu ja ovat oikein
- Väärät vastaukset ovat uskottavia (yleisiä laskuvirheitä)
- Selitykset näyttävät laskuaskeleet
- Kysymykset kattavat eri matematiikan osa-alueita
- LaTeX-merkintä on oikein muotoiltu
- Numeeristen vastausten kaikki hyväksyttävät muodot on listattu`;
}
