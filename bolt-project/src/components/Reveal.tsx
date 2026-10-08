import { type ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'slide-in-left' | 'slide-in-right' | 'scale-in';
  once?: boolean;
};

export default function Reveal({
  children,
  className = '',
  delay = 0,
  animation = 'fade-in-up',
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${
        inView ? `animate-${animation}` : 'opacity-0'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
