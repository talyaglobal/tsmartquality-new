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
    public class SKUFollowTypesController(IMapper mapper, ISKUFollowTypeService skuFollowTypeService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly ISKUFollowTypeService _skuFollowTypeService = skuFollowTypeService;

        [HttpGet]
        //[Authorize(Roles = "Root,SKUFollowTypes.Get")]
        public async Task<IActionResult> All()
        {
            var skuFollowTypes = await _skuFollowTypeService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var skuFollowTypesDtos = _mapper.Map<List<SKUFollowTypeDto>>(skuFollowTypes.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<SKUFollowTypeDto>>.Success(200, skuFollowTypesDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<SKUFollowType>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,SKUFollowTypes.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var skuFollowType = await _skuFollowTypeService.GetByIdAsync(id);
            var skuFollowTypesDto = _mapper.Map<SKUFollowTypeDto>(skuFollowType);
            return CreateActionResult(CustomResponseDto<SKUFollowTypeDto>.Success(200, skuFollowTypesDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,SKUFollowTypes.Add")]
        public async Task<IActionResult> Save(SKUFollowTypeDto skuFollowTypeDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<SKUFollowType>(skuFollowTypeDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var skuFollowType = await _skuFollowTypeService.AddAsync(processedEntity);

            var skuFollowTypesDto = _mapper.Map<SKUFollowTypeDto>(skuFollowType);
            return CreateActionResult(CustomResponseDto<SKUFollowTypeDto>.Success(201, skuFollowTypesDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,SKUFollowTypes.Update")]
        public async Task<IActionResult> Update(SKUFollowTypeUpdateDto skuFollowTypeDto)
        {
            int userId = GetUserFromToken();
            var skuFollowType = _mapper.Map<SKUFollowType>(skuFollowTypeDto);
            skuFollowType.UpdatedBy = userId;

            await _skuFollowTypeService.UpdateAsync(skuFollowType);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,SKUFollowTypes.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var skuFollowType = await _skuFollowTypeService.GetByIdAsync(id);

            skuFollowType.UpdatedBy = userId;

            await _skuFollowTypeService.ChangeStatusAsync(skuFollowType);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
