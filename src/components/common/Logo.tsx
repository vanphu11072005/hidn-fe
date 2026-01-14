import Link from 'next/link';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link 
      href="/dashboard" 
      className={`text-2xl font-bold text-blue-600 
        hover:text-blue-700 transition-colors ${className}`}
    >
      Hidn
    </Link>
  );
}
