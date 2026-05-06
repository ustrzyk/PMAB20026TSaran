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
    category: 'Drukarka 3D',
    price: '1 099 zł',
    tag: 'Bestseller',
    description: 'Popularna drukarka 3D FDM, idealna dla początkujących.',
  },
  {
    id: 2,
    name: 'Bambu Lab A1 Mini',
    category: 'Drukarka 3D',
    price: '1 499 zł',
    tag: 'Nowość',
    description: 'Kompaktowa i szybka drukarka 3D do zastosowań domowych.',
  },
  {
    id: 3,
    name: 'Filament PLA Black 1kg',
    category: 'Filament',
    price: '79 zł',
    tag: 'Popularne',
    description: 'Uniwersalny filament PLA do codziennych wydruków.',
  },
  {
    id: 4,
    name: 'Zestaw dysz 0.4 mm',
    category: 'Akcesoria',
    price: '29 zł',
    tag: 'Akcesoria',
    description: 'Zapasowe dysze do najpopularniejszych głowic drukujących.',
  },
];

export const hitProduct: Product = {
  id: 99,
  name: 'Anycubic Kobra 2 Neo',
  category: 'Hit tygodnia',
  price: '1 299 zł',
  tag: 'Promocja',
  description:
    'Nowoczesna drukarka 3D z automatycznym poziomowaniem stołu.',
};