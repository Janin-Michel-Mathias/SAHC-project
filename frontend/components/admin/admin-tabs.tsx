import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminTab = "bookings" | "users";

type AdminTabsProps = {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
};

const tabs: Array<{ id: AdminTab; label: string }> = [
    { id: "bookings", label: "Réservations" },
    { id: "users", label: "Utilisateurs" },
];

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
    return (
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            {tabs.map((tab) => (
                <Button
                    key={tab.id}
                    type="button"
                    variant="ghost"
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "rounded-full px-4 text-sm",
                        activeTab === tab.id && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white"
                    )}
                >
                    {tab.label}
                </Button>
            ))}
        </div>
    );
}