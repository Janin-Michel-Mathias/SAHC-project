export type SelfBookingSummary = {
    remainingBookings: number;
    bookings: Array<unknown>;
};

export async function getParkingSpots(date: Date) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}parking-spots?date=${date.toISOString()}`);
    const data = await response.json();
    return data;
}

export async function getSelfBookingSummary() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}bookings/self`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Une erreur s'est produite");
    }

    return (await response.json()) as SelfBookingSummary;
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

export async function cancelParkingSpot(bookingId: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Une erreur s'est produite");
    }

    return await response.json();
}

export async function checkInBooking(bookingId: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}bookings/${bookingId}/check-in`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Une erreur s'est produite");
    }

    return await response.json();
}   