import {API_BASE_URL} from './config.ts';

import type {
  CategoryDto,
  ClientDto,
  CreateCategoryCommand,
  CreateCategoryResponse,
  CreateClientCommand,
  CreateClientResponse,
  CreateItemCommand,
  CreateItemResponse,
  CreateOrderCommand,
  CreateOrderResponse,
  CreateUnitOfMeasurementCommand,
  CreateUnitOfMeasurementResponse,
  CreateWorkerCommand,
  CreateWorkerResponse,
  Item,
  OrderDto,
  UnitOfMeasurementDto,
  UpdateCategoryCommand,
  UpdateClientCommand,
  UpdateItemCommand,
  UpdateOrderCommand,
  UpdateUnitOfMeasurementCommand,
  UpdateWorkerCommand,
  WorkerDto,
} from '../types/models.ts';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Wspólna metoda do obsługi zapytań HTTP.
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
      console.log(`API Request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`,
        );
      }

      // PUT / DELETE często zwracają 204 No Content.
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();

      console.log('API Response:', data);

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ========== PRODUKTY / ITEMS ==========

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

  // ========== KATEGORIE ==========

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

  // ========== JEDNOSTKI MIARY ==========

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
    return this.request<CreateUnitOfMeasurementResponse>(
      '/UnitOfMeasurement',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
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

  // ========== KLIENCI ==========

  async getClients(): Promise<ClientDto[]> {
    return this.request<ClientDto[]>('/Client');
  }

  async getClient(idClient: number): Promise<ClientDto> {
    return this.request<ClientDto>(`/Client/${idClient}`);
  }

  async createClient(
    data: CreateClientCommand,
  ): Promise<CreateClientResponse> {
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

  // ========== PRACOWNICY ==========

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

  // ========== ZAMÓWIENIA ==========

  async getOrders(): Promise<OrderDto[]> {
    return this.request<OrderDto[]>('/Order');
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
}

// Singleton używany w całej aplikacji.
export default new ApiService();