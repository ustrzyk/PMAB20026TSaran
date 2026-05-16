import type {CategoryDto, Item} from '../types/models.ts';

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
  CreateCategory: undefined;
  EditCategory: {
    category: CategoryDto;
  };

  Units: undefined;
  Cart: undefined;
};