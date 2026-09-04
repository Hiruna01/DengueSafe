using HackathonApi.Data;
using HackathonApi.Dtos;
using HackathonApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HackathonApi.Services;

public class DivisionService : IDivisionService
{
    /// <summary>How many site types the dashboard lists.</summary>
    private const int TopSiteTypeCount = 5;

    private readonly AppDbContext _db;
    private readonly IRiskService _risk;

    public DivisionService(AppDbContext db, IRiskService risk)
    {
        _db = db;
        _risk = risk;
    }

    public async Task<IReadOnlyList<DivisionRiskDto>> GetDivisionRiskAsync(
        CancellationToken cancellationToken = default)
    {
        var (divisions, reports, cases, now) = await LoadAsync(cancellationToken);

        return Score(divisions, reports, cases, now);
    }

    public async Task<DashboardDto> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        var (divisions, reports, cases, now) = await LoadAsync(cancellationToken);

        var scored = Score(divisions, reports, cases, now);

        var openReports = reports.Where(_risk.IsOpenReport).ToList();

        // Every band is present even at zero, so the dashboard's band breakdown
        // has a stable shape and does not gain and lose keys between refreshes.
        var divisionsByBand = Enum.GetValues<RiskBand>()
            .ToDictionary(band => band, band => scored.Count(d => d.RiskBand == band));

        var topSiteTypes = openReports
            .GroupBy(r => r.SiteType)
            .Select(g => new SiteTypeCountDto(g.Key, SiteTypeLabels.For(g.Key), g.Count()))
            .OrderByDescending(s => s.Count)
            .ThenBy(s => s.Label)
            .Take(TopSiteTypeCount)
            .ToList();

        return new DashboardDto(
            openReports.Count,
            _risk.CalculateTransmissionRisk(cases, now),
            AverageDaysToClear(reports),
            divisionsByBand,
            topSiteTypes,
            scored);
    }

    /// <summary>
    /// Pulls everything the scoring needs in one go. The dataset is one district
    /// pair's worth of rows, so loading it whole beats issuing a query per
    /// division; revisit if the row count ever grows by an order of magnitude.
    /// </summary>
    private async Task<(List<Division> Divisions, List<Report> Reports, List<DengueCase> Cases, DateTime Now)>
        LoadAsync(CancellationToken cancellationToken)
    {
        var divisions = await _db.Divisions.AsNoTracking()
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);

        var reports = await _db.Reports.AsNoTracking().ToListAsync(cancellationToken);
        var cases = await _db.DengueCases.AsNoTracking().ToListAsync(cancellationToken);

        // One instant for the whole snapshot, so no two divisions are scored
        // against a different "now".
        return (divisions, reports, cases, DateTime.UtcNow);
    }

    private IReadOnlyList<DivisionRiskDto> Score(
        List<Division> divisions,
        List<Report> reports,
        List<DengueCase> cases,
        DateTime now)
    {
        var reportsByDivision = reports.ToLookup(r => r.DivisionId);
        var casesByDivision = cases.ToLookup(c => c.DivisionId);

        return divisions
            .Select(division => _risk.BuildDivisionRisk(
                division,
                reportsByDivision[division.Id],
                casesByDivision[division.Id],
                now))
            .OrderByDescending(d => d.VectorRisk)
            .ThenByDescending(d => d.RecentCaseCount)
            .ToList();
    }

    /// <summary>
    /// Mean days between a report being raised and being inspected, across
    /// reports that reached Cleared. Returns 0 when nothing has been cleared yet.
    /// </summary>
    private static double AverageDaysToClear(IEnumerable<Report> reports)
    {
        var cleared = reports
            .Where(r => r.Status == ReportStatus.Cleared && r.InspectedAt is not null)
            .Select(r => (r.InspectedAt!.Value - r.ReportedAt).TotalDays)
            .Where(days => days >= 0)
            .ToList();

        return cleared.Count == 0 ? 0 : Math.Round(cleared.Average(), 1);
    }
}
