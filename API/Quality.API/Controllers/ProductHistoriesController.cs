using AutoMapper;
using Quality.API.Filters;
using Quality.Business;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductDTOs;
using Quality.Core.DTOs.ProductPortalDTOs;
using Quality.Core.Models.ProductModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductHistoriesController(IMapper mapper, IProductHistoryService productHistoryService/*, Lazy<INetsisService> netsisService*/) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IProductHistoryService _productHistoryService = productHistoryService;
        //private readonly Lazy<INetsisService> _netsisService = netsisService;


        [HttpGet]
        //[Authorize(Roles = "Root,ProductHistories.Get")]
        public async Task<IActionResult> All()
        {
            var productHistories = await _productHistoryService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var productHistoriesDtos = _mapper.Map<List<ProductHistoryDto>>(productHistories.Where(x => x.CompanyId == companyId && x.Status).ToList());
            return CreateActionResult(CustomResponseDto<List<ProductHistoryDto>>.Success(200, productHistoriesDtos));
        }

        [HttpGet("GetAllWithDetails/{limit}/{offset}")]
        //[Authorize(Roles = "Root,Products.Get")]
        public async Task<IActionResult> GetProductsWithDetailsAsync(int limit, int offset)
        {
            var products = await _productHistoryService.GetProductHistoriesWithDetailsAsync(limit, offset);
            var productsDtos = _mapper.Map<List<ProductDto>>(products.Where(x => x.Status == true).OrderByDescending(x => x.CreatedDate).ToList());
            return CreateActionResult(CustomResponseDto<List<ProductDto>>.Success(200, productsDtos));
        }

        //[HttpGet("[action]")]
        ////[Authorize(Roles = "Root,ProductHistories.Get")]
        //public async Task<IActionResult> DoERPScheduledUpdateTask()
        //{
        //    var productHistory = await _productHistoryService.GetERPNotUpdatedData();
        //    if (productHistory != null && (productHistory.Code_Old != null || productHistory.Code2_Old != null || productHistory.Code3_Old != null))
        //    {
        //        var product = await _netsisService.Value.UpdateProduct(productHistory);

        //        await _productHistoryService.UpdateAsync(product);
        //    }
        //    return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        //}

        [ServiceFilter(typeof(NotFoundFilter<ProductHistory>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,ProductHistories.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var productHistory = await _productHistoryService.GetByIdAsync(id);
            var productHistoriesDto = _mapper.Map<ProductHistoryDto>(productHistory);
            return CreateActionResult(CustomResponseDto<ProductHistoryDto>.Success(200, productHistoriesDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,ProductHistories.Add")]
        public async Task<IActionResult> Save(ProductHistoryDto productHistoryDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<ProductHistory>(productHistoryDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy= userId;
            processedEntity.UpdatedBy = userId;

            var productHistory = await _productHistoryService.AddAsync(processedEntity);

            var productHistoriesDto = _mapper.Map<ProductHistoryDto>(productHistory);
            return CreateActionResult(CustomResponseDto<ProductHistoryDto>.Success(201, productHistoriesDto));
        }

        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,ProductHistories.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var productHistory = await _productHistoryService.GetByIdAsync(id);

            productHistory.UpdatedBy = userId;

            await _productHistoryService.ChangeStatusAsync(productHistory);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }
    }
}
