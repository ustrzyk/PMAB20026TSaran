import type {
  CategoryDto,
  ClientDto,
  Item,
  OrderDto,
  OrderItemDto,
  UnitOfMeasurementDto,
  WorkerDto,
} from '../types/models.ts';

export type RootStackParamList = {
  Home: undefined;

  Dashboard: undefined;

  Items: undefined;
  AdminItems: undefined;

  ItemDetails: {
    item: Item;
  };
  CreateItem: undefined;
  EditItem: {
    item: Item;
  };

  Cart: undefined;

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

  OrderItems:
    | {
        idOrder?: number;
        orderTitle?: string;
      }
    | undefined;

  CreateOrderItem:
    | {
        idOrder?: number;
      }
    | undefined;

  EditOrderItem: {
    orderItem: OrderItemDto;
  };
};