using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.BaseDTOs.DefinitionDTOs;
using Quality.Core.Models.BaseModels;
using Quality.Core.Models.BaseModels.DefinitionModels;

namespace Quality.Core.Services
{
    public interface IUserService : IService<User>
    {
        Task<Token> Login(UserLoginDto userLoginDto);
        //User GetByEmail(string email);


        //public Task<List<User>> GetUsersWithDetailsAsync();
        //public CustomResponseDto<UserDto> GetUserByIdWithDetailsAsync(int userId);
    }
}
