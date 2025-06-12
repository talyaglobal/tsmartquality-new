using AutoMapper;
using Quality.API.Filters;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs.ProductPortalDefinitionUpdateDtos;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [OutputCache]
    [EnableRateLimiting("Basic")]
    public class ProductStatusesController(IMapper mapper, IProductStatusService productStatusService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IProductStatusService _productStatusService = productStatusService;

        [HttpGet]
        //[Authorize(Roles = "Root,ProductStatuses.Get")]
        public async Task<IActionResult> All()
        {
            var productStatuss = await _productStatusService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var productStatussDtos = _mapper.Map<List<ProductStatusDto>>(productStatuss.Where(x => x.CompanyId == companyId && x.Status).OrderBy(x => x.Name).ToList());
            return CreateActionResult(CustomResponseDto<List<ProductStatusDto>>.Success(200, productStatussDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<ProductStatus>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,ProductStatuses.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var productStatus = await _productStatusService.GetByIdAsync(id);
            var productStatussDto = _mapper.Map<ProductStatusDto>(productStatus);
            return CreateActionResult(CustomResponseDto<ProductStatusDto>.Success(200, productStatussDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,ProductStatuses.Add")]
        public async Task<IActionResult> Save(ProductStatusDto productStatusDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<ProductStatus>(productStatusDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var productStatus = await _productStatusService.AddAsync(processedEntity);

            var productStatussDto = _mapper.Map<ProductStatusDto>(productStatus);
            return CreateActionResult(CustomResponseDto<ProductStatusDto>.Success(201, productStatussDto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,ProductStatuses.Update")]
        public async Task<IActionResult> Update(ProductStatusUpdateDto productStatusDto)
        {
            int userId = GetUserFromToken();
            var productStatus = _mapper.Map<ProductStatus>(productStatusDto);
            productStatus.UpdatedBy = userId;

            await _productStatusService.UpdateAsync(productStatus);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,ProductStatuses.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var productStatus = await _productStatusService.GetByIdAsync(id);

            productStatus.UpdatedBy = userId;

            await _productStatusService.ChangeStatusAsync(productStatus);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
