using System.ComponentModel.DataAnnotations;
using HackathonApi.Models;

namespace HackathonApi.Dtos;

/// <summary>
/// A dengue case as the API returns it. Mirrors the entity exactly, which holds
/// no patient name, address or contact details by design.
/// </summary>
public record CaseDto(
    int Id,
    int DivisionId,
    string DivisionName,
    DateTime ReportedDate,
    AgeBand AgeBand,
    CaseSeverity Severity,
    bool Hospitalised);

public record CreateCaseDto
{
    [Required(ErrorMessage = "DivisionId is required.")]
    [Range(1, int.MaxValue, ErrorMessage = "DivisionId must be a positive number.")]
    public int DivisionId { get; init; }

    [Required(ErrorMessage = "ReportedDate is required.")]
    [NotInTheFuture(ErrorMessage = "ReportedDate cannot be in the future.")]
    public DateTime? ReportedDate { get; init; }

    [Required(ErrorMessage = "AgeBand is required.")]
    [EnumDataType(typeof(AgeBand), ErrorMessage = "AgeBand must be one of: Under15, Age15To30, Age31To50, Over50.")]
    public AgeBand? AgeBand { get; init; }

    [Required(ErrorMessage = "Severity is required.")]
    [EnumDataType(typeof(CaseSeverity), ErrorMessage = "Severity must be one of: DF, DHF.")]
    public CaseSeverity? Severity { get; init; }

    public bool Hospitalised { get; init; }
}

/// <summary>Query options for <c>GET /api/cases</c>.</summary>
public record CaseQueryParameters
{
    public int? DivisionId { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Page must be 1 or greater.")]
    public int Page { get; init; } = 1;

    [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100.")]
    public int PageSize { get; init; } = 10;
}
