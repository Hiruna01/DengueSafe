using HackathonApi.Dtos;
using HackathonApi.Models;

namespace HackathonApi.Services;

/// <summary>
/// Scores breeding-site reports and dengue cases into the four-quadrant risk
/// model the dashboard is built on.
/// <para>
/// The model separates two things that are usually conflated. <b>Vector risk</b>
/// measures how much mosquito breeding habitat is currently sitting unaddressed;
/// it is a leading indicator, visible before anyone falls ill.
/// <b>Transmission risk</b> counts people who have already been infected; it is
/// a lagging indicator. Crossing them is what makes the output actionable — the
/// same case count means something very different depending on whether the
/// breeding sites driving it have been found.
/// </para>
/// <para>
/// The service is stateless and holds no dependencies, so it is safe to register
/// as a singleton and cheap to call in a loop over every division.
/// </para>
/// </summary>
public class RiskService : IRiskService
{
    // -----------------------------------------------------------------------
    // Tunable model parameters
    // -----------------------------------------------------------------------

    /// <summary>
    /// Days a report must be open before its score is inflated once.
    /// <para>
    /// Set at 7 because <i>Aedes aegypti</i> completes egg-to-adult development
    /// in roughly 7–10 days under Sri Lankan conditions. A site left standing
    /// past a week has therefore had time to produce a new generation of biting
    /// adults, rather than merely holding water.
    /// </para>
    /// </summary>
    public const int AgeingThresholdDays = 7;

    /// <summary>
    /// Days a report must be open before its score is inflated a second time.
    /// <para>
    /// At 14 days the site has cleared two full development cycles and is
    /// producing adults continuously, so it is treated as an established
    /// breeding focus rather than a one-off container.
    /// </para>
    /// </summary>
    public const int SevereAgeingThresholdDays = 14;

    /// <summary>Applied to a report open past <see cref="AgeingThresholdDays"/>.</summary>
    public const double AgeingMultiplier = 1.5;

    /// <summary>Applied to a report open past <see cref="SevereAgeingThresholdDays"/>.</summary>
    public const double SevereAgeingMultiplier = 2.0;

    /// <summary>
    /// How far back a case still counts towards transmission risk.
    /// <para>
    /// Fourteen days spans one mosquito generation plus the intrinsic incubation
    /// period and the onset of illness, so it is the window in which a reported
    /// case still reflects transmission that is happening now. Beyond it, a case
    /// describes an outbreak that has already turned over.
    /// </para>
    /// </summary>
    public const int RecentCaseWindowDays = 14;

    /// <summary>Vector risk at or above which a division counts as high-vector.</summary>
    public const double HighVectorRiskThreshold = 20.0;

    /// <summary>Recent cases at or above which a division counts as high-transmission.</summary>
    public const int HighTransmissionRiskThreshold = 8;

    /// <summary>
    /// Relative larval productivity per site type, on a 2–5 scale.
    /// <para>
    /// Discarded tyres and water storage tanks score highest: both hold water
    /// through dry spells, are shaded, and are the two container types that
    /// dominate national larval surveys. Construction sites follow, being large
    /// but intermittent. Roof gutters, pot saucers and ornamental ponds hold
    /// less water, dry out faster, or — in the case of stocked ponds — carry
    /// predators that eat larvae.
    /// </para>
    /// </summary>
    private static readonly IReadOnlyDictionary<SiteType, double> SiteTypeWeights =
        new Dictionary<SiteType, double>
        {
            [SiteType.DiscardedTyres] = 5,
            [SiteType.WaterStorageTank] = 5,
            [SiteType.ConstructionSite] = 4,
            [SiteType.RoofGutter] = 3,
            [SiteType.PlantPotSaucer] = 2,
            [SiteType.OrnamentalPond] = 2,

            // Not a container. Auto-generated premises-inspection tasks carry
            // this type and are excluded from scoring anyway; the 0 keeps the
            // table total so GetSiteTypeWeight never throws on a real row.
            [SiteType.PremisesInspection] = 0
        };

    /// <summary>
    /// What each quadrant tells a public health inspector to actually do.
    /// </summary>
    private static readonly IReadOnlyDictionary<RiskBand, string> RecommendedActions =
        new Dictionary<RiskBand, string>
        {
            [RiskBand.Emergency] = "Fogging plus immediate site clearance",
            [RiskBand.Prevent] = "Clear sites now, before transmission starts",
            [RiskBand.Investigate] = "Cases with no reported sites — send an inspection team to find unreported breeding sites",
            [RiskBand.Monitor] = "Continue routine surveillance"
        };

    /// <summary>
    /// Statuses that still represent standing habitat. A report that has been
    /// cleared no longer holds water; one that has reached notice stage has been
    /// handed to enforcement and is tracked there, not as live vector pressure.
    /// </summary>
    private static bool IsOpenStatus(ReportStatus status) =>
        status is ReportStatus.Reported or ReportStatus.Inspected;

    /// <summary>
    /// Whether a report represents live, observed breeding habitat.
    /// <para>
    /// Auto-generated premises-inspection tasks are excluded deliberately. They
    /// are raised in response to a notified case, so counting them would feed
    /// transmission risk back into vector risk and destroy the independence the
    /// two axes rely on — a division with many cases would mechanically acquire
    /// high vector risk, and the Investigate quadrant, which exists precisely to
    /// flag cases <i>without</i> corresponding reports, could never be reached.
    /// </para>
    /// </summary>
    public bool IsOpenReport(Report report)
    {
        ArgumentNullException.ThrowIfNull(report);

        return !report.IsAutoGenerated && IsOpenStatus(report.Status);
    }

    // -----------------------------------------------------------------------
    // Per-report scoring
    // -----------------------------------------------------------------------

    public double GetSiteTypeWeight(SiteType siteType) =>
        SiteTypeWeights.TryGetValue(siteType, out var weight)
            ? weight
            : throw new ArgumentOutOfRangeException(
                nameof(siteType), siteType, "No risk weight is defined for this site type.");

    public double GetDaysOpen(Report report, DateTime? asOfUtc = null)
    {
        ArgumentNullException.ThrowIfNull(report);

        if (!IsOpenReport(report))
        {
            return 0;
        }

        var elapsed = (Now(asOfUtc) - report.ReportedAt).TotalDays;

        // A clock skew or a back-dated row must not produce negative risk.
        return elapsed < 0 ? 0 : elapsed;
    }

    public double ScoreReport(Report report, DateTime? asOfUtc = null)
    {
        ArgumentNullException.ThrowIfNull(report);

        if (!IsOpenReport(report))
        {
            return 0;
        }

        var daysOpen = GetDaysOpen(report, asOfUtc);

        var ageingMultiplier = daysOpen > SevereAgeingThresholdDays
            ? SevereAgeingMultiplier
            : daysOpen > AgeingThresholdDays
                ? AgeingMultiplier
                : 1.0;

        return GetSiteTypeWeight(report.SiteType) * ageingMultiplier;
    }

    // -----------------------------------------------------------------------
    // Per-division scoring
    // -----------------------------------------------------------------------

    public double CalculateVectorRisk(IEnumerable<Report> reports, DateTime? asOfUtc = null)
    {
        ArgumentNullException.ThrowIfNull(reports);

        var now = Now(asOfUtc);

        return reports.Sum(report => ScoreReport(report, now));
    }

    public int CalculateTransmissionRisk(IEnumerable<DengueCase> cases, DateTime? asOfUtc = null)
    {
        ArgumentNullException.ThrowIfNull(cases);

        var cutoff = Now(asOfUtc).AddDays(-RecentCaseWindowDays);

        return cases.Count(c => c.ReportedDate >= cutoff);
    }

    public RiskBand DetermineBand(double vectorRisk, int transmissionRisk)
    {
        var highVector = vectorRisk >= HighVectorRiskThreshold;
        var highCases = transmissionRisk >= HighTransmissionRiskThreshold;

        return (highVector, highCases) switch
        {
            // Sites and sickness together: the outbreak is active and fed.
            (true, true) => RiskBand.Emergency,

            // Habitat is piling up but nobody is ill yet — the cheapest moment
            // to intervene, and the one most often missed.
            (true, false) => RiskBand.Prevent,

            // People are falling ill with no reported sites to explain it, which
            // means the real breeding sources have not been found.
            (false, true) => RiskBand.Investigate,

            (false, false) => RiskBand.Monitor
        };
    }

    public RiskModelDto GetModel() => new(
        // PremisesInspection is left out on purpose: it is not a container, it
        // scores 0, and it only ever reaches the table through an auto-generated
        // report. Publishing it would invite a client to draw a zero-weight bar
        // next to six real ones.
        SiteTypeWeights
            .Where(entry => entry.Key != SiteType.PremisesInspection)
            .OrderByDescending(entry => entry.Value)
            .ThenBy(entry => entry.Key.ToString())
            .Select(entry => new SiteTypeWeightDto(
                entry.Key,
                SiteTypeLabels.For(entry.Key),
                entry.Value))
            .ToList(),
        AgeingThresholdDays,
        AgeingMultiplier,
        SevereAgeingThresholdDays,
        SevereAgeingMultiplier,
        RecentCaseWindowDays,
        HighVectorRiskThreshold,
        HighTransmissionRiskThreshold);

    public string GetRecommendedAction(RiskBand band) =>
        RecommendedActions.TryGetValue(band, out var action)
            ? action
            : throw new ArgumentOutOfRangeException(
                nameof(band), band, "No recommended action is defined for this risk band.");

    public DivisionRiskDto BuildDivisionRisk(
        Division division,
        IEnumerable<Report> reports,
        IEnumerable<DengueCase> cases,
        DateTime? asOfUtc = null)
    {
        ArgumentNullException.ThrowIfNull(division);
        ArgumentNullException.ThrowIfNull(reports);
        ArgumentNullException.ThrowIfNull(cases);

        // One instant for the whole division, so the open-report count and the
        // scores that depend on it cannot disagree.
        var now = Now(asOfUtc);

        var reportList = reports as IReadOnlyCollection<Report> ?? reports.ToList();

        var vectorRisk = CalculateVectorRisk(reportList, now);
        var transmissionRisk = CalculateTransmissionRisk(cases, now);
        var band = DetermineBand(vectorRisk, transmissionRisk);

        return new DivisionRiskDto(
            division.Id,
            division.Name,
            division.MohArea,
            division.District,
            Math.Round(vectorRisk, 2),
            reportList.Count(IsOpenReport),
            transmissionRisk,
            band,
            GetRecommendedAction(band));
    }

    /// <summary>
    /// Resolves the instant to score against, normalising to UTC so a caller
    /// passing a local <see cref="DateTime"/> cannot shift every score.
    /// </summary>
    private static DateTime Now(DateTime? asOfUtc) => asOfUtc switch
    {
        null => DateTime.UtcNow,
        { Kind: DateTimeKind.Utc } value => value,
        var value => value.Value.ToUniversalTime()
    };
}
