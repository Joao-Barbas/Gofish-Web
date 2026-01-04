using GofishApi.Data;

namespace GofishApi.Extensions
{
    public static class WebApplicationExtensions
    {
        public static void EnableSwaggerIfIsDevelopment(this WebApplication app)
        {
            if (!app.Environment.IsDevelopment()) return;
            app.UseSwagger();
            app.UseSwaggerUI();
        }
    }
}
