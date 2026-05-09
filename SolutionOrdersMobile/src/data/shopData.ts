import {Category, Product} from '../types/shop';

export const categories: Category[] = [
  {id: 1, name: 'Drukarki 3D'},
  {id: 2, name: 'Filamenty'},
  {id: 3, name: 'Dysze'},
  {id: 4, name: 'Stoły robocze'},
  {id: 5, name: 'Części'},
  {id: 6, name: 'Narzędzia'},
];

export const products: Product[] = [
  {
    id: 1,
    name: 'Creality Ender 3 V3 SE',
    categoryId: 1,
    categoryName: 'Drukarki 3D',
    price: 1099,
    tag: 'Bestseller',
    description: 'Popularna drukarka 3D FDM, idealna dla początkujących.',
  },
  {
    id: 2,
    name: 'Bambu Lab A1 Mini',
    categoryId: 1,
    categoryName: 'Drukarki 3D',
    price: 1499,
    tag: 'Nowość',
    description: 'Kompaktowa i szybka drukarka 3D do zastosowań domowych.',
  },
  {
    id: 3,
    name: 'Filament PLA Black 1kg',
    categoryId: 2,
    categoryName: 'Filamenty',
    price: 79,
    tag: 'Popularne',
    description: 'Uniwersalny filament PLA do codziennych wydruków.',
  },
  {
    id: 4,
    name: 'Zestaw dysz 0.4 mm',
    categoryId: 3,
    categoryName: 'Dysze',
    price: 29,
    tag: 'Akcesoria',
    description: 'Zapasowe dysze do najpopularniejszych głowic drukujących.',
  },
  {
    id: 5,
    name: 'Płyta PEI 235x235 mm',
    categoryId: 4,
    categoryName: 'Stoły robocze',
    price: 89,
    tag: 'Polecane',
    description: 'Elastyczna powierzchnia robocza PEI do drukarek 3D.',
  },
  {
    id: 6,
    name: 'Szpachelka do zdejmowania wydruków',
    categoryId: 6,
    categoryName: 'Narzędzia',
    price: 19,
    tag: 'Narzędzia',
    description: 'Akcesorium pomocne przy zdejmowaniu modeli ze stołu.',
  },
];

export const hitProducts: Product[] = [
  {
    id: 99,
    name: 'Anycubic Kobra 2 Neo',
    categoryId: 1,
    categoryName: 'Drukarki 3D',
    price: 1299,
    tag: 'Hit tygodnia',
    description:
      'Nowoczesna drukarka 3D z automatycznym poziomowaniem stołu.',
  },
  {
    id: 100,
    name: 'Filament PLA Red 1kg',
    categoryId: 2,
    categoryName: 'Filamenty',
    price: 82,
    tag: 'Promocja',
    description:
      'Czerwony filament PLA do codziennych wydruków i testów modeli.',
  },
  {
    id: 101,
    name: 'Dysza 0.6 mm Hardened Steel',
    categoryId: 3,
    categoryName: 'Dysze',
    price: 29,
    tag: 'Polecane',
    description:
      'Utwardzana dysza do filamentów technicznych i ściernych.',
  },
  {
    id: 102,
    name: 'Płyta PEI 235x235 mm',
    categoryId: 4,
    categoryName: 'Stoły robocze',
    price: 89,
    tag: 'Bestseller',
    description:
      'Elastyczna powierzchnia robocza PEI ułatwiająca zdejmowanie wydruków.',
  },
];