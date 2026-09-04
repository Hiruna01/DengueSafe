using System.ComponentModel.DataAnnotations;
using HackathonApi.Models;

namespace HackathonApi.Dtos;

public record ItemDto(
    int Id,
    string Title,
    string Description,
    string Category,
    ItemStatus Status,
    Priority Priority,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record CreateItemDto
{
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 200 characters.")]
    public string Title { get; init; } = string.Empty;

    [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters.")]
    public string Description { get; init; } = string.Empty;

    [Required(ErrorMessage = "Category is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Category must be between 1 and 100 characters.")]
    public string Category { get; init; } = string.Empty;

    public ItemStatus Status { get; init; } = ItemStatus.Pending;

    public Priority Priority { get; init; } = Priority.Medium;
}

public record UpdateItemDto
{
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 200 characters.")]
    public string Title { get; init; } = string.Empty;

    [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters.")]
    public string Description { get; init; } = string.Empty;

    [Required(ErrorMessage = "Category is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Category must be between 1 and 100 characters.")]
    public string Category { get; init; } = string.Empty;

    public ItemStatus Status { get; init; }

    public Priority Priority { get; init; }
}

public record UpdateItemStatusDto
{
    [Required(ErrorMessage = "Status is required.")]
    [EnumDataType(typeof(ItemStatus), ErrorMessage = "Status must be one of: Pending, InProgress, Completed, Rejected.")]
    public ItemStatus Status { get; init; }
}

/// <summary>Query options for <c>GET /api/items</c>.</summary>
public record ItemQueryParameters
{
    public string? Search { get; init; }

    public ItemStatus? Status { get; init; }

    public string? Category { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Page must be 1 or greater.")]
    public int Page { get; init; } = 1;

    [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100.")]
    public int PageSize { get; init; } = 10;

    public string SortBy { get; init; } = "CreatedAt";

    public bool SortDescending { get; init; } = true;
}
