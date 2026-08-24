'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function PropertyImageCarousel({ photos }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!Array.isArray(photos) || photos.length === 0) {
        return (
            <div className="flex h-48 w-full items-center justify-center border">
                <p>No photo available</p>
            </div>
        );
    }

    function handlePrevious(event) {
        event.preventDefault();
        event.stopPropagation();

        setCurrentIndex((currentIndex - 1 + photos.length) % photos.length);
    }

    function handleNext(event) {
        event.preventDefault();
        event.stopPropagation();

        setCurrentIndex((currentIndex + 1) % photos.length);
    }

    return (
        <div className="relative">
            <Image
                src={photos[currentIndex]}
                alt={`Property photo ${currentIndex + 1}`}
                width={800}
                height={450}
                unoptimized
                className="h-48 w-full rounded-t-lg object-cover"
            />

            {photos.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={handlePrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white"
                        aria-label="Previous photo"
                    >
                        ←
                    </button>

                    <button
                        type="button"
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white"
                        aria-label="Next photo"
                    >
                        →
                    </button>

                    <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-sm text-white">
                        {currentIndex + 1} / {photos.length}
                    </span>
                </>
            )}
        </div>
    );
}
