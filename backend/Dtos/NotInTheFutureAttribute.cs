using System.ComponentModel.DataAnnotations;

namespace HackathonApi.Dtos;

/// <summary>
/// Rejects a date that falls after the current UTC instant. DataAnnotations has
/// no built-in range check against "now", and a case cannot be reported before
/// it happens.
/// </summary>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public sealed class NotInTheFutureAttribute : ValidationAttribute
{
    /// <summary>
    /// Tolerance for clients whose clock runs slightly ahead of the server's.
    /// </summary>
    private static readonly TimeSpan Skew = TimeSpan.FromMinutes(5);

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        // Null is the [Required] attribute's business, not ours.
        if (value is null)
        {
            return ValidationResult.Success;
        }

        if (value is not DateTime date)
        {
            return new ValidationResult(
                ErrorMessage ?? $"{validationContext.DisplayName} must be a date.",
                new[] { validationContext.MemberName! });
        }

        var instant = date.Kind == DateTimeKind.Utc ? date : date.ToUniversalTime();

        return instant > DateTime.UtcNow.Add(Skew)
            ? new ValidationResult(
                ErrorMessage ?? $"{validationContext.DisplayName} cannot be in the future.",
                new[] { validationContext.MemberName! })
            : ValidationResult.Success;
    }
}
