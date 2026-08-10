'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchProperties } from '../../lib/api/client.js';
import PropertyCardSkeleton from './PropertyCardSkeleton.jsx';
import PropertyCard from './PropertyCard';
import PropertyFilters from './PropertyFilters';
import Pagination from './Pagination';

/**
 * Default response shape.
 *
 * Keeping this outside the component avoids
 * recreating the object every render.
 */
const EMPTY_DATA = {
    total: 0,
    limit: 20,
    offset: 0,
    results: [],
};

export default function ListingsPage() {
    /**
     * Property results returned from the API.
     */
    const [data, setData] = useState(EMPTY_DATA);

    /**
     * Current filter values.
     */
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const offset = (currentPage - 1) * itemsPerPage;

    /**
     * Loading state.
     */
    const [loading, setLoading] = useState(true);

    /**
     * Error message.
     */
    const [error, setError] = useState(null);

    /**
     * Prevents stale requests from updating UI.
     *
     * Example:
     *
     * Search Atlanta -> request 1
     * Clear -> request 2
     * Search Chicago -> request 3
     *
     * If request 1 finishes last,
     * it should NOT overwrite Chicago.
     */
    const requestIdRef = useRef(0);

    /**
     * Fetch properties from API.
     */
    async function loadProperties(searchFilters = {}) {
        const currentRequestId = ++requestIdRef.current;

        try {
            setLoading(true);
            setError(null);

            const response = await fetchProperties({
                ...searchFilters,
                limit: itemsPerPage,
                offset,
            });

            /**
             * Ignore stale responses.
             */
            if (currentRequestId !== requestIdRef.current) {
                return;
            }

            setData(response);

        } catch (err) {

            /**
             * Ignore stale errors too.
             */
            if (currentRequestId !== requestIdRef.current) {
                return;
            }

            setError(err.message);

        } finally {

            /**
             * Only newest request controls loading.
             */
            if (currentRequestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }

    /**
     * Initial page load.
     */
    useEffect(() => {
        loadProperties(filters);
    }, [currentPage, filters]);

    /**
     * User clicked Search. 
     */
    function handleSearch(newFilters) {
        setFilters(newFilters);
        setCurrentPage(1); 
    }

    /**
     * User clicked Clear Filters.
     */
    function handleClear() {
        setFilters({});
        setCurrentPage(1);
    }

    /**
     * When User clicks to the next page OR filter adjusts page.
     */
    function handlePageChange(page) {
        setCurrentPage(page);
        window.scrollTo(0, 0); //Make the page start from the top
    }

    /**
     * Error UI.
     */
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
                Showing {data.results.length} of {data.total} properties
            </p>

            {loading ? (

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                    {Array.from({ length: 6 }).map((_, index) => (
                    <PropertyCardSkeleton key={index} />
                    ))}

                </div>

            ) : data.results.length === 0 ? ( /* No results state */
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