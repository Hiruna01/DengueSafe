using HackathonApi.Dtos;
using HackathonApi.Models;

namespace HackathonApi.Services;

/// <summary>
/// The whole risk model. Every weight, threshold and band decision in the
/// application lives behind this interface — no other service, controller or
/// DTO may re-implement or second-guess any part of it.
/// <para>
/// Implementations are pure: they take the rows to score and return numbers.
/// Callers do the querying, which keeps the model testable and stops a caller
/// from accidentally scoring a wrongly-filtered set — the methods here apply
/// their own status and date filters regardless of what they are handed.
/// </para>
/// </summary>
public interface IRiskService
{
    /// <summary>
    /// Whether a report counts as live breeding habitat: still open, and raised
    /// by an observer rather than auto-generated from a case notification.
    /// Callers must use this rather than testing <see cref="ReportStatus"/>
    /// themselves, so the definition of "open" stays in one place.
    /// </summary>
    bool IsOpenReport(Report report);

    /// <summary>Relative productivity of a breeding site type, 2 to 5.</summary>
    double GetSiteTypeWeight(SiteType siteType);

    /// <summary>
    /// How long a report has been outstanding, in fractional days. Returns 0 for
    /// reports that are no longer open.
    /// </summary>
    double GetDaysOpen(Report report, DateTime? asOfUtc = null);

    /// <summary>Risk contributed by a single report. 0 once it is closed.</summary>
    double ScoreReport(Report report, DateTime? asOfUtc = null);

    /// <summary>
    /// Total breeding-site pressure for a division: the sum of every open
    /// report's score. Closed reports in the input contribute nothing.
    /// </summary>
    double CalculateVectorRisk(IEnumerable<Report> reports, DateTime? asOfUtc = null);

    /// <summary>
    /// Confirmed human cases in the division inside the recent-case window.
    /// Cases older than the window are ignored.
    /// </summary>
    int CalculateTransmissionRisk(IEnumerable<DengueCase> cases, DateTime? asOfUtc = null);

    /// <summary>Places a division in one of the four risk quadrants.</summary>
    RiskBand DetermineBand(double vectorRisk, int transmissionRisk);

    /// <summary>The operational instruction that goes with a band.</summary>
    string GetRecommendedAction(RiskBand band);

    /// <summary>
    /// The model's own parameters — weights, ageing thresholds and multipliers,
    /// the case window and the two band thresholds. Published so a client can
    /// explain the scoring from the real numbers instead of keeping a copy that
    /// drifts the moment these are tuned.
    /// </summary>
    RiskModelDto GetModel();

    /// <summary>Scores one division end to end.</summary>
    DivisionRiskDto BuildDivisionRisk(
        Division division,
        IEnumerable<Report> reports,
        IEnumerable<DengueCase> cases,
        DateTime? asOfUtc = null);
}
