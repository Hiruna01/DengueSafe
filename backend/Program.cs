using System.Text;
using System.Text.Json.Serialization;
using HackathonApi.Data;
using HackathonApi.Middleware;
using HackathonApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

const string AllowFrontendPolicy = "AllowFrontend";

// Environment variables win over appsettings.json, so a deployment can inject
// ConnectionStrings__DefaultConnection without touching any config file.
var connectionString =
    Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddScoped<IRiskService, RiskService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<ICaseService, CaseService>();
builder.Services.AddScoped<IDivisionService, DivisionService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IOfficerService, OfficerService>();

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

// Resolved once at startup so a missing or too-short JWT_SECRET fails the boot
// with a clear message, rather than at the first login attempt.
var signingKey = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes(JwtSettings.ResolveSigningKey(builder.Configuration)));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = JwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = JwtSettings.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateLifetime = true,

            // No grace period on expiry: the default five minutes is generous
            // for an eight-hour token and there are no clocks to reconcile here.
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy(AllowFrontendPolicy, policy => policy
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Enums travel as names ("NoticeIssued"), matching how they are stored.
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Hackathon API",
        Version = "v1"
    });

    // Lets the Swagger UI hold a token, so the authorised endpoints can be
    // exercised from the browser: log in, copy the token, Authorize, paste.
    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste the token from POST /api/auth/login. Swagger adds the \"Bearer \" prefix itself."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = JwtBearerDefaults.AuthenticationScheme
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

// Migrate before the first request, then lay down demo data if the tables are
// still empty. Seeding is a no-op once anything has been written.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    db.Database.Migrate();

    await DbSeeder.SeedAsync(db);
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

// First in the pipeline so it catches everything downstream.
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Swagger is on in every environment, not just Development.
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Hackathon API v1");
});

app.UseCors(AllowFrontendPolicy);

// Authentication first: it establishes who the caller is, which is what
// authorization then judges.
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
