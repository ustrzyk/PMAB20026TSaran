import type {Item} from '../types/models.ts';

export type RootStackParamList = {
  Home: undefined;

  // Lista produktów
  Items: undefined;

  // Szczegóły produktu
  ItemDetails: {
    item: Item;
  };

  // Dodawanie produktu
  CreateItem: undefined;

  // Edycja produktu
  EditItem: {
    item: Item;
  };

  // Kategorie produktów
  Categories: undefined;

  // Jednostki miary
  Units: undefined;

  // Koszyk
  Cart: undefined;
};