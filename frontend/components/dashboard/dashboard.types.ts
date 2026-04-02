export type DateRange = {
    startDate: string;
    endDate: string;
};

export type DashboardPeriod = "week" | "month";

export type DashboardDerivedStats = {
    totalUsers: number;
    usersUsingParking: number;
    usersNotUsingParking: number;
    totalSpots: number;
    electricSpots: number;
    activeBookings: number;
    selectedDayCount: number;
    occupancyRate: number;
    electricSpotRate: number;
    activeUserRate: number;
    inactiveUserRate: number;
};