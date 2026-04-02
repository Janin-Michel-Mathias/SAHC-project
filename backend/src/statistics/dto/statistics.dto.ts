export class StatisticsDto {
  startDate: Date;
  endDate: Date;
  totalBookings: number;
  checkedInBookings: number;
  nonCheckedInBookings: number;
  cancelledBookings: number;
  usedElectricSpots: number;
  spotsUsage: {
    spotId: number;
    row: string;
    col: string;
    isElectric: boolean;
    totalBookings: number;
    checkedInBookings: number;
    nonCheckedInBookings: number;
    cancelledBookings: number;
  }[];
}
