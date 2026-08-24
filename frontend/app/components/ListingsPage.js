'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { fetchProperties } from '../../lib/api/client.js';
import PropertyCardSkeleton from './PropertyCardSkeleton.jsx';
import PropertyCard from './PropertyCard';
import PropertyFilters from './PropertyFilters';
import Pagination from './Pagination';

function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div
            role="alert"
            className="rounded border border-red-200 bg-red-50 p-8 text-center"
        >
            <h2 className="text-xl font-semibold text-red-700">
                Something went wrong
            </h2>

            <p className="mt-2 text-gray-600">
                Please try again.
            </p>

            <button
                type="button"
                onClick={resetErrorBoundary}
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
                Try Again
            </button>
        </div>
    );
}

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
    const [sortBy, setSortBy] = useState();
    const [sortOrder, setSortOrder] = useState();

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

        setLoading(true);
        setError(null);

        try {
            const response = await fetchProperties({
                ...searchFilters,
                limit: itemsPerPage,
                offset,
                sortBy,
                sortOrder,
            });

            if (currentRequestId !== requestIdRef.current) {
                return;
            }

            setData(response);

        } catch (err) {

            if (currentRequestId !== requestIdRef.current) {
                return;
            }

            setError(err instanceof Error ? err.message : 'Unable to load properties');

        } finally {

            if (currentRequestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [itemsPerPage, offset, sortBy, sortOrder]);

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
        setSortBy();
        setSortOrder();
    }

    function handleClear() {
        setLoading(true);
        setError(null);
        setFilters({});
        setCurrentPage(1);
        setSortBy();
        setSortOrder();
    }

    function handlePageChange(page) {
        setLoading(true);
        setError(null);
        setCurrentPage(page);
        window.scrollTo(0, 0);
    }

    function handleSortChange(e) {
        const fullValue = e.target.value;

        if (fullValue == "") {
            setSortBy();
            setSortOrder();
            setCurrentPage(1);
        } else {
            const [column, direction] = fullValue.split(':');
            setSortBy(column);
            setSortOrder(direction);
            setCurrentPage(1);
        }
    }

    let currentSelectValue;
    if (sortBy !== undefined && sortOrder !== undefined) {
        currentSelectValue = `${sortBy}:${sortOrder}`;
    } else {
        currentSelectValue = "";
    }

    function handleRetry() {
        void loadProperties(filters);
    }

    if (error) {
        return (
            <main className="p-6">
                <div role="alert" className="rounded border border-red-200 bg-red-50 p-8 text-center">
                    <h2 className="text-xl font-semibold text-red-700">
                        Something went wrong
                    </h2>
                    <p className="text-red-500 mt-2">
                        Error: {error}
                    </p>
                    <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                setData(EMPTY_DATA);
                void loadProperties(filters);
            }}
            onError={(error, info) => {
                console.error('React render error:', error, info);
            }}
        >
            <main className="p-6">



                <PropertyFilters
                    onSearch={handleSearch}
                    onClear={handleClear}
                />

                <div className="flex justify-between items-center mb-4">
                    <p>
                        Showing {showingStart}-{showingEnd} of {data.total} properties
                    </p>

                    <p className="flex gap-2">
                        <span className="text-gray-600 select-none">Sort:</span>
                        <select id="sort" value={currentSelectValue} aria-label="Sort options" className="bg-transparent border-none pr-4 cursor-pointer font-medium" onChange={handleSortChange}>
                            <option value="">Recommended</option>
                            <option value="L_SystemPrice:asc">Price: Low to High</option>
                            <option value="L_SystemPrice:desc">Price: High to Low</option>
                            <option value="ListingContractDate:desc">Date Listed: Newest</option>
                            <option value="ListingContractDate:asc">Date Listed: Oldest</option>
                            <option value="LM_Int2_3:asc">Square Footage: Low to High</option>
                            <option value="LM_Int2_3:desc">Square Footage: High to Low</option>
                            <option value="L_Keyword2:asc">Beds: Low to High</option>
                            <option value="L_Keyword2:desc">Beds: High to Low</option>
                        </select>
                    </p>
                </div>

                {loading ? (

                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

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
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
        </ErrorBoundary>
    );
}
