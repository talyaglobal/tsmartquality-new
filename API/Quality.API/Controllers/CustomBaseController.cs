using Quality.Core.DTOs.BaseDTOs;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;

namespace Quality.API.Controllers
{
    public class CustomBaseController : ControllerBase
    {
        [NonAction]
        public IActionResult CreateActionResult<T>(CustomResponseDto<T> response)
        {
            if (response.StatusCode == 204)
                return new ObjectResult(null)
                {
                    StatusCode = response.StatusCode
                };
            if (response.StatusCode == 400)
            {
                return new ObjectResult(new { ErrorMessage = response.Errors })
                {
                    StatusCode = response.StatusCode
                };
            }
            return new ObjectResult(response)
            {
                StatusCode = response.StatusCode
            };
        }
        [NonAction]
        public int GetUserFromToken()
        {
            //string? authorizationHeader = Request.Headers.Authorization;
            //string? jwt = authorizationHeader?.Replace("Bearer ", "");
            //var handler = new JwtSecurityTokenHandler();
            //var securityToken = handler.ReadToken(jwt) as JwtSecurityToken;
            //string? userId = securityToken.Claims.FirstOrDefault(claim => claim.Type == "sub")?.Value;
            //int idUser = int.Parse(userId);
            //return idUser == 0 ? 0 : idUser;
            return 1;
        }

        [NonAction]
        public int GetCompanyIdFromToken()
        {
            string? authorizationHeader = Request.Headers.Authorization;
            string? jwt = authorizationHeader?.Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var securityToken = handler.ReadToken(jwt) as JwtSecurityToken;
            string? companyId = securityToken.Claims.FirstOrDefault(claim => claim.Type == "companyId")?.Value;
            int idCompany = int.Parse(companyId);
            return idCompany == 0 ? 0 : idCompany;
        }
    }
}
