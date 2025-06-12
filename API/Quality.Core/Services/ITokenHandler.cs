using Quality.Core.Models.BaseModels;
using Quality.Core.Models.BaseModels.DefinitionModels;

namespace Quality.Core.Services
{
    public interface ITokenHandler
    {
        Token CreateToken(User user, List<Role> roles);
    }
}
