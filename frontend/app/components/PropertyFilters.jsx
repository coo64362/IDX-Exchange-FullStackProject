'use client';

import { useState } from 'react';

/*
 * Initial values for every filter.
 * Keeping this object outside the component prevents it from
 * being recreated on every render.
 */
const INITIAL_FILTERS = {
    city: '',
    zipcode: '',
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: '',
};

/*
   PropertyFilters
  
   Responsibilities:
   - Render the filter form.
   - Store the user's input.
   - Notify the parent when Search is clicked.
   - Notify the parent when Clear Filters is clicked.
 */
export default function PropertyFilters({onSearch, onClear}) {
     //throw new Error("Simulated filter crash testing!");
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    /*
       Updates whichever input changed.
      
       Example:
       name="city"
       value="CA"
      
       becomes
      
       filters = {
        ...filters,
        city: "CA"
       }
     */
    function handleChange(event) {
        const { name, value } = event.target;

        setFilters((previousFilters) => ({
            ...previousFilters,
            [name]: value,
        }));
    }

    /*
      Prevent the browser from refreshing.
      Pass all filter values back to ListingsPage.
     */
    function handleSubmit(event) {
        event.preventDefault();

        onSearch(filters);
    }

    /*
      Reset every input.
      Notify ListingsPage so it reloads all properties.
     */
    function handleClear() {
        setFilters(INITIAL_FILTERS);
        onClear();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-lg border p-4"
        >
            <div className="grid grid-cols-3 gap-4">

                <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={filters.city}
                    onChange={handleChange}
                    className="rounded border p-2"
                />

                <input
                    type="text"
                    name="zipcode"
                    placeholder="ZIP Code"
                    value={filters.zipcode}
                    onChange={handleChange}
                    className="rounded border p-2"
                />

                <input
                    type="number"
                    name="minPrice"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={handleChange}
                    className="rounded border p-2"
                />

                <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={handleChange}
                    className="rounded border p-2"
                />

                <select
                    name="beds"
                    value={filters.beds}
                    onChange={handleChange}
                    className="rounded border p-2"
                >
                    <option value="">Beds</option>

                    {[1, 2, 3, 4, 5].map((number) => (
                        <option
                            key={number}
                            value={number}
                        >
                            {number}+
                        </option>
                    ))}
                </select>

                <select
                    name="baths"
                    value={filters.baths}
                    onChange={handleChange}
                    className="rounded border p-2"
                >
                    <option value="">Baths</option>

                    {[1, 2, 3, 4, 5].map((number) => (
                        <option
                            key={number}
                            value={number}
                        >
                            {number}+
                        </option>
                    ))}
                </select>

            </div>

            <div className="mt-4 flex gap-4">

                <button
                    type="submit"
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Search
                </button>

                <button
                    type="button"
                    onClick={handleClear}
                    className="rounded border px-4 py-2 hover:bg-gray-100"
                >
                    Clear Filters
                </button>

            </div>
        </form>
    );
}