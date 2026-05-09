// Modele TypeScript dopasowane do DTO i Command z SolutionOrders.API

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

// Dane wysyłane przy aktualizacji produktu - PUT /api/Item
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

// Odpowiedź z API po utworzeniu produktu
// U Ciebie Swagger zwracał np. { id: 15, message: "Produkt został utworzony" }
export interface CreateItemResponse {
  id: number;
  message: string;
}

// Kategoria produktu
// Przyda się później, jeśli dodasz endpoint GET /api/Category
export interface CategoryDto {
  idCategory: number;
  name: string;
  description?: string | null;
}

// Jednostka miary
// Przyda się później, jeśli dodasz endpoint GET /api/UnitOfMeasurement
export interface UnitOfMeasurementDto {
  idUnitOfMeasurement: number;
  name: string;
  shortcut?: string | null;
}

// Model pozycji koszyka po stronie aplikacji mobilnej
// Na razie lokalny, później można go mapować na OrderItem
export interface CartItemModel {
  item: ItemDto;
  quantity: number;
}

// Pomocniczy typ do obsługi stanu ładowania danych z API
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

// Uniwersalny stan dla zapytań API
export interface ApiState<T> {
  data: T | null;
  status: ApiStatus;
  error: string | null;
}