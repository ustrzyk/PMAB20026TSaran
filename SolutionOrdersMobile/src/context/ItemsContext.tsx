import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import apiService from '../api/apiService.ts';

import type {
  CreateItemCommand,
  Item,
  UpdateItemCommand,
} from '../types/models.ts';

interface ItemsContextType {
  items: Item[];
  loading: boolean;
  error: string | null;

  // Akcje dla produktów
  refreshItems: () => Promise<void>;
  createItem: (data: CreateItemCommand) => Promise<void>;
  updateItem: (idItem: number, data: UpdateItemCommand) => Promise<void>;
  deleteItem: (idItem: number) => Promise<void>;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

interface ItemsProviderProps {
  children: React.ReactNode;
}

export function ItemsProvider({
  children,
}: ItemsProviderProps): React.JSX.Element {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pobiera produkty z API: GET /api/Item
  const refreshItems = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiService.getItems();

      setItems(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nieznany błąd pobierania danych';

      setError(message);
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tworzy produkt: POST /api/Item
  const createItem = useCallback(
    async (data: CreateItemCommand): Promise<void> => {
      try {
        setError(null);

        await apiService.createItem(data);

        // Po dodaniu odświeżamy listę, żeby pobrać categoryName i unitName
        await refreshItems();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Nieznany błąd tworzenia produktu';

        setError(message);
        console.error('Failed to create item:', err);

        throw err;
      }
    },
    [refreshItems],
  );

  // Aktualizuje produkt: PUT /api/Item/{id}
  const updateItem = useCallback(
    async (idItem: number, data: UpdateItemCommand): Promise<void> => {
      try {
        setError(null);

        await apiService.updateItem(idItem, {
          ...data,
          idItem,
        });

        // Po edycji odświeżamy listę z API
        await refreshItems();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Nieznany błąd aktualizacji produktu';

        setError(message);
        console.error('Failed to update item:', err);

        throw err;
      }
    },
    [refreshItems],
  );

  // Usuwa produkt: DELETE /api/Item/{id}
  const deleteItem = useCallback(async (idItem: number): Promise<void> => {
    try {
      setError(null);

      await apiService.deleteItem(idItem);

      // Po usunięciu usuwamy produkt lokalnie z listy
      setItems(previousItems =>
        previousItems.filter(item => item.idItem !== idItem),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nieznany błąd usuwania produktu';

      setError(message);
      console.error('Failed to delete item:', err);

      throw err;
    }
  }, []);

  // Pierwsze załadowanie produktów po wejściu do aplikacji
  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  return (
    <ItemsContext.Provider
      value={{
        items,
        loading,
        error,
        refreshItems,
        createItem,
        updateItem,
        deleteItem,
      }}>
      {children}
    </ItemsContext.Provider>
  );
}

export function useItems(): ItemsContextType {
  const context = useContext(ItemsContext);

  if (!context) {
    throw new Error('useItems must be used within ItemsProvider');
  }

  return context;
}