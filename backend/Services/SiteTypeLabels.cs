using HackathonApi.Models;

namespace HackathonApi.Services;

/// <summary>
/// Human-readable names for <see cref="SiteType"/>. Presentation only — this
/// carries no weighting or risk meaning, which lives solely in
/// <see cref="IRiskService"/>.
/// </summary>
public static class SiteTypeLabels
{
    private static readonly IReadOnlyDictionary<SiteType, string> Labels =
        new Dictionary<SiteType, string>
        {
            [SiteType.DiscardedTyres] = "Discarded tyres",
            [SiteType.WaterStorageTank] = "Water storage tank",
            [SiteType.ConstructionSite] = "Construction site",
            [SiteType.RoofGutter] = "Roof gutter",
            [SiteType.PlantPotSaucer] = "Plant pot saucer",
            [SiteType.OrnamentalPond] = "Ornamental pond",
            [SiteType.PremisesInspection] = "Premises inspection"
        };

    public static string For(SiteType siteType) =>
        Labels.TryGetValue(siteType, out var label) ? label : siteType.ToString();
}
