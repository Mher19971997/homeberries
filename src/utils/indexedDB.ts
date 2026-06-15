// Утилиты для работы с IndexedDB для корзины неавторизованных пользователей

const DB_NAME = 'HomeBerriesDB';
const DB_VERSION = 1;
const STORE_NAME = 'basket';

interface BasketItem {
  catalogUuid: string;
  catalog: any;
  quantity: number;
  uuid: string;
  createdAt?: number;
}

// Инициализация базы данных
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in the browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Создаем хранилище для корзины, если его нет
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'uuid' });
        objectStore.createIndex('catalogUuid', 'catalogUuid', { unique: false });
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

// Получить все товары из корзины
export const getBasketItems = async (): Promise<BasketItem[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Ошибка при получении корзины из IndexedDB:', error);
    return [];
  }
};

// Добавить товар в корзину
export const addToBasket = async (catalog: any, quantity: number = 1): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('catalogUuid');
      
      // Проверяем, есть ли уже этот товар
      const getRequest = index.get(catalog.uuid);
      
      getRequest.onsuccess = () => {
        const existingItem = getRequest.result;
        
        if (existingItem) {
          // Увеличиваем количество
          existingItem.quantity = (existingItem.quantity || 1) + quantity;
          const updateRequest = store.put(existingItem);
          
          updateRequest.onsuccess = () => {
            resolve();
            // Отправляем событие для обновления UI
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('basketUpdated'));
            }
          };
          
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          // Добавляем новый товар
          const newItem: BasketItem = {
            catalogUuid: catalog.uuid,
            catalog: catalog,
            quantity: quantity,
            uuid: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now()
          };
          
          const addRequest = store.add(newItem);
          
          addRequest.onsuccess = () => {
            resolve();
            // Отправляем событие для обновления UI
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('basketUpdated'));
            }
          };
          
          addRequest.onerror = () => reject(addRequest.error);
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('Ошибка при добавлении в корзину IndexedDB:', error);
    throw error;
  }
};

// Удалить товар из корзины
export const removeFromBasket = async (uuid: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(uuid);

      request.onsuccess = () => {
        resolve();
        // Отправляем событие для обновления UI
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('basketUpdated'));
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Ошибка при удалении из корзины IndexedDB:', error);
    throw error;
  }
};

// Обновить количество товара
export const updateBasketItemQuantity = async (uuid: string, quantity: number): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(uuid);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.quantity = quantity;
          const updateRequest = store.put(item);

          updateRequest.onsuccess = () => {
            resolve();
            // Отправляем событие для обновления UI
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('basketUpdated'));
            }
          };

          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Item not found in basket'));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('Ошибка при обновлении количества в корзине IndexedDB:', error);
    throw error;
  }
};

// Очистить корзину
export const clearBasket = async (): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
        // Отправляем событие для обновления UI
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('basketUpdated'));
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Ошибка при очистке корзины IndexedDB:', error);
    throw error;
  }
};

// Получить количество товаров в корзине
export const getBasketCount = async (): Promise<number> => {
  try {
    const items = await getBasketItems();
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  } catch (error) {
    console.error('Ошибка при получении количества товаров в корзине:', error);
    return 0;
  }
};
