using HackathonApi.Models;

namespace HackathonApi.Dtos;

/// <summary>
/// The tunable parameters of the risk model, published so a client can explain
/// the scoring without restating it.
/// <para>
/// This exists because the alternative is worse: a page that describes the
/// weights or the ageing rule in its own hard-coded copy silently drifts the
/// day <see cref="Services.RiskService"/> is tuned. Everything here is read
/// straight off those constants.
/// </para>
/// </summary>
public record RiskModelDto(
    IReadOnlyList<SiteTypeWeightDto> SiteTypeWeights,
    int AgeingThresholdDays,
    double AgeingMultiplier,
    int SevereAgeingThresholdDays,
    double SevereAgeingMultiplier,
    int RecentCaseWindowDays,
    double HighVectorRiskThreshold,
    int HighTransmissionRiskThreshold);

/// <summary>One container type's relative larval productivity.</summary>
public record SiteTypeWeightDto(SiteType SiteType, string Label, double Weight);
