using System.ComponentModel.DataAnnotations;

namespace HackathonApi.Models;

public class Item
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    public ItemStatus Status { get; set; } = ItemStatus.Pending;

    public Priority Priority { get; set; } = Priority.Medium;

    /// <summary>Always stored as UTC.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Null until the item is first modified. Always stored as UTC.</summary>
    public DateTime? UpdatedAt { get; set; }
}
