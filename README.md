# Service Aftale Beregner

En moderne webbaseret service- og reparationsaftale beregner til elbiler.

## Funktioner

- Oprettelse af service- og reparationsaftaler
- Understøttelse af både private og erhvervskunder
- Integration med biloplysninger via nummerplade/stellnummer
- Fire trin proces:
  1. Indtastning af bildata
  2. Aftaleoverblik
  3. Indtastning af kundedata
  4. Underskrift af kontrakt
- Administrationspanel til konfiguration

## Teknologier

- React med TypeScript
- React Router til navigation
- Tailwind CSS for styling
- React Icons for ikoner

## Forudsætninger

- Node.js (v14 eller nyere)
- npm (kommer med Node.js)

## Installation

1. Klon dette repository
2. Installer afhængigheder:

```bash
npm install
```

## Kørsel

For at starte udviklingsserveren:

```bash
npm start
```

Dette vil starte applikationen på [http://localhost:3000](http://localhost:3000).

## Bygning til produktion

For at bygge en produktionsklar version:

```bash
npm run build
```

## Næste skridt

- Implementer API-integration til biloplysninger
- Tilføj brugerautentificering
- Udfyld admin-panelet
- Implementer SMS-integration til kundeflow
- Tilføj flere lande og valutaer

## Licens

Dette projekt er [MIT-licenseret](LICENSE).
