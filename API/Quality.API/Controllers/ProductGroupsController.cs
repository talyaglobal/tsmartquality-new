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
    public class ProductGroupsController(IMapper mapper, IProductGroupService productGroupService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IProductGroupService _productGroupService = productGroupService;

        [HttpGet]
        //[Authorize(Roles = "Root,ProductGroups.Get")]
        public async Task<IActionResult> All()
        {
            var productGroups = await _productGroupService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var productGroupsDtos = _mapper.Map<List<ProductGroupDto>>(productGroups.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<ProductGroupDto>>.Success(200, productGroupsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<ProductGroup>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,ProductGroups.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var productGroup = await _productGroupService.GetByIdAsync(id);
            var productGroupsDto = _mapper.Map<ProductGroupDto>(productGroup);
            return CreateActionResult(CustomResponseDto<ProductGroupDto>.Success(200, productGroupsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,ProductGroups.Add")]
        public async Task<IActionResult> Save(ProductGroupDto productGroupDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<ProductGroup>(productGroupDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var productGroup = await _productGroupService.AddAsync(processedEntity);

            var productGroupsDto = _mapper.Map<ProductGroupDto>(productGroup);
            return CreateActionResult(CustomResponseDto<ProductGroupDto>.Success(201, productGroupsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,ProductGroups.Update")]
        public async Task<IActionResult> Update(ProductGroupUpdateDto productGroupDto)
        {
            int userId = GetUserFromToken();
            var productGroup = _mapper.Map<ProductGroup>(productGroupDto);
            productGroup.UpdatedBy = userId;

            await _productGroupService.UpdateAsync(productGroup);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,ProductGroups.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var productGroup = await _productGroupService.GetByIdAsync(id);

            productGroup.UpdatedBy = userId;

            await _productGroupService.ChangeStatusAsync(productGroup);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
