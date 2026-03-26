using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using DineIn.API.Hubs;
using DineIn.API.Middleware;
using DineIn.Application;
using DineIn.Infrastructure;
using DineIn.Infrastructure.Persistence;
using DineIn.Infrastructure.Persistence.SeedData;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

//Database
//server=resturent
// dinein
// dominos@123

// Serilog
builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration)
          .WriteTo.Console());

// Services
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
    {
        options.PayloadSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        options.PayloadSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        };
    });
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim(System.Security.Claims.ClaimTypes.Role, "admin"));
    options.AddPolicy("CashierOrAdmin", policy =>
        policy.RequireClaim(System.Security.Claims.ClaimTypes.Role, "admin", "cashier"));
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "DineIn API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter JWT token",
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("MobileApp", policy =>
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

var app = builder.Build();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await context.Database.EnsureCreatedAsync();

    await context.Database.ExecuteSqlRawAsync(@"
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AdminUsers') AND name = 'Role')
    BEGIN
        ALTER TABLE AdminUsers ADD Role NVARCHAR(50) NOT NULL DEFAULT 'admin';
    END
");

    await context.Database.ExecuteSqlRawAsync(@"
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'PaymentMethod')
    BEGIN
        ALTER TABLE Orders ADD PaymentMethod INT NOT NULL DEFAULT 0;
        ALTER TABLE Orders ADD PaymentStatus INT NOT NULL DEFAULT 0;
        ALTER TABLE Orders ADD AmountTendered DECIMAL(18,2) NULL;
        ALTER TABLE Orders ADD ChangeGiven DECIMAL(18,2) NULL;
        ALTER TABLE Orders ADD CashierId NVARCHAR(450) NULL;
    END
");

    await SeedDataHelper.SeedAsync(context);

    if (!await context.AdminUsers.AnyAsync(u => u.Username == "admin"))
    {
        var salt = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(salt);
        var hash = Convert.ToBase64String(System.Security.Cryptography.Rfc2898DeriveBytes.Pbkdf2(
            System.Text.Encoding.UTF8.GetBytes("admin123"),
            salt, 100_000, System.Security.Cryptography.HashAlgorithmName.SHA256, 32));

        context.AdminUsers.Add(new DineIn.Domain.Entities.AdminUser
        {
            Id = Guid.NewGuid(),
            Username = "admin",
            PasswordHash = $"{Convert.ToBase64String(salt)}.{hash}",
            DisplayName = "Administrator",
            Role = "admin",
            CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();
    }

    if (!await context.AdminUsers.AnyAsync(u => u.Role == "cashier"))
    {
        var salt = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(salt);
        var hash = Convert.ToBase64String(System.Security.Cryptography.Rfc2898DeriveBytes.Pbkdf2(
            System.Text.Encoding.UTF8.GetBytes("cashier123"),
            salt, 100_000, System.Security.Cryptography.HashAlgorithmName.SHA256, 32));

        context.AdminUsers.Add(new DineIn.Domain.Entities.AdminUser
        {
            Id = Guid.NewGuid(),
            Username = "cashier",
            PasswordHash = $"{Convert.ToBase64String(salt)}.{hash}",
            DisplayName = "Cashier",
            Role = "cashier",
            CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();
    }
}

// Middleware pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();


    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "DineIn API v1"));
    app.MapOpenApi();


app.UseCors("MobileApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<OrderHub>("/hubs/orders");

app.Run();
