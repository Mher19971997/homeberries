import { Scale } from 'lucide-react';

export const ScaleIcon = ({ className, size = 22 }: { className?: string; size?: number }) => (
  <Scale className={className} size={size} strokeWidth={1} />
);
