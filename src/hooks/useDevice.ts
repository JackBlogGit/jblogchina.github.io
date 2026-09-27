import { useEffect, useMemo, useState } from 'react';

export type Device = 'phone' | 'tablet' | 'desktop';

function current(): Device {
  if (typeof window === 'undefined') return 'desktop';
  if (window.matchMedia('(max-width: 767px)').matches) return 'phone';
  if (window.matchMedia('(max-width: 1199px)').matches) return 'tablet';
  return 'desktop';
}

export interface DeviceInfo {
  device: Device;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useDevice(): DeviceInfo {
  const [device, setDevice] = useState<Device>(current);

  useEffect(() => {
    const mqPhone = window.matchMedia('(max-width: 767px)');
    const mqTablet = window.matchMedia('(max-width: 1199px)');
    const onChange = () => setDevice(current());
    mqPhone.addEventListener('change', onChange);
    mqTablet.addEventListener('change', onChange);
    return () => {
      mqPhone.removeEventListener('change', onChange);
      mqTablet.removeEventListener('change', onChange);
    };
  }, []);

  return useMemo(
    () => ({
      device,
      isMobile: device === 'phone',
      isTablet: device === 'tablet',
      isDesktop: device === 'desktop',
    }),
    [device],
  );
}
