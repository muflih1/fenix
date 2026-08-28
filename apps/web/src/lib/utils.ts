import clsx, {type ClassValue} from 'clsx';
import {composeRenderProps} from 'react-aria-components';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(...inputs));
}

export function composeTailwindRenderProps<T>(
  className: string | ((v: T) => string) | undefined,
  tw: string,
) {
  return composeRenderProps(className, className => cn(tw, className));
}
