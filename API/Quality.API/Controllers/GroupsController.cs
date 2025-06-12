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
    public class GroupsController : CustomBaseController
    {
        private readonly IMapper _mapper;
        private readonly IGroupService _groupService;

        public GroupsController(IGroupService groupService, IMapper mapper)
        {
            _groupService = groupService;
            _mapper = mapper;
        }

        [HttpGet]
        //[Authorize(Roles = "Root,Groups.Get")]
        public async Task<IActionResult> All()
        {
            var groups = await _groupService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var groupsDtos = _mapper.Map<List<GroupDto>>(groups.Where(x => x.CompanyId == companyId && x.Status).ToList());
            return CreateActionResult(CustomResponseDto<List<GroupDto>>.Success(200, groupsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<Group>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,Groups.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var group = await _groupService.GetByIdAsync(id);
            var groupsDto = _mapper.Map<GroupDto>(group);
            return CreateActionResult(CustomResponseDto<GroupDto>.Success(200, groupsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,Groups.Add")]
        public async Task<IActionResult> Save(GroupDto groupDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<Group>(groupDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var group = await _groupService.AddAsync(processedEntity);

            var groupsDto = _mapper.Map<GroupDto>(group);
            return CreateActionResult(CustomResponseDto<GroupDto>.Success(201, groupsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,Groups.Update")]
        public async Task<IActionResult> Update(GroupUpdateDto groupDto)
        {
            int userId = GetUserFromToken();
            var group = _mapper.Map<Group>(groupDto);
            group.UpdatedBy = userId;

            await _groupService.UpdateAsync(group);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,Groups.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            var group = await _groupService.GetByIdAsync(id);
            int userId = GetUserFromToken();
            group.UpdatedBy = userId;

            await _groupService.ChangeStatusAsync(group);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
