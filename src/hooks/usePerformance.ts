import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  isLowEndDevice: boolean;
  prefersReducedMotion: boolean;
  isMobile: boolean;
  devicePixelRatio: number;
  hardwareConcurrency: number;
  memoryInfo?: {
    totalJSHeapSize: number;
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export function usePerformance(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    isLowEndDevice: false,
    prefersReducedMotion: false,
    isMobile: false,
    devicePixelRatio: 1,
    hardwareConcurrency: 4,
  });

  useEffect(() => {
    const detectPerformance = () => {
      // Detectar preferencias de movimiento reducido
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Detectar si es dispositivo móvil
      const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Obtener información del dispositivo
      const devicePixelRatio = window.devicePixelRatio || 1;
      const hardwareConcurrency = (navigator as any).hardwareConcurrency || 4;
      
      // Obtener información de memoria si está disponible
      let memoryInfo;
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        memoryInfo = {
          totalJSHeapSize: memory.totalJSHeapSize,
          usedJSHeapSize: memory.usedJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };
      }
      
      // Determinar si es un dispositivo de bajos recursos
      const isLowEndDevice = 
        hardwareConcurrency <= 2 || 
        devicePixelRatio <= 1 || 
        isMobile ||
        (memoryInfo && memoryInfo.jsHeapSizeLimit < 1073741824); // < 1GB
      
      setMetrics({
        isLowEndDevice,
        prefersReducedMotion,
        isMobile,
        devicePixelRatio,
        hardwareConcurrency,
        memoryInfo,
      });
    };

    // Detectar al montar
    detectPerformance();
    
    // Escuchar cambios en el tamaño de la ventana
    const handleResize = () => {
      detectPerformance();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Escuchar cambios en las preferencias de movimiento
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => {
      detectPerformance();
    };
    
    mediaQuery.addEventListener('change', handleMotionChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return metrics;
}

// Hook para aplicar clases de rendimiento automáticamente
export function usePerformanceMode() {
  const { isLowEndDevice, prefersReducedMotion } = usePerformance();
  
  useEffect(() => {
    const root = document.documentElement;
    
    if (isLowEndDevice || prefersReducedMotion) {
      root.classList.add('performance-mode');
    } else {
      root.classList.remove('performance-mode');
    }
    
    return () => {
      root.classList.remove('performance-mode');
    };
  }, [isLowEndDevice, prefersReducedMotion]);
  
  return { isLowEndDevice, prefersReducedMotion };
}

// Hook para optimizar animaciones basado en el rendimiento
export function useOptimizedAnimation() {
  const { isLowEndDevice, prefersReducedMotion } = usePerformance();
  
  const getAnimationClass = (defaultClass: string, fallbackClass?: string) => {
    if (isLowEndDevice || prefersReducedMotion) {
      return fallbackClass || '';
    }
    return defaultClass;
  };
  
  const getTransitionClass = (defaultClass: string, fallbackClass?: string) => {
    if (isLowEndDevice || prefersReducedMotion) {
      return fallbackClass || '';
    }
    return defaultClass;
  };
  
  return {
    getAnimationClass,
    getTransitionClass,
    isLowEndDevice,
    prefersReducedMotion,
  };
}

