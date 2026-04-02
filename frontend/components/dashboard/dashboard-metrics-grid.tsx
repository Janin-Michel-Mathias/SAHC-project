import { BatteryCharging, Gauge, Percent, Users } from "lucide-react";

import type { DashboardDerivedStats } from "./dashboard.types";
import { DashboardMetricCard } from "./dashboard-metric-card";

type DashboardMetricsGridProps = {
    stats: DashboardDerivedStats;
};

function formatPercent(value: number) {
    return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

export function DashboardMetricsGrid({ stats }: DashboardMetricsGridProps) {
    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardMetricCard
                title="Personnes qui utilisent le parking"
                value={`${stats.usersUsingParking}`}
                description={`${stats.usersUsingParking} sur ${stats.totalUsers} utilisateurs actifs pendant la période.`}
                icon={Users}
                tone="blue"
            />
            <DashboardMetricCard
                title="Remplissage moyen"
                value={formatPercent(stats.occupancyRate)}
                description={`${stats.activeBookings} réservations actives sur ${stats.totalSpots * stats.selectedDayCount} places disponibles sur la période.`}
                icon={Gauge}
                tone="green"
            />
            <DashboardMetricCard
                title="Part des utilisateurs"
                value={formatPercent(stats.activeUserRate)}
                description={`${stats.usersUsingParking} utilisateurs ont réservé au moins une fois, ${stats.usersNotUsingParking} n'ont pas utilisé le parking.`}
                icon={Percent}
                tone="amber"
            />
            <DashboardMetricCard
                title="Places électriques"
                value={formatPercent(stats.electricSpotRate)}
                description={`${stats.electricSpots} places électriques sur ${stats.totalSpots} places au total.`}
                icon={BatteryCharging}
            />
        </section>
    );
}