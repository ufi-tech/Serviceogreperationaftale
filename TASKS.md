# Service-Aftale Beregner - Opgaveliste

Dette dokument indeholder den prioriterede liste af opgaver for udviklingen af Service-Aftale Beregneren.

## Status symboler
- 🔄 Igangværende
- ✅ Færdig
- ⏱️ Planlagt
- 🔘 Ikke påbegyndt

## Fase 1: Kernestruktur og Grundfunktionalitet (Revideret)

### 1. Appstruktur og routing
- ✅ Opret grundlæggende app-struktur med React og TypeScript
- ✅ Implementer hovedsider: Bildata, Aftaleoverblik, Kundedata, Kontrakt
- 🔘 Tilføj progress-indikator til at vise hvor langt brugeren er i processen
- 🔘 Sikre fuldstændig navigation mellem siderne med validering

### 2. Bildata-siden
- ✅ Implementer nummerplade/stelnummer-søgefelt med validering
- ✅ Design nummerplade-felt der visuelt matcher rigtige nummerplader (Grundlæggende design på plads, synlighedsproblem løst. Dynamisk design er ny task)
- ✅ Tilføj privat/erhverv-toggle med tilhørende momsberegning
- ✅ Implementer varebil-toggle med prismodifikation
- ✅ Tilføj felter for bildata (mærke, model, HK, dato, km) med validering
- ✅ Tilføj autofuldførelse af mærke/model ved søgning
- ✅ Implementer gem/hent funktionalitet for bil-profiler (Antaget færdig fra tidligere liste, kan revurderes)
- ✅ Fuldstændiggør validering for alle obligatoriske felter på Bildata-siden (udelukkende grundlæggende biloplysninger inkl. forventet årligt km)

#### Bildata Udvidelser (for dækberegning)
- ✅ **Integrer køreklar vægt og biltype i `Bildata`:**
    - ✅ Opdater `BilData` interface (`BilProfilerContext.tsx`) til at inkludere `koereklarVaegt` (number) og `bilType` (string, f.eks. 'personbil', 'varebil', 'suv').
    - ✅ Opdater `Bildata.tsx` til at hente og gemme disse værdier fra API-kald (hvis de returneres) og vise dem (evt. skjult hvis de kun bruges internt).
    - ✅ Sørg for, at disse værdier sendes videre til `AftaleoverblikPage` via `location.state.bildataFormData`.

### 3. Aftaleoverblik-siden
- ✅ Vis indsamlede data om køretøjet fra Bildata-siden.
- ✅ Implementer valg af "Aftaletype" (fx Service / Service & Reparation).
- ✅ Implementer valg af "Løbetid" for aftalen.
- ✅ Beregn og vis "Samlet km-forbrug" (baseret på "Forventet km pr. år" fra Bildata og "Løbetid").

- ✅ **Dækaftale:**
    - ✅ Implementer valg for "Tilføj Dækaftale" (Ja/Nej).
    - ⏱️ *Hvis tilvalgt:* 
        - ✅ Implementer valg af dæksæson (sommer, vinter, helår)
        - ✅ Tilføj funktionalitet for dækbredde, profil og diameter med validering
        - ✅ Implementer automatisk fokus mellem dækdimensionsfelter
        - ✅ Tilføj farvetemaer for de forskellige dæksæsoner
        - ✅ Tilføj info-popup med dækbrands for hver kategori
        - 🔘 **Understøt forskellige dækdimensioner (for/bag) i `DaekAftale.tsx`:**
            - 🔘 Opdater UI i `DaekAftale.tsx` til at tillade specificering af separate dækdimensioner for for- og bagaksel for sommer- og vinterdæk.
            - 🔘 Tilføj en mekanisme (f.eks. checkbox "Forskellige størrelser for/bag?") for hver dæktype.
            - 🔘 Opdater datastrukturen for dækvalg i `DaekAftale.tsx`'s interne state og den data, der sendes via `onChange`.
        - 🔘 **Opdater datamodel for dækaftaler i `AftaleoverblikPage.tsx`:**
            - 🔘 Juster `aftaleData.daekaftale` strukturen til at kunne gemme de differentierede dækstørrelser (og evt. kategorier) for sommer- og vinterdæk.
            - 🔘 Sørg for, at `handleDaekAftaleChange` korrekt opdaterer den nye struktur.
            - 🔘 Sørg for, at `initialData` proppen til `DaekAftale` håndterer den nye struktur.
        - ✅ **Integrer bilvægt/type i dæk-km-holdbarhedsberegning:**
            - ✅ Når den nye menu for "dæk holdbarhed & prisjustering" implementeres, brug `koereklarVaegt` og `bilType` (fra `bildataFormData`) som input til beregning af dækkenes forventede kilometerholdbarhed.
        - 🔄 Validering: Hvis dækaftale er tilvalgt, skal alle dækdetaljer udfyldes

- ✅ **Garantiforsikring:**
    - ✅ Implementer valg for "Tilføj Garantiforsikring" (Ja/Nej).
    - ✅ *Hvis tilvalgt:* 
        - ✅ Valg af forhandlerdækning (kunde betaler, 50%, 100%)
        - ✅ Vælg garantiudbyder fra liste
        - ✅ Vælg garantiprodukter/niveauer (bronze, sølv, guld eller lignende)
        - ✅ Pris udregnet baseret på de ovenstående valg, bilens alder, km, motorstørrelse, etc.
        - ✅ Validering: Hvis garantiforsikring er tilvalgt skal alle garantidetaljer udfyldes
    - 🔘 **UI/UX forbedringer til garantiforsikringsmodul:**
        - 🔘 Fjern duplikeret visning af garantiforsikring og til/fra knap/felt
        - 🔘 Optimere layout så "Vælg garantipakker" kun vises efter en udbyder er valgtr.
        - ✅ Brugerflade for valg af garantiforsikringspakke (baseret på valgt udbyder).
        - ✅ API-kald: Beregn pris for valgt garantipakke baseret på køretøjets data (alder, km, motorstørrelse/HK).
        - ✅ Vis beregnet garantipris (justeret for evt. forhandlerdækning).

- 🔄 **Vejhjælp:**
    - ✅ Implementer toggle (Ja/Nej) for tilvalg af vejhjælp.
    - ✅ Implementer admin-mødulredigering af vejhjælps-information:
        - ✅ Pris pr. måned (kr/md)
        - ✅ Beskrivelse og fordele
        - ✅ Infotekst i hover-panel
    - ✅ *Hvis tilvalgt:* Vis bekræftelse/konfigurer eventuelle detaljer.

- ✅ **Lånebil ved service:**
    - ✅ Implementer valg for "Tilføj Lånebil ved service" (Ja/Nej - obligatorisk).
    - ✅ *Hvis tilvalgt:* Vis bekræftelse/konfigurer eventuelle detaljer.

- ✅ Sikre at siden afspejler enighed mellem kunde og sælger før progression til Kundedata.

#### Profil Håndtering
- 🔘 **Gem og indlæs udvidede aftaledetaljer i bilprofiler:**
    - 🔘 Sørg for at `gemBilProfil` i `AftaleoverblikPage` gemmer alle relevante nye aftalevalg (inkl. detaljeret dækinfo).
    - 🔘 Opdater logik i `BilProfilerContext` (eller hvor profiler indlæses) til korrekt at parse og anvende de gemte, udvidede aftaledetaljer, når en profil vælges og data sendes til `AftaleoverblikPage`.

## Fase 1.5: EV Service- & Reparationspriser og Prisopsummering (NY PRIORITET)

### 1. Forenklet admin-prismodul til EV Service- & Reparationspriser
- ✅ Forenklet datamodel og UI: Udbyder, km-interval, hk-interval, månedlig pris, rabat under fabriksgaranti (kun for service+repair)
- ✅ CRUD-funktionalitet og visning i admin

### 2. CSV import/export af prisregler
- 🔄 Implementér CSV import/export for EV-prisregler (NÆSTE STEP)

### 3. Udvidet fabriksgaranti i frontend
- ✅ Tilføj felt for udvidet fabriksgaranti i biloprettelse (færdig)
    - ✅ Feltet vises i Bildata-formularen og sendes med til AftaleoverblikPage
    - ✅ Feltet vises i toppen af AftaleoverblikPage sammen med de øvrige biloplysninger

### 4. Prisopsummering og rabatlogik i AftaleoverblikPage
- ⏱️ Opdater opsummering og rabatberegning ift. fabriksgaranti (kommende step)
    - Næste step: Implementér at rabat på service/reparationspriser automatisk udregnes, hvis bilen er dækket af fabriksgaranti

### 5. Test og validering af prislogik
- ⏱️ Når ovenstående er færdigt: Test og valider alle prisflows i UI

---

## Fase 2: Kundedata og Kontraktgenerering

### 4. Kundedata-siden og SMS Flow
- ✅ Brugerflade: Inputfelt for kundens mobilnummer (skal vises *efter* Aftaleoverblik er godkendt).
- ✅ Brugerflade: "Send SMS til kunde for dataopsamling" knap.
- ✅ Medsendelse af et simpelt resumé af det aftalte (fra Aftaleoverblik) i SMS-besked.
- ✅ Mock backend/API: Simuleret endpoint til at modtage mobilnummer og udløse SMS-afsendelse for kundedata.
    - ✅ Logik for landekode (baseret på admin-indstilling).
    - ✅ Generering af unikt link/token til eksternt kundedata-flow.
    - ✅ Simuleret SMS-afsendelsesmekanisme.
- 🔘 Design og implementer eksternt webflow for kundeoplysninger (separat projekt/modul).
- ✅ Mock backend/API: Simuleret endpoint til at modtage kundedata fra det eksterne flow.
- ✅ Frontend: Mekanisme til at polle/modtage opdaterede kundedata og opdatere `formData`.
- ✅ Brugerflade: Vis de indhentede kundedata på Kundedata-siden.
- ✅ Brugerflade: Mulighed for sælger at validere/redigere de modtagne kundedata.
- ✅ Validering: Sikre at kundedata er modtaget og valideret af sælger før progression til Kontrakt.
- ✅ Alternativ manuel indtastning af kundedata hvis SMS-flow ikke ønskes.

### 5. Kontrakt-siden
- ⏱️ API-kald/Logik: Generer PDF-kontrakt baseret på alle indsamlede data (`formData`).
- ⏱️ Brugerflade: Vis et preview eller bekræftelse af den genererede kontrakt.
- ⏱️ Brugerflade: Knap til "Print kontrakt".
- ⏱️ Brugerflade: Knap til "Send kontrakt via SMS".
- ⏱️ Backend/API: Endpoint til at udløse SMS-afsendelse af kontraktlink.
    - 🔘 Generering af unikt link til PDF-kontrakten.
    - 🔘 SMS-afsendelsesmekanisme.
- ✅ Sikre at stelnummer bruges som primær identifikation, når registreringsnummer ikke findes.

## Fase 3: Yderligere Funktioner og Forbedringer
- 🟤 **Admin-panel til konfiguration:**
  - ✅ Dækpriskonfiguration med fast avance, monterings- og bortskaffelsesgebyrer
  - ✅ Sæsonhjul–konfiguration med opbevarings- og skiftegebyrer
  - ✅ Mock API til gemning/hentning af konfiguration via localStorage
  - 🔘 Garantiprodukt-konfiguration
  - 🔘 Lånebils-konfiguration 
  - 🔘 Landekode-konfiguration

- 🔘 **Serviceaftale-konfiguration:**
  - 🔘 Opbygge et admin-modul til konfiguration af serviceaftaler (service og service+reparation)
  - 🔘 Implementere prisstruktur for forskellige serviceaftaleniveauer
  - 🔘 Mulighed for at konfigurere priser baseret på biltype, alder, km-forbrug og mærke/model
  - 🔘 Mock API til gemning/hentning af serviceaftalekonfiguration

- 🟤 **Avanceret priskalkulation:**
  - ✅ Dækpris-beregning baseret på biltype, vægt, hestekræfter og kørsel
  - ✅ Estimering af dæk-levetid/km
  - ✅ Samlet pris inklusiv alle gebyrer og avancer
  - 🔘 Integration med økonomisystem
- 🔘 Brugerroller og rettighedsstyring
- 🔘 **Dynamisk, landespecifikt nummerpladedesign:**
    - 🔘 Implementer funktionalitet, så nummerpladedesignet på Bildata-siden dynamisk tilpasser sig et valgt land.
    - 🔘 Inkluder visuel repræsentation af landets nummerpladeformat (f.eks. farver, layout).
    - 🔘 Vis et lille flag-ikon, der svarer til det valgte land, ved siden af eller som en del af nummerpladefeltet.
    - 🔘 Overvej tilføjelse af flag-ikoner ud for hvert land i en eventuel landevælgerliste i admin-panelet.
    - 🔘 Definer datakilde/konfiguration for landespecifikke nummerpladedetaljer (formater, farver, flag-billedstier/komponenter).

- 🔄 **Implementer virksomhedens farveskema i hele applikationen:**
    - 🔄 Opret et konsistent farveskema baseret på virksomhedens brand-farver:
      - Primær: Blå (#2563eb) - fra logo
      - Sekundær: Grå (#6b7280)
      - Success: Grøn (#10b981)
      - Advarsel: Orange (#f59e0b)
      - Fejl: Rød (#ef4444)
      - Tekst: Mørk grå (#111827)
      - Baggrund: Lys grå (#f3f4f6)
    - 🔘 Opdater alle komponenter til at bruge det nye farveskema via Tailwind konfiguration
    - 🔘 Sikre at alle knapper, forms, og UI-elementer anvender de korrekte farver
    - 🔘 Implementer hover, focus, og active states der passer med farveskemaet
    - 🔘 Sørg for at kontraster er tilstrækkelige for god læsbarhed og tilgængelighed

- 🔘 **Implementer automatisk leverandør-kommunikation efter underskrevet aftale:**
    - 🔘 **Admin-konfiguration af leverandør-kontaktoplysninger:**
        - 🔘 Tilføj sektion i admin-panelet til at konfigurere kontaktoplysninger for hver type underleverandør:
            - Serviceaftale (intern/egen håndtering)
            - Garantiforsikring (f.eks. Fragus)
            - Vejhjælp (f.eks. Assist 24)
            - Dækaftale (intern/egen håndtering)
        - 🔘 For hver leverandør skal følgende kunne konfigureres:
            - Email-adresse(r) for aftale-opstart
            - Kontaktperson(er)
            - Evt. specifik leverandør-reference eller ID
            - Email-skabelon med variabler for aftalens detaljer
    - 🔘 **Generering af pre-udfyldte emails fra Kontrakt-siden:**
        - 🔘 Tilføj en "Send aftaler til underleverandører"-sektion på Kontrakt-siden (vises når aftalen er underskrevet)
        - 🔘 Implementer checkbokse for hver relevant underleverandør baseret på de valgte services
        - 🔘 Tilføj "Generer emails" knap, der åbner kundens standard mailprogram (Outlook eller andet)
        - 🔘 Brug `mailto:`-links med pre-udfyldte emnelinjer og brødtekster baseret på skabeloner
    - 🔘 **Tydelig statusvisning for sendte emails:**
        - 🔘 Implementer en klar visuel indikation på om der er sendt mail til underleverandører efter underskrivelse
    - 🔘 **Email-indhold og skabeloner:**
        - 🔘 Skabeloner skal inkludere relevante aftaleoplysninger:
            - Kundeoplysninger (navn, kontaktinfo)
            - Køretøjsoplysninger (mærke, model, registreringsnummer, stelnummer)
            - Aftaledetaljer (aftaletype, løbetid, km-forbrug, pris)
            - Specifikke detaljer for den relevante service (f.eks. garantiniveau, vejhjælpsdækning)
        - 🔘 Mulighed for at vedhæfte PDF-kontrakt eller henvise til denne i email-teksten
    - 🔘 **Sporingsmekanisme:**
        - 🔘 Implementer mulighed for at markere når emails er sendt til hver underleverandør
        - 🔘 Visuel indikation af status på alle påkrævede opsætnings-emails

- 🔘 **Implementer bruger-support og søgefunktionalitet i admin-området:**
    - 🔘 **Integreret FAQ-sektion:**
        - 🔘 Skab en dedikeret FAQ-side i admin-området
        - 🔘 Organiser FAQ-indhold i kategorier (Generelt, Serviceaftaler, Dækaftaler, Garantiforsikring, Vejhjælp, osv.)
        - 🔘 Implementer mulighed for at "favorisere" ofte stillede spørgsmål
        - 🔘 Tilføj et admin-modul til at redigere FAQ-indhold uden kodning
    - 🔘 **Global søgefunktionalitet:**
        - 🔘 Implementer en søgebar i topmenuen der særger på tværs af admin-moduler
        - 🔘 Kategoriser søgeresultater efter funktionsområde
        - 🔘 Inkluder "quick-links" til almindelige handlinger direkte fra søgeresultaterne
        - 🔘 Implementer auto-complete og forslag under indtastning
    - 🔘 **Søgning i aftaleoversigt:**
        - 🔘 Tilføj mulighed for at fremsøge tidligere afsluttede, afsluttede og aktive kontrakter
        - 🔘 Implementer filtrerings- og sorteringsmuligheder for kontraktsøgning
    - 🔘 **Kontekstspecifik hjælp:**
        - 🔘 Tilføj hjælp-ikoner ved komplekse funktioner med hover/klik tooltips
        - 🔘 Udvikl et dynamisk "Hvordan gør jeg..."-panel i sidebaren 
        - 🔘 Skab trinvise vejledninger for komplekse processer
    - 🔘 **Interaktive vejledninger for nye brugere:**
        - 🔘 Design en "Kom godt i gang"-guide for førstegangsbrug
        - 🔘 Implementer interaktive tours der guider brugeren gennem vigtige funktioner
        - 🔘 Skab videovejledninger for centrale processer med mulighed for at integrere dem direkte i admin-grænsefladen
