'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function PropertyImageGallery({ photos }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const photoCount = Array.isArray(photos) ? photos.length : 0;

    function previousPhoto() {
        setCurrentIndex((index) =>
            (index - 1 + photos.length) % photos.length
        );
    }

    function nextPhoto() {
        setCurrentIndex((index) => (index + 1) % photos.length);
    }

    useEffect(() => {
        if (!lightboxOpen || photoCount === 0) {
            return undefined;
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setLightboxOpen(false);
            }

            if (event.key === 'ArrowLeft') {
                setCurrentIndex((index) =>
                    (index - 1 + photoCount) % photoCount
                );
            }

            if (event.key === 'ArrowRight') {
                setCurrentIndex((index) => (index + 1) % photoCount);
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [lightboxOpen, photoCount]);

    if (photoCount === 0) {
        return (
            <div className="flex h-96 items-center justify-center border">
                <p>No photos available</p>
            </div>
        );
    }

    return (
        <>
            <div>
                <Image
                    src={photos[currentIndex]}
                    alt={`Property photo ${currentIndex + 1}`}
                    width={1200}
                    height={675}
                    unoptimized
                    className="h-96 w-full cursor-pointer rounded-lg object-cover"
                    onClick={() => setLightboxOpen(true)}
                />

                <div className="mt-3 flex gap-2 overflow-x-auto">
                    {photos.map((photo, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setCurrentIndex(index)}
                            className="shrink-0"
                        >
                            <Image
                                src={photo}
                                alt={`Thumbnail ${index + 1}`}
                                width={96}
                                height={80}
                                unoptimized
                                className={`h-20 w-24 rounded object-cover ${
                                    index === currentIndex
                                        ? 'ring-2 ring-blue-500'
                                        : ''
                                }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                    onClick={() => setLightboxOpen(false)}
                >
                    <Image
                        src={photos[currentIndex]}
                        alt={`Property photo ${currentIndex + 1}`}
                        width={1600}
                        height={900}
                        unoptimized
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                        onClick={(event) => event.stopPropagation()}
                    />

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            previousPhoto();
                        }}
                        className="absolute left-5 text-4xl text-white"
                        aria-label="Previous photo"
                    >
                        ←
                    </button>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            nextPhoto();
                        }}
                        className="absolute right-5 text-4xl text-white"
                        aria-label="Next photo"
                    >
                        →
                    </button>
                </div>
            )}
        </>
    );
}
