import {API_BASE_URL} from './config.ts';

import type {
  CategoryDto,
  CreateItemCommand,
  CreateItemResponse,
  Item,
  UnitOfMeasurementDto,
  UpdateItemCommand,
} from '../types/models.ts';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Wspólna metoda do obsługi zapytań HTTP
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

      // PUT / DELETE często zwracają 204 No Content
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

  // GET /api/Item
  async getItems(): Promise<Item[]> {
    return this.request<Item[]>('/Item');
  }

  // GET /api/Item/{id}
  async getItem(idItem: number): Promise<Item> {
    return this.request<Item>(`/Item/${idItem}`);
  }

  // POST /api/Item
  async createItem(data: CreateItemCommand): Promise<CreateItemResponse> {
    return this.request<CreateItemResponse>('/Item', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT /api/Item/{id}
  async updateItem(idItem: number, data: UpdateItemCommand): Promise<void> {
    return this.request<void>(`/Item/${idItem}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        idItem,
      }),
    });
  }

  // DELETE /api/Item/{id}
  async deleteItem(idItem: number): Promise<void> {
    return this.request<void>(`/Item/${idItem}`, {
      method: 'DELETE',
    });
  }

  // ========== KATEGORIE ==========
  // Zostawione pod przyszły CategoryController.
  // Nie wywołuj, jeśli Swagger nie pokazuje /api/Category.

  async getCategories(): Promise<CategoryDto[]> {
    return this.request<CategoryDto[]>('/Category');
  }

  async getCategory(idCategory: number): Promise<CategoryDto> {
    return this.request<CategoryDto>(`/Category/${idCategory}`);
  }

  // ========== JEDNOSTKI MIARY ==========
  // Zostawione pod przyszły UnitOfMeasurementController.
  // Nie wywołuj, jeśli Swagger nie pokazuje /api/UnitOfMeasurement.

  async getUnits(): Promise<UnitOfMeasurementDto[]> {
    return this.request<UnitOfMeasurementDto[]>('/UnitOfMeasurement');
  }

  async getUnit(idUnitOfMeasurement: number): Promise<UnitOfMeasurementDto> {
    return this.request<UnitOfMeasurementDto>(
      `/UnitOfMeasurement/${idUnitOfMeasurement}`,
    );
  }
}

// Singleton używany w całej aplikacji
export default new ApiService();