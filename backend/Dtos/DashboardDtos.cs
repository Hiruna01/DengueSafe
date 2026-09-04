using HackathonApi.Models;

namespace HackathonApi.Dtos;

/// <summary>Everything the dashboard landing view renders, in one payload.</summary>
public record DashboardDto(
    int TotalOpenReports,
    int TotalRecentCases,
    double AverageDaysToClear,
    IReadOnlyDictionary<RiskBand, int> DivisionsByBand,
    IReadOnlyList<SiteTypeCountDto> TopSiteTypes,
    IReadOnlyList<DivisionRiskDto> Divisions);

/// <summary>How often one site type appears across the reports in scope.</summary>
public record SiteTypeCountDto(
    SiteType SiteType,
    string Label,
    int Count);
