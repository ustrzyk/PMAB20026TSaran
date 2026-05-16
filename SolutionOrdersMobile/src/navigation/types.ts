import type {
  CategoryDto,
  ClientDto,
  Item,
  UnitOfMeasurementDto,
} from '../types/models.ts';

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
  CreateUnit: undefined;
  EditUnit: {
    unit: UnitOfMeasurementDto;
  };

  Clients: undefined;
  CreateClient: undefined;
  EditClient: {
    client: ClientDto;
  };

  Cart: undefined;
};