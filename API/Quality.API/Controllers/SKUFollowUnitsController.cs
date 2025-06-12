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
    public class SKUFollowUnitsController(IMapper mapper, ISKUFollowUnitService skuFollowUnitService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly ISKUFollowUnitService _skuFollowUnitService = skuFollowUnitService;

        [HttpGet]
        //[Authorize(Roles = "Root,SKUFollowUnits.Get")]
        public async Task<IActionResult> All()
        {
            var skuFollowUnits = await _skuFollowUnitService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var skuFollowUnitsDtos = _mapper.Map<List<SKUFollowUnitDto>>(skuFollowUnits.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<SKUFollowUnitDto>>.Success(200, skuFollowUnitsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<SKUFollowUnit>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,SKUFollowUnits.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var skuFollowUnit = await _skuFollowUnitService.GetByIdAsync(id);
            var skuFollowUnitsDto = _mapper.Map<SKUFollowUnitDto>(skuFollowUnit);
            return CreateActionResult(CustomResponseDto<SKUFollowUnitDto>.Success(200, skuFollowUnitsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,SKUFollowUnits.Add")]
        public async Task<IActionResult> Save(SKUFollowUnitDto skuFollowUnitDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<SKUFollowUnit>(skuFollowUnitDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var skuFollowUnit = await _skuFollowUnitService.AddAsync(processedEntity);

            var skuFollowUnitsDto = _mapper.Map<SKUFollowUnitDto>(skuFollowUnit);
            return CreateActionResult(CustomResponseDto<SKUFollowUnitDto>.Success(201, skuFollowUnitsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,SKUFollowUnits.Update")]
        public async Task<IActionResult> Update(SKUFollowUnitUpdateDto skuFollowUnitDto)
        {
            int userId = GetUserFromToken();
            var skuFollowUnit = _mapper.Map<SKUFollowUnit>(skuFollowUnitDto);
            skuFollowUnit.UpdatedBy = userId;

            await _skuFollowUnitService.UpdateAsync(skuFollowUnit);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,SKUFollowUnits.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var skuFollowUnit = await _skuFollowUnitService.GetByIdAsync(id);

            skuFollowUnit.UpdatedBy = userId;

            await _skuFollowUnitService.ChangeStatusAsync(skuFollowUnit);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
