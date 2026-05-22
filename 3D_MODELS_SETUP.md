# Настройка 3D Моделей

## 📦 Загрузка реалистичных 3D моделей

Система поддерживает загрузку реалистичных 3D моделей в формате GLTF/GLB для товаров.

## 🎯 Как это работает

1. **Автоматическое определение**: Система автоматически определяет тип товара по названию (MacBook, iPhone, iPad и т.д.)
2. **Поиск модели**: Система ищет URL 3D модели для товара
3. **Загрузка из интернета**: Модели загружаются из указанных URL
4. **Применение цветов**: Цвета из каталога автоматически применяются к модели
5. **Fallback**: Если модель не найдена, используются примитивы

## 📝 Добавление реальных моделей MacBook

### Вариант 1: Использование публичных моделей

1. Найдите модель MacBook в формате GLTF/GLB на:
   - [Sketchfab](https://sketchfab.com) - бесплатные модели
   - [Poly Haven](https://polyhaven.com/models) - CC0 модели
   - [Free3D](https://free3d.com) - бесплатные модели
   - [TurboSquid](https://www.turbosquid.com) - платные и бесплатные модели

2. Загрузите модель в папку `public/models/`:
   ```bash
   public/
     models/
       macbook-pro-14.gltf
       macbook-pro-14.bin (если есть)
       textures/ (если есть)
   ```

3. Обновите функцию `getModelUrl` в `Product3DViewer/index.tsx`:
   ```typescript
   if (/macbook|mac book/i.test(name) && /pro/i.test(name) && /14/i.test(name)) {
     return '/models/macbook-pro-14.gltf';
   }
   ```

### Вариант 2: Использование CDN

1. Загрузите модель на CDN (например, GitHub, Cloudinary, AWS S3)
2. Обновите URL в функции `getModelUrl`:
   ```typescript
   if (/macbook|mac book/i.test(name)) {
     return 'https://your-cdn.com/models/macbook-pro-14.gltf';
   }
   ```

### Вариант 3: Использование API

1. Создайте API endpoint для получения URL модели:
   ```typescript
   const getModelUrl = async (productName: string) => {
     const response = await fetch(`/api/models?product=${productName}`);
     const data = await response.json();
     return data.modelUrl;
   };
   ```

## 🎨 Применение цветов

Цвета автоматически извлекаются из каталога товара:

1. **Из каталога**: Если в товаре указаны цвета (`catalog.colors`), они используются
2. **Из названия**: Система пытается определить цвет из названия (например, "Space Black", "Silver")
3. **По умолчанию**: Если цвет не найден, используется цвет по умолчанию

### Пример применения цвета:

```typescript
// В Product3DViewer
productColor={selectedProduct?.colors?.[0]?.color || '#667eea'}
```

## 🔧 Настройка моделей

### Добавление новой модели товара:

1. Откройте `homeberries/src/components/Product3DViewer/index.tsx`
2. Найдите функцию `getModelUrl`
3. Добавьте условие для вашего товара:

```typescript
// Пример для Samsung Galaxy
if (/samsung|galaxy/i.test(name)) {
  return '/models/samsung-galaxy-s24.gltf';
}
```

### Оптимизация моделей:

1. **Сжатие**: Используйте `gltf-pipeline` для оптимизации:
   ```bash
   npx gltf-pipeline -i model.gltf -o model-optimized.gltf -d
   ```

2. **Размер**: Рекомендуемый размер модели < 5MB для быстрой загрузки

3. **Текстуры**: Используйте сжатые текстуры (WebP, KTX2)

## 📱 Поддерживаемые форматы

- ✅ GLTF (`.gltf`)
- ✅ GLB (`.glb`)
- ✅ Binary GLTF (`.gltf` + `.bin`)

## 🚀 Примеры URL моделей

### Бесплатные источники:

1. **Three.js Examples**:
   - `https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/...`

2. **Sketchfab** (требуется API ключ):
   - `https://api.sketchfab.com/v1/models/{model_id}/download`

3. **Poly Haven**:
   - `https://dl.polyhaven.org/file/ph-assets/Models/gltf/...`

## ⚠️ Важные замечания

1. **CORS**: Убедитесь, что CDN поддерживает CORS для загрузки моделей
2. **Размер**: Большие модели (>10MB) могут загружаться медленно
3. **Браузеры**: GLTF поддерживается во всех современных браузерах
4. **Fallback**: Всегда есть fallback на примитивы, если модель не загрузится

## 🔍 Отладка

Если модель не загружается:

1. Проверьте консоль браузера на ошибки
2. Убедитесь, что URL модели доступен
3. Проверьте CORS настройки сервера
4. Используйте Network tab в DevTools для проверки загрузки

## 📚 Полезные ссылки

- [GLTF Specification](https://www.khronos.org/gltf/)
- [Three.js GLTF Loader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Drei useGLTF](https://github.com/pmndrs/drei#usegltf)
