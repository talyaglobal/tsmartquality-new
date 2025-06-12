using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs.ProductPortalDefinitionUpdateDtos;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductTypesController(IMapper mapper, IProductTypeService productTypeService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IProductTypeService _productTypeService = productTypeService;

        [HttpGet]
        //[Authorize(Roles = "Root,ProductTypes.Get")]
        public async Task<IActionResult> All()
        {
            var productTypes = await _productTypeService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var productTypesDtos = _mapper.Map<List<ProductTypeDto>>(productTypes.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<ProductTypeDto>>.Success(200, productTypesDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<ProductType>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,ProductTypes.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var productType = await _productTypeService.GetByIdAsync(id);
            var productTypesDto = _mapper.Map<ProductTypeDto>(productType);
            return CreateActionResult(CustomResponseDto<ProductTypeDto>.Success(200, productTypesDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,ProductTypes.Add")]
        public async Task<IActionResult> Save(ProductTypeDto productTypeDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<ProductType>(productTypeDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy = userId;
            processedEntity.UpdatedBy = userId;

            var productType = await _productTypeService.AddAsync(processedEntity);

            var productTypesDto = _mapper.Map<ProductTypeDto>(productType);
            return CreateActionResult(CustomResponseDto<ProductTypeDto>.Success(201, productTypesDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,ProductTypes.Update")]
        public async Task<IActionResult> Update(ProductTypeUpdateDto productTypeDto)
        {
            int userId = GetUserFromToken();
            var productType = _mapper.Map<ProductType>(productTypeDto);
            productType.UpdatedBy = userId;

            await _productTypeService.UpdateAsync(productType);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,ProductTypes.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var productType = await _productTypeService.GetByIdAsync(id);

            productType.UpdatedBy = userId;

            await _productTypeService.ChangeStatusAsync(productType);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
