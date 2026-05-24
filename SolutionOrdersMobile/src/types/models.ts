// Modele TypeScript dopasowane do DTO i Command z API.

// Produkt zwracany z GET /api/Item oraz GET /api/Item/{id}
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

// Dane wysyłane przy tworzeniu produktu - POST /api/Item
export interface CreateItemCommand {
  name: string;
  description: string;
  idCategory: number;
  price: number;
  quantity: number;
  fotoUrl?: string | null;
  idUnitOfMeasurement: number;
  code: string;
}

// Dane wysyłane przy aktualizacji produktu - PUT /api/Item/{id}
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

// Odpowiedź z API po utworzeniu produktu.
export interface CreateItemResponse {
  id: number;
  message: string;
}

// Kategoria produktu.
export interface CategoryDto {
  idCategory: number;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

// Dane wysyłane przy tworzeniu kategorii - POST /api/Category
export interface CreateCategoryCommand {
  name: string;
  description?: string | null;
}

// Dane wysyłane przy aktualizacji kategorii - PUT /api/Category/{id}
export interface UpdateCategoryCommand {
  idCategory: number;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

// Odpowiedź z API po utworzeniu kategorii.
export interface CreateCategoryResponse {
  id: number;
  message?: string;
}

// Jednostka miary.
export interface UnitOfMeasurementDto {
  idUnitOfMeasurement: number;
  name: string;
  shortcut?: string | null;
  description?: string | null;
  isActive?: boolean;
}

// Dane wysyłane przy tworzeniu jednostki miary - POST /api/UnitOfMeasurement
export interface CreateUnitOfMeasurementCommand {
  name: string;
  description?: string | null;
}

// Dane wysyłane przy aktualizacji jednostki miary - PUT /api/UnitOfMeasurement/{id}
export interface UpdateUnitOfMeasurementCommand {
  idUnitOfMeasurement: number;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

// Odpowiedź z API po utworzeniu jednostki miary.
export interface CreateUnitOfMeasurementResponse {
  id: number;
  message?: string;
}

// Klient.
export interface ClientDto {
  idClient: number;
  name: string;
  adress?: string | null;
  phoneNumber?: string | null;
  isActive?: boolean;
}

// Dane wysyłane przy tworzeniu klienta - POST /api/Client
export interface CreateClientCommand {
  name: string;
  adress?: string | null;
  phoneNumber?: string | null;
}

// Dane wysyłane przy aktualizacji klienta - PUT /api/Client/{id}
export interface UpdateClientCommand {
  idClient: number;
  name: string;
  adress?: string | null;
  phoneNumber?: string | null;
  isActive?: boolean;
}

// Odpowiedź z API po utworzeniu klienta.
export interface CreateClientResponse {
  id: number;
  message?: string;
}

// Pracownik.
export interface WorkerDto {
  idWorker: number;
  firstName?: string | null;
  lastName?: string | null;
  login: string;
  isActive?: boolean;
}

// Dane wysyłane przy tworzeniu pracownika - POST /api/Worker
export interface CreateWorkerCommand {
  firstName?: string | null;
  lastName?: string | null;
  login: string;
  password?: string | null;
}

// Dane wysyłane przy aktualizacji pracownika - PUT /api/Worker/{id}
export interface UpdateWorkerCommand {
  idWorker: number;
  firstName?: string | null;
  lastName?: string | null;
  login: string;
  password?: string | null;
  isActive?: boolean;
}

// Odpowiedź z API po utworzeniu pracownika.
export interface CreateWorkerResponse {
  id: number;
  message?: string;
}

// Zamówienie.
export interface OrderDto {
  idOrder: number;
  dataOrder?: string | null;

  idClient?: number | null;
  clientName?: string | null;

  idWorker?: number | null;
  workerName?: string | null;

  notes?: string | null;
  deliveryDate?: string | null;

  orderItemsCount: number;

  // Suma wartości zamówienia wyliczana w backendzie.
  totalValue: number;
}

// Dane wysyłane przy tworzeniu zamówienia - POST /api/Order
export interface CreateOrderCommand {
  dataOrder?: string | null;
  idClient?: number | null;
  idWorker?: number | null;
  notes?: string | null;
  deliveryDate?: string | null;
}

// Dane wysyłane przy aktualizacji zamówienia - PUT /api/Order/{id}
export interface UpdateOrderCommand {
  idOrder: number;
  dataOrder?: string | null;
  idClient?: number | null;
  idWorker?: number | null;
  notes?: string | null;
  deliveryDate?: string | null;
}

// Odpowiedź z API po utworzeniu zamówienia.
export interface CreateOrderResponse {
  id: number;
  message?: string;
}

// Pozycja zamówienia.
export interface OrderItemDto {
  idOrderItem: number;
  idOrder: number;

  idItem: number;
  itemName?: string | null;
  itemCode?: string | null;

  quantity?: number | null;

  // Cena produktu pobrana z backendu.
  itemPrice: number;

  // Wartość pozycji: quantity * itemPrice.
  lineValue: number;

  isActive?: boolean;
}

// Dane wysyłane przy tworzeniu pozycji zamówienia - POST /api/OrderItem
export interface CreateOrderItemCommand {
  idOrder: number;
  idItem: number;
  quantity?: number | null;
}

// Dane wysyłane przy aktualizacji pozycji zamówienia - PUT /api/OrderItem/{id}
export interface UpdateOrderItemCommand {
  idOrderItem: number;
  idOrder: number;
  idItem: number;
  quantity?: number | null;
  isActive?: boolean;
}

// Odpowiedź z API po utworzeniu pozycji zamówienia.
export interface CreateOrderItemResponse {
  id: number;
  message?: string;
}

// Dane klienta wpisywane przy finalizacji koszyka.
export interface CheckoutClientDto {
  name: string;
  address: string;
  phoneNumber: string;
}

// Jedna pozycja koszyka wysyłana do backendu.
export interface CheckoutItemDto {
  idItem: number;
  quantity: number;
}

// Dane wysyłane do POST /api/Checkout.
export interface CreateCheckoutOrderCommand {
  client: CheckoutClientDto;
  items: CheckoutItemDto[];
  notes?: string | null;
  deliveryDate?: string | null;
}

// Odpowiedź z POST /api/Checkout.
export interface CheckoutOrderResponseDto {
  idOrder: number;
  idClient: number;
  totalValue: number;
  message: string;
}

// Najnowsze zamówienie pokazywane na Dashboardzie.
export interface DashboardLatestOrderDto {
  idOrder: number;
  dataOrder?: string | null;

  clientName?: string | null;
  workerName?: string | null;

  orderItemsCount: number;
  totalValue: number;
}

// Produkt z niskim stanem magazynowym pokazywany na Dashboardzie.
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

// Sprzedaż według kategorii na Dashboardzie.
export interface DashboardCategorySalesDto {
  idCategory: number;

  categoryName?: string | null;

  totalQuantity: number;
  totalValue: number;
}

// Najlepiej sprzedający się produkt na Dashboardzie.
export interface DashboardTopProductDto {
  idItem: number;

  name?: string | null;
  code?: string | null;

  categoryName?: string | null;

  totalQuantity: number;
  totalValue: number;
}

// Dane raportowe z GET /api/Dashboard.
export interface DashboardDto {
  productsCount: number;
  categoriesCount: number;
  unitsCount: number;

  clientsCount: number;
  workersCount: number;

  ordersCount: number;
  orderItemsCount: number;

  productsStockValue: number;
  ordersTotalValue: number;

  latestOrders: DashboardLatestOrderDto[];

  lowStockProducts: DashboardLowStockProductDto[];

  categorySales: DashboardCategorySalesDto[];

  topProducts: DashboardTopProductDto[];
}

// Model pozycji koszyka po stronie aplikacji mobilnej.
export interface CartItemModel {
  item: ItemDto;
  quantity: number;
}

// Pomocniczy typ do obsługi stanu ładowania danych z API.
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

// Uniwersalny stan dla zapytań API.
export interface ApiState<T> {
  data: T | null;
  status: ApiStatus;
  error: string | null;
}