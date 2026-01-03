using GofishApi.Data;
using GofishApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddIdentityApiEndpoints<AppUser>()
                .AddEntityFrameworkStores<AppDbContext>();

builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
    options.User.RequireUniqueEmail = true;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("angular", policy => policy
        .WithOrigins("http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("angular");
app.UseAuthorization();
app.MapControllers();
app.MapGroup("/api")
   .MapIdentityApi<AppUser>();

app.MapPost("/api/signup", async (UserManager<AppUser> userManager, [FromBody] UserSignupDTO userSignupDTO) =>
{
    AppUser user = new()
    {
        Email = userSignupDTO.Email,
        UserName = userSignupDTO.UserName,
        FirstName = userSignupDTO.FirstName,
        LastName = userSignupDTO.LastName
    };
    var result = await userManager.CreateAsync(user, userSignupDTO.Password);
    if (result.Succeeded)
    {
        return Results.Ok(result);
    }
    return Results.BadRequest(result);
}); // Mudar para um controller depois

app.Run();

public class UserSignupDTO
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string UserName { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
}
