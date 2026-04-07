using GofishApi.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace GofishApi.Services;

public class EmailService : IEmailService
{
    private readonly EmailOptions _options;

    public EmailService(IOptions<EmailOptions> options)
    {
        _options = options.Value;
    }

    public async Task SendAsync(string to, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.FromName, _options.From));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };

        using var client = new SmtpClient();
        await client.ConnectAsync(_options.Host, _options.Port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_options.Username, _options.Password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}

public static class EmailResources
{
    public static (string, string) TwoFactorEmail(string code)
    {
        var subject = "Your Gofish verification code";
        var body = $$"""
            <p>Your one-time verification code is: <strong>{{code}}</strong></p>
            <p>This code will expire in a few minutes. Please enter it in the app to complete your verification.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            """;
        return (subject, body);
    }

    public static (string, string) EmailChange(string code)
    {
        var subject = "Confirm your new Gofish email";
        var body = $$"""
            <p>Your email change confirmation code is: <strong>{{code}}</strong></p>
            <p>Enter this code in the app to complete the change. It expires in 15 minutes.</p>
            <p>If you did not request this, you can safely ignore this email.</p>
            """;
        return (subject, body);
    }

    public static (string, string) TwoFactorSignIn(string code)
    {
        var subject = "Your Gofish sign-in code";
        var body = $$"""
            <p>Your sign-in code is: <strong>{{code}}</strong></p>
            <p>This code expires in a few minutes. Do not share it with anyone.</p>
            """;
        return (subject, body);
    }
}
