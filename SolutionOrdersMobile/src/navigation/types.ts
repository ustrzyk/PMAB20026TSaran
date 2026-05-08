import type {Item} from '../types/models.ts';

export type RootStackParamList = {
  Home: undefined;
  Items: undefined;
  ItemDetails: {
    item: Item;
  };
  CreateItem: undefined;
  EditItem: {
    item: Item;
  };
  Categories: undefined;
  Units: undefined;
  Cart: undefined;
};