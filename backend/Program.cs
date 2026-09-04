using System.Text.Json.Serialization;
using HackathonApi.Data;
using HackathonApi.Middleware;
using HackathonApi.Services;
using Microsoft.EntityFrameworkCore;

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

builder.Services.AddCors(options =>
{
    options.AddPolicy(AllowFrontendPolicy, policy => policy
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddScoped<IItemService, ItemService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Enums travel as names ("InProgress"), matching how they are stored.
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Hackathon API",
        Version = "v1"
    });
});

var app = builder.Build();

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

app.UseAuthorization();

app.MapControllers();

app.Run();
