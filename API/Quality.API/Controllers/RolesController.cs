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
    public class RolesController(IMapper mapper, IRoleService roleService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IRoleService _roleService = roleService;

        [HttpGet]
        //[Authorize(Roles = "Root,Roles.Get")]
        public async Task<IActionResult> All()
        {
            var roles = await _roleService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var rolesDtos = _mapper.Map<List<RoleDto>>(roles.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<RoleDto>>.Success(200, rolesDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<Role>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,Roles.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var role = await _roleService.GetByIdAsync(id);
            var rolesDto = _mapper.Map<RoleDto>(role);
            return CreateActionResult(CustomResponseDto<RoleDto>.Success(200, rolesDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,Roles.Add")]
        public async Task<IActionResult> Save(RoleDto roleDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<Role>(roleDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var role = await _roleService.AddAsync(processedEntity);

            var rolesDto = _mapper.Map<RoleDto>(role);
            return CreateActionResult(CustomResponseDto<RoleDto>.Success(201, rolesDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,Roles.Update")]
        public async Task<IActionResult> Update(RoleUpdateDto roleDto)
        {
            int userId = GetUserFromToken();
            var role = _mapper.Map<Role>(roleDto);
            role.UpdatedBy = userId;

            await _roleService.UpdateAsync(role);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,Roles.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var role = await _roleService.GetByIdAsync(id);

            role.UpdatedBy = userId;

            await _roleService.ChangeStatusAsync(role);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
