import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pagination from './Pagination';

//To avoid repeating props. These props give us 24 pages default.
function renderPagination({
    currentPage = 1,
    totalItems = 480,
    itemsPerPage = 20,
    onPageChange = jest.fn(),
} = {}) {
    return render(
        <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}  
        />
    );
}

test('does not render pagination when there is only one page', () => {
    renderPagination({
        totalItems: 20,
        itemsPerPage: 20,
    });

    expect(
        screen.queryByRole('navigation', { name: /pagination/i })
    ).not.toBeInTheDocument();
});

test('shows every page number when there are 5 or fewer pages', () =>{
    renderPagination({
        currentPage: 1,
        totalItems: 100,
        itemsPerPage: 20,
    });

    expect(screen.getByRole('button', { name: '1'})).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2'})).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3'})).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4'})).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5'})).toBeInTheDocument();

    expect(screen.queryByText('...')).not.toBeInTheDocument();
});

test('shows correct pagination when current page is near the beginning', () => {
    renderPagination({
        currentPage: 1,
    });

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '24' })).toBeInTheDocument();

    expect(screen.getByText('...')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: '5' })).not.toBeInTheDocument();
});

test('shows correct pagination when current page is in the middle', () => {
    renderPagination({
        currentPage: 5,
    });

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '24' })).toBeInTheDocument();

    expect(screen.getAllByText('...')).toHaveLength(2);
});

test('shows correct pagination when current page is near the end', () => {
    renderPagination({
        currentPage: 24,
    });

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '21' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '22' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '23' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '24' })).toBeInTheDocument();

    expect(screen.getByText('...')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: '20' })).not.toBeInTheDocument();
});

test('does not duplicate the first page near the end', () => {
    renderPagination({
        currentPage: 22,
    });

    const pageOneButtons = screen.getAllByRole('button', {
        name: '1',
    });

    expect(pageOneButtons).toHaveLength(1);

    expect(screen.getByRole('button', { name: '24' })).toBeInTheDocument();
});

test('disables Previous on the first page', () => {
    renderPagination({
        currentPage: 1,
    });

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
});

test('disables Next on the last page', () => {
    renderPagination({
        currentPage: 24,
    });

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
});

test('calls onPageChange with the next page when Next is clicked', () => {
    const onPageChange = jest.fn();

    renderPagination({
        currentPage: 5,
        onPageChange,
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(onPageChange).toHaveBeenCalledWith(6);
});

test('calls onPageChange with the previous page when Previous is clicked', () => {
    const onPageChange = jest.fn();

    renderPagination({
        currentPage: 5,
        onPageChange,
    });

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));

    expect(onPageChange).toHaveBeenCalledWith(4);
});

test('calls onPageChange when a page number is clicked', () => {
    const onPageChange = jest.fn();

    renderPagination({
        currentPage: 5,
        onPageChange,
    });

    fireEvent.click(screen.getByRole('button', { name: '6' }));

    expect(onPageChange).toHaveBeenCalledWith(6);
});

test('marks the current page as the current page', () => {
    renderPagination({
        currentPage: 5,
    });

    expect(screen.getByRole('button', { name: '5', current: 'page'})).toBeInTheDocument();
});

