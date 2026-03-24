using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DineIn.Application.Interfaces;
using DineIn.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace DineIn.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IApplicationDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(IApplicationDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Seed default admin if none exists
        if (!await _db.AdminUsers.AnyAsync())
        {
            var defaultAdmin = new AdminUser
            {
                Id = Guid.NewGuid(),
                Username = "admin",
                PasswordHash = HashPassword("admin123"),
                DisplayName = "Administrator",
                Role = "admin",
                CreatedAt = DateTime.UtcNow,
            };
            _db.AdminUsers.Add(defaultAdmin);
            await _db.SaveChangesAsync();
        }

        var user = await _db.AdminUsers.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        var token = GenerateJwtToken(user);

        return Ok(new LoginResponse(token, user.DisplayName, user.Username, user.Role));
    }

    [HttpPost("change-password")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userId, out var guid))
            return Unauthorized();

        var user = await _db.AdminUsers.FindAsync(guid);
        if (user == null)
            return Unauthorized();

        if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect" });

        user.PasswordHash = HashPassword(request.NewPassword);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully" });
    }

    private string GenerateJwtToken(AdminUser user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim("displayName", user.DisplayName),
            new Claim(ClaimTypes.Role, user.Role),
        };

        var expiresHours = int.TryParse(_config["Jwt:ExpiresInHours"], out var h) ? h : 8;

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiresHours),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password), salt, 100_000, HashAlgorithmName.SHA256, 32);
        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    private static bool VerifyPassword(string password, string storedHash)
    {
        var parts = storedHash.Split('.');
        if (parts.Length != 2) return false;
        var salt = Convert.FromBase64String(parts[0]);
        var hash = Convert.FromBase64String(parts[1]);
        var computed = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password), salt, 100_000, HashAlgorithmName.SHA256, 32);
        return CryptographicOperations.FixedTimeEquals(hash, computed);
    }
}

public record LoginRequest(string Username, string Password);
public record LoginResponse(string Token, string DisplayName, string Username, string Role);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
