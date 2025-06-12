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
    public class RawMaterialGroupsController(IMapper mapper, IRawMaterialGroupService rawMaterialGroupService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IRawMaterialGroupService _rawMaterialGroupService = rawMaterialGroupService;

        [HttpGet]
        //[Authorize(Roles = "Root,RawMaterialGroups.Get")]
        public async Task<IActionResult> All()
        {
            var rawMaterialGroups = await _rawMaterialGroupService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var rawMaterialGroupsDtos = _mapper.Map<List<RawMaterialGroupDto>>(rawMaterialGroups.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<RawMaterialGroupDto>>.Success(200, rawMaterialGroupsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<RawMaterialGroup>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,RawMaterialGroups.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var rawMaterialGroup = await _rawMaterialGroupService.GetByIdAsync(id);
            var rawMaterialGroupsDto = _mapper.Map<RawMaterialGroupDto>(rawMaterialGroup);
            return CreateActionResult(CustomResponseDto<RawMaterialGroupDto>.Success(200, rawMaterialGroupsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,RawMaterialGroups.Add")]
        public async Task<IActionResult> Save(RawMaterialGroupDto rawMaterialGroupDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<RawMaterialGroup>(rawMaterialGroupDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var rawMaterialGroup = await _rawMaterialGroupService.AddAsync(processedEntity);

            var rawMaterialGroupsDto = _mapper.Map<RawMaterialGroupDto>(rawMaterialGroup);
            return CreateActionResult(CustomResponseDto<RawMaterialGroupDto>.Success(201, rawMaterialGroupsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,RawMaterialGroups.Update")]
        public async Task<IActionResult> Update(RawMaterialGroupUpdateDto rawMaterialGroupDto)
        {
            int userId = GetUserFromToken();
            var rawMaterialGroup = _mapper.Map<RawMaterialGroup>(rawMaterialGroupDto);
            rawMaterialGroup.UpdatedBy = userId;

            await _rawMaterialGroupService.UpdateAsync(rawMaterialGroup);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,RawMaterialGroups.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var rawMaterialGroup = await _rawMaterialGroupService.GetByIdAsync(id);

            rawMaterialGroup.UpdatedBy = userId;

            await _rawMaterialGroupService.ChangeStatusAsync(rawMaterialGroup);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

    }
}
