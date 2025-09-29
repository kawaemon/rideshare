export interface DashboardRouteStats {
  untilEarliestMin: number | null;
  vehicles: number;
}

export interface DashboardToSchoolSummary {
  fromSyonandai: DashboardRouteStats;
  fromTsujido: DashboardRouteStats;
}

export interface DashboardFromSchoolSummary {
  toSyonandai: DashboardRouteStats;
  toTsujido: DashboardRouteStats;
}

export interface DashboardSummary {
  toSchool: DashboardToSchoolSummary;
  fromSchool: DashboardFromSchoolSummary;
}
