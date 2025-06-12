using AutoMapper;
using Quality.API.Filters;
using Quality.Business;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductDTOs;
using Quality.Core.DTOs.ProductPortalDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.FilterDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.NewProductDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.StockDTOs;
using Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs;
using Quality.Core.Models.ProductPortalModels;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace Quality.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController(IMapper mapper/*, Lazy<INetsisService> netsisService*/, IProductService productService, IProductHistoryService productHistoryService, IProductToProductGroupTypeDefinitionService productToProductGroupTypeDefinitionService) : CustomBaseController
    {
        private readonly IMapper _mapper = mapper;
        private readonly IProductService _productService = productService;
        private readonly IProductToProductGroupTypeDefinitionService _productToProductGroupTypeDefinitionService = productToProductGroupTypeDefinitionService;
        private readonly IProductHistoryService _productHistoryService = productHistoryService;
        //private readonly Lazy<INetsisService> _netsisService = netsisService;

        [HttpGet]
        //[Authorize(Roles = "Root,Products.Get")]
        public async Task<IActionResult> All()
        {
            var products = await _productService.GetAllAsync(); int companyId = GetCompanyIdFromToken();
            var productsDtos = _mapper.Map<List<ProductDto>>(products.Where(x => x.Status == true && x.CompanyId == companyId).OrderBy(x => x.CreatedDate).ToList());
            return CreateActionResult(CustomResponseDto<List<ProductDto>>.Success(200, productsDtos));
        }

        [ServiceFilter(typeof(NotFoundFilter<Product>))]
        [HttpGet("{id}")]
        //[Authorize(Roles = "Root,Products.Get")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetByIdAsync(id);
            var productsDto = _mapper.Map<ProductDto>(product);
            return CreateActionResult(CustomResponseDto<ProductDto>.Success(200, productsDto));
        }

        [HttpPost]
        //[Authorize(Roles = "Root,Products.Add")]
        public async Task<IActionResult> Save(ProductDto productDto)
        {
            int userId = GetUserFromToken();
            var processedEntity = _mapper.Map<Product>(productDto);
            int companyId = GetCompanyIdFromToken(); processedEntity.CompanyId = companyId; processedEntity.CreatedBy = userId;
            processedEntity.UpdatedBy = userId;

            var newDefinitions = productDto.ProductToProductGroupTypeDefinitions ?? [];

            productDto.ProductToProductGroupTypeDefinitions = null;
            processedEntity.ProductToProductGroupTypeDefinitions = null;
            var product = await _productService.AddAsync(processedEntity);


            if (newDefinitions.Count > 0)
            {
                foreach (var item in newDefinitions)
                {
                    item.ProductId = product.Id;
                    item.CreatedDate = DateTime.UtcNow;
                }

                var definitions = _mapper.Map<List<ProductToProductGroupTypeDefinition>>(newDefinitions);

                await _productToProductGroupTypeDefinitionService.UpdateMappings(definitions,companyId, userId);
            }

            var productsDto = _mapper.Map<ProductDto>(product);

            //if (_productService.CheckDbForSaveProduct(productDto))
            //{
            //    return CreateActionResult(CustomResponseDto<string>.Fail(400, "Already exist"));
            //}

            //else
            //{
            //    if (product == null)
            //    {
            //        return CreateActionResult(CustomResponseDto<string>.Fail(400, "An Error Occured"));
            //    }
            //    else
            {
                return CreateActionResult(CustomResponseDto<ProductDto>.Success(201, productsDto));
            }
            //}
        }
        [HttpGet("[action]")]
        //[Authorize(Roles = "Root,Products.Get")]
        public async Task<IActionResult> GetProductFilterItems()
        {
            int companyId = GetCompanyIdFromToken();
            var filterItems = _productService.GetProductFilterItems(companyId);
            return CreateActionResult(CustomResponseDto<FilterItemsDto>.Success(200, filterItems));
        }

        //[HttpPost("[action]")]
        ////[Authorize(Roles = "Root,Products.Get")]
        //public async Task<IActionResult> PreNewProductFromNetsis(StockDto stockDto)
        //{
        //    if (_productService.CheckDbForNewProduct(stockDto))
        //    {
        //        return CreateActionResult(CustomResponseDto<string>.Success(200, "Already exist"));
        //    }
        //    else
        //    {
        //        var products = await _productService.PreNewProductFromNetsisAsync(stockDto);

        //        if (products == null)
        //        {
        //            return CreateActionResult(CustomResponseDto<string>.Success(200, "ERP Error"));

        //        }
        //        else
        //        {
        //            return CreateActionResult(CustomResponseDto<FoundProductsFromNetsisDto>.Success(200, products));

        //        }
        //    }
        //}

        [HttpPost("[action]")]
        //[Authorize(Roles = "Root,Products.Add")]
        public async Task<IActionResult> FilteredList(ProductListFilterDto productListFilterDto)
        {
            int companyId = GetCompanyIdFromToken();
            var prod = _productService.FilteredList(productListFilterDto, companyId);

            var dto = _mapper.Map<List<ProductsWithDetailsDto>>(prod);
            return CreateActionResult(CustomResponseDto<List<ProductsWithDetailsDto>>.Success(200, dto));
        }

        [HttpPut("[action]")]
        //[Authorize(Roles = "Root,Products.Update")]
        public async Task<IActionResult> Update(ProductUpdateDto productDto)
        {
            int userId = GetUserFromToken();
            int companyId = GetCompanyIdFromToken();

            var product = _mapper.Map<Product>(productDto);
            product.UpdatedBy = userId;

            var current = await _productService.GetByIdAsync(productDto.Id);

            await _productHistoryService.AddByProduct(current, product);
            product.ProductToProductGroupTypeDefinitions = null;
            await _productService.UpdateAsync(product);

            if (productDto.ProductToProductGroupTypeDefinitions.Count > 0)
            {
                foreach (var item in productDto.ProductToProductGroupTypeDefinitions)
                {
                    item.ProductId = product.Id;
                }

                
            }
            else
            {
                productDto.ProductToProductGroupTypeDefinitions.Add(new ProductToProductGroupTypeDefinitionDto
                {
                    ProductId = product.Id
                });
            }
            var definitions = _mapper.Map<List<ProductToProductGroupTypeDefinition>>(productDto.ProductToProductGroupTypeDefinitions);

            await _productToProductGroupTypeDefinitionService.UpdateMappings(definitions, companyId, userId);
            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }


        [HttpGet("[action]/{id}")]
        //[Authorize(Roles = "Root,Products.Delete")]
        public async Task<IActionResult> Remove(int id)
        {
            int userId = GetUserFromToken();
            var product = await _productService.GetByIdAsync(id);

            product.UpdatedBy = userId;

            await _productService.ChangeStatusAsync(product);

            return CreateActionResult(CustomResponseDto<NoContentDto>.Success(204));
        }

        [HttpGet("GetWithDetails/{productId}")]
        //[Authorize(Roles = "Root,Products.Get")]
        public async Task<IActionResult> GetProductByIdWithDetailsAsync(int productId)
        {
            return CreateActionResult(await _productService.GetProductByIdWithDetailsAsync(productId));
        }

        [HttpGet("GetAllWithDetails")]
        //[Authorize(Roles = "Root,Products.Get")]
        public async Task<IActionResult> GetProductsWithDetailsAsync()
        {
            int companyId = GetCompanyIdFromToken();

            var products = await _productService.GetProductsWithDetailsAsync(companyId);
            var productsDtos = _mapper.Map<List<ProductsWithDetailsDto>>(products.Where(x => x.Status == true).OrderByDescending(x => x.CreatedDate).ToList());
            return CreateActionResult(CustomResponseDto<List<ProductsWithDetailsDto>>.Success(200, productsDtos));
        }

        //[HttpGet("GetAllWithDetailsWithReport")]
        ////[Authorize(Roles = "Root,Products.Get")]
        //public async Task<IActionResult> GetProductsWithDetailsWithReportAsync()
        //{
        //    int companyId = GetCompanyIdFromToken();

        //    var products = await _productService.GetAllWithDetailsForReportAsync(companyId);
        //    return CreateActionResult(CustomResponseDto<WebFilterResponseDto>.Success(200, products));
        //}

        [HttpGet("GetAllWithDetailsForWeb")]
        //[Authorize(Roles = "Root,Products.Get")]
        public async Task<IActionResult> GetProductsWithDetailsForWebAsync()
        {
            int companyId = GetCompanyIdFromToken();

            var products = await _productService.GetProductsWithDetailsForWebAsync(companyId);
            var productsDtos = _mapper.Map<List<ProductsWithDetailsDto>>(products.OrderByDescending(x => x.CreatedDate).ToList());
            return CreateActionResult(CustomResponseDto<List<ProductsWithDetailsDto>>.Success(200, productsDtos));
        }

        [HttpGet("GetAllWithDetails/{limit}/{offset}")]
        //[Authorize(Roles = "Root,Products.Get")]
        public async Task<IActionResult> GetProductsWithDetailsAsync(int limit, int offset)
        {
            var companyId = GetCompanyIdFromToken();
            var products = await _productService.GetProductsWithDetailsAsync(limit, offset, companyId);
            var productsDtos = _mapper.Map<List<ProductsWithDetailsDto>>(products.Where(x => x.Status == true).OrderByDescending(x => x.CreatedDate).ToList());
            return CreateActionResult(CustomResponseDto<List<ProductsWithDetailsDto>>.Success(200, productsDtos));
        }

        #region GetAllWithDetailsWithFilterCriteria

        [HttpGet("[action]/{limit}/{offset}")]
        // //[Authorize(Roles = "Root,Products.Get")]
        public async Task<IActionResult> GetProductsWithDetailsWithFilterAsync(int limit, int offset, [FromQuery] FilterCriteriaDto criteria)
        {
            var companyId = GetCompanyIdFromToken();
            var products = await _productService.GetAllWithDetailsWithFilterAsync(limit, offset, criteria ?? new FilterCriteriaDto(), companyId);
            return CreateActionResult(CustomResponseDto<WebFilterResponseDto>.Success(200, products));
        }

        #endregion

        //[HttpGet("[action]/{productId}")]
        ////[Authorize(Roles = "Root,Products.Get")]
        //public async Task<IActionResult> GetStockByProductId(int productId)
        //{

        //    var product = _productService.Where(x => x.Id == productId).Select(x => new StockDto { Code1 = x.Code, ProductId = x.Id }).FirstOrDefault();

        //    if (product != null)
        //    {
        //        var stock = await _netsisService.Value.GetStockByProductId(product);
        //        return CreateActionResult(CustomResponseDto<StockDto>.Success(200, stock));
        //    }
        //    else
        //    {
        //        return CreateActionResult(CustomResponseDto<NoContentDto>.Fail(404, "Product Not Found"));
        //    }

        //}

        //[HttpGet("[action]/{semiProductId}")]
        ////[Authorize(Roles = "Root,Products.Get")]
        //public async Task<IActionResult> SPReport(int semiProductId)
        //{

        //    var semiProduct = _productService.GetSpReport(semiProductId);

        //    return CreateActionResult(CustomResponseDto<SemiProductDto>.Success(200, semiProduct));


        //}

        //[HttpGet("[action]/{semiProductGroupId}")]
        ////[Authorize(Roles = "Root,Products.Get")]
        //public async Task<IActionResult> SPGReport(int semiProductGroupId)
        //{

        //    var semiProductGroup = _productService.GetSPGReport(semiProductGroupId);

        //    return CreateActionResult(CustomResponseDto<SemiProductGroupDto>.Success(200, semiProductGroup));

        //}

        //[HttpGet("[action]/{rawMaterialId}")]
        ////[Authorize(Roles = "Root,Products.Get")]
        //public async Task<IActionResult> RmReport(int rawMaterialId)
        //{

        //    var rawMaterial = await _productService.GetRMReportAsync(rawMaterialId);

        //    return CreateActionResult(CustomResponseDto<RawMaterialDto>.Success(200, rawMaterial));

        //}

        //[HttpGet("[action]/{rawMaterialGroupId}")]
        ////[Authorize(Roles = "Root,Products.Get")]
        //public async Task<IActionResult> RmgReport(int rawMaterialGroupId)
        //{

        //    var rawMaterialGroup = await _productService.GetRMGReportAsync(rawMaterialGroupId);

        //    return CreateActionResult(CustomResponseDto<RawMaterialGroupDto>.Success(200, rawMaterialGroup));
        //}

        //[Authorize(Roles = "Root")]
        [HttpGet("[action]")]
        public async Task<IActionResult> Dashboard()
        {
            int companyId = GetCompanyIdFromToken();

            var dashboard = _productService.GetDashboardCounts(companyId);

            return CreateActionResult(CustomResponseDto<DashboardCountDto>.Success(200, dashboard));
        }

        //[HttpGet("[action]/{productId}")]
        ////[Authorize(Roles = "Root,Products.Get")]
        //public async Task<IActionResult> UpdateNetsisProduct(int productId)
        //{

        //    var product = await _productService.GetByIdAsync(productId);

        //    var semiProductGroup = _netsisService.Value.UpdateProduct(product);

        //    return CreateActionResult(CustomResponseDto<Items>.Success(200, semiProductGroup));

        //}
    }
}
