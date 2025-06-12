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
    public class SalesGroupsController(IMapper mapper, ISalesGroupService salesGroupService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly ISalesGroupService _salesGroupService = salesGroupService;

        [HttpGet]
        //[Authorize(Roles = "Root,SalesGroups.Get")]
        public async Task<IActionResult> All()
        {
            var salesGroups = await _salesGroupService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var salesGroupsDtos = _mapper.Map<List<SalesGroupDto>>(salesGroups.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<SalesGroupDto>>.Success(200, salesGroupsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<SalesGroup>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,SalesGroups.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var salesGroup = await _salesGroupService.GetByIdAsync(id);
            var salesGroupsDto = _mapper.Map<SalesGroupDto>(salesGroup);
            return CreateActionResult(CustomResponseDto<SalesGroupDto>.Success(200, salesGroupsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,SalesGroups.Add")]
        public async Task<IActionResult> Save(SalesGroupDto salesGroupDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<SalesGroup>(salesGroupDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var salesGroup = await _salesGroupService.AddAsync(processedEntity);

            var salesGroupsDto = _mapper.Map<SalesGroupDto>(salesGroup);
            return CreateActionResult(CustomResponseDto<SalesGroupDto>.Success(201, salesGroupsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,SalesGroups.Update")]
        public async Task<IActionResult> Update(SalesGroupUpdateDto salesGroupDto)
        {
            int userId = GetUserFromToken();
            var salesGroup = _mapper.Map<SalesGroup>(salesGroupDto);
            salesGroup.UpdatedBy = userId;

            await _salesGroupService.UpdateAsync(salesGroup);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,SalesGroups.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var salesGroup = await _salesGroupService.GetByIdAsync(id);

            salesGroup.UpdatedBy = userId;

            await _salesGroupService.ChangeStatusAsync(salesGroup);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

    }
}
