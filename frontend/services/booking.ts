export async function getParkingSpots(date: Date) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}parking-spots?date=${date.toISOString()}`);
    const data = await response.json();
    return data;
}

export async function bookParkingSpot(date: Date, parkingSpotId: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}bookings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({date, parkingSpotId})
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Une erreur s'est produite");
    }
    return await response.json();
}