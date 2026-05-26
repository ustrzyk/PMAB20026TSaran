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
  AuthLogin: undefined;
  Register: undefined;
  ClientPanel: undefined;
  CustomerOrders: undefined;

  Home: undefined;

  Dashboard: undefined;
  AdminPanel: undefined;

  Items:
    | {
        initialCategory?: string;
        initialSearch?: string;
      }
    | undefined;

  AdminItems: undefined;

  TrackOrder:
    | {
        idOrder?: number;
      }
    | undefined;

  ItemDetails: {
    item: Item;
  };

  CreateItem: undefined;
  EditItem: {
    item: Item;
  };

  Cart: undefined;

  OrderSuccess: {
    idOrder: number;
    totalValue: number;
    message?: string | null;

    deliveryPrice?: number;
    finalValue?: number;
    deliveryMethod?: string;
    paymentMethod?: string;
    deliveryDate?: string;
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