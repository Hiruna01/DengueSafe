using HackathonApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HackathonApi.Data;

/// <summary>
/// Lays down demo data on an empty database.
/// <para>
/// The numbers here are hand-picked, not randomised, so every run of the demo
/// tells the same story: four divisions are engineered to land in one risk
/// quadrant each — Kolonnawa emergency, Maharagama prevent, Wattala
/// investigate, Negombo monitor — and the remaining four sit in the middle.
/// Changing the counts below changes what the dashboard shows.
/// </para>
/// <para>
/// Dates are expressed as "days ago" against the current UTC date, so seeded
/// data always falls inside the trailing 30-day window the dashboard reads.
/// </para>
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        var divisions = await SeedDivisionsAsync(db, cancellationToken);

        await SeedReportsAsync(db, divisions, cancellationToken);
        await SeedCasesAsync(db, divisions, cancellationToken);
        await SeedOfficersAsync(db, cancellationToken);
    }

    // -----------------------------------------------------------------------
    // Officers
    // -----------------------------------------------------------------------

    /// <summary>
    /// The password every seeded account shares. Fine for a demo database that
    /// is created from this file; anything real changes it on first sign-in.
    /// </summary>
    private const string SeedPassword = "Dengue@2026";

    private static async Task SeedOfficersAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        if (await db.Officers.AnyAsync(cancellationToken))
        {
            return;
        }

        var createdAt = DateTime.UtcNow;

        // Hashed once and shared: BCrypt is deliberately slow, and three
        // separate hashes of the same string would only slow start-up down.
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(SeedPassword);

        var admin = new Officer
        {
            FullName = "Nimal Perera",
            Email = "admin@moh.lk",
            PasswordHash = passwordHash,
            MohArea = "MOH Kolonnawa",
            Role = OfficerRole.Admin,
            IsActive = true,
            CreatedAt = createdAt
            // CreatedById stays null: nobody created the first account.
        };

        db.Officers.Add(admin);
        await db.SaveChangesAsync(cancellationToken);

        db.Officers.AddRange(
            new Officer
            {
                FullName = "Sanduni Fernando",
                Email = "sanduni@moh.lk",
                PasswordHash = passwordHash,
                MohArea = "MOH Maharagama",
                Role = OfficerRole.Officer,
                IsActive = true,
                CreatedAt = createdAt,
                CreatedById = admin.Id
            },
            new Officer
            {
                FullName = "Ruwan Jayasuriya",
                Email = "ruwan@moh.lk",
                PasswordHash = passwordHash,
                MohArea = "MOH Wattala",
                Role = OfficerRole.Officer,
                IsActive = true,
                CreatedAt = createdAt,
                CreatedById = admin.Id
            });

        await db.SaveChangesAsync(cancellationToken);

        AnnounceSeededCredentials();
    }

    /// <summary>
    /// Prints the seeded sign-ins once, on the run that creates them. There is
    /// no other way to discover them — the hashes are one-way — and they are
    /// only ever written when the officers table was empty.
    /// </summary>
    private static void AnnounceSeededCredentials()
    {
        Console.WriteLine();
        Console.WriteLine("  Seeded officer accounts (password: " + SeedPassword + ")");
        Console.WriteLine("  ---------------------------------------------------");
        Console.WriteLine("  admin@moh.lk      Admin     MOH Kolonnawa");
        Console.WriteLine("  sanduni@moh.lk    Officer   MOH Maharagama");
        Console.WriteLine("  ruwan@moh.lk      Officer   MOH Wattala");
        Console.WriteLine("  Change these before this database is anything but a demo.");
        Console.WriteLine();
    }

    // -----------------------------------------------------------------------
    // Divisions
    // -----------------------------------------------------------------------

    private static async Task<Dictionary<string, int>> SeedDivisionsAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        if (!await db.Divisions.AnyAsync(cancellationToken))
        {
            db.Divisions.AddRange(
                new Division { Name = "Kolonnawa", MohArea = "MOH Kolonnawa", District = "Colombo" },
                new Division { Name = "Maharagama", MohArea = "MOH Maharagama", District = "Colombo" },
                new Division { Name = "Dehiwala", MohArea = "MOH Dehiwala", District = "Colombo" },
                new Division { Name = "Kaduwela", MohArea = "MOH Kaduwela", District = "Colombo" },
                new Division { Name = "Ja-Ela", MohArea = "MOH Ja-Ela", District = "Gampaha" },
                new Division { Name = "Wattala", MohArea = "MOH Wattala-Mabole", District = "Gampaha" },
                new Division { Name = "Kelaniya", MohArea = "MOH Kelaniya", District = "Gampaha" },
                new Division { Name = "Negombo", MohArea = "MOH Negombo", District = "Gampaha" });

            await db.SaveChangesAsync(cancellationToken);
        }

        return await db.Divisions
            .AsNoTracking()
            .ToDictionaryAsync(d => d.Name, d => d.Id, cancellationToken);
    }

    // -----------------------------------------------------------------------
    // Reports
    // -----------------------------------------------------------------------

    private static async Task SeedReportsAsync(
        AppDbContext db,
        Dictionary<string, int> divisions,
        CancellationToken cancellationToken)
    {
        if (await db.Reports.AnyAsync(cancellationToken))
        {
            return;
        }

        var reports = new List<Report>();

        // --- Kolonnawa: EMERGENCY -------------------------------------------
        // Eight of nine reports still open, weighted towards tyres and storage
        // tanks, and paired below with a heavy case load.
        var kolonnawa = divisions["Kolonnawa"];
        reports.AddRange(new[]
        {
            NewReport(kolonnawa, 2, SiteType.DiscardedTyres, ReportStatus.Reported,
                "Garage එක පිටිපස්සේ ටයර් ගොඩක් දාලා. වතුර පිරිලා මදුරු පැටව් ඉන්නවා පේනවා.",
                "Sedawatta Road, opposite the tyre re-treading garage",
                "Nimal Perera", "0771234567"),

            NewReport(kolonnawa, 4, SiteType.DiscardedTyres, ReportStatus.Reported,
                "Abandoned tyres dumped along the canal bund for the past two weeks. Rain water collected inside all of them.",
                "Canal bund near Wellampitiya railway crossing",
                "Sanduni Fernando", "0712345678"),

            NewReport(kolonnawa, 5, SiteType.WaterStorageTank, ReportStatus.Reported,
                "පොදු ජල ටැංකියේ වහන ලෑල්ල නැති වෙලා. සති දෙකකට වඩා විවෘතව තියෙනවා.",
                "Community water tank, Meethotamulla housing scheme",
                "Ruwan Jayasinghe", "0763456789"),

            NewReport(kolonnawa, 7, SiteType.WaterStorageTank, ReportStatus.Inspected,
                "Overhead tank at the flats has no lid. Larvae clearly visible when checked with a torch.",
                "Block C rooftop, Sedawatta flats",
                "Kamala Silva", "0774567890",
                inspectedDaysAgo: 5,
                inspectorNote: "Larvae confirmed. Residents' committee instructed to fit a cover within 7 days."),

            NewReport(kolonnawa, 9, SiteType.DiscardedTyres, ReportStatus.NoticeIssued,
                "Tyre shop keeps stock outside on the pavement. Water stays in them after every shower.",
                "Main road tyre shop, Kolonnawa junction",
                "Anura Bandara", "0785678901",
                inspectedDaysAgo: 7,
                inspectorNote: "Repeat offender. Formal notice issued under the Nuisances Ordinance."),

            NewReport(kolonnawa, 11, SiteType.ConstructionSite, ReportStatus.Inspected,
                "ඉදිකිරීම් බිමේ අත්තිවාරම් වලවල් වල වතුර. කිසිම කෙනෙක් බලන්නේ නෑ.",
                "Three-storey building site, Gothatuwa New Town Road",
                "Priyantha Kumara", "0776789012",
                inspectedDaysAgo: 9,
                inspectorNote: "Standing water in foundation pits. Site supervisor asked to pump out and backfill."),

            NewReport(kolonnawa, 13, SiteType.WaterStorageTank, ReportStatus.Reported,
                "Disused cement water tank behind the market is half full and never cleaned.",
                "Rear of Kolonnawa public market",
                "Mohamed Rizwan", "0727890123"),

            NewReport(kolonnawa, 16, SiteType.DiscardedTyres, ReportStatus.Reported,
                "Scrap yard has hundreds of tyres stacked in the open. Whole lane smells of stagnant water.",
                "Scrap yard, Old Awissawella Road",
                "Dilani Wickramasinghe", "0778901234"),

            NewReport(kolonnawa, 20, SiteType.RoofGutter, ReportStatus.Cleared,
                "පරණ ගොඩනැගිල්ලේ පියස්සේ බට කැඩිලා වතුර නවතිනවා.",
                "Old dispensary building, Kolonnawa town",
                "Sunil Gunawardena", "0759012345",
                inspectedDaysAgo: 18,
                inspectorNote: "Gutter cleared and re-fixed by the owner. Re-checked, no water retained."),
        });

        // --- Maharagama: PREVENT --------------------------------------------
        // Seven of eight open and nearly all high-weight, but the case count
        // below is deliberately tiny — risk that has not yet become illness.
        var maharagama = divisions["Maharagama"];
        reports.AddRange(new[]
        {
            NewReport(maharagama, 3, SiteType.ConstructionSite, ReportStatus.Reported,
                "New apartment site has open water in the basement excavation. Nobody covers it between pours.",
                "Apartment construction site, High Level Road",
                "Chathura Dissanayake", "0770123456"),

            NewReport(maharagama, 5, SiteType.WaterStorageTank, ReportStatus.Reported,
                "පාසලේ ජල ටැංකිය වහලා නෑ. ළමයි ගොඩක් ඉන්න තැනක්.",
                "School water tank, Maharagama Central College",
                "W. A. Nandani", "0711234509"),

            NewReport(maharagama, 6, SiteType.DiscardedTyres, ReportStatus.Reported,
                "Tyres and empty barrels left behind the bus depot workshop.",
                "Behind the SLTB depot workshop, Maharagama",
                "Jagath Ranasinghe", "0762345601"),

            NewReport(maharagama, 8, SiteType.ConstructionSite, ReportStatus.Inspected,
                "Half-finished house abandoned mid-build. Sump and pits full of rain water.",
                "Abandoned house, Pamunuwa Road",
                "Sriyani Alwis", "0773456012",
                inspectedDaysAgo: 6,
                inspectorNote: "Sump full. Owner traced, given 14 days to cover or drain."),

            NewReport(maharagama, 10, SiteType.WaterStorageTank, ReportStatus.NoticeIssued,
                "Hotel keeps two uncovered storage tanks on the roof.",
                "Rooftop tanks, guest house on Dehiwala Road",
                "Ajith Peiris", "0784560123",
                inspectedDaysAgo: 8,
                inspectorNote: "Uncovered on both visits. Notice issued to the proprietor."),

            NewReport(maharagama, 14, SiteType.DiscardedTyres, ReportStatus.Reported,
                "ටයර් ගොඩක් හිස් ඉඩමේ දාලා තියෙනවා. වැස්සට පස්සේ වතුර පිරෙනවා.",
                "Vacant plot next to the temple, Wattegedara",
                "H. M. Kusumawathie", "0775601234"),

            NewReport(maharagama, 18, SiteType.ConstructionSite, ReportStatus.Reported,
                "Roadworks left concrete drums and formwork holding water for over a month.",
                "Road widening works, Navinna junction",
                "Tharindu Silva", "0726012345"),

            NewReport(maharagama, 22, SiteType.PlantPotSaucer, ReportStatus.Cleared,
                "Nursery had water standing in dozens of pot saucers.",
                "Plant nursery, High Level Road",
                "Malani Rajapaksa", "0770123458",
                inspectedDaysAgo: 20,
                inspectorNote: "Owner emptied and inverted all saucers during the visit."),
        });

        // --- Wattala: INVESTIGATE -------------------------------------------
        // Only one open report against a large recent case load, which is the
        // signal that the real source has not been found yet.
        var wattala = divisions["Wattala"];
        reports.AddRange(new[]
        {
            NewReport(wattala, 6, SiteType.OrnamentalPond, ReportStatus.Reported,
                "Ornamental pond at the housing scheme entrance has no fish and green stagnant water.",
                "Entrance pond, Mabole housing scheme",
                "Nadeeka Fernando", "0777012345"),

            NewReport(wattala, 12, SiteType.RoofGutter, ReportStatus.Cleared,
                "පියස්සේ බට වල කොළ පිරිලා වතුර නවතිනවා.",
                "Two-storey house, Hendala Road",
                "Lakshman de Silva", "0713012456",
                inspectedDaysAgo: 10,
                inspectorNote: "Gutters cleaned out by the householder. No water retained on re-check."),

            NewReport(wattala, 19, SiteType.PlantPotSaucer, ReportStatus.Cleared,
                "Saucers under the potted plants along the boundary wall always hold water.",
                "Boundary wall, Wattala Bazaar Street",
                "Fathima Nazreen", "0764023567",
                inspectedDaysAgo: 17,
                inspectorNote: "Saucers removed. Household advised on weekly checks."),
        });

        // --- Negombo: MONITOR -----------------------------------------------
        // Low on both axes; the quiet control case.
        var negombo = divisions["Negombo"];
        reports.AddRange(new[]
        {
            NewReport(negombo, 8, SiteType.RoofGutter, ReportStatus.Reported,
                "Gutter on the church annexe overflows and water sits in the bend.",
                "Church annexe, Sea Street, Negombo",
                "Anton Croos", "0775034678"),

            NewReport(negombo, 15, SiteType.PlantPotSaucer, ReportStatus.Cleared,
                "ගෙවත්තේ මල් පෝච්චි යට වතුර තියෙනවා කියලා අසල්වැසියෙක් දැනුම් දුන්නා.",
                "Private garden, Poruthota Road",
                "Shirani Peiris", "0786045789",
                inspectedDaysAgo: 13,
                inspectorNote: "Minor. Saucers emptied at the time of inspection."),
        });

        // --- Middling divisions ---------------------------------------------
        var dehiwala = divisions["Dehiwala"];
        reports.AddRange(new[]
        {
            NewReport(dehiwala, 4, SiteType.RoofGutter, ReportStatus.Reported,
                "Blocked gutter at the row of shops holds water after every shower.",
                "Shop row, Galle Road, Dehiwala",
                "Roshan Mendis", "0771056890"),

            NewReport(dehiwala, 9, SiteType.WaterStorageTank, ReportStatus.Reported,
                "පොදු ළිඳ අසල ජල ටැංකිය විවෘතව තියෙනවා.",
                "Near the public well, Kawdana Road",
                "Deepika Jayawardena", "0712067901"),

            NewReport(dehiwala, 13, SiteType.ConstructionSite, ReportStatus.Inspected,
                "Small building site with water collected in a disused mixer drum.",
                "Building site, Hospital Road, Dehiwala",
                "Nuwan Kodikara", "0763078012",
                inspectedDaysAgo: 11,
                inspectorNote: "Drum emptied and turned over. Follow-up visit scheduled."),

            NewReport(dehiwala, 17, SiteType.PlantPotSaucer, ReportStatus.Cleared,
                "Flat balcony plants standing in water on several floors.",
                "Apartment block, Station Road, Dehiwala",
                "Ishara Gunasekara", "0774089123",
                inspectedDaysAgo: 15,
                inspectorNote: "Management circulated a notice. Balconies checked and cleared."),

            NewReport(dehiwala, 24, SiteType.DiscardedTyres, ReportStatus.Cleared,
                "Few old tyres behind the service station.",
                "Service station, Attidiya Road",
                "M. Careem", "0785090234",
                inspectedDaysAgo: 22,
                inspectorNote: "Tyres removed to covered storage by the owner."),
        });

        var kaduwela = divisions["Kaduwela"];
        reports.AddRange(new[]
        {
            NewReport(kaduwela, 3, SiteType.ConstructionSite, ReportStatus.Reported,
                "Water collected in the pit at the new road culvert works.",
                "Culvert works, Malabe-Kaduwela Road",
                "Saman Weerasinghe", "0776101345"),

            NewReport(kaduwela, 7, SiteType.WaterStorageTank, ReportStatus.Reported,
                "ටැංකියේ වහන ලෑල්ල කැඩිලා. මදුරු පැටව් පේනවා.",
                "Storage tank, Welivita Road",
                "Champika Herath", "0727112456"),

            NewReport(kaduwela, 12, SiteType.RoofGutter, ReportStatus.Inspected,
                "Gutters full of leaves at the community hall.",
                "Community hall, Battaramulla Road",
                "Ranjith Ekanayake", "0778123567",
                inspectedDaysAgo: 10,
                inspectorNote: "Cleaning arranged with the hall committee for this week."),

            NewReport(kaduwela, 18, SiteType.OrnamentalPond, ReportStatus.Cleared,
                "Ornamental pond at the park was left without fish after cleaning.",
                "Public park pond, Kaduwela town",
                "Nilanthi Rathnayake", "0759134678",
                inspectedDaysAgo: 16,
                inspectorNote: "Guppies restocked by the council. Pond clear on re-check."),

            NewReport(kaduwela, 26, SiteType.PlantPotSaucer, ReportStatus.Cleared,
                "Saucers holding water in the office garden.",
                "Divisional secretariat garden, Kaduwela",
                "P. G. Wijerathne", "0770145789",
                inspectedDaysAgo: 24,
                inspectorNote: "Cleared during the routine premises inspection."),
        });

        var jaEla = divisions["Ja-Ela"];
        reports.AddRange(new[]
        {
            NewReport(jaEla, 5, SiteType.DiscardedTyres, ReportStatus.Reported,
                "Old tyres left at the edge of the paddy field access road.",
                "Paddy field access road, Ekala",
                "Sujeewa Perera", "0711156890"),

            NewReport(jaEla, 11, SiteType.RoofGutter, ReportStatus.Reported,
                "පිටිපස්සේ පියස්සේ බටයෙන් වතුර බැහැරට යන්නේ නෑ.",
                "House behind the Ekala junction shops",
                "K. A. Dammika", "0762167901"),

            NewReport(jaEla, 16, SiteType.WaterStorageTank, ReportStatus.Cleared,
                "Factory keeps an open water tank near the boundary fence.",
                "Garment factory, Ja-Ela industrial area",
                "Thilak Amarasinghe", "0773178012",
                inspectedDaysAgo: 14,
                inspectorNote: "Tank fitted with a lid. Verified on re-inspection."),

            NewReport(jaEla, 23, SiteType.PlantPotSaucer, ReportStatus.Cleared,
                "Water in the pot saucers at the pre-school.",
                "Pre-school, Kandana Road, Ja-Ela",
                "Nirosha Kumari", "0784189123",
                inspectedDaysAgo: 21,
                inspectorNote: "Staff briefed. Saucers emptied and stored inverted."),
        });

        var kelaniya = divisions["Kelaniya"];
        reports.AddRange(new[]
        {
            NewReport(kelaniya, 6, SiteType.WaterStorageTank, ReportStatus.Reported,
                "Uncovered tank at the boarding house serving the university students.",
                "Boarding house, Dalugama",
                "Asanka Rodrigo", "0775190234"),

            NewReport(kelaniya, 10, SiteType.ConstructionSite, ReportStatus.Inspected,
                "ඉදිකිරීම් බිමේ බැරල් වල වතුර සති ගණනක් තියෙනවා.",
                "Building site near the temple road, Kelaniya",
                "D. M. Piyasena", "0726201345",
                inspectedDaysAgo: 8,
                inspectorNote: "Barrels emptied. Contractor warned about weekly checks."),

            NewReport(kelaniya, 15, SiteType.RoofGutter, ReportStatus.Cleared,
                "Gutter at the market building overflowing.",
                "Kelaniya market building",
                "S. Vijayakumar", "0777212456",
                inspectedDaysAgo: 13,
                inspectorNote: "Downpipe unblocked by the market authority."),

            NewReport(kelaniya, 21, SiteType.OrnamentalPond, ReportStatus.Cleared,
                "Small pond at the guest house is not maintained.",
                "Guest house garden, Biyagama Road",
                "Chandima Silva", "0758223567",
                inspectedDaysAgo: 19,
                inspectorNote: "Pond drained and refilled. Fish added by the owner."),
        });

        db.Reports.AddRange(reports);
        await db.SaveChangesAsync(cancellationToken);
    }

    // -----------------------------------------------------------------------
    // Cases
    // -----------------------------------------------------------------------

    private static async Task SeedCasesAsync(
        AppDbContext db,
        Dictionary<string, int> divisions,
        CancellationToken cancellationToken)
    {
        if (await db.DengueCases.AnyAsync(cancellationToken))
        {
            return;
        }

        var cases = new List<DengueCase>();

        // Kolonnawa: EMERGENCY — 16 cases, clustered in the last fortnight.
        cases.AddRange(CasesFor(divisions["Kolonnawa"], new[]
        {
            (1, AgeBand.Under15, CaseSeverity.DHF, true),
            (2, AgeBand.Age15To30, CaseSeverity.DF, false),
            (2, AgeBand.Under15, CaseSeverity.DF, true),
            (3, AgeBand.Age31To50, CaseSeverity.DHF, true),
            (4, AgeBand.Age15To30, CaseSeverity.DF, false),
            (5, AgeBand.Under15, CaseSeverity.DHF, true),
            (6, AgeBand.Age31To50, CaseSeverity.DF, false),
            (7, AgeBand.Over50, CaseSeverity.DHF, true),
            (8, AgeBand.Age15To30, CaseSeverity.DF, true),
            (10, AgeBand.Under15, CaseSeverity.DF, false),
            (12, AgeBand.Age31To50, CaseSeverity.DHF, true),
            (14, AgeBand.Age15To30, CaseSeverity.DF, false),
            (17, AgeBand.Over50, CaseSeverity.DF, true),
            (20, AgeBand.Under15, CaseSeverity.DF, false),
            (24, AgeBand.Age31To50, CaseSeverity.DF, false),
            (27, AgeBand.Age15To30, CaseSeverity.DHF, true),
        }));

        // Maharagama: PREVENT — 2 cases only, against a heavy open-report load.
        cases.AddRange(CasesFor(divisions["Maharagama"], new[]
        {
            (9, AgeBand.Age15To30, CaseSeverity.DF, false),
            (23, AgeBand.Age31To50, CaseSeverity.DF, false),
        }));

        // Wattala: INVESTIGATE — 15 cases with almost nothing reported.
        cases.AddRange(CasesFor(divisions["Wattala"], new[]
        {
            (1, AgeBand.Age15To30, CaseSeverity.DF, false),
            (2, AgeBand.Under15, CaseSeverity.DHF, true),
            (3, AgeBand.Age31To50, CaseSeverity.DF, false),
            (4, AgeBand.Age15To30, CaseSeverity.DHF, true),
            (5, AgeBand.Under15, CaseSeverity.DF, true),
            (6, AgeBand.Age31To50, CaseSeverity.DF, false),
            (8, AgeBand.Over50, CaseSeverity.DHF, true),
            (9, AgeBand.Age15To30, CaseSeverity.DF, false),
            (11, AgeBand.Under15, CaseSeverity.DF, false),
            (13, AgeBand.Age31To50, CaseSeverity.DHF, true),
            (15, AgeBand.Age15To30, CaseSeverity.DF, true),
            (18, AgeBand.Over50, CaseSeverity.DF, false),
            (21, AgeBand.Under15, CaseSeverity.DF, false),
            (25, AgeBand.Age31To50, CaseSeverity.DF, false),
            (28, AgeBand.Age15To30, CaseSeverity.DF, false),
        }));

        // Negombo: MONITOR — 2 cases, both mild.
        cases.AddRange(CasesFor(divisions["Negombo"], new[]
        {
            (12, AgeBand.Age31To50, CaseSeverity.DF, false),
            (26, AgeBand.Age15To30, CaseSeverity.DF, false),
        }));

        // Middling divisions: enough to be visible, not enough to escalate.
        cases.AddRange(CasesFor(divisions["Dehiwala"], new[]
        {
            (3, AgeBand.Age15To30, CaseSeverity.DF, false),
            (7, AgeBand.Under15, CaseSeverity.DF, true),
            (11, AgeBand.Age31To50, CaseSeverity.DF, false),
            (14, AgeBand.Age15To30, CaseSeverity.DHF, true),
            (19, AgeBand.Over50, CaseSeverity.DF, false),
            (22, AgeBand.Under15, CaseSeverity.DF, false),
            (29, AgeBand.Age31To50, CaseSeverity.DF, false),
        }));

        cases.AddRange(CasesFor(divisions["Kaduwela"], new[]
        {
            (2, AgeBand.Under15, CaseSeverity.DF, false),
            (6, AgeBand.Age31To50, CaseSeverity.DF, true),
            (10, AgeBand.Age15To30, CaseSeverity.DF, false),
            (16, AgeBand.Over50, CaseSeverity.DHF, true),
            (21, AgeBand.Age15To30, CaseSeverity.DF, false),
            (28, AgeBand.Under15, CaseSeverity.DF, false),
        }));

        cases.AddRange(CasesFor(divisions["Ja-Ela"], new[]
        {
            (4, AgeBand.Age31To50, CaseSeverity.DF, false),
            (8, AgeBand.Age15To30, CaseSeverity.DF, false),
            (13, AgeBand.Under15, CaseSeverity.DF, true),
            (17, AgeBand.Age31To50, CaseSeverity.DF, false),
            (23, AgeBand.Over50, CaseSeverity.DF, false),
            (30, AgeBand.Age15To30, CaseSeverity.DF, false),
        }));

        cases.AddRange(CasesFor(divisions["Kelaniya"], new[]
        {
            (5, AgeBand.Age15To30, CaseSeverity.DF, false),
            (9, AgeBand.Under15, CaseSeverity.DF, false),
            (12, AgeBand.Age31To50, CaseSeverity.DHF, true),
            (18, AgeBand.Age15To30, CaseSeverity.DF, false),
            (24, AgeBand.Over50, CaseSeverity.DF, true),
            (29, AgeBand.Age31To50, CaseSeverity.DF, false),
        }));

        db.DengueCases.AddRange(cases);
        await db.SaveChangesAsync(cancellationToken);
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private static Report NewReport(
        int divisionId,
        int daysAgo,
        SiteType siteType,
        ReportStatus status,
        string description,
        string landmark,
        string reporterName,
        string reporterPhone,
        int? inspectedDaysAgo = null,
        string? inspectorNote = null) => new()
        {
            DivisionId = divisionId,
            SiteType = siteType,
            Status = status,
            Description = description,
            Landmark = landmark,
            ReporterName = reporterName,
            ReporterPhone = reporterPhone,
            ReportedAt = DaysAgo(daysAgo, hour: 9),
            InspectedAt = inspectedDaysAgo is null ? null : DaysAgo(inspectedDaysAgo.Value, hour: 11),
            InspectorNote = inspectorNote
        };

    private static IEnumerable<DengueCase> CasesFor(
        int divisionId,
        (int DaysAgo, AgeBand Age, CaseSeverity Severity, bool Hospitalised)[] rows)
        => rows.Select(row => new DengueCase
        {
            DivisionId = divisionId,
            ReportedDate = DaysAgo(row.DaysAgo, hour: 8),
            AgeBand = row.Age,
            Severity = row.Severity,
            Hospitalised = row.Hospitalised
        });

    /// <summary>
    /// A UTC instant <paramref name="days"/> before today. Kind stays Utc, which
    /// Npgsql requires for a <c>timestamp with time zone</c> column.
    /// </summary>
    private static DateTime DaysAgo(int days, int hour)
        => DateTime.UtcNow.Date.AddDays(-days).AddHours(hour);
}
