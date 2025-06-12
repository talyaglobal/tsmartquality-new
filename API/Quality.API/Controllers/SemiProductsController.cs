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
    public class SemiProductsController(IMapper mapper, ISemiProductService semiProductService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly ISemiProductService _semiProductService = semiProductService;

        [HttpGet]
        //[Authorize(Roles = "Root,SemiProducts.Get")]
        public async Task<IActionResult> All()
        {
            var semiProducts = await _semiProductService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var semiProductsDtos = _mapper.Map<List<SemiProductDto>>(semiProducts.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<SemiProductDto>>.Success(200, semiProductsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<SemiProduct>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,SemiProducts.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var semiProduct = await _semiProductService.GetByIdAsync(id);
            var semiProductsDto = _mapper.Map<SemiProductDto>(semiProduct);
            return CreateActionResult(CustomResponseDto<SemiProductDto>.Success(200, semiProductsDto));
        }

        [HttpGet("GetWithDetails/{semiProductId}")]
        //[Authorize(Roles = "Root,Products.Get")]
        public async Task<IActionResult> GetSemiProductByIdWithDetailsAsync(int semiProductId)
        {
            return CreateActionResult(await _semiProductService.GetSemiProductByIdWithDetailsAsync(semiProductId));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,SemiProducts.Add")]
        public async Task<IActionResult> Save(SemiProductDto semiProductDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<SemiProduct>(semiProductDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var semiProduct = await _semiProductService.AddAsync(processedEntity);

            var semiProductsDto = _mapper.Map<SemiProductDto>(semiProduct);
            return CreateActionResult(CustomResponseDto<SemiProductDto>.Success(201, semiProductsDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,SemiProducts.Update")]
        public async Task<IActionResult> Update(SemiProductUpdateDto semiProductDto)
        {
            int userId = GetUserFromToken();
            var semiProduct = _mapper.Map<SemiProduct>(semiProductDto);
            semiProduct.UpdatedBy = userId;

            await _semiProductService.UpdateAsync(semiProduct);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,SemiProducts.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var semiProduct = await _semiProductService.GetByIdAsync(id);

            semiProduct.UpdatedBy = userId;

            await _semiProductService.ChangeStatusAsync(semiProduct);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
