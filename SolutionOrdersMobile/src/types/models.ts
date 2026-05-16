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