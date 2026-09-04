namespace HackathonApi.Models;

/// <summary>Kind of mosquito breeding site a report describes.</summary>
public enum SiteType
{
    DiscardedTyres,
    WaterStorageTank,
    ConstructionSite,
    RoofGutter,
    PlantPotSaucer,
    OrnamentalPond,

    /// <summary>
    /// Not a container type. Carried by the premises-inspection reports opened
    /// automatically on case notification, which describe an area to sweep
    /// rather than a specific site seen holding water.
    /// </summary>
    PremisesInspection
}

/// <summary>Where a report sits in the inspection workflow.</summary>
public enum ReportStatus
{
    Reported,
    Inspected,
    Cleared,
    NoticeIssued
}

/// <summary>
/// Coarse age bucket. Cases carry a band rather than a date of birth so a row
/// cannot be traced back to an individual.
/// </summary>
public enum AgeBand
{
    Under15,
    Age15To30,
    Age31To50,
    Over50
}

/// <summary>Dengue fever (DF) or dengue haemorrhagic fever (DHF).</summary>
public enum CaseSeverity
{
    DF,
    DHF
}

/// <summary>Escalation level a division falls into once its risk is scored.</summary>
public enum RiskBand
{
    Monitor,
    Prevent,
    Investigate,
    Emergency
}

/// <summary>
/// What an officer account may do. <see cref="Admin"/> additionally manages
/// other accounts; both roles work the inspection and case views.
/// </summary>
public enum OfficerRole
{
    Officer,
    Admin
}
