using Quality.Core.Models.BaseModels;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Services;
using Quality.Service.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Quality.Service.Services
{
    public class TokenHandler : ITokenHandler
    {
        private readonly IConfiguration Configuration;
        IPhotoService photoService;

        public TokenHandler(IConfiguration configuration, IPhotoService photoService)
        {
            Configuration = configuration;
            this.photoService = photoService;
        }

        public Token CreateToken(User user, List<Role> roles)
        {
            Token token = new();

            SymmetricSecurityKey symmetricSecurityKey = new(Encoding.UTF8.GetBytes(Configuration["Token:SecurityKey"]));

            SigningCredentials signingCredentials = new(symmetricSecurityKey, SecurityAlgorithms.HmacSha256Signature);

            token.Expiration = DateTime.UtcNow.AddDays(7);
            JwtSecurityToken jwtSecurityToken = new(
                issuer: Configuration["Token:Issuer"],
                audience: Configuration["Token:Audience"],
                expires: token.Expiration,
                claims: SetClaims(user, roles),
                notBefore: DateTime.UtcNow,
                signingCredentials: signingCredentials);
            JwtSecurityTokenHandler jwtSecurityTokenHandler = new();

            token.AccessToken = jwtSecurityTokenHandler.WriteToken(jwtSecurityToken);

            token.RefreshToken = CreateRefreshToken();
            return token;
        }
        public static string CreateRefreshToken()
        {
            byte[] number = new byte[32];
            using RandomNumberGenerator random = RandomNumberGenerator.Create();
            random.GetBytes(number);
            return Convert.ToBase64String(number);
        }

        private IEnumerable<Claim> SetClaims(User user, List<Role> roles)
        {
            Claim claim = new("sub", user.Id.ToString());
            var roleList = new List<Claim>
            {
                claim
            };

            string fullName = $"{user.Name} {user.Surname}";
            roleList.AddName(fullName);

            roleList.AddRoles(roles.Select(p => p.Name).ToArray());

            if (user != null && user.CompanyId != null)
            {
                //Claim companyNameClaim = new("companyName", user.Company.Name.ToString());
                Claim companyIdClaim = new("companyId", user.CompanyId.ToString());

                //var logoUrl = user.Company.LogoUrl ?? "acm.png";

                //Claim companyLogoUrl = new("companyLogoUrl", logoUrl.ToString());

                //roleList.Add(companyNameClaim);
                roleList.Add(companyIdClaim);
                //roleList.Add(companyLogoUrl);
            }

            string photo;
            photo = photoService.GetPhotoByUserList(user.Id);
            if (photo != null)
            {
                roleList.AddImageUrl(photo);
            }
            else
            {
                roleList.AddImageUrl("profile.jpg");
            }
            return roleList;
        }
    }
}

