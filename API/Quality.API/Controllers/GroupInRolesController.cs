using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.BaseDTOs.DefinitionDTOs;
using Quality.Core.DTOs.UpdateDTOs.BaseUpdateDTOs.DefinitionUpdateDTOs;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroupInRolesController(IMapper mapper, IGroupInRoleService groupInRoleService, IUserService userService, IRoleService roleService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IUserService _userService = userService;
        private readonly IRoleService _roleService = roleService;
        private readonly IGroupInRoleService _groupInRoleService = groupInRoleService;

        [HttpGet]
        //[Authorize(Roles = "Root,GroupInRoles.Get")]
        public async Task<IActionResult> All()
        {
            var groupInRoles = await _groupInRoleService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var groupInRolesDtos = _mapper.Map<List<GroupInRoleDto>>(groupInRoles.Where(x=>x.CompanyId == companyId && x.Status).ToList());
            return CreateActionResult(CustomResponseDto<List<GroupInRoleDto>>.Success(200, groupInRolesDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<GroupInRole>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,GroupInRoles.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var groupInRole = await _groupInRoleService.GetByIdAsync(id);
            var groupInRolesDto = _mapper.Map<GroupInRoleDto>(groupInRole);
            return CreateActionResult(CustomResponseDto<GroupInRoleDto>.Success(200, groupInRolesDto));
        }

        //[HttpGet("GetWithDetails/{userId}")]
        //public async Task<IActionResult> GetWithDetails(int userId)
        //{
        //    var user = await _userService.GetByIdAsync(userId);
        //    var groupInRoles = _groupInRoleService.GetRoleIdsByGroupId(user.GroupId);
        //    var roles = await _roleService.GetRolesAsync(groupInRoles);
        //    List<string> roleNames = [];
        //    foreach (var role in roles)
        //    {
        //        roleNames.Add(role.Name);
        //    }

        //    RoleNamesDto roleNamesDto = new()
        //    {
        //        Roles = roleNames
        //    };
        //    return CreateActionResult(CustomResponseDto<RoleNamesDto>.Success(200, roleNamesDto));
        //}

        [HttpPost]
        //[Authorize(Roles = "Root,GroupInRoles.Add")]
        public async Task<IActionResult> Save(GroupInRoleDto groupInRoleDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<GroupInRole>(groupInRoleDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var groupInRole = await _groupInRoleService.AddAsync(processedEntity);

            var groupInRolesDto = _mapper.Map<GroupInRoleDto>(groupInRole);
            return CreateActionResult(CustomResponseDto<GroupInRoleDto>.Success(201, groupInRolesDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,GroupInRoles.Update")]
        public async Task<IActionResult> Update(GroupInRoleUpdateDto groupInRoleDto)
        {
            int userId = GetUserFromToken();
            var groupInRole = _mapper.Map<GroupInRole>(groupInRoleDto);
            groupInRole.UpdatedBy = userId;

            await _groupInRoleService.UpdateAsync(groupInRole);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,GroupInRoles.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            var groupInRole = await _groupInRoleService.GetByIdAsync(id);
            int userId = GetUserFromToken();
            groupInRole.UpdatedBy = userId;

            await _groupInRoleService.ChangeStatusAsync(groupInRole);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
