'use client';

import { useState, useEffect } from 'react';
import { tokenManager } from '@/lib/api';
import { Loader2, ImageIcon } from 'lucide-react';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function AuthenticatedImage({ src, alt, className, fallback }: AuthenticatedImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = tokenManager.getAccessToken();
        if (!token) {
          throw new Error('Token d\'authentification non trouvé');
        }

        const response = await fetch(src, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } catch (err: any) {
        console.error('Error loading authenticated image:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (src) {
      loadImage();
    }

    // Cleanup function to revoke object URL
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [src]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      fallback || (
        <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
          <div className="text-center text-gray-500">
            <ImageIcon className="h-6 w-6 mx-auto mb-1" />
            <p className="text-xs">Image non disponible</p>
          </div>
        </div>
      )
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setError('Erreur de chargement')}
    />
  );
}