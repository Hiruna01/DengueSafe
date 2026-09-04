using System.ComponentModel.DataAnnotations;

namespace HackathonApi.Models;

/// <summary>
/// A confirmed dengue case, recorded only at the level of detail risk scoring
/// needs. Deliberately holds no patient name, address or contact details, so
/// the table carries no personally identifying information.
/// </summary>
public class DengueCase
{
    public int Id { get; set; }

    public int DivisionId { get; set; }

    public Division? Division { get; set; }

    /// <summary>Always stored as UTC.</summary>
    public DateTime ReportedDate { get; set; }

    public AgeBand AgeBand { get; set; }

    public CaseSeverity Severity { get; set; }

    public bool Hospitalised { get; set; }
}
