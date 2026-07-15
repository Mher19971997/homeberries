import { Scale } from 'lucide-react';

export const ScaleIcon = ({ className, size }: { className?: string; size?: number; }) => (
  <Scale className={className} size={size} width={30} height={30} strokeWidth={1} />
);
