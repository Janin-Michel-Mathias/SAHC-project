"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, SubmitEvent } from "react";
import { AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getManagerDashboardStats, type ManagerDashboardStats } from "@/services";
import { DashboardBreakdown as DashboardBreakdownSection } from "@/components/dashboard/dashboard-breakdown";
import { DashboardHeader as DashboardHeaderSection } from "@/components/dashboard/dashboard-header";
import { DashboardMetricsGrid as DashboardMetricsGridSection } from "@/components/dashboard/dashboard-metrics-grid";
import { DashboardRangeForm as DashboardRangeFormSection } from "@/components/dashboard/dashboard-range-form";
import type { DashboardDerivedStats, DashboardPeriod, DateRange } from "@/components/dashboard/dashboard.types";

function formatInputDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

function parseInputDate(value: string) {
    return new Date(`${value}T00:00:00`);
}

function createLocalDate(year: number, month: number, day: number) {
    return new Date(year, month, day);
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}

function getRangeForPeriod(period: DashboardPeriod, referenceDate = new Date()): DateRange {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();

    if (period === "week") {
        const day = referenceDate.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const start = createLocalDate(year, month, referenceDate.getDate() + mondayOffset);
        const end = createLocalDate(start.getFullYear(), start.getMonth(), start.getDate() + 6);

        return {
            startDate: formatInputDate(start),
            endDate: formatInputDate(end),
        };
    }

    const start = createLocalDate(year, month, 1);
    const end = createLocalDate(year, month + 1, 0);

    return {
        startDate: formatInputDate(start),
        endDate: formatInputDate(end),
    };
}

function getDefaultPeriod(): DashboardPeriod {
    return "month";
}

function shiftReferenceDate(current: Date, period: DashboardPeriod, direction: -1 | 1) {
    if (period === "week") {
        return createLocalDate(current.getFullYear(), current.getMonth(), current.getDate() + 7 * direction);
    }

    return createLocalDate(current.getFullYear(), current.getMonth() + direction, 1);
}

function getInclusiveDayCount(startDate: string, endDate: string) {
    const start = parseInputDate(startDate);
    const end = parseInputDate(endDate);
    const diff = Math.max(0, end.getTime() - start.getTime());

    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
}

export default function Page() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>(getDefaultPeriod);
    const [referenceDate, setReferenceDate] = useState<Date>(() => new Date());
    const [dateRange, setDateRange] = useState<DateRange>(() => getRangeForPeriod(getDefaultPeriod()));
    const [stats, setStats] = useState<ManagerDashboardStats | null>(null);

    const loadStats = async (range: DateRange) => {
        const startDate = parseInputDate(range.startDate);
        const endDate = parseInputDate(range.endDate);

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            throw new Error("La période sélectionnée est invalide.");
        }

        if (startDate > endDate) {
            throw new Error("La date de début doit être antérieure à la date de fin.");
        }

        const nextStats = await getManagerDashboardStats(startDate, endDate);
        setStats(nextStats);
        setDateRange(range);
    };

    const refreshForSelection = async (period: DashboardPeriod, anchorDate: Date) => {
        setError(null);
        setIsRefreshing(true);

        try {
            await loadStats(getRangeForPeriod(period, anchorDate));
        } catch (refreshError) {
            setError(refreshError instanceof Error ? refreshError.message : "Impossible d'actualiser les statistiques.");
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");

        if (!token) {
            window.location.href = "/?redirect=/dashboard";
            return;
        }

        if (role !== "manager") {
            window.location.href = "/booking";
            return;
        }

        const bootstrap = async () => {
            setIsAuthorized(true);

            try {
                await loadStats(getRangeForPeriod(selectedPeriod, referenceDate));
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : "Impossible de charger le tableau de bord.");
            } finally {
                setIsLoading(false);
            }
        };

        bootstrap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const derived: DashboardDerivedStats | null = useMemo(() => {
        if (!stats) {
            return null;
        }

        const totalUsers = stats.userStats.users.length;
        const usersUsingParking = stats.userStats.users.filter((user) => user.totalBookings > 0).length;
        const usersNotUsingParking = Math.max(0, totalUsers - usersUsingParking);
        const totalSpots = stats.bookingStats.spotsUsage.length;
        const electricSpots = stats.bookingStats.spotsUsage.filter((spot) => spot.isElectric).length;
        const activeBookings = Math.max(0, stats.bookingStats.totalBookings - stats.bookingStats.cancelledBookings);
        const selectedDayCount = getInclusiveDayCount(dateRange.startDate, dateRange.endDate);
        const capacity = totalSpots * selectedDayCount;
        const occupancyRate = capacity === 0 ? 0 : (activeBookings / capacity) * 100;
        const electricSpotRate = totalSpots === 0 ? 0 : (electricSpots / totalSpots) * 100;
        const activeUserRate = totalUsers === 0 ? 0 : (usersUsingParking / totalUsers) * 100;
        const inactiveUserRate = totalUsers === 0 ? 0 : (usersNotUsingParking / totalUsers) * 100;

        return {
            totalUsers,
            usersUsingParking,
            usersNotUsingParking,
            totalSpots,
            electricSpots,
            activeBookings,
            selectedDayCount,
            occupancyRate,
            electricSpotRate,
            activeUserRate,
            inactiveUserRate,
        };
    }, [dateRange.endDate, dateRange.startDate, stats]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await refreshForSelection(selectedPeriod, referenceDate);
    };

    const handlePeriodChange = async (period: DashboardPeriod) => {
        setSelectedPeriod(period);
        await refreshForSelection(period, referenceDate);
    };

    const handleNavigate = async (direction: -1 | 1) => {
        const nextReferenceDate = shiftReferenceDate(referenceDate, selectedPeriod, direction);
        setReferenceDate(nextReferenceDate);
        await refreshForSelection(selectedPeriod, nextReferenceDate);
    };

    if (isLoading || !isAuthorized) {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] p-6">
                <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
                    <div className="rounded-3xl border border-white/60 bg-white/80 px-6 py-5 text-sm text-slate-600 shadow-lg shadow-slate-900/5 backdrop-blur">
                        Chargement du tableau de bord manager...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <DashboardHeaderSection periodLabel={`${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`} />

                <DashboardRangeFormSection
                    period={selectedPeriod}
                    isRefreshing={isRefreshing}
                    onSubmit={handleSubmit}
                    onPeriodChange={handlePeriodChange}
                    onPrevious={() => {
                        void handleNavigate(-1);
                    }}
                    onNext={() => {
                        void handleNavigate(1);
                    }}
                />

                {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {!stats || !derived ? (
                    <Card className="border-dashed border-slate-300 bg-white/70 shadow-sm backdrop-blur">
                        <CardContent className="p-8 text-center text-sm text-slate-600">
                            Aucune donnée disponible sur la période sélectionnée.
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <DashboardMetricsGridSection stats={derived} />

                        <DashboardBreakdownSection
                            stats={derived}
                            backendRangeLabel={`${formatDate(stats.bookingStats.startDate)} et le ${formatDate(stats.bookingStats.endDate)}`}
                        />
                    </>
                )}
            </div>
        </div>
    );
}