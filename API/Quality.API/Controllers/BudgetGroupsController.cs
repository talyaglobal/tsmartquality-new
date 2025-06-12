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
    public class BudgetGroupsController(IMapper mapper, IBudgetGroupService budgetGroupService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IBudgetGroupService _budgetGroupService = budgetGroupService;

        [HttpGet]
        //[Authorize(Roles = "Root,BudgetGroups.Get")]
        public async Task<IActionResult> All()
        {
            var budgetGroups = await _budgetGroupService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var budgetGroupsDtos = _mapper.Map<List<BudgetGroupDto>>(budgetGroups.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<BudgetGroupDto>>.Success(200, budgetGroupsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<BudgetGroup>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,BudgetGroups.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var budgetGroup = await _budgetGroupService.GetByIdAsync(id);
            var budgetGroupsDto = _mapper.Map<BudgetGroupDto>(budgetGroup);
            return CreateActionResult(CustomResponseDto<BudgetGroupDto>.Success(200, budgetGroupsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,BudgetGroups.Add")]
        public async Task<IActionResult> Save(BudgetGroupDto budgetGroupDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<BudgetGroup>(budgetGroupDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var budgetGroup = await _budgetGroupService.AddAsync(processedEntity);

            var budgetGroupsDto = _mapper.Map<BudgetGroupDto>(budgetGroup);
            return CreateActionResult(CustomResponseDto<BudgetGroupDto>.Success(201, budgetGroupsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,BudgetGroups.Update")]
        public async Task<IActionResult> Update(BudgetGroupUpdateDto budgetGroupDto)
        {
            int userId = GetUserFromToken();
            var budgetGroup = _mapper.Map<BudgetGroup>(budgetGroupDto);
            budgetGroup.UpdatedBy = userId;

            await _budgetGroupService.UpdateAsync(budgetGroup);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,BudgetGroups.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var budgetGroup = await _budgetGroupService.GetByIdAsync(id);

            budgetGroup.UpdatedBy = userId;

            await _budgetGroupService.ChangeStatusAsync(budgetGroup);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
