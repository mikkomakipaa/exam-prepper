import { Difficulty } from '@/types';

export function getGenericPrompt(
  subject: string,
  difficulty: Difficulty,
  questionCount: number,
  grade?: number,
  material?: string
): string {
  const difficultyInstructions = {
    helppo: `
- Perustason käsitteet ja teoriat
- Yksinkertaiset ja selkeät kysymykset
- Keskity olennaisimpiin asioihin
- Suoraviivainen sisältö`,
    normaali: `
- Monipuolinen sisältö ja keskitason käsitteet
- Vaihtelevat kysymystyypit
- Vaatii ymmärrystä ja soveltamista
- Kohtuullisen haastava`,
    vaikea: `
- Laaja ja syventävä sisältö
- Monimutkaiset kysymykset ja tilanteet
- Vaatii analyyttistä ajattelua
- Haastava ja vaativa taso`,
    mahdoton: `
- Erittäin haastava ja erikoistunut sisältö
- Monimutkaiset teoriat ja sovellukset
- Vaatii syvällistä ymmärrystä
- Edistynyt ja vaativa taso`,
  };

  const gradeContext = grade ? `Kysymysten tulee olla sopivan haastavuustason ${grade}. luokkalaiselle.` : '';

  return `Analysoi ${material ? 'seuraava materiaali' : 'nämä dokumentit'} ja luo ${questionCount} monipuolista kysymystä aiheesta "${subject}".

VAIKEUSTASO: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}

${gradeContext}

VAIKEUSTASON OHJEET:
${difficultyInstructions[difficulty]}

${material ? `MATERIAALI:\n${material}\n\n` : ''}TÄRKEÄÄ - KYSYMYSTEN MUOTO:
- Kysymykset esitetään SUOMEKSI
- Luo kysymyksiä jotka testaavat ymmärrystä aiheesta "${subject}"
- Vaihtele kysymystyyppejä
- Luo TÄSMÄLLEEN ${questionCount} kysymystä
- Perusta kysymykset annettuun materiaaliin

KYSYMYSTYYPIT JA ESIMERKIT:

1. Monivalintakysymykset:
   Kysymys: "Mikä seuraavista on oikein?"
   Vaihtoehdot: ["vaihtoehto 1", "vaihtoehto 2", "vaihtoehto 3", "vaihtoehto 4"]

2. Totta/Epätotta kysymykset:
   Kysymys: "Totta vai tarua: [väite]"
   Vastaus: true tai false

3. Täydennystehtävät:
   Kysymys: "Täydennä: [lause jossa puuttuu sana]"
   Vastaus: "oikea vastaus"

Luo kysymykset JSON-muodossa. VASTAA VAIN JSON-MUODOSSA ILMAN MITÄÄN MUUTA TEKSTIÄ:

[
  {
    "question": "kysymysteksti suomeksi",
    "type": "multiple_choice" | "fill_blank" | "true_false",
    "options": ["vaihtoehto1", "vaihtoehto2", "vaihtoehto3", "vaihtoehto4"], // vain multiple_choice
    "correct_answer": "oikea vastaus",
    "acceptable_answers": ["vaihtoehtoinen vastaus"], // vain fill_blank, vapaaehtoinen
    "explanation": "selitys suomeksi miksi tämä on oikea vastaus"
  }
]

Varmista että:
- Jokainen kysymys on uniikki
- Väärät vastaukset ovat uskottavia
- Selitykset ovat informatiivisia
- Kysymykset kattavat materiaalin laajasti
- Kysymykset liittyvät aiheeseen "${subject}"`;
}
