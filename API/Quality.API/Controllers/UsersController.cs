using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.BaseDTOs.DefinitionDTOs;
using Quality.Core.DTOs.UpdateDTOs.BaseUpdateDTOs.DefinitionUpdateDTOs;
using Quality.Core.Models.BaseModels;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Services;
using Quality.Service.Hashings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController(IUserService userService, IMapper mapper) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IUserService _userService = userService;

        [AllowAnonymous]
        [HttpPost("[action]")]
        public async Task<IActionResult> Login(UserLoginDto userLoginDto)
        {
            Token token = await _userService.Login(userLoginDto);
            if (token == null)
            {
                return CreateActionResult(CustomResponseDto<NoContentDto>.Fail(401, "Login information is incorrect !"));
            }

            return CreateActionResult(CustomResponseDto<Token>.Success(201, token));
        }
    }
}
