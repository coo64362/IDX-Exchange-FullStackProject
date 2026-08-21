'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchProperties } from '../../lib/api/client.js';
import PropertyCardSkeleton from './PropertyCardSkeleton.jsx';
import PropertyCard from './PropertyCard';
import PropertyFilters from './PropertyFilters';
import Pagination from './Pagination';

const EMPTY_DATA = {
    total: 0,
    limit: 20,
    offset: 0,
    results: [],
};

export default function ListingsPage() {
    const [data, setData] = useState(EMPTY_DATA);
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const offset = (currentPage - 1) * itemsPerPage;
    const showingStart = data.total === 0 ? 0 : offset + 1;
    const showingEnd = Math.min(
        offset + data.results.length,
        data.total
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Prevent older requests from overwriting newer search results.
    const requestIdRef = useRef(0);

    const loadProperties = useCallback(async (searchFilters = {}) => {
        const currentRequestId = ++requestIdRef.current;

        try {
            const response = await fetchProperties({
                ...searchFilters,
                limit: itemsPerPage,
                offset,
            });

            if (currentRequestId !== requestIdRef.current) {
                return;
            }

            setData(response);

        } catch (err) {

            if (currentRequestId !== requestIdRef.current) {
                return;
            }

            setError(err.message);

        } finally {

            if (currentRequestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [itemsPerPage, offset]);

    useEffect(() => {
        // Defer the request so React can finish the current render first.
        const requestTimer = window.setTimeout(() => {
            void loadProperties(filters);
        }, 0);

        return () => window.clearTimeout(requestTimer);
    }, [filters, loadProperties]);

    function handleSearch(newFilters) {
        setLoading(true);
        setError(null);
        setFilters(newFilters);
        setCurrentPage(1); 
    }

    function handleClear() {
        setLoading(true);
        setError(null);
        setFilters({});
        setCurrentPage(1);
    }

    function handlePageChange(page) {
        setLoading(true);
        setError(null);
        setCurrentPage(page);
        window.scrollTo(0, 0);
    }

    if (error) {
        return (
            <main className="p-6">
                <p className="text-red-500">
                    Error: {error}
                </p>
            </main>
        );
    }

    return (
        <main className="p-6">

            <PropertyFilters
                onSearch={handleSearch}
                onClear={handleClear}
            />

            <p className="mb-4">
                Showing {showingStart}-{showingEnd} of {data.total} properties
            </p>

            {loading ? (

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                    {Array.from({ length: 6 }).map((_, index) => (
                    <PropertyCardSkeleton key={index} />
                    ))}

                </div>

            ) : data.results.length === 0 ? (
                <div className="rounded border p-8 text-center">
                    <h2 className="text-xl font-semibold">
                        No properties found
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Try adjusting your filters.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-3">
                    {data.results.map((property) => (
                        <PropertyCard
                            key={property.L_ListingID}
                            property={property}
                        />
                    ))}
                </div>

            )}

            <Pagination
                currentPage={currentPage}
                totalItems={data.total}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
            />
        </main>
    );
}
