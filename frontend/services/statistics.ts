type BookingStatisticsSpotUsage = {
    spotId: number;
    row: string;
    col: string;
    isElectric: boolean;
    totalBookings: number;
    checkedInBookings: number;
    nonCheckedInBookings: number;
    cancelledBookings: number;
};

export type BookingStatistics = {
    startDate: string;
    endDate: string;
    totalBookings: number;
    checkedInBookings: number;
    nonCheckedInBookings: number;
    cancelledBookings: number;
    usedElectricSpots: number;
    spotsUsage: BookingStatisticsSpotUsage[];
};

export type UserStatisticsEntry = {
    userId: number;
    email: string;
    totalBookings: number;
    checkedInBookings: number;
    nonCheckedInBookings: number;
    cancelledBookings: number;
};

export type UserStatistics = {
    startDate: string;
    endDate: string;
    users: UserStatisticsEntry[];
};

export type ManagerDashboardStats = {
    bookingStats: BookingStatistics;
    userStats: UserStatistics;
};

async function statisticsRequest<T>(path: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}statistics${path}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Une erreur s'est produite");
    }

    return (await response.json()) as T;
}

export function getManagerBookingStats(startDate: Date, endDate: Date) {
    const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
    });

    return statisticsRequest<BookingStatistics>(`/booking-stats?${params.toString()}`);
}

export function getManagerUserStats(startDate: Date, endDate: Date) {
    const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
    });

    return statisticsRequest<UserStatistics>(`/user-stats?${params.toString()}`);
}

export async function getManagerDashboardStats(startDate: Date, endDate: Date): Promise<ManagerDashboardStats> {
    const [bookingStats, userStats] = await Promise.all([
        getManagerBookingStats(startDate, endDate),
        getManagerUserStats(startDate, endDate),
    ]);

    return {
        bookingStats,
        userStats,
    };
}