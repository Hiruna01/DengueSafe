using HackathonApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HackathonApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Item> Items => Set<Item>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(i => i.Id);

            entity.Property(i => i.Id).ValueGeneratedOnAdd();

            entity.Property(i => i.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(i => i.Description)
                .HasMaxLength(2000);

            entity.Property(i => i.Category)
                .HasMaxLength(100);

            // Stored as text ("Pending", "High") so the rows stay readable and
            // reordering the enum members cannot silently remap existing data.
            entity.Property(i => i.Status)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            entity.Property(i => i.Priority)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            entity.Property(i => i.CreatedAt).IsRequired();

            entity.HasIndex(i => i.CreatedAt);
            entity.HasIndex(i => i.Status);
            entity.HasIndex(i => i.Category);
        });

        // Picks up any IEntityTypeConfiguration<T> declared in this assembly.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
