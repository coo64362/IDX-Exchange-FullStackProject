export async function fetchProperties (params = {}) {
    const searchParams = new URLSearchParams();

    //Check the params before creating the searchParams string
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
            searchParams.append(key, value);
        }
    });

    const queryString = searchParams.toString();

    //Check whether to append the ?
    const response = await fetch(`/api/properties${queryString ? `?${queryString}` : ""}`);

    if (!response.ok) {
        let message = `Failed to fetch property ${response.status}`;

        try {
            let errorData = await response.json();
            if (errorData.message) {
                message = errorData.message;
            } else if (errorData.error) {
                message = errorData.error;
            }
        }   catch {
            //The server did not return JSON, default to set message
        }
        throw new Error(message);
    }

    return response.json();
}

export async function fetchPropertyDetail(id) {
    const response = await fetch(`/api/properties/${encodeURIComponent(id)}`);
    
    if (!response.ok) {
        let message = `Failed to fetch property ${response.status}`;

        try {
            let errorData = await response.json();
            if (errorData.message) {
                message = errorData.message;
            } else if (errorData.error) {
                message = errorData.error;
            }
        }   catch {
            //The server did not return JSON, default to set message
        }
        throw new Error(message);
    }

    return response.json();
}

export async function fetchPropertyOpenHouses(id) {
    const response = await fetch(`/api/properties/${encodeURIComponent(id)}/openhouses`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
            errorData.error || 'Failed to fetch open houses'
        );
    }

    return response.json();
}
