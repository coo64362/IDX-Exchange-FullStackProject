function getPageNumbers(currentPage, totalPages) {
    // All pages fit - no ellipsis needed
    if (totalPages <= 5) {
        return Array.from(
            { length: totalPages },
            (_, index) => index + 1
        );
    }

    //Current page is near the beginning
    if (currentPage <= 3) {
        return [1, 2, 3, 4, 'ellipsis', totalPages];
    }

    //Current page is near the end
    if (currentPage >= totalPages - 2) {
        return [
            1,
            'ellipsis',
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages,
        ];
    }

    //Current page is in the middle
    return [
        1,
        'ellipsis',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        'ellipsis',
        totalPages
    ];
}

export default function Pagination({currentPage, totalItems, itemsPerPage, onPageChange}) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        return null;
    }

    const pageNumbers = getPageNumbers(currentPage, totalPages);

    return (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
            <button 
                type="button" 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
            >
                Previous
            </button>

            {pageNumbers.map((page, index) =>
                page === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`}>
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        aria-current={
                            page === currentPage ? 'page' : undefined
                        }
                        className={
                            page === currentPage ? 'rounded bg-blue-600 px-3 py-2 text-white' : 'rounded border border-gray-700 bg-gray-900 px-3 py-2 text-white hover:bg-gray-700'
                        }
                    >
                        {page}
                    </button>
                )
            )}

            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>

        </nav>
    );
}