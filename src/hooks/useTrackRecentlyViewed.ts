import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCookies } from 'react-cookie';
import { trackRecentlyViewed } from '@homeberris/http/recentlyViewedApi';
import { useRef, useCallback } from 'react';

export const useTrackRecentlyViewed = () => {
  const [cookies] = useCookies(['token']);
  const trackedRef = useRef<string | null>(null);

  const { mutate } = useMutation({
    mutationFn: (catalogUuid: string) =>
      trackRecentlyViewed({ catalogUuid }, cookies.token),
  });

  const track = useCallback((catalogUuid: string) => {
    if (!cookies.token) return;
    if (trackedRef.current === catalogUuid) return;
    trackedRef.current = catalogUuid;
    mutate(catalogUuid);
  }, [cookies.token, mutate]);

  return track;
};