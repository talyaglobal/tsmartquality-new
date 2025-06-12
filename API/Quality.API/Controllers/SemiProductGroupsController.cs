using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs.ProductPortalDefinitionUpdateDtos;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SemiProductGroupsController(IMapper mapper, ISemiProductGroupService semiProductGroupService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly ISemiProductGroupService _semiProductGroupService = semiProductGroupService;

        [HttpGet]
        //[Authorize(Roles = "Root,SemiProductGroups.Get")]
        public async Task<IActionResult> All()
        {
            var semiProductGroups = await _semiProductGroupService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var semiProductGroupsDtos = _mapper.Map<List<SemiProductGroupDto>>(semiProductGroups.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<SemiProductGroupDto>>.Success(200, semiProductGroupsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<SemiProductGroup>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,SemiProductGroups.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var semiProductGroup = await _semiProductGroupService.GetByIdAsync(id);
            var semiProductGroupsDto = _mapper.Map<SemiProductGroupDto>(semiProductGroup);
            return CreateActionResult(CustomResponseDto<SemiProductGroupDto>.Success(200, semiProductGroupsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,SemiProductGroups.Add")]
        public async Task<IActionResult> Save(SemiProductGroupDto semiProductGroupDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<SemiProductGroup>(semiProductGroupDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var semiProductGroup = await _semiProductGroupService.AddAsync(processedEntity);

            var semiProductGroupsDto = _mapper.Map<SemiProductGroupDto>(semiProductGroup);
            return CreateActionResult(CustomResponseDto<SemiProductGroupDto>.Success(201, semiProductGroupsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,SemiProductGroups.Update")]
        public async Task<IActionResult> Update(SemiProductGroupUpdateDto semiProductGroupDto)
        {
            int userId = GetUserFromToken();
            var semiProductGroup = _mapper.Map<SemiProductGroup>(semiProductGroupDto);
            semiProductGroup.UpdatedBy = userId;

            await _semiProductGroupService.UpdateAsync(semiProductGroup);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,SemiProductGroups.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var semiProductGroup = await _semiProductGroupService.GetByIdAsync(id);

            semiProductGroup.UpdatedBy = userId;

            await _semiProductGroupService.ChangeStatusAsync(semiProductGroup);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
