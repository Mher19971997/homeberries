import React, { useRef, useState, Suspense, useEffect, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Environment, ContactShadows } from '@react-three/drei';
import { Mesh, Group, Object3D, Color, Box3, Vector3, AnimationClip, AnimationMixer } from 'three';
import { Box as MuiBox, Box, Slider, Typography, Paper, Grid, CircularProgress, LinearProgress, Button, Alert } from '@mui/material';
import styles from './index.module.css';

// ErrorBoundary для обработки ошибок загрузки GLTF
class ErrorBoundary extends Component<{
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error) => void;
}, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

interface Product3DViewerProps {
  productName?: string;
  onParameterChange?: (params: Product3DParams) => void;
  productType?: 'laptop' | 'phone' | 'tablet' | 'default';
  productColor?: string; // Цвет из каталога
  modelUrl?: string; // Прямой URL к 3D модели
  hideControls?: boolean; // Скрыть панель управления
  compact?: boolean; // Компактный режим
  isSpeaking?: boolean; // Состояние речи для анимации
  focusOnFace?: boolean; // Фокус на лице модели
}

export interface Product3DParams {
  color: string;
  size: number;
  rotation: number;
  shape: 'box' | 'sphere' | 'cylinder';
}

// Функция для поиска URL 3D модели по названию товара
// ⚠️ ВНИМАНИЕ: Отключено до добавления реальных моделей
// Для включения загрузите модели в public/models/ и раскомментируйте код
const getModelUrl = (productName?: string, productType?: string): string | null => {
  // Временно отключено - показываем примитивы вместо моделей
  // Раскомментируйте когда добавите реальные модели:
  
  /*
  if (!productName) return null;

  const name = productName.toLowerCase();
  
  // MacBook модели
  if (/macbook|mac book/i.test(name)) {
    if (/pro/i.test(name) && /14/i.test(name)) {
      return '/models/macbook-pro-14.gltf'; // Локальный файл
    }
    if (/pro/i.test(name) && /16/i.test(name)) {
      return '/models/macbook-pro-16.gltf';
    }
    if (/air/i.test(name)) {
      return '/models/macbook-air.gltf';
    }
    return '/models/macbook.gltf';
  }
  
  // iPhone модели
  if (/iphone|айфон/i.test(name)) {
    if (/15/i.test(name)) {
      return '/models/iphone-15.gltf';
    }
    if (/14/i.test(name)) {
      return '/models/iphone-14.gltf';
    }
    if (/16/i.test(name)) {
      return '/models/iphone-16.gltf';
    }
    return '/models/iphone.gltf';
  }
  
  // iPad модели
  if (/ipad|планшет/i.test(name)) {
    return '/models/ipad.gltf';
  }
  */
  
  return null; // Возвращаем null - будут использоваться примитивы
};

// Компонент-обертка для безопасной загрузки GLTF с обработкой ошибок
const GLTFModelWrapper: React.FC<{
  url: string;
  color?: string;
  meshRef: React.RefObject<Object3D>;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  scale?: number;
  isSpeaking?: boolean;
}> = ({ url, color, meshRef, onLoad, onError, scale = 1, isSpeaking = false }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем доступность URL перед загрузкой
    fetch(url, { method: 'HEAD', mode: 'no-cors' })
      .catch(() => {
        console.warn('⚠️ Model URL may not be accessible:', url);
      });
  }, [url]);

  if (hasError) {
    console.log('⚠️ Falling back to primitive due to error');
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color || '#667eea'} />
      </mesh>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={color || '#667eea'} />
        </mesh>
      }
      onError={(error) => {
        console.error('❌ ErrorBoundary caught error:', error);
        setHasError(true);
        setIsLoading(false);
        onError?.(error);
      }}
    >
      <Suspense fallback={
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={color || '#667eea'} />
        </mesh>
      }>
        <GLTFModel 
          url={url}
          color={color}
          meshRef={meshRef}
          onLoad={() => {
            setIsLoading(false);
            onLoad?.();
          }}
          onError={(error) => {
            console.error('❌ GLTFModel error:', error);
            setHasError(true);
            setIsLoading(false);
            onError?.(error);
          }}
          scale={scale}
          isSpeaking={isSpeaking}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

// Компонент для загрузки GLTF модели с поддержкой анимаций
const GLTFModel: React.FC<{
  url: string;
  color?: string;
  meshRef: React.RefObject<Object3D>;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  scale?: number;
  isSpeaking?: boolean;
}> = ({ url, color, meshRef, onLoad, onError, scale = 1, isSpeaking = false }) => {
  // useGLTF может выбрасывать промисы для Suspense, поэтому не оборачиваем в try-catch
  // Ошибки будут обработаны через ErrorBoundary
  const { scene, animations } = useGLTF(url);
  
  // Используем useAnimations для воспроизведения анимаций (работает с оригинальной сценой)
  const { actions, mixer } = useAnimations(animations, scene);
  
  // Воспроизводим все анимации автоматически
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      Object.values(actions).forEach((action) => {
        if (action) {
          action.play();
        }
      });
      console.log('🎬 Animations started:', Object.keys(actions));
      
      return () => {
        Object.values(actions).forEach((action) => {
          if (action) {
            action.stop();
          }
        });
      };
    }
  }, [actions]);

  // Обновляем mixer в каждом кадре для анимаций
  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
    
    // Поворачиваем модель так, чтобы она смотрела на камеру
    if (scene && state.camera) {
      // Получаем позицию камеры
      const cameraPosition = state.camera.position;
      
      // Вычисляем направление от модели к камере
      const direction = new Vector3();
      direction.subVectors(cameraPosition, scene.position).normalize();
      
      // Вычисляем угол поворота вокруг оси Y (горизонтальный поворот)
      const angleY = Math.atan2(direction.x, direction.z);
      
      // Применяем поворот только вокруг оси Y, чтобы модель смотрела на камеру
      scene.rotation.y = angleY;
      
      // Опционально: легкий наклон головы вверх/вниз (небольшой угол)
      // const angleX = Math.asin(-direction.y) * 0.3; // 0.3 - коэффициент для мягкого наклона
      // scene.rotation.x = angleX;
    }
    
    // Анимация при разговоре - легкое покачивание головы и движение рта
    if (scene && isSpeaking) {
      // Ищем голову или лицо в модели
      scene.traverse((child) => {
        if ((child as any).isMesh) {
          const mesh = child as any;
          const name = mesh.name?.toLowerCase() || '';
          
          // Если это часть головы/лица, добавляем легкую анимацию
          if (name.includes('head') || name.includes('face') || name.includes('mouth') || name.includes('lip')) {
            // Легкое покачивание при разговоре (добавляем к основному повороту)
            const baseRotationX = scene.rotation.x || 0;
            const baseRotationZ = scene.rotation.z || 0;
            mesh.rotation.x = baseRotationX + Math.sin(state.clock.elapsedTime * 5) * 0.05;
            mesh.rotation.z = baseRotationZ + Math.cos(state.clock.elapsedTime * 3) * 0.03;
            
            // Легкое масштабирование рта при разговоре
            if (name.includes('mouth') || name.includes('lip')) {
              const scale = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.1;
              mesh.scale.set(scale, scale, scale);
            }
          }
        }
      });
    }
  });

  useEffect(() => {
    if (scene) {
      // Применяем цвет ко всем материалам
      if (color) {
        scene.traverse((child) => {
          if ((child as any).isMesh) {
            const mesh = child as any;
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat: any) => {
                  if (mat.color) {
                    mat.color = new Color(color);
                  }
                });
              } else if (mesh.material.color) {
                mesh.material.color = new Color(color);
              }
            }
          }
        });
      }

      // Масштабируем модель (увеличиваем для лучшей видимости лица)
      const finalScale = scale * 3.5; // Оптимальный масштаб для видимости лица
      scene.scale.set(finalScale, finalScale, finalScale);
      
      // Центрируем модель
      const box = new Box3().setFromObject(scene);
      const center = box.getCenter(new Vector3());
      scene.position.sub(center);
      
      // Поднимаем модель для лучшего вида лица (уровень глаз)
      scene.position.y += 0.3;
      
      // Поворачиваем модель так, чтобы она смотрела на камеру
      // Большинство GLTF моделей смотрят в направлении -Z, поэтому поворачиваем
      scene.rotation.y = Math.PI; // Поворот на 180 градусов
      
      // Включаем тени для всех мешей
      scene.traverse((child) => {
        if ((child as any).isMesh) {
          (child as any).castShadow = true;
          (child as any).receiveShadow = true;
        }
      });

      if (meshRef) {
        (meshRef as React.MutableRefObject<Object3D | null>).current = scene;
      }
      
      onLoad?.();
      console.log('✅ GLTF Model loaded:', url);
      if (animations && animations.length > 0) {
        console.log(`🎬 Found ${animations.length} animation(s):`, animations.map((a: AnimationClip) => a.name));
      }
    }
  }, [scene, color, scale, meshRef, onLoad, animations]);

  if (!scene) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color || '#667eea'} />
      </mesh>
    );
  }

  return <primitive object={scene} />;
};

// Компонент 3D объекта
const Product3DObject: React.FC<{
  params: Product3DParams;
  meshRef: React.RefObject<Object3D>;
  onLoad?: () => void;
  productName?: string;
  productType?: 'laptop' | 'phone' | 'tablet' | 'default';
  productColor?: string;
  modelUrl?: string;
  isSpeaking?: boolean;
}> = ({ params, meshRef, onLoad, productName, productType, productColor, modelUrl, isSpeaking = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    // Проверяем загрузку mesh с задержкой
    const checkMesh = setTimeout(() => {
      const currentRef = meshRef.current || groupRef.current;
      if (currentRef && !isLoaded) {
        console.log('✅ Product3DObject: Mesh/Group loaded successfully');
        console.log('Ref type:', currentRef.constructor.name);
        setIsLoaded(true);
        onLoad?.();
      } else if (!currentRef) {
        console.warn('⚠️ Mesh/Group ref is not available yet');
      }
    }, 200);

    return () => clearTimeout(checkMesh);
  }, [meshRef, isLoaded, onLoad]);

  // Автоматическое вращение отключено для AI Assistant (когда focusOnFace = true)
  // useFrame(() => {
  //   const currentRef = meshRef.current || groupRef.current;
  //   if (currentRef && 'rotation' in currentRef) {
  //     currentRef.rotation.y += 0.01;
  //   }
  // });

  const getGeometry = () => {
    switch (params.shape) {
      case 'sphere':
        return <sphereGeometry args={[params.size, 32, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[params.size, params.size, params.size * 2, 32]} />;
      default:
        return <boxGeometry args={[params.size, params.size, params.size]} />;
    }
  };

  // Определяем тип товара
  const isLaptop = productType === 'laptop' || 
    (productName && /ноутбук|laptop|macbook|mac book/i.test(productName));
  
  const isPhone = productType === 'phone' || 
    (productName && /iphone|айфон|телефон|phone|смартфон/i.test(productName));
  
  const isTablet = productType === 'tablet' || 
    (productName && /ipad|планшет|tablet/i.test(productName));

  // Пытаемся загрузить реальную 3D модель (только если явно указан modelUrl)
  // Автоматический поиск отключен до добавления реальных моделей
  // Также проверяем наличие локальной модели angelica.glb
  const modelUrlToUse = modelUrl || (productName && /angelica/i.test(productName) ? '/models/angelica.glb' : null);
  const finalColor = productColor || params.color;

  // Если есть URL модели, загружаем GLTF
  if (modelUrlToUse) {
    return (
      <GLTFModelWrapper 
        url={modelUrlToUse} 
        color={finalColor}
        meshRef={meshRef}
        onLoad={onLoad}
        onError={(error) => {
          console.error('❌ Failed to load 3D model:', error);
          console.error('Model URL:', modelUrlToUse);
        }}
        scale={params.size}
        isSpeaking={isSpeaking}
      />
    );
  }

  // Реалистичная модель iPhone из примитивов - максимально точная
  if (isPhone) {
    // Пропорции iPhone (примерно 9:19.5)
    const phoneWidth = params.size * 0.55;
    const phoneHeight = params.size * 1.19;
    const phoneDepth = params.size * 0.11;
    const bezel = phoneWidth * 0.03; // Отступ экрана от края
    
    return (
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Задняя панель (основной корпус) */}
        <mesh position={[0, 0, -phoneDepth * 0.4]}>
          <boxGeometry args={[phoneWidth, phoneHeight, phoneDepth * 0.8]} />
          <meshStandardMaterial 
            color={finalColor} 
            metalness={0.95}
            roughness={0.1}
            envMapIntensity={1.2}
          />
        </mesh>
        
        {/* Боковая рамка (алюминиевая/стальная) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[phoneWidth * 1.01, phoneHeight * 1.01, phoneDepth]} />
          <meshStandardMaterial 
            color={finalColor === '#000000' || finalColor === '#1a1a1a' ? '#2a2a2a' : finalColor} 
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
        
        {/* Передняя стеклянная панель */}
        <mesh position={[0, 0, phoneDepth * 0.45]}>
          <boxGeometry args={[phoneWidth * 0.99, phoneHeight * 0.99, phoneDepth * 0.1]} />
          <meshStandardMaterial 
            color="#000000" 
            metalness={0.1}
            roughness={0.02}
            transparent={true}
            opacity={0.95}
          />
        </mesh>
        
        {/* Экран (OLED дисплей) */}
        <mesh position={[0, 0, phoneDepth * 0.48]}>
          <boxGeometry args={[phoneWidth * 0.94, phoneHeight * 0.88, phoneDepth * 0.02]} />
          <meshStandardMaterial 
            color="#000000" 
            emissive="#0a1a2a"
            emissiveIntensity={0.8}
          />
        </mesh>
        
        {/* Динамический остров (Dynamic Island) - iPhone 14/15 Pro */}
        <mesh position={[0, phoneHeight * 0.415, phoneDepth * 0.49]}>
          <boxGeometry args={[phoneWidth * 0.22, phoneDepth * 0.12, phoneDepth * 0.03]} />
          <meshStandardMaterial 
            color="#000000" 
            metalness={0.05}
            roughness={0.05}
          />
        </mesh>
        {/* Внутренняя часть Dynamic Island */}
        <mesh position={[0, phoneHeight * 0.415, phoneDepth * 0.495]}>
          <boxGeometry args={[phoneWidth * 0.18, phoneDepth * 0.08, phoneDepth * 0.01]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            emissive="#001122"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Камера (основная, большая) */}
        <mesh position={[phoneWidth * 0.18, phoneHeight * 0.415, -phoneDepth * 0.35]}>
          <cylinderGeometry args={[phoneDepth * 0.25, phoneDepth * 0.25, phoneDepth * 0.15, 32]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.7}
            roughness={0.15}
          />
        </mesh>
        {/* Линза камеры */}
        <mesh position={[phoneWidth * 0.18, phoneHeight * 0.415, -phoneDepth * 0.28]}>
          <cylinderGeometry args={[phoneDepth * 0.22, phoneDepth * 0.22, phoneDepth * 0.02, 32]} />
          <meshStandardMaterial 
            color="#0a0a0a" 
            metalness={0.3}
            roughness={0.05}
            transparent={true}
            opacity={0.9}
          />
        </mesh>
        
        {/* Вторая камера (ультраширокоугольная) */}
        <mesh position={[-phoneWidth * 0.18, phoneHeight * 0.415, -phoneDepth * 0.35]}>
          <cylinderGeometry args={[phoneDepth * 0.18, phoneDepth * 0.18, phoneDepth * 0.12, 32]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.7}
            roughness={0.15}
          />
        </mesh>
        
        {/* Третья камера (телеобъектив) */}
        <mesh position={[phoneWidth * 0.35, phoneHeight * 0.415, -phoneDepth * 0.35]}>
          <cylinderGeometry args={[phoneDepth * 0.15, phoneDepth * 0.15, phoneDepth * 0.1, 32]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.7}
            roughness={0.15}
          />
        </mesh>
        
        {/* Вспышка True Tone */}
        <mesh position={[-phoneWidth * 0.35, phoneHeight * 0.415, -phoneDepth * 0.35]}>
          <cylinderGeometry args={[phoneDepth * 0.1, phoneDepth * 0.1, phoneDepth * 0.08, 16]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
        
        {/* LiDAR сканер (для Pro моделей) */}
        <mesh position={[0, phoneHeight * 0.415, -phoneDepth * 0.35]}>
          <boxGeometry args={[phoneDepth * 0.12, phoneDepth * 0.12, phoneDepth * 0.08]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.6}
            roughness={0.2}
          />
        </mesh>
        
        {/* Кнопка питания (справа, длинная) */}
        <mesh position={[phoneWidth * 0.51, phoneHeight * 0.22, 0]}>
          <boxGeometry args={[phoneDepth * 0.15, phoneHeight * 0.1, phoneDepth * 0.95]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        
        {/* Кнопка увеличения громкости (справа, верхняя) */}
        <mesh position={[phoneWidth * 0.51, phoneHeight * 0.38, 0]}>
          <boxGeometry args={[phoneDepth * 0.15, phoneHeight * 0.06, phoneDepth * 0.95]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        
        {/* Кнопка уменьшения громкости (справа, нижняя) */}
        <mesh position={[phoneWidth * 0.51, phoneHeight * 0.32, 0]}>
          <boxGeometry args={[phoneDepth * 0.15, phoneHeight * 0.06, phoneDepth * 0.95]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        
        {/* Переключатель беззвучного режима (слева) */}
        <mesh position={[-phoneWidth * 0.51, phoneHeight * 0.35, 0]}>
          <boxGeometry args={[phoneDepth * 0.12, phoneHeight * 0.08, phoneDepth * 0.9]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        
        {/* Разъем Lightning/USB-C (внизу, по центру) */}
        <mesh position={[0, -phoneHeight * 0.5, 0]}>
          <boxGeometry args={[phoneWidth * 0.18, phoneDepth * 0.25, phoneDepth * 0.7]} />
          <meshStandardMaterial 
            color="#0a0a0a" 
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
        
        {/* Динамики (сетка внизу, симметрично) */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh 
            key={`speaker-left-${i}`}
            position={[-phoneWidth * 0.25 + (i * phoneWidth * 0.08), -phoneHeight * 0.48, phoneDepth * 0.48]}
          >
            <boxGeometry args={[phoneWidth * 0.04, phoneDepth * 0.04, phoneDepth * 0.01]} />
            <meshStandardMaterial 
              color="#0a0a0a" 
              metalness={0.1}
              roughness={0.9}
            />
          </mesh>
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh 
            key={`speaker-right-${i}`}
            position={[phoneWidth * 0.25 - (i * phoneWidth * 0.08), -phoneHeight * 0.48, phoneDepth * 0.48]}
          >
            <boxGeometry args={[phoneWidth * 0.04, phoneDepth * 0.04, phoneDepth * 0.01]} />
            <meshStandardMaterial 
              color="#0a0a0a" 
              metalness={0.1}
              roughness={0.9}
            />
          </mesh>
        ))}
        
        {/* Логотип Apple (на задней панели) */}
        <mesh position={[0, phoneHeight * 0.1, -phoneDepth * 0.35]}>
          <boxGeometry args={[phoneWidth * 0.15, phoneWidth * 0.15, phoneDepth * 0.01]} />
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.3}
            roughness={0.4}
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      </group>
    );
  }

  // Простая модель ноутбука из примитивов
  if (isLaptop) {
    const laptopWidth = params.size * 2;
    const laptopHeight = params.size * 1.2;
    const laptopDepth = params.size * 0.2;
    const screenHeight = params.size * 1.5;
    
    return (
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Основание ноутбука */}
        <mesh position={[0, -laptopHeight * 0.3, 0]}>
          <boxGeometry args={[laptopWidth, laptopDepth, laptopHeight]} />
          <meshStandardMaterial 
            color={params.color} 
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
        
        {/* Экран ноутбука */}
        <mesh 
          position={[0, laptopHeight * 0.4, -laptopDepth * 0.5]} 
          rotation={[-0.3, 0, 0]}
        >
          <boxGeometry args={[laptopWidth * 0.98, screenHeight, laptopDepth * 0.3]} />
          <meshStandardMaterial 
            color="#000000" 
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
        
        {/* Экран (дисплей) */}
        <mesh 
          position={[0, laptopHeight * 0.4, -laptopDepth * 0.3]} 
          rotation={[-0.3, 0, 0]}
        >
          <boxGeometry args={[laptopWidth * 0.85, screenHeight * 0.7, laptopDepth * 0.1]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            emissive="#001122"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Клавиатура */}
        <mesh position={[0, -laptopHeight * 0.25, laptopDepth * 0.1]}>
          <boxGeometry args={[laptopWidth * 0.9, laptopDepth * 0.1, laptopHeight * 0.7]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
      </group>
    );
  }

  // Реалистичная модель планшета из примитивов
  if (isTablet) {
    const tabletWidth = params.size * 1.5;
    const tabletHeight = params.size * 1.2;
    const tabletDepth = params.size * 0.15;
    
    return (
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Корпус планшета */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[tabletWidth, tabletHeight, tabletDepth]} />
          <meshStandardMaterial 
            color={finalColor} 
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
        
        {/* Экран */}
        <mesh position={[0, 0, tabletDepth * 0.1]}>
          <boxGeometry args={[tabletWidth * 0.98, tabletHeight * 0.95, tabletDepth * 0.05]} />
          <meshStandardMaterial 
            color="#000000" 
            metalness={0.3}
            roughness={0.1}
          />
        </mesh>
        
        {/* Дисплей */}
        <mesh position={[0, 0, tabletDepth * 0.12]}>
          <boxGeometry args={[tabletWidth * 0.9, tabletHeight * 0.85, tabletDepth * 0.02]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            emissive="#001122"
            emissiveIntensity={0.4}
          />
        </mesh>
        
        {/* Кнопка Home (если iPad) */}
        <mesh position={[0, -tabletHeight * 0.45, tabletDepth * 0.1]}>
          <cylinderGeometry args={[tabletDepth * 0.3, tabletDepth * 0.3, tabletDepth * 0.1, 32]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      </group>
    );
  }

  return (
    <mesh ref={meshRef as React.RefObject<Mesh>} position={[0, 0, 0]} scale={[1, 1, 1]}>
      {getGeometry()}
      <meshStandardMaterial 
        color={params.color} 
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
};

const Product3DViewer: React.FC<Product3DViewerProps> = ({ 
  productName, 
  onParameterChange, 
  productType,
  productColor,
  modelUrl,
  hideControls = false,
  compact = false,
  isSpeaking = false,
  focusOnFace = false
}) => {
  const meshRef = useRef<Object3D>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [canvasReady, setCanvasReady] = useState(false);
  const [params, setParams] = useState<Product3DParams>({
    color: productColor || '#667eea',
    size: compact ? 1.5 : 2, // Компактный режим с меньшим размером, но модель все равно будет большой за счет scale
    rotation: 0,
    shape: 'box',
  });
  const [modelError, setModelError] = useState<string | null>(null);
  const [useRealModel, setUseRealModel] = useState(true);

  // Обновляем цвет при изменении productColor
  useEffect(() => {
    if (productColor) {
      setParams(prev => ({ ...prev, color: productColor }));
    }
  }, [productColor]);

  // Симуляция прогресса загрузки с таймаутом
  useEffect(() => {
    if (!isMounted) return;

    console.log('🔄 Starting loading progress simulation');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setLoadingProgress(progress);
      console.log(`📊 Loading progress: ${progress}%`);
      
      if (progress >= 90) {
        clearInterval(interval);
        console.log('⏸️ Progress paused at 90%, waiting for Canvas...');
      }
    }, 150);

    // Таймаут на случай, если Canvas не создастся
    const timeout = setTimeout(() => {
      console.warn('⚠️ Loading timeout - forcing completion');
      clearInterval(interval);
      if (progress < 100) {
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          console.log('✅ Loading completed by timeout');
        }, 500);
      }
    }, 5000); // 5 секунд максимум

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isMounted]);

  useEffect(() => {
    console.log('🔄 Product3DViewer: Initializing...');
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && canvasContainerRef.current) {
      const { width, height } = canvasContainerRef.current.getBoundingClientRect();
      console.log('📐 Canvas container size:', { width, height });
    }
  }, [isMounted]);

  useEffect(() => {
    if (productName) {
      console.log('📦 Product3DViewer: Product changed:', productName);
      console.log('🔄 Resetting loading state');
      setIsLoading(true);
      setLoadingProgress(0);
      setCanvasReady(false);
      
      // Таймаут на случай зависания
      const resetTimeout = setTimeout(() => {
        if (isLoading) {
          console.warn('⚠️ Loading timeout for product change - forcing completion');
          setIsLoading(false);
          setLoadingProgress(100);
        }
      }, 6000);
      
      return () => clearTimeout(resetTimeout);
    }
  }, [productName]);

  const handleParamChange = (key: keyof Product3DParams, value: any) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    onParameterChange?.(newParams);
  };

  const handleCanvasCreated = ({ gl, scene, camera }: any) => {
    console.log('✅ Canvas created successfully!');
    console.log('WebGL context:', gl.getContext());
    console.log('Scene:', scene);
    console.log('Camera position:', camera.position);
    setCanvasReady(true);
    
    // Увеличиваем прогресс до 95%
    setLoadingProgress(95);
    console.log('📊 Progress updated to 95%');
    
    // Завершаем загрузку через небольшую задержку
    setTimeout(() => {
      setLoadingProgress(100);
      console.log('📊 Progress updated to 100%');
      setTimeout(() => {
        setIsLoading(false);
        console.log('🎉 3D Model fully loaded!');
      }, 300);
    }, 200);
  };

  const handleObjectLoad = () => {
    console.log('✅ 3D Object loaded');
    // Если Canvas уже готов, завершаем загрузку
    if (canvasReady) {
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        console.log('🎉 Loading completed after object load');
      }, 200);
    }
  };

  if (!isMounted) {
    return (
      <MuiBox className={styles.container}>
        <Paper className={styles.viewerContainer}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            {productName || '3D Просмотр товара'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px', gap: 2 }}>
            <CircularProgress size={60} />
            <Typography variant="body2" color="text.secondary">
              Инициализация 3D просмотра...
            </Typography>
          </Box>
        </Paper>
      </MuiBox>
    );
  }

  return (
    <MuiBox className={styles.container}>
      <Paper className={styles.viewerContainer}>
        {!compact && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              {productName || '3D Просмотр товара'}
            </Typography>
            {modelUrl && (
              <Button 
                size="small" 
                variant="outlined"
                onClick={() => setUseRealModel(!useRealModel)}
                sx={{ ml: 2 }}
              >
                {useRealModel ? 'Примитивы' : '3D Модель'}
              </Button>
            )}
          </Box>
        )}
        
        {modelError && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setModelError(null)}>
            Не удалось загрузить 3D модель. Используются примитивы.
          </Alert>
        )}
        
        {modelUrl && !modelError && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {modelUrl.startsWith('/models/') 
              ? 'Загружается локальная 3D модель с анимацией' 
              : 'Загружается реалистичная 3D модель из интернета'}
          </Alert>
        )}

        <MuiBox 
          ref={canvasContainerRef}
          className={styles.canvasContainer}
          sx={{ 
            width: '100%', 
            height: compact ? '300px' : '400px',
            minHeight: compact ? '300px' : '400px',
            position: 'relative',
            backgroundColor: '#f0f0f0'
          }}
        >
          {isLoading && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                zIndex: 10,
                gap: 2
              }}
            >
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" color="primary" fontWeight="bold">
                {loadingProgress}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loadingProgress < 30 && 'Инициализация WebGL...'}
                {loadingProgress >= 30 && loadingProgress < 60 && 'Загрузка 3D сцены...'}
                {loadingProgress >= 60 && loadingProgress < 90 && 'Создание 3D модели...'}
                {loadingProgress >= 90 && 'Финальная обработка...'}
              </Typography>
              <Box sx={{ width: '80%', mt: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={loadingProgress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                    }
                  }} 
                />
              </Box>
              {loadingProgress >= 90 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Если загрузка зависла, обновите страницу
                </Typography>
              )}
            </Box>
          )}
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          }>
            <Canvas 
              camera={{ 
                position: focusOnFace ? [0, 1.5, 2.8] : [4, 4, 4], 
                fov: focusOnFace ? 55 : 50,
                near: 0.1,
                far: 1000
              }}
              gl={{ 
                antialias: true, 
                alpha: false,
                powerPreference: "high-performance",
                preserveDrawingBuffer: false,
                stencil: false,
                depth: true,
                toneMappingExposure: 1.2
              }}
              dpr={[1, Math.min(window.devicePixelRatio, 2)]}
              style={{ width: '100%', height: '100%', display: 'block' }}
              onCreated={({ gl, scene, camera }) => {
                // Обработка потери контекста WebGL
                const canvas = gl.domElement;
                canvas.addEventListener('webglcontextlost', (event: Event) => {
                  event.preventDefault();
                  console.warn('⚠️ WebGL context lost');
                });
                canvas.addEventListener('webglcontextrestored', () => {
                  console.log('✅ WebGL context restored');
                });

                // Настраиваем камеру для фокуса на лице
                if (focusOnFace && camera) {
                  camera.lookAt(0, 1.4, 0); // Смотрим на уровень лица
                  // Обновляем матрицу камеры
                  camera.updateProjectionMatrix();
                }

                // Настройки рендерера для лучшего качества
                gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                gl.shadowMap.enabled = true;
                gl.outputEncoding = 3001; // sRGBEncoding

                handleCanvasCreated({ gl, scene, camera });
              }}
              onError={(error: any) => {
                console.error('❌ Canvas error:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                setIsLoading(false);
                setLoadingProgress(100);
                // Не показываем alert, чтобы не блокировать интерфейс
                console.error('Canvas failed to initialize');
              }}
            >
              {/* Улучшенное освещение для лучшей видимости лица */}
              <ambientLight intensity={1.0} />
              <pointLight position={[5, 5, 5]} intensity={1.5} castShadow />
              <pointLight position={[-5, 3, 5]} intensity={1.0} />
              <directionalLight 
                position={[2, 8, 5]} 
                intensity={1.8} 
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <directionalLight position={[-2, 4, -3]} intensity={0.6} />

              {/* Окружение для реалистичного освещения */}
              <Environment preset="sunset" />

              {/* Тени для реалистичности */}
              <ContactShadows 
                opacity={0.3} 
                scale={8} 
                blur={1.5} 
                far={8}
                position={[0, -1, 0]}
              />

              {/* Сетка для лучшей ориентации (опционально) */}
              {/* <gridHelper args={[20, 20, '#888888', '#cccccc']} /> */}
              
              {/* Оси для отладки (опционально) */}
              {/* <axesHelper args={[5]} /> */}

              <Product3DObject 
                params={params} 
                meshRef={meshRef as React.RefObject<Object3D>} 
                onLoad={handleObjectLoad}
                productName={productName}
                productType={productType}
                productColor={productColor}
                modelUrl={useRealModel ? modelUrl : undefined}
                isSpeaking={isSpeaking}
              />

              <OrbitControls 
                enableZoom={!focusOnFace} 
                enablePan={!focusOnFace} 
                enableRotate={!focusOnFace}
                minDistance={focusOnFace ? 2 : 3}
                maxDistance={focusOnFace ? 4 : 15}
                autoRotate={false}
                autoRotateSpeed={0.5}
                target={focusOnFace ? [0, 1.5, 0] : [0, 0, 0]}
              />
            </Canvas>
          </Suspense>
        </MuiBox>

        {!hideControls && (
          <MuiBox className={styles.controlsContainer}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography gutterBottom>Цвет</Typography>
                <input
                  type="color"
                  value={params.color}
                  onChange={(e) => handleParamChange('color', e.target.value)}
                  style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>Размер: {params.size.toFixed(2)}</Typography>
                <Slider
                  value={params.size}
                  min={0.5}
                  max={5}
                  step={0.1}
                  onChange={(_: any, value: number | number[]) => handleParamChange('size', Array.isArray(value) ? value[0] : value)}
                  valueLabelDisplay="auto"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>Форма</Typography>
                <MuiBox sx={{ display: 'flex', gap: 1 }}>
                  <button
                    className={params.shape === 'box' ? styles.activeButton : styles.button}
                    onClick={() => handleParamChange('shape', 'box')}
                  >
                    Куб
                  </button>
                  <button
                    className={params.shape === 'sphere' ? styles.activeButton : styles.button}
                    onClick={() => handleParamChange('shape', 'sphere')}
                  >
                    Сфера
                  </button>
                  <button
                    className={params.shape === 'cylinder' ? styles.activeButton : styles.button}
                    onClick={() => handleParamChange('shape', 'cylinder')}
                  >
                    Цилиндр
                  </button>
                </MuiBox>
              </Grid>
            </Grid>
          </MuiBox>
        )}
      </Paper>
    </MuiBox>
  );
};

export default Product3DViewer;
