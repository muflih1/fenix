import type {LucideIcon} from 'lucide-react';

export type IconComponentType = LucideIcon;
export type IconProps = {
  icon: IconComponentType;
  size: number;
  className?: string;
};

export function Icon({icon: Icon, size, className}: IconProps) {
  return <Icon size={size} className={className} />;
}
