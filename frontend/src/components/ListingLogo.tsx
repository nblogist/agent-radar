import { useState } from 'react';

const GRADIENTS = [
  'from-primary to-blue-600',
  'from-purple-600 to-pink-500',
  'from-green-500 to-emerald-400',
  'from-blue-400 to-indigo-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-500',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
];

export function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function getInitials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

interface ListingLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: string;
  textSize?: string;
  rounded?: string;
}

export default function ListingLogo({ name, logoUrl, size = 'w-12 h-12', textSize = 'text-sm', rounded = 'rounded-lg' }: ListingLogoProps) {
  const [imgError, setImgError] = useState(false);

  // Real logo: clean white box with subtle border — works for any logo color
  if (logoUrl && !imgError) {
    return (
      <div className={`${size} ${rounded} ring-1 ring-white/10 flex items-center justify-center overflow-hidden flex-shrink-0`}>
        <img
          className="w-full h-full object-contain"
          src={logoUrl}
          alt={name}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // No logo: gradient with initials
  return (
    <div className={`${size} ${rounded} bg-gradient-to-br ${getGradient(name)} flex items-center justify-center flex-shrink-0`}>
      <span className={`font-bold text-white ${textSize}`}>{getInitials(name)}</span>
    </div>
  );
}
