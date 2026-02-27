using GofishApi.Tests.Fixtutes;
using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace GofishApi.Tests.Controllers;

public class AuthControllerTests : IClassFixture<WebAppFactory>
{
    //False User that makes requests for the api
    private readonly HttpClient _client;

    public AuthControllerTests(WebAppFactory factory)
    {
        _client = factory.CreateClient();
    }

    // -- SIGNUP --

    [Fact]
    public async Task SignUp_ValidCredentials_Returns200() 
    {
        var body = new
        {
            Email = "test@test.com",
            UserName = "testuser",
            FirstName = "Test",
            LastName = "User",
            Password = "Password123!"
        };
        var response = await _client.PostAsJsonAsync("/api/auth/signup", body);
        object value = response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    
    [Fact]
    public async Task SignUp_EmailAlreadyExists_Returns400()
    {   
        var body = new
          {
            Email = "fixture@test.com", 
            UserName = "testuser",
            FirstName = "Test",
            LastName = "User",
            Password = "Password123!"
          };

       var response = await _client.PostAsJsonAsync("/api/auth/signup", body);
       response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SignUp_UserAlreadyExists_Returns400() 
    {
        var body = new
        {
            Email = "fixture2@test.com",
            UserName = "existinguser",
            FirstName = "Test",
            LastName = "User",
            Password = "Password123!"
        };
        var response = await _client.PostAsJsonAsync("/api/auth/signup", body);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }


    [Fact]
    public async Task SignUp_WeakPassword_Returns400() 
    {
        var body = new
        {
            Email = "jonatas@test.com",
            UserName = "testuser",
            FirstName = "Test",
            LastName = "User",
            Password = "pass"
        };
        var response = await _client.PostAsJsonAsync("/api/auth/signup", body);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // -- SIGNIN --

    [Fact]
    public async Task SignIn_UserDoesntExist_Returns400() 
    {
        var body = new
        {
            EmailOrUserName = "noexist@email.com",
            Password = "Password@123"
        };
        var response = await _client.PostAsJsonAsync("/api/auth/signin", body);
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task SignIn_BadPassword_Returns400() 
    {
        var body = new
        {
            EmailOrUserName = "fixture@test.com",
            Password = "Password@123"
        };
        var response = await _client.PostAsJsonAsync("/api/auth/signin", body);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SignIn_ValidCredentials_Returns200WithToken() 
    {
        var body = new
        {
            EmailOrUserName = "fixture@test.com",
            Password = "Password123!"
        };
        var response = await _client.PostAsJsonAsync("/api/auth/signin", body);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
    
}
