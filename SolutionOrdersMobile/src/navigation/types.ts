import type {
  CategoryDto,
  ClientDto,
  Item,
  OrderDto,
  UnitOfMeasurementDto,
  WorkerDto,
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

  Workers: undefined;
  CreateWorker: undefined;
  EditWorker: {
    worker: WorkerDto;
  };

  Orders: undefined;
  CreateOrder: undefined;
  EditOrder: {
    order: OrderDto;
  };

  Cart: undefined;
};