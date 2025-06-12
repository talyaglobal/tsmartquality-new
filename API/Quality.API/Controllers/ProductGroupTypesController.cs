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
    public class ProductGroupTypesController(IMapper mapper, IProductGroupTypeService productGroupTypeService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IProductGroupTypeService _productGroupTypeService = productGroupTypeService;

        [HttpGet]
        //[Authorize(Roles = "Root,ProductGroupTypes.Get")]
        public async Task<IActionResult> All()
        {
            var productGroupTypes = await _productGroupTypeService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var productGroupTypesDtos = _mapper.Map<List<ProductGroupTypeDto>>(productGroupTypes.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<ProductGroupTypeDto>>.Success(200, productGroupTypesDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<ProductGroupType>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,ProductGroupTypes.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var productGroupType = await _productGroupTypeService.GetByIdAsync(id);
            var productGroupTypesDto = _mapper.Map<ProductGroupTypeDto>(productGroupType);
            return CreateActionResult(CustomResponseDto<ProductGroupTypeDto>.Success(200, productGroupTypesDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,ProductGroupTypes.Add")]
        public async Task<IActionResult> Save(ProductGroupTypeDto productGroupTypeDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<ProductGroupType>(productGroupTypeDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var productGroupType = await _productGroupTypeService.AddAsync(processedEntity);

            var productGroupTypesDto = _mapper.Map<ProductGroupTypeDto>(productGroupType);
            return CreateActionResult(CustomResponseDto<ProductGroupTypeDto>.Success(201, productGroupTypesDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,ProductGroupTypes.Update")]
        public async Task<IActionResult> Update(ProductGroupTypeUpdateDto productGroupTypeDto)
        {
            int userId = GetUserFromToken();
            var productGroupType = _mapper.Map<ProductGroupType>(productGroupTypeDto);
            productGroupType.UpdatedBy = userId;

            await _productGroupTypeService.UpdateAsync(productGroupType);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,ProductGroupTypes.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var productGroupType = await _productGroupTypeService.GetByIdAsync(id);

            productGroupType.UpdatedBy = userId;

            await _productGroupTypeService.ChangeStatusAsync(productGroupType);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        //[Authorize(Roles = "Root")]
        [HttpGet("GetAllWithDetails")]
        public async Task<IActionResult> GetAllWithDetailsAsync()
        {
            var companyId = GetCompanyIdFromToken();
            var getAllWithDetails = await _productGroupTypeService.GetAllWithDetailsAsync(companyId);

            return CreateActionResult(CustomResponseDto<List<ProductGroupTypeDto>>.Success(200, getAllWithDetails));
        }

        //[Authorize(Roles = "Root")]
        [HttpGet("GetWithDetails/{productGroupTypeId}")]
        public async Task<IActionResult> GetWithDetailsAsync(int productGroupTypeId)
        {
            var companyId = GetCompanyIdFromToken();
            var productGroupType = await _productGroupTypeService.GetWithDetailsAsync(productGroupTypeId, companyId);

            return CreateActionResult(CustomResponseDto<ProductGroupTypeDto>.Success(200, productGroupType));
        }
    }
}
