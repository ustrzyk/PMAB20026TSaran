import {API_BASE_URL} from './config.ts';

import type {
  CategoryDto,
  CheckoutOrderResponseDto,
  ClientDto,
  CreateCategoryCommand,
  CreateCategoryResponse,
  CreateCheckoutOrderCommand,
  CreateClientCommand,
  CreateClientResponse,
  CreateItemCommand,
  CreateItemResponse,
  CreateOrderCommand,
  CreateOrderItemCommand,
  CreateOrderItemResponse,
  CreateOrderResponse,
  CreateUnitOfMeasurementCommand,
  CreateUnitOfMeasurementResponse,
  CreateWorkerCommand,
  CreateWorkerResponse,
  CustomerLoginRequestDto,
  CustomerLoginResponseDto,
  CustomerRegisterRequestDto,
  DashboardDto,
  Item,
  OrderDto,
  OrderItemDto,
  UnitOfMeasurementDto,
  UpdateCategoryCommand,
  UpdateClientCommand,
  UpdateItemCommand,
  UpdateOrderCommand,
  UpdateOrderItemCommand,
  UpdateUnitOfMeasurementCommand,
  UpdateWorkerCommand,
  WorkerDto,
  WorkerLoginRequestDto,
  WorkerLoginResponseDto,
} from '../types/models.ts';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private getFriendlyErrorMessage(status: number, errorText: string): string {
    if (status === 400) {
      return errorText.length > 0
        ? `Niepoprawne dane: ${errorText}`
        : 'Niepoprawne dane wysłane do API.';
    }

    if (status === 401) {
      return 'Nieprawidłowy login/e-mail albo hasło.';
    }

    if (status === 403) {
      return 'Brak uprawnień do wykonania tej operacji.';
    }

    if (status === 404) {
      return 'Nie znaleziono danych w API.';
    }

    if (status === 409) {
      return errorText.length > 0
        ? `Konflikt danych: ${errorText}`
        : 'Nie można zapisać danych, bo istnieje konflikt w bazie.';
    }

    if (status >= 500) {
      return 'Błąd serwera API. Sprawdź, czy backend i baza danych działają poprawnie.';
    }

    return errorText.length > 0
      ? `Błąd API ${status}: ${errorText}`
      : `Błąd API ${status}.`;
  }

  private getNetworkErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) {
      return 'Wystąpił nieznany błąd połączenia z API.';
    }

    if (
      error.message.includes('Network request failed') ||
      error.message.includes('Failed to fetch')
    ) {
      return `Nie można połączyć się z API. Sprawdź, czy backend działa oraz czy adres API jest poprawny: ${this.baseUrl}`;
    }

    return error.message;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        const message = this.getFriendlyErrorMessage(response.status, errorText);

        throw new Error(message);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      throw new Error(this.getNetworkErrorMessage(error));
    }
  }

  async loginWorker(
    data: WorkerLoginRequestDto,
  ): Promise<WorkerLoginResponseDto> {
    return this.request<WorkerLoginResponseDto>('/Auth/worker-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async loginCustomer(
    data: CustomerLoginRequestDto,
  ): Promise<CustomerLoginResponseDto> {
    return this.request<CustomerLoginResponseDto>('/Auth/customer-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerCustomer(
    data: CustomerRegisterRequestDto,
  ): Promise<CustomerLoginResponseDto> {
    return this.request<CustomerLoginResponseDto>('/Auth/customer-register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createCheckoutOrder(
    data: CreateCheckoutOrderCommand,
  ): Promise<CheckoutOrderResponseDto> {
    return this.request<CheckoutOrderResponseDto>('/Checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDashboard(): Promise<DashboardDto> {
    return this.request<DashboardDto>('/Dashboard');
  }

  async getItems(): Promise<Item[]> {
    return this.request<Item[]>('/Item');
  }

  async getItem(idItem: number): Promise<Item> {
    return this.request<Item>(`/Item/${idItem}`);
  }

  async createItem(data: CreateItemCommand): Promise<CreateItemResponse> {
    return this.request<CreateItemResponse>('/Item', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(idItem: number, data: UpdateItemCommand): Promise<void> {
    return this.request<void>(`/Item/${idItem}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        idItem,
      }),
    });
  }

  async deleteItem(idItem: number): Promise<void> {
    return this.request<void>(`/Item/${idItem}`, {
      method: 'DELETE',
    });
  }

  async getCategories(): Promise<CategoryDto[]> {
    return this.request<CategoryDto[]>('/Category');
  }

  async getCategory(idCategory: number): Promise<CategoryDto> {
    return this.request<CategoryDto>(`/Category/${idCategory}`);
  }

  async createCategory(
    data: CreateCategoryCommand,
  ): Promise<CreateCategoryResponse> {
    return this.request<CreateCategoryResponse>('/Category', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(
    idCategory: number,
    data: UpdateCategoryCommand,
  ): Promise<void> {
    return this.request<void>(`/Category/${idCategory}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        idCategory,
      }),
    });
  }

  async deleteCategory(idCategory: number): Promise<void> {
    return this.request<void>(`/Category/${idCategory}`, {
      method: 'DELETE',
    });
  }

  async getUnits(): Promise<UnitOfMeasurementDto[]> {
    return this.request<UnitOfMeasurementDto[]>('/UnitOfMeasurement');
  }

  async getUnit(idUnitOfMeasurement: number): Promise<UnitOfMeasurementDto> {
    return this.request<UnitOfMeasurementDto>(
      `/UnitOfMeasurement/${idUnitOfMeasurement}`,
    );
  }

  async createUnit(
    data: CreateUnitOfMeasurementCommand,
  ): Promise<CreateUnitOfMeasurementResponse> {
    return this.request<CreateUnitOfMeasurementResponse>('/UnitOfMeasurement', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUnit(
    idUnitOfMeasurement: number,
    data: UpdateUnitOfMeasurementCommand,
  ): Promise<void> {
    return this.request<void>(`/UnitOfMeasurement/${idUnitOfMeasurement}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        idUnitOfMeasurement,
      }),
    });
  }

  async deleteUnit(idUnitOfMeasurement: number): Promise<void> {
    return this.request<void>(`/UnitOfMeasurement/${idUnitOfMeasurement}`, {
      method: 'DELETE',
    });
  }

  async getClients(): Promise<ClientDto[]> {
    return this.request<ClientDto[]>('/Client');
  }

  async getClient(idClient: number): Promise<ClientDto> {
    return this.request<ClientDto>(`/Client/${idClient}`);
  }

  async createClient(data: CreateClientCommand): Promise<CreateClientResponse> {
    return this.request<CreateClientResponse>('/Client', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(
    idClient: number,
    data: UpdateClientCommand,
  ): Promise<void> {
    return this.request<void>(`/Client/${idClient}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        idClient,
      }),
    });
  }

  async deleteClient(idClient: number): Promise<void> {
    return this.request<void>(`/Client/${idClient}`, {
      method: 'DELETE',
    });
  }

  async getWorkers(): Promise<WorkerDto[]> {
    return this.request<WorkerDto[]>('/Worker');
  }

  async getWorker(idWorker: number): Promise<WorkerDto> {
    return this.request<WorkerDto>(`/Worker/${idWorker}`);
  }

  async createWorker(
    data: CreateWorkerCommand,
  ): Promise<CreateWorkerResponse> {
    return this.request<CreateWorkerResponse>('/Worker', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorker(
    idWorker: number,
    data: UpdateWorkerCommand,
  ): Promise<void> {
    return this.request<void>(`/Worker/${idWorker}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        idWorker,
      }),
    });
  }

  async deleteWorker(idWorker: number): Promise<void> {
    return this.request<void>(`/Worker/${idWorker}`, {
      method: 'DELETE',
    });
  }

  async getOrders(): Promise<OrderDto[]> {
    return this.request<OrderDto[]>('/Order');
  }

  async getOrdersByClient(idClient: number): Promise<OrderDto[]> {
    return this.request<OrderDto[]>(`/Order/Client/${idClient}`);
  }

  async getOrder(idOrder: number): Promise<OrderDto> {
    return this.request<OrderDto>(`/Order/${idOrder}`);
  }

  async createOrder(data: CreateOrderCommand): Promise<CreateOrderResponse> {
    return this.request<CreateOrderResponse>('/Order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrder(
    idOrder: number,
    data: UpdateOrderCommand,
  ): Promise<void> {
    return this.request<void>(`/Order/${idOrder}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        idOrder,
      }),
    });
  }

  async deleteOrder(idOrder: number): Promise<void> {
    return this.request<void>(`/Order/${idOrder}`, {
      method: 'DELETE',
    });
  }

  async getOrderItems(): Promise<OrderItemDto[]> {
    return this.request<OrderItemDto[]>('/OrderItem');
  }

  async getOrderItemsByOrder(idOrder: number): Promise<OrderItemDto[]> {
    return this.request<OrderItemDto[]>(`/OrderItem/Order/${idOrder}`);
  }

  async getOrderItem(idOrderItem: number): Promise<OrderItemDto> {
    return this.request<OrderItemDto>(`/OrderItem/${idOrderItem}`);
  }

  async createOrderItem(
    data: CreateOrderItemCommand,
  ): Promise<CreateOrderItemResponse> {
    return this.request<CreateOrderItemResponse>('/OrderItem', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderItem(
    idOrderItem: number,
    data: UpdateOrderItemCommand,
  ): Promise<void> {
    return this.request<void>(`/OrderItem/${idOrderItem}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        idOrderItem,
      }),
    });
  }

  async deleteOrderItem(idOrderItem: number): Promise<void> {
    return this.request<void>(`/OrderItem/${idOrderItem}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();