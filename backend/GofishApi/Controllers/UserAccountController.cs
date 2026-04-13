using GofishApi.Dtos;
using GofishApi.Exceptions;
using GofishApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;

namespace GofishApi.Controllers
{
    /// <summary>
    /// Controlador responsável por operações sobre a conta do utilizador autenticado,
    /// incluindo eliminação de conta e exportação de dados pessoais.
    /// </summary>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserAccountController : ControllerBase
    {
        /// <summary>Logger para registo de eventos e erros.</summary>
        private readonly ILogger<UserAccountController> _logger;

        /// <summary>Gestor de utilizadores do ASP.NET Identity.</summary>
        private readonly UserManager<AppUser> _userManager;

        /// <summary>Gestor de autenticação do ASP.NET Identity.</summary>
        private readonly SignInManager<AppUser> _signInManager;

        /// <summary>
        /// Inicializa uma nova instância do controlador de conta de utilizador.
        /// </summary>
        /// <param name="logger">Logger da aplicação.</param>
        /// <param name="userManager">Gestor de utilizadores.</param>
        /// <param name="signInManager">Gestor de autenticação.</param>
        public UserAccountController(
            ILogger<UserAccountController> logger,
            UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager
        )
        {
            _logger = logger;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        /// <summary>
        /// Elimina definitivamente a conta do utilizador autenticado.
        /// Se a conta tiver password local, é necessária validação da password.
        /// </summary>
        /// <param name="dto">Dados necessários para confirmação da eliminação.</param>
        /// <returns>Resposta sem conteúdo em caso de sucesso.</returns>
        [HttpDelete("DeleteAccount")]
        public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountReqDTO dto)
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
            {
                return Unauthorized();
            }

            if (user.PasswordHash is not null && !await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                return Unauthorized();
            }

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                throw new IdentityException(result.Errors);
            }

            return NoContent();
        }

        /// <summary>
        /// Elimina os dados pessoais do utilizador.
        /// Nesta implementação reutiliza diretamente a lógica de eliminação de conta.
        /// </summary>
        /// <param name="dto">Dados necessários para confirmação da operação.</param>
        /// <returns>Resposta sem conteúdo em caso de sucesso.</returns>
        [HttpDelete("DeletePersonalData")]
        public async Task<IActionResult> DeletePersonalData([FromBody] DeleteAccountReqDTO dto)
        {
            return await DeleteAccount(dto);
        }

        /// <summary>
        /// Exporta os dados pessoais do utilizador autenticado em formato JSON.
        /// Inclui propriedades marcadas com <see cref="PersonalDataAttribute"/>,
        /// logins externos e chave de autenticador.
        /// </summary>
        /// <returns>Ficheiro JSON com os dados pessoais do utilizador.</returns>
        [HttpGet("DownloadPersonalData")]
        public async Task<IActionResult> DownloadPersonalData()
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
            {
                return Unauthorized();
            }

            // Reflect over all [PersonalData] properties on AppUser
            // Plus inherited [PersonalData] on IdentityUser

            var personalData = new Dictionary<string, string?>();
            var personalDataProps = typeof(AppUser).GetProperties().Where(p => p.IsDefined(typeof(PersonalDataAttribute), inherit: true));
            var externalLogins = await _userManager.GetLoginsAsync(user);
            var authenticatorKey = await _userManager.GetAuthenticatorKeyAsync(user);

            foreach (var prop in personalDataProps)
            {
                personalData[prop.Name] = prop.GetValue(user)?.ToString();
            }

            foreach (var login in externalLogins)
            {
                personalData[$"{login.LoginProvider} login key"] = login.ProviderKey;
            }

            personalData["AuthenticatorKey"] = authenticatorKey;

            var bytes = JsonSerializer.SerializeToUtf8Bytes(
                personalData,
                new JsonSerializerOptions { WriteIndented = true });

            Response.Headers.Append("Content-Disposition", "attachment; filename=PersonalData.json");

            return File(bytes, "application/json");
        }
    }
}