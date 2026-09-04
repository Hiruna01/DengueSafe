using HackathonApi.Models;

namespace HackathonApi.Dtos;

/// <summary>
/// A division with its scored risk position — the row the dashboard map and
/// table are both built from.
/// </summary>
public record DivisionRiskDto(
    int Id,
    string Name,
    string MohArea,
    string District,
    double VectorRisk,
    int OpenReportCount,
    int RecentCaseCount,
    RiskBand RiskBand,
    string RecommendedAction);
