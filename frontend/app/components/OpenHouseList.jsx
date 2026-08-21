export default function OpenHouseList({ openHouses }) {
    if (!openHouses || openHouses.length === 0) {
        return (
            <div className="rounded-lg border p-4">
                <p className="text-gray-500">
                    No open houses scheduled.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {openHouses.map((openHouse, index) => {
                let allData = {};

                try {
                    allData =
                        typeof openHouse.all_data === 'string'
                            ? JSON.parse(openHouse.all_data)
                            : openHouse.all_data || {};
                } catch (error) {
                    console.error(
                        'Failed to parse open house all_data:',
                        error
                    );
                }

                const remarks = allData.OpenHouseRemarks ?? '';

                return (
                    <div
                        key={openHouse.id ?? index}
                        className="rounded-lg border p-4"
                    >
                        <p className="font-semibold">
                            {formatDate(openHouse.OpenHouseDate)}
                        </p>

                        <p className="text-gray-600">
                            {formatTime(openHouse.OH_StartTime)}
                            {' – '}
                            {formatTime(openHouse.OH_EndTime)}
                        </p>

                        {remarks && (
                            <p className="mt-2 text-gray-700">
                                {remarks}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}


function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
}