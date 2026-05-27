export interface ItemDto {
  idItem: number;
  name: string;
  description: string;
  idCategory: number;
  categoryName: string;
  price: number;
  quantity: number;
  fotoUrl?: string | null;
  idUnitOfMeasurement: number;
  unitName: string;
  code: string;
  isActive: boolean;
}

export type Item = ItemDto;

export interface CreateItemCommand {
  name: string;
  description: string;
  idCategory: number;
  price: number;
  quantity: number;
  fotoUrl?: string | null;
  idUnitOfMeasurement: number;
  code: string;
  isActive?: boolean;
}

export interface UpdateItemCommand {
  idItem: number;
  name: string;
  description: string;
  idCategory: number;
  price: number;
  quantity: number;
  fotoUrl?: string | null;
  idUnitOfMeasurement: number;
  code: string;
  isActive: boolean;
}

export interface CreateItemResponse {
  id: number;
  message: string;
}

export interface CategoryDto {
  idCategory: number;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface CreateCategoryCommand {
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateCategoryCommand {
  idCategory: number;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface CreateCategoryResponse {
  id: number;
  message?: string;
}

export interface UnitOfMeasurementDto {
  idUnitOfMeasurement: number;
  name: string;
  shortcut?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export interface CreateUnitOfMeasurementCommand {
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateUnitOfMeasurementCommand {
  idUnitOfMeasurement: number;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface CreateUnitOfMeasurementResponse {
  id: number;
  message?: string;
}

export interface ClientDto {
  idClient: number;
  name: string;
  adress?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  isActive?: boolean;
}

export interface CreateClientCommand {
  name: string;
  adress?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  password?: string | null;
  isActive?: boolean;
}

export interface UpdateClientCommand {
  idClient: number;
  name: string;
  adress?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  password?: string | null;
  isActive?: boolean;
}

export interface CreateClientResponse {
  id: number;
  message?: string;
}

export type WorkerRole = 'Admin' | 'Worker';

export interface WorkerDto {
  idWorker: number;
  firstName?: string | null;
  lastName?: string | null;
  login: string;
  role?: WorkerRole | string | null;
  isActive?: boolean;
}

export interface CreateWorkerCommand {
  firstName?: string | null;
  lastName?: string | null;
  login: string;
  password?: string | null;
  role?: WorkerRole | string | null;
  isActive?: boolean;
}

export interface UpdateWorkerCommand {
  idWorker: number;
  firstName?: string | null;
  lastName?: string | null;
  login: string;
  password?: string | null;
  role?: WorkerRole | string | null;
  isActive?: boolean;
}

export interface CreateWorkerResponse {
  id: number;
  message?: string;
}

export interface WorkerLoginRequestDto {
  login: string;
  password: string;
}

export interface WorkerLoginResponseDto {
  idWorker: number;
  name: string;
  login: string;
  role: WorkerRole | string;
}

export interface CustomerLoginRequestDto {
  email: string;
  password: string;
}

export interface CustomerRegisterRequestDto {
  name: string;
  email: string;
  password: string;
  adress?: string | null;
  phoneNumber?: string | null;
}

export interface CustomerLoginResponseDto {
  idClient: number;
  name: string;
  email: string;
  adress?: string | null;
  phoneNumber?: string | null;
}

export type OrderStatus =
  | 'Nowe'
  | 'W realizacji'
  | 'Gotowe'
  | 'Wysłane'
  | 'Zakończone'
  | 'Anulowane';

export const ORDER_STATUSES: OrderStatus[] = [
  'Nowe',
  'W realizacji',
  'Gotowe',
  'Wysłane',
  'Zakończone',
  'Anulowane',
];

export interface OrderDto {
  idOrder: number;
  dataOrder?: string | null;

  idClient?: number | null;
  clientName?: string | null;

  idWorker?: number | null;
  workerName?: string | null;

  notes?: string | null;
  deliveryDate?: string | null;
  status?: OrderStatus | string | null;

  orderItemsCount: number;
  totalValue: number;

  isActive?: boolean;
}

export interface CreateOrderCommand {
  dataOrder?: string | null;
  idClient?: number | null;
  idWorker?: number | null;
  notes?: string | null;
  deliveryDate?: string | null;
  status?: OrderStatus | string | null;
  isActive?: boolean;
}

export interface UpdateOrderCommand {
  idOrder: number;
  dataOrder?: string | null;
  idClient?: number | null;
  idWorker?: number | null;
  notes?: string | null;
  deliveryDate?: string | null;
  status?: OrderStatus | string | null;
  isActive?: boolean;
}

export interface CreateOrderResponse {
  id: number;
  message?: string;
}

export interface OrderItemDto {
  idOrderItem: number;
  idOrder: number;

  idItem: number;
  itemName?: string | null;
  itemCode?: string | null;

  quantity?: number | null;

  itemPrice: number;
  lineValue: number;

  isActive?: boolean;
}

export interface CreateOrderItemCommand {
  idOrder: number;
  idItem: number;
  quantity?: number | null;
}

export interface UpdateOrderItemCommand {
  idOrderItem: number;
  idOrder: number;
  idItem: number;
  quantity?: number | null;
  isActive?: boolean;
}

export interface CreateOrderItemResponse {
  id: number;
  message?: string;
}

export interface CheckoutClientDto {
  idClient?: number | null;
  name: string;
  address: string;
  phoneNumber: string;
  email?: string | null;
}

export interface CheckoutItemDto {
  idItem: number;
  quantity: number;
}

export interface CreateCheckoutOrderCommand {
  client: CheckoutClientDto;
  items: CheckoutItemDto[];
  notes?: string | null;
  deliveryDate?: string | null;
}

export interface CheckoutOrderResponseDto {
  idOrder: number;
  idClient: number;
  totalValue: number;
  message: string;
}

export interface DashboardLatestOrderDto {
  idOrder: number;
  dataOrder?: string | null;

  clientName?: string | null;
  workerName?: string | null;

  orderItemsCount: number;
  totalValue: number;
}

export interface DashboardLowStockProductDto {
  idItem: number;

  name?: string | null;
  code?: string | null;

  quantity?: number | null;

  unitName?: string | null;
  categoryName?: string | null;

  price?: number | null;
  stockValue: number;
}

export interface DashboardCategorySalesDto {
  idCategory: number;

  categoryName?: string | null;

  totalQuantity: number;
  totalValue: number;
}

export interface DashboardTopProductDto {
  idItem: number;

  name?: string | null;
  code?: string | null;

  categoryName?: string | null;

  totalQuantity: number;
  totalValue: number;
}

export interface DashboardDto {
  productsCount: number;
  categoriesCount: number;
  unitsCount: number;

  clientsCount: number;
  workersCount: number;

  ordersCount: number;
  activeOrdersCount: number;
  inactiveOrdersCount: number;

  orderItemsCount: number;

  productsValue: number;
  ordersValue: number;

  latestOrders: DashboardLatestOrderDto[];
  lowStockProducts: DashboardLowStockProductDto[];
  categorySales: DashboardCategorySalesDto[];
  topProducts: DashboardTopProductDto[];
}