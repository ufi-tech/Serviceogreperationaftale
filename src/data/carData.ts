// Autofuldførelsesdata for bilmærker og elbil-modeller 2025
// Kun elektriske køretøjer er inkluderet i denne liste

interface ModelOption {
  value: string;
  label: string;
}

interface BrandOption {
  value: string;
  label: string;
  models: ModelOption[];
}

const carBrands: BrandOption[] = [
  {
    value: 'tesla',
    label: 'Tesla',
    models: [
      { value: 'model3', label: 'Model 3' },
      { value: 'modely', label: 'Model Y' },
      { value: 'models', label: 'Model S' },
      { value: 'modelx', label: 'Model X' },
      { value: 'cybertruck', label: 'Cybertruck' },
      { value: 'roadster', label: 'Roadster' },
      { value: 'semi', label: 'Semi' },
    ]
  },
  {
    value: 'volkswagen',
    label: 'Volkswagen',
    models: [
      { value: 'id3', label: 'ID.3' },
      { value: 'id4', label: 'ID.4' },
      { value: 'id5', label: 'ID.5' },
      { value: 'id7', label: 'ID.7' },
      { value: 'idbuzz', label: 'ID. Buzz' },
      { value: 'idvizzion', label: 'ID. Vizzion' },
      { value: 'idspace', label: 'ID. Space Vizzion' },
      { value: 'id2', label: 'ID.2' },
      { value: 'id2all', label: 'ID.2all' },
      { value: 'idxtreme', label: 'ID. Xtreme' },
    ]
  },
  {
    value: 'audi',
    label: 'Audi',
    models: [
      { value: 'etron', label: 'e-tron' },
      { value: 'etrongt', label: 'e-tron GT' },
      { value: 'q4etron', label: 'Q4 e-tron' },
      { value: 'q4etronsportback', label: 'Q4 e-tron Sportback' },
      { value: 'q6etron', label: 'Q6 e-tron' },
      { value: 'q6etronsportback', label: 'Q6 e-tron Sportback' },
      { value: 'q8etron', label: 'Q8 e-tron' },
      { value: 'q8etronsportback', label: 'Q8 e-tron Sportback' },
      { value: 'etronsportback', label: 'e-tron Sportback' },
      { value: 'a6etron', label: 'A6 e-tron' },
      { value: 'a6etronavant', label: 'A6 e-tron Avant' },
    ]
  },
  {
    value: 'bmw',
    label: 'BMW',
    models: [
      { value: 'i3', label: 'i3' },
      { value: 'i4', label: 'i4' },
      { value: 'i4m50', label: 'i4 M50' },
      { value: 'i5', label: 'i5' },
      { value: 'i5m60', label: 'i5 M60' },
      { value: 'i5touring', label: 'i5 Touring' },
      { value: 'i7', label: 'i7' },
      { value: 'i7m70', label: 'i7 M70' },
      { value: 'ix', label: 'iX' },
      { value: 'ixm60', label: 'iX M60' },
      { value: 'ix1', label: 'iX1' },
      { value: 'ix2', label: 'iX2' },
      { value: 'ix3', label: 'iX3' },
      { value: 'ix5', label: 'iX5 Hydrogen' },
      { value: 'ixflow', label: 'iX Flow' },
    ]
  },
  {
    value: 'mercedes',
    label: 'Mercedes-Benz',
    models: [
      { value: 'eqa', label: 'EQA' },
      { value: 'eqb', label: 'EQB' },
      { value: 'eqc', label: 'EQC' },
      { value: 'eqe', label: 'EQE' },
      { value: 'eqesedanamg', label: 'EQE AMG' },
      { value: 'eqesuv', label: 'EQE SUV' },
      { value: 'eqesuvamg', label: 'EQE SUV AMG' },
      { value: 'eqs', label: 'EQS' },
      { value: 'eqssedanamg', label: 'EQS AMG' },
      { value: 'eqssuv', label: 'EQS SUV' },
      { value: 'eqssuv680', label: 'EQS SUV Maybach' },
      { value: 'eqt', label: 'EQT' },
      { value: 'eqv', label: 'EQV' },
      { value: 'esprinter', label: 'eSprinter' },
      { value: 'evito', label: 'eVito' },
      { value: 'ecitan', label: 'eCitan' },
    ]
  },
  {
    value: 'hyundai',
    label: 'Hyundai',
    models: [
      { value: 'kona', label: 'Kona Electric' },
      { value: 'konaN', label: 'Kona Electric N' },
      { value: 'ioniq5', label: 'IONIQ 5' },
      { value: 'ioniq5n', label: 'IONIQ 5 N' },
      { value: 'ioniq6', label: 'IONIQ 6' },
      { value: 'ioniq7', label: 'IONIQ 7' },
      { value: 'ioniq9', label: 'IONIQ 9' },
    ]
  },
  {
    value: 'kia',
    label: 'Kia',
    models: [
      { value: 'ev6', label: 'EV6' },
      { value: 'ev6gt', label: 'EV6 GT' },
      { value: 'ev9', label: 'EV9' },
      { value: 'niroev', label: 'Niro EV' },
      { value: 'ev3', label: 'EV3' },
      { value: 'ev4', label: 'EV4' },
      { value: 'ev5', label: 'EV5' },
    ]
  },
  {
    value: 'volvo',
    label: 'Volvo',
    models: [
      { value: 'c40', label: 'C40 Recharge' },
      { value: 'xc40', label: 'XC40 Recharge' },
      { value: 'ex30', label: 'EX30' },
      { value: 'ex60', label: 'EX60' },
      { value: 'ex90', label: 'EX90' },
      { value: 'em90', label: 'EM90' },
    ]
  },
  {
    value: 'polestar',
    label: 'Polestar',
    models: [
      { value: 'polestar2', label: 'Polestar 2' },
      { value: 'polestar3', label: 'Polestar 3' },
      { value: 'polestar4', label: 'Polestar 4' },
      { value: 'polestar5', label: 'Polestar 5' },
      { value: 'polestar6', label: 'Polestar 6' },
    ]
  },
  {
    value: 'nissan',
    label: 'Nissan',
    models: [
      { value: 'leaf', label: 'Leaf' },
      { value: 'ariya', label: 'Ariya' },
      { value: 'townstar', label: 'Townstar EV' },
      { value: 'sakura', label: 'Sakura' },
      { value: 'micra', label: 'Micra EV' },
    ]
  },
  {
    value: 'ford',
    label: 'Ford',
    models: [
      { value: 'mustangmache', label: 'Mustang Mach-E' },
      { value: 'mustangmachegt', label: 'Mustang Mach-E GT' },
      { value: 'f150lightning', label: 'F-150 Lightning' },
      { value: 'explorer', label: 'Explorer EV' },
      { value: 'puma', label: 'Puma Electric' },
      { value: 'etransit', label: 'E-Transit' },
      { value: 'etransiccustom', label: 'E-Transit Custom' },
      { value: 'etourneo', label: 'E-Tourneo' },
    ]
  },
  {
    value: 'peugeot',
    label: 'Peugeot',
    models: [
      { value: 'e208', label: 'e-208' },
      { value: 'e308', label: 'e-308' },
      { value: 'e308sw', label: 'e-308 SW' },
      { value: 'e2008', label: 'e-2008' },
      { value: 'e3008', label: 'e-3008' },
      { value: 'e5008', label: 'e-5008' },
      { value: 'partner', label: 'e-Partner' },
      { value: 'traveller', label: 'e-Traveller' },
      { value: 'rifter', label: 'e-Rifter' },
      { value: 'boxer', label: 'e-Boxer' },
    ]
  },
  {
    value: 'citroen',
    label: 'Citroën',
    models: [
      { value: 'ec3', label: 'ë-C3' },
      { value: 'ec3x', label: 'ë-C3 X' },
      { value: 'ec4', label: 'ë-C4' },
      { value: 'ec4x', label: 'ë-C4 X' },
      { value: 'eberlingo', label: 'ë-Berlingo' },
      { value: 'espacetime', label: 'ë-SpaceTourer' },
      { value: 'ejumpy', label: 'ë-Jumpy' },
      { value: 'ejumper', label: 'ë-Jumper' },
    ]
  },
  {
    value: 'opel',
    label: 'Opel/Vauxhall',
    models: [
      { value: 'corsa', label: 'Corsa Electric' },
      { value: 'mokka', label: 'Mokka Electric' },
      { value: 'astra', label: 'Astra Electric' },
      { value: 'astrasports', label: 'Astra Sports Tourer Electric' },
      { value: 'combo', label: 'Combo Electric' },
      { value: 'zafira', label: 'Zafira Electric' },
      { value: 'vivaro', label: 'Vivaro Electric' },
      { value: 'movano', label: 'Movano Electric' },
      { value: 'experimental', label: 'Experimental Electric' },
    ]
  },
  {
    value: 'fiat',
    label: 'Fiat',
    models: [
      { value: '500e', label: '500e' },
      { value: 'pandaev', label: 'Panda Electric' },
      { value: 'grandepanda', label: 'Grande Panda' },
      { value: 'topolino', label: 'Topolino' },
      { value: 'dobloev', label: 'Doblo Electric' },
      { value: 'scudoev', label: 'Scudo Electric' },
      { value: 'ducatoev', label: 'Ducato Electric' },
    ]
  },
  {
    value: 'ds',
    label: 'DS',
    models: [
      { value: 'ds3etense', label: 'DS 3 E-Tense' },
      { value: 'ds4etense', label: 'DS 4 E-Tense' },
      { value: 'ds7etense', label: 'DS 7 E-Tense' },
      { value: 'ds9etense', label: 'DS 9 E-Tense' },
    ]
  },
  {
    value: 'jeep',
    label: 'Jeep',
    models: [
      { value: 'avenger', label: 'Avenger Electric' },
      { value: 'recon', label: 'Recon' },
      { value: 'wagoneer', label: 'Wagoneer S' },
    ]
  },
  {
    value: 'alfaromeo',
    label: 'Alfa Romeo',
    models: [
      { value: 'junior', label: 'Junior Elettrica' },
      { value: 'stelvioev', label: 'Stelvio Electric' },
      { value: 'giuliaev', label: 'Giulia Electric' },
    ]
  },
  {
    value: 'lancia',
    label: 'Lancia',
    models: [
      { value: 'ypsilon', label: 'Ypsilon Electric' },
      { value: 'gamma', label: 'Gamma Electric' },
      { value: 'delta', label: 'Delta Electric' },
    ]
  },
  {
    value: 'renault',
    label: 'Renault',
    models: [
      { value: 'zoe', label: 'Zoe' },
      { value: 'megane', label: 'Megane E-Tech' },
      { value: 'scenic', label: 'Scenic E-Tech' },
      { value: 'r5', label: 'R5 E-Tech' },
      { value: 'r4', label: 'R4 E-Tech' },
      { value: 'twizy', label: 'Twizy' },
      { value: 'kangoo', label: 'Kangoo E-Tech' },
      { value: 'master', label: 'Master E-Tech' },
    ]
  },
  {
    value: 'dacia',
    label: 'Dacia',
    models: [
      { value: 'spring', label: 'Spring Electric' },
      { value: 'bigster', label: 'Bigster Electric' },
    ]
  },
  {
    value: 'skoda',
    label: 'Skoda',
    models: [
      { value: 'enyaq', label: 'Enyaq iV' },
      { value: 'enyaqrs', label: 'Enyaq RS iV' },
      { value: 'enyaqcoupe', label: 'Enyaq Coupé iV' },
      { value: 'enyaqcoupers', label: 'Enyaq Coupé RS iV' },
      { value: 'elroq', label: 'Elroq' },
      { value: 'epopular', label: 'Epopular' },
      { value: 'id2', label: 'ID.2 Skoda version' },
    ]
  },
  {
    value: 'mg',
    label: 'MG',
    models: [
      { value: 'mg4', label: 'MG4 Electric' },
      { value: 'mg4xpower', label: 'MG4 XPower' },
      { value: 'zs', label: 'ZS EV' },
      { value: 'marvel', label: 'Marvel R' },
      { value: 'mg5', label: 'MG5 Electric' },
      { value: 'cyberster', label: 'Cyberster' },
      { value: 'ei5', label: 'EI5' },
    ]
  },
  {
    value: 'byd',
    label: 'BYD',
    models: [
      { value: 'atto3', label: 'ATTO 3' },
      { value: 'seal', label: 'SEAL' },
      { value: 'dolphin', label: 'DOLPHIN' },
      { value: 'sealU', label: 'SEAL U' },
      { value: 'tang', label: 'TANG' },
      { value: 'han', label: 'HAN' },
      { value: 'sealv', label: 'SEAL V' },
      { value: 'yangwang', label: 'Yangwang U8' },
      { value: 'denza', label: 'DENZA D9' },
    ]
  },
  {
    value: 'toyota',
    label: 'Toyota',
    models: [
      { value: 'bz4x', label: 'bZ4X' },
      { value: 'bz3x', label: 'bZ3X' },
      { value: 'bz3', label: 'bZ3' },
      { value: 'bz5x', label: 'bZ5X' },
      { value: 'prollye', label: 'Proace Electric' },
      { value: 'prollycitye', label: 'Proace City Electric' },
    ]
  },
  {
    value: 'lexus',
    label: 'Lexus',
    models: [
      { value: 'rz', label: 'RZ 450e' },
      { value: 'uz', label: 'UZ' },
      { value: 'lbx', label: 'LBX Electric' },
      { value: 'lf30', label: 'LF-30' },
    ]
  },
  {
    value: 'cupra',
    label: 'Cupra',
    models: [
      { value: 'born', label: 'Born' },
      { value: 'tavascan', label: 'Tavascan' },
      { value: 'urbanrebel', label: 'Urban Rebel' },
    ]
  },
  {
    value: 'porsche',
    label: 'Porsche',
    models: [
      { value: 'taycan', label: 'Taycan' },
      { value: 'taycancross', label: 'Taycan Cross Turismo' },
      { value: 'taycansport', label: 'Taycan Sport Turismo' },
      { value: 'macan', label: 'Macan Electric' },
      { value: 'caysturbo', label: 'Cayenne Electric' },
      { value: '718electric', label: '718 Electric' },
    ]
  },
  {
    value: 'maxus',
    label: 'Maxus',
    models: [
      { value: 'euniq5', label: 'EUNIQ 5' },
      { value: 'euniq6', label: 'EUNIQ 6' },
      { value: 'mifa9', label: 'MIFA 9' },
      { value: 'euniq7', label: 'EUNIQ 7' },
      { value: 'e-deliver3', label: 'e-DELIVER 3' },
      { value: 'e-deliver9', label: 'e-DELIVER 9' },
      { value: 't90ev', label: 'T90 EV' },
    ]
  },
  {
    value: 'smart',
    label: 'Smart',
    models: [
      { value: 'smart1', label: 'Smart #1' },
      { value: 'smart3', label: 'Smart #3' },
      { value: 'smart5', label: 'Smart #5' },
    ]
  },
  {
    value: 'xpeng',
    label: 'XPeng',
    models: [
      { value: 'p7', label: 'P7' },
      { value: 'g6', label: 'G6' },
      { value: 'g9', label: 'G9' },
      { value: 'p5', label: 'P5' },
    ]
  },
  {
    value: 'nio',
    label: 'NIO',
    models: [
      { value: 'et5', label: 'ET5' },
      { value: 'et7', label: 'ET7' },
      { value: 'el6', label: 'EL6' },
      { value: 'el7', label: 'EL7' },
      { value: 'es6', label: 'ES6' },
      { value: 'es7', label: 'ES7' },
      { value: 'es8', label: 'ES8' },
    ]
  },
  {
    value: 'lucid',
    label: 'Lucid',
    models: [
      { value: 'air', label: 'Air' },
      { value: 'gravity', label: 'Gravity' },
    ]
  },
  {
    value: 'rivian',
    label: 'Rivian',
    models: [
      { value: 'r1t', label: 'R1T' },
      { value: 'r1s', label: 'R1S' },
      { value: 'r2', label: 'R2' },
      { value: 'r3', label: 'R3' },
      { value: 'r3x', label: 'R3X' },
    ]
  },
  {
    value: 'honda',
    label: 'Honda',
    models: [
      { value: 'e', label: 'Honda e' },
      { value: 'prologue', label: 'Prologue' },
      { value: 'e-ny1', label: 'e:Ny1' },
    ]
  },
  {
    value: 'subaru',
    label: 'Subaru',
    models: [
      { value: 'solterra', label: 'Solterra' },
    ]
  },
  {
    value: 'genesis',
    label: 'Genesis',
    models: [
      { value: 'gv60', label: 'GV60' },
      { value: 'gv70', label: 'Electrified GV70' },
      { value: 'g80', label: 'Electrified G80' },
    ]
  }
];

export { carBrands };
export type { BrandOption, ModelOption };
