using AutoMapper;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.FilterDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.Models.ProductPortalModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;
using Microsoft.EntityFrameworkCore;

namespace Quality.Service.Services
{
    public class ProductService(IGenericRepository<Product> repository, IRawMaterialRepository rawMaterialRepository/*, Lazy<INetsisService> netsisService*/, IRecipeRepository recipeRepository, IRecipeDetailRepository recipeDetailRepository, ISemiProductRepository semiProductRepository, IUnitOfWork unitOfWork, IMapper mapper, ISemiProductGroupRepository semiProductGroupRepository, IProductRepository productRepository, ICustomUpdateService<Product> customUpdateService, IPhotoService photoService, IBrandRepository brandRepository, ISellerRepository sellerRepository, IProductGroupRepository productGroupRepository, IBudgetGroupRepository budgetGroupRepository, ISalesGroupRepository salesGroupRepository, IRawMaterialGroupRepository rawMaterialGroupRepository, IStorageConditionRepository storageConditionRepository, IPackagingRepository packagingRepository, IProductionPlaceRepository productionPlaceRepository, ICuttingTypeRepository cuttingTypeRepository, IQualityTypeRepository qualityTypeRepository, IColorTypeRepository colorTypeRepository, ISalesBasedRepository salesBasedRepository, IUserService userService, IProductStatusRepository productStatusRepository, IProductGroupTypeRepository productGroupTypeRepository, ISKUFollowTypeRepository skuFollowTypeRepository, ISKUFollowUnitRepository skuFollowUnitRepository, IProductTypeRepository productTypeRepository) : Service<Product>(repository, unitOfWork), IProductService
    {
        string user;
        private readonly IProductRepository _productRepository = productRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ISellerRepository _sellerRepository = sellerRepository;
        private readonly IProductGroupRepository _productGroupRepository = productGroupRepository;
        private readonly IBrandRepository _brandRepository = brandRepository;
        private readonly IBudgetGroupRepository _budgetGroupRepository = budgetGroupRepository;
        private readonly ISalesGroupRepository _salesGroupRepository = salesGroupRepository;
        private readonly IRawMaterialGroupRepository _rawMaterialGroupRepository = rawMaterialGroupRepository;
        private readonly IStorageConditionRepository _storageConditionRepository = storageConditionRepository;
        private readonly IPackagingRepository _packagingRepository = packagingRepository;
        private readonly IProductionPlaceRepository _productionPlaceRepository = productionPlaceRepository;
        private readonly ICuttingTypeRepository _cuttingTypeRepository = cuttingTypeRepository;
        private readonly IQualityTypeRepository _qualityTypeRepository = qualityTypeRepository;
        private readonly IColorTypeRepository _colorTypeRepository = colorTypeRepository;
        private readonly ISalesBasedRepository _salesBasedRepository = salesBasedRepository;
        private readonly IPhotoService _photoService = photoService;
        private readonly IUserService _userService = userService;
        private readonly ICustomUpdateService<Product> _customUpdateService = customUpdateService;
        private readonly ISemiProductGroupRepository _semiProductGroupRepository = semiProductGroupRepository;
        private readonly ISemiProductRepository _semiProductRepository = semiProductRepository;
        private readonly IRecipeDetailRepository _recipeDetailRepository = recipeDetailRepository;
        private readonly IRecipeRepository _recipeRepository = recipeRepository;
        //private readonly Lazy<INetsisService> _netsisService = netsisService;
        private readonly IRawMaterialRepository _rawMaterialRepository = rawMaterialRepository;
        private readonly IProductStatusRepository _productStatusRepository = productStatusRepository;
        private readonly IProductGroupTypeRepository _productGroupTypeRepository = productGroupTypeRepository;
        private readonly ISKUFollowTypeRepository _skuFollowTypeRepository = skuFollowTypeRepository;
        private readonly ISKUFollowUnitRepository _skuFollowUnitRepository = skuFollowUnitRepository;
        private readonly IProductTypeRepository _productTypeRepository = productTypeRepository;
        public override async Task<Product> AddAsync(Product product)
        {
            product.CreatedDate = DateTime.UtcNow;
            product.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(product);
        }

        public FilterItemsDto GetProductFilterItems(int companyId)
        {
            var filterItems = new FilterItemsDto();
            filterItems.ProductGroupTypes = _mapper.Map<List<ProductGroupTypeDto>>(_productGroupTypeRepository.Where(x => x.CompanyId == companyId).Include(x => x.ProductGroupTypeDefinitions));
            filterItems.Sellers = _mapper.Map<List<SellerDto>>(_sellerRepository.Where(x => x.CompanyId == companyId));
            filterItems.Brands = _mapper.Map<List<BrandDto>>(_brandRepository.Where(x => x.CompanyId == companyId));
            filterItems.ProductGroups = _mapper.Map<List<ProductGroupDto>>(_productGroupRepository.Where(x => x.CompanyId == companyId));
            filterItems.StorageConditions = _mapper.Map<List<StorageConditionDto>>(_storageConditionRepository.Where(x => x.CompanyId == companyId));
            filterItems.ProductTypes = _mapper.Map<List<ProductTypeDto>>(_productTypeRepository.Where(x => x.CompanyId == companyId));
            filterItems.SKUFollowTypes = _mapper.Map<List<SKUFollowTypeDto>>(_skuFollowTypeRepository.Where(x => x.CompanyId == companyId));
            filterItems.SKUFollowUnits = _mapper.Map<List<SKUFollowUnitDto>>(_skuFollowUnitRepository.Where(x => x.CompanyId == companyId));

            return filterItems;
        }

        public List<Product> FilteredList(ProductListFilterDto productListFilterDto, int companyId)
        {
            var limit = productListFilterDto.Limit != null ? productListFilterDto.Limit : 10;
            var offset = productListFilterDto.Offset != null ? productListFilterDto.Offset : 0;
            var query = _productRepository.Where(x => x.CompanyId == companyId);
            if (productListFilterDto.ProductGroupTypeDefinitionId != null) { query = query.Where(x => x.ProductToProductGroupTypeDefinitions.Any(y => y.ProductGroupTypeDefinitionId == productListFilterDto.ProductGroupTypeDefinitionId)); }
            if (productListFilterDto.SellerId != null) { query = query.Where(x => x.SellerId == productListFilterDto.SellerId); }
            if (productListFilterDto.BrandId != null) { query = query.Where(x => x.BrandId == productListFilterDto.BrandId); }
            if (productListFilterDto.ProductGroupId != null) { query = query.Where(x => x.ProductGroupId == productListFilterDto.ProductGroupId); }
            if (productListFilterDto.StorageConditionId != null) { query = query.Where(x => x.StorageConditionId == productListFilterDto.StorageConditionId); }
            if (productListFilterDto.ProductTypeId != null) { query = query.Where(x => x.ProductTypeId == productListFilterDto.ProductTypeId); }
            if (productListFilterDto.SKUFollowTypeId != null) { query = query.Where(x => x.SKUFollowTypeId == productListFilterDto.SKUFollowTypeId); }
            if (productListFilterDto.SKUFollowUnitId != null) { query = query.Where(x => x.SKUFollowUnitId == productListFilterDto.SKUFollowUnitId); }


            if (productListFilterDto.CodeOrName != null)
            {
                if (productListFilterDto.CodeOrName.Length > 2)
                {
                    string codeOrNameLower = productListFilterDto.CodeOrName.ToLower();
                    query = query.Where(x => x.Code.ToLower().Contains(codeOrNameLower));
                }
            }

            query = query.Where(x => x.CompanyId == companyId).Skip(offset.Value).Take(limit.Value);
            var x = query.ToList();

            return x;
        }

        public override async Task ChangeStatusAsync(Product product)
        {
            var current = await _productRepository.GetByIdAsync(product.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = product.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public async Task<CustomResponseDto<ProductsWithDetailsDto>> GetProductByIdWithDetailsAsync(int productId)
        {
            Product product = _productRepository.Where(x => x.Id == productId).OrderByDescending(x => x.CreatedDate)

                .Include(x => x.Seller)
                .Include(x => x.ProductGroup)
                .Include(x => x.Brand)
                .Include(x => x.StorageCondition)
                .Include(x => x.ProductType)
                .Include(x => x.SKUFollowType)
                .Include(x => x.SKUFollowUnit)
                .Include(x => x.ProductToProductGroupTypeDefinitions.Where(x => x.Status)).ThenInclude(x => x.ProductGroupTypeDefinition)
                .Include(x => x.ProductToProductGroupTypeDefinitions.Where(x => x.Status)).ThenInclude(x => x.ProductGroupType)
                .FirstOrDefault();

            if (product == null)
            {
                return CustomResponseDto<ProductsWithDetailsDto>.Fail(404, "Product not found");
            }
            //var groupTypes = _productGroupTypeRepository.Where(x => x.CompanyId == product.CompanyId).ToList();
            var productDto = _mapper.Map<ProductsWithDetailsDto>(product);

            //productDto.CreatedByName = await GetCreatedByAsync(productId);
            //productDto.UpdatedByName = await GetUpdatedByAsync(productId);
            productDto.UpdatedDate = product.UpdatedDate;

            if (product.Photos != null && product.Photos.Count() > 0)
            {
                var photoUrls = product.Photos.Select(photo => photo.PhotoUrl).ToList();

                productDto.Photos = photoUrls;

                foreach (var photos in productDto.Photos)
                {
                    productDto.Photos = _photoService.GetPhotosByProductList(productId);
                }
            }

            return CustomResponseDto<ProductsWithDetailsDto>.Success(200, productDto);
        }

        //public async Task<string> GetCreatedByAsync(int productId)
        //{
        //    try
        //    {
        //        Product product = await _productRepository.GetByIdAsync(productId);
        //        User createdByUser = await _userService.GetByIdAsync(product.CreatedBy);
        //        user = createdByUser.Name + " " + createdByUser.Surname;
        //    }
        //    catch (Exception ex) { Console.WriteLine(ex.Message); }

        //    return user;
        //}

        //public async Task<string> GetUpdatedByAsync(int productId)
        //{
        //    try
        //    {
        //        Product product = await _productRepository.GetByIdAsync(productId);
        //        User updatedByUser = await _userService.GetByIdAsync(product.UpdatedBy);
        //        user = updatedByUser.Name + " " + updatedByUser.Surname;
        //    }
        //    catch (Exception ex) { Console.WriteLine(ex.Message); }

        //    return user;
        //}

        public override async Task UpdateAsync(Product product)
        {
            var current = await _productRepository.GetByIdAsync(product.Id);

            Product last = _customUpdateService.Check(current, product);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = product.UpdatedBy;

            await base.UpdateAsync(last);
        }

        //public async Task<RawMaterialGroupDto> GetRMGReportAsync(int rawMaterialGroupId)
        //{
        //    var rawMaterialGroup = _rawMaterialGroupRepository.Where(x => x.Id == rawMaterialGroupId).Include(x => x.RawMaterials).First();

        //    var rawMaterialDtos = new List<RawMaterialDto>();
        //    var rawMaterialGroupDto = _mapper.Map<RawMaterialGroupDto>(rawMaterialGroup);

        //    if (rawMaterialGroup.RawMaterials != null && rawMaterialGroup.RawMaterials.Count > 0)
        //    {
        //        foreach (var rawMaterial in rawMaterialGroup.RawMaterials)
        //        {
        //            var rmDto = await GetRMReportAsync(rawMaterial.Id);
        //            rawMaterialDtos.Add(rmDto);
        //            rawMaterialGroupDto.TotalStock += rmDto.Stocks.TotalStock;
        //        }
        //    }

        //    rawMaterialGroupDto.RawMaterials = rawMaterialDtos;

        //    return rawMaterialGroupDto;
        //}

        //public List<SemiProduct> GetSemiProductsByRawMaterialId(int rawMaterialId)
        //{
        //    var rawMaterial = _rawMaterialRepository.Where(x => x.Id == rawMaterialId);
        //    if (rawMaterial != null)
        //    {
        //        var recipeIds = _recipeDetailRepository.Where(x => x.RawMaterialId == rawMaterialId).Select(x => x.RecipeId);
        //        var semiProductIds = _recipeRepository.Where(x => recipeIds.Contains(x.Id)).Select(x => x.SemiProductId);
        //        var semiProducts = _semiProductRepository.Where(x => semiProductIds.Contains(x.Id)).Select(x => new SemiProduct() { Id = x.Id, Code = x.Code, Code2 = x.Code2, Code3 = x.Code3, Name = x.Name }).ToList();

        //        if (semiProducts.Count > 0)
        //        {
        //            return semiProducts;
        //        }
        //        else { return null; }
        //    }
        //    else { return null; }
        //}

        //public List<Product> GetProductsBySemiProductId(int semiProductId)
        //{
        //    var semiProduct = _semiProductRepository.Where(x => x.Id == semiProductId);
        //    if (semiProduct != null)
        //    {
        //        var recipeIds = _recipeDetailRepository.Where(x => x.SemiProductId == semiProductId).Select(x => x.RecipeId);
        //        var productIds = _recipeRepository.Where(x => recipeIds.Contains(x.Id)).Select(x => x.ProductId);
        //        var products = _productRepository.Where(x => productIds.Contains(x.Id)).Select(x => new Product() { Id = x.Id, Code = x.Code, Name = x.Name }).ToList();

        //        if (products.Count > 0)
        //        {
        //            return products;
        //        }
        //        else { return null; }
        //    }
        //    else { return null; }
        //}

        //public async Task<RawMaterialDto> GetRMReportAsync(int rawMaterialId)
        //{
        //    RmReportDto rmReportDto = new RmReportDto();
        //    var rawMaterial = _rawMaterialRepository.Where(x => x.Id == rawMaterialId).FirstOrDefault();
        //    var semiProducts = GetSemiProductsByRawMaterialId(rawMaterialId);
        //    var semiProductsDtos = _mapper.Map<List<SemiProductDto>>(semiProducts);
        //    if (semiProductsDtos.Count > 0)
        //    {
        //        foreach (var semiProduct in semiProductsDtos)
        //        {
        //            var products = GetProductsBySemiProductId(semiProduct.Id);
        //            if (products.Count > 0)
        //            {
        //                SpReportDto spReportDto = new SpReportDto();
        //                StockDto spStock = new StockDto()
        //                {
        //                    ProductId = semiProduct.Id,
        //                    Code1 = semiProduct.Code,
        //                    Code2 = semiProduct.Code2,
        //                    Code3 = semiProduct.Code3
        //                };
        //                spReportDto.SPStock = spStock;
        //                List<StockDto> productStocks = new List<StockDto>();
        //                if (products.Count > 0)
        //                {
        //                    foreach (var product in products)
        //                    {
        //                        StockDto stockDto = new StockDto();
        //                        stockDto.ProductId = product.Id;
        //                        stockDto.Code1 = product.Code;
        //                        stockDto.Code2 = product.Code2;
        //                        stockDto.Code3 = product.Code3;
        //                        productStocks.Add(stockDto);
        //                    }
        //                    spReportDto.ProductStocks = productStocks;
        //                }
        //                var stocks = _netsisService.Value.GetSPReport(spReportDto);
        //                if (stocks != null)
        //                {

        //                    semiProduct.Stocks = stocks.SPStock;
        //                    semiProduct.Stocks.TotalStock = ((stocks.SPStock.Code1Stock == null ? 0 : stocks.SPStock.Code1Stock) + (stocks.SPStock.Code2Stock == null ? 0 : stocks.SPStock.Code2Stock) + (stocks.SPStock.Code3Stock == null ? 0 : stocks.SPStock.Code3Stock));
        //                }

        //                if (products != null && products.Count > 0)
        //                {
        //                    var grandTotalInBox = 0;
        //                    var grandTotal = 0;

        //                    var productsDtos = _mapper.Map<List<ProductsWithDetailsDto>>(products);
        //                    foreach (var prod in productsDtos)
        //                    {
        //                        var stock = stocks.ProductStocks.Where(x => x.ProductId == prod.Id).First();
        //                        prod.Stock = stock;

        //                        prod.Stock.TotalStock = ((prod.Stock.Code1Stock == null ? 0 : prod.Stock.Code1Stock) + (prod.Stock.Code2Stock == null ? 0 : prod.Stock.Code2Stock) + (prod.Stock.Code3Stock == null ? 0 : prod.Stock.Code3Stock));
        //                        prod.Stock.TotalStockInBox = prod.Stock.TotalStock * prod.QtyInBox;

        //                        grandTotal += prod.Stock.TotalStock != null ? Convert.ToInt32(prod.Stock.TotalStock) : 0;
        //                        grandTotalInBox += prod.Stock.TotalStockInBox != null ? Convert.ToInt32(prod.Stock.TotalStockInBox) : 0;
        //                    }

        //                    semiProduct.ProductWithDetails = productsDtos;
        //                    semiProduct.Stocks.TotalProductStock = grandTotal;
        //                    semiProduct.Stocks.TotalProductStockInBox = grandTotalInBox;
        //                    semiProduct.Stocks.GrandTotalInBox = semiProduct.Stocks.TotalStock + semiProduct.Stocks.TotalProductStockInBox;
        //                }
        //            }
        //        }
        //    }
        //    var rawMaterialDto = _mapper.Map<RawMaterialDto>(rawMaterial);
        //    rawMaterialDto.SemiProducts = semiProductsDtos;
        //    StockDto dtoSt = new StockDto();
        //    dtoSt.ProductId = rawMaterialDto.Id;
        //    dtoSt.Code1 = rawMaterialDto.Code;
        //    dtoSt.Code2 = rawMaterialDto.Code2;
        //    dtoSt.Code3 = rawMaterialDto.Code3;
        //    var rawMaterialStock = await _netsisService.Value.GetStockByProductId(dtoSt);
        //    rawMaterialDto.Stocks = rawMaterialStock;
        //    return rawMaterialDto;
        //}

        //public SemiProductDto GetSpReport(int semiProductId)
        //{
        //    var semiProduct = _semiProductRepository.Where(x => x.Id == semiProductId).FirstOrDefault();
        //    var products = GetProductsBySemiProductId(semiProductId);

        //    SpReportDto spReportDto = new SpReportDto();
        //    StockDto spStock = new StockDto()
        //    {
        //        ProductId = semiProductId,
        //        Code1 = semiProduct.Code,
        //        Code2 = semiProduct.Code2,
        //        Code3 = semiProduct.Code3
        //    };
        //    spReportDto.SPStock = spStock;
        //    List<StockDto> productStocks = new List<StockDto>();
        //    if (products != null && products.Count > 0)
        //    {
        //        foreach (var product in products)
        //        {
        //            StockDto stockDto = new StockDto();
        //            stockDto.ProductId = product.Id;
        //            stockDto.Code1 = product.Code;
        //            stockDto.Code2 = product.Code2;
        //            stockDto.Code3 = product.Code3;
        //            productStocks.Add(stockDto);

        //        }
        //        spReportDto.ProductStocks = productStocks;
        //    }
        //    var stocks = _netsisService.Value.GetSPReport(spReportDto);
        //    var semiProductDto = _mapper.Map<SemiProductDto>(semiProduct);
        //    if (stocks != null)
        //    {
        //        semiProductDto.Stocks = stocks.SPStock;

        //        semiProductDto.Stocks.TotalStock = ((stocks.SPStock.Code1Stock == null ? 0 : stocks.SPStock.Code1Stock) + (stocks.SPStock.Code2Stock == null ? 0 : stocks.SPStock.Code2Stock) + (stocks.SPStock.Code3Stock == null ? 0 : stocks.SPStock.Code3Stock));
        //    }
        //    if (products != null && products.Count > 0)
        //    {
        //        var grandTotalInBox = 0;
        //        var grandTotal = 0;

        //        var productsDtos = _mapper.Map<List<ProductsWithDetailsDto>>(products);
        //        foreach (var prod in productsDtos)
        //        {
        //            var stock = stocks.ProductStocks.Where(x => x.ProductId == prod.Id).First();
        //            prod.Stock = stock;

        //            prod.Stock.TotalStock = ((prod.Stock.Code1Stock == null ? 0 : prod.Stock.Code1Stock) + (prod.Stock.Code2Stock == null ? 0 : prod.Stock.Code2Stock) + (prod.Stock.Code3Stock == null ? 0 : prod.Stock.Code3Stock));
        //            prod.Stock.TotalStockInBox = prod.Stock.TotalStock * prod.QtyInBox;

        //            grandTotal += prod.Stock.TotalStock != null ? Convert.ToInt32(prod.Stock.TotalStock) : 0;
        //            grandTotalInBox += prod.Stock.TotalStockInBox != null ? Convert.ToInt32(prod.Stock.TotalStockInBox) : 0;
        //        }

        //        semiProductDto.ProductWithDetails = productsDtos;
        //        semiProductDto.Stocks.TotalProductStock = grandTotal;
        //        semiProductDto.Stocks.TotalProductStockInBox = grandTotalInBox;
        //        semiProductDto.Stocks.GrandTotalInBox = semiProductDto.Stocks.TotalStock + semiProductDto.Stocks.TotalProductStockInBox;

        //    }
        //    return semiProductDto;

        //    return null;
        //}

        //public SemiProductGroupDto GetSPGReport(int semiProductGroupId) // Değiştirilecek
        //{
        //    var semiProductGroup = _semiProductGroupRepository.Where(x => x.Id == semiProductGroupId).FirstOrDefault();
        //    var semiProducts = _semiProductRepository.Where(x => x.Id == semiProductGroupId).ToList();

        //    var semiProductsDtos = _mapper.Map<List<SemiProductDto>>(semiProducts);
        //    var semiProductGroupDto = _mapper.Map<SemiProductGroupDto>(semiProductGroup);

        //    List<SemiProductDto> newSemiProductDtos = new List<SemiProductDto>();
        //    foreach (var semiProduct in semiProductsDtos)
        //    {
        //        var semi = GetSpReport(semiProduct.Id);
        //        newSemiProductDtos.Add(semi);

        //        semiProductGroupDto.TotalStock += semi.Stocks.GrandTotalInBox;
        //    }
        //    semiProductGroupDto.SemiProducts = newSemiProductDtos;

        //    return semiProductGroupDto;
        //}

        //public async Task<FoundProductsFromNetsisDto> PreNewProductFromNetsisAsync(StockDto stockDto)
        //{

        //    FoundProductsFromNetsisDto foundProductsFromNetsisDto = new FoundProductsFromNetsisDto();

        //    foundProductsFromNetsisDto = await _netsisService.Value.PreNewProductFromNetsis(stockDto);

        //    if (foundProductsFromNetsisDto != null)
        //    {
        //        return foundProductsFromNetsisDto;
        //    }


        //    return null;
        //}

        //public bool CheckDbForNewProduct(StockDto stockDto)
        //{
        //    var code1Product = stockDto.Code1 != null && stockDto.Code1 != "" ? _productRepository.Where(x => x.Code == stockDto.Code1).FirstOrDefault() : null;
        //    var code2Product = stockDto.Code2 != null && stockDto.Code2 != "" ? _productRepository.Where(x => x.Code2 == stockDto.Code2).FirstOrDefault() : null;
        //    var code3Product = stockDto.Code3 != null && stockDto.Code3 != "" ? _productRepository.Where(x => x.Code3 == stockDto.Code3).FirstOrDefault() : null;

        //    if (code1Product != null || code2Product != null || code3Product != null)
        //    {
        //        return true;
        //    }
        //    else
        //    {
        //        return false;
        //    }
        //}

        //public bool CheckDbForSaveProduct(ProductDto productDto)
        //{
        //    var code1Product = productDto.Code != null && productDto.Code != "" ? _productRepository.Where(x => x.Code == productDto.Code).FirstOrDefault() : null;
        //    var code2Product = productDto.Code2 != null && productDto.Code2 != "" ? _productRepository.Where(x => x.Code2 == productDto.Code2).FirstOrDefault() : null;
        //    var code3Product = productDto.Code3 != null && productDto.Code3 != "" ? _productRepository.Where(x => x.Code3 == productDto.Code3).FirstOrDefault() : null;

        //    if (code1Product != null || code2Product != null || code3Product != null)
        //    {
        //        return true;
        //    }
        //    else
        //    {
        //        return false;
        //    }
        //}

        //repoda kontol et productId varsa 

        public Task<List<Product>> GetProductsWithDetailsAsync(int companyId)
        {
            var query = _productRepository.Where(x => x.CompanyId == companyId)
                .Include(x => x.Seller)
                .Include(x => x.ProductGroup)
                .Include(x => x.Brand)
                .Include(x => x.StorageCondition)
                .Include(x => x.ProductType)
                .Include(x => x.SKUFollowType)
                .Include(x => x.SKUFollowUnit)
                .Include(x => x.ProductToProductGroupTypeDefinitions.Where(x => x.Status)).ThenInclude(x => x.ProductGroupTypeDefinition)
                .Include(x => x.ProductToProductGroupTypeDefinitions.Where(x => x.Status)).ThenInclude(x => x.ProductGroupType);

            var products = query.ToListAsync();

            var sqlQuery = query.ToQueryString();



            return products;
        }

        public DashboardCountDto GetDashboardCounts(int companyId)
        {
            var productsCount = _productRepository.Where(x => x.CompanyId == companyId).Count();
            var semiProdutcsCount = _semiProductRepository.Where(x => x.CompanyId == companyId).Count();
            var rawMaterialsCount = _rawMaterialRepository.Where(x => x.CompanyId == companyId).Count();
            var productsGroupsCount = _productGroupRepository.Where(x => x.CompanyId == companyId).Count();
            var semiProductGroupsCount = _semiProductGroupRepository.Where(x => x.CompanyId == companyId).Count();
            var rawMaterialGroupsCount = _rawMaterialGroupRepository.Where(x => x.CompanyId == companyId).Count();

            return new DashboardCountDto
            {
                Products = productsCount,
                SemiProducts = semiProdutcsCount,
                RawMaterials = rawMaterialsCount,
                ProductGroups = productsGroupsCount,
                SemiProductGroups = semiProductGroupsCount,
                RawMaterialGroups = rawMaterialGroupsCount
            };
        }

        public async Task<List<Product>> GetProductsWithDetailsAsync(int limit, int offset, int companyId)
        {
            var products = await _productRepository.Where(x => x.CompanyId == companyId)

                .Include(x => x.Seller)
                .Include(x => x.ProductGroup)
                .Include(x => x.Brand)
                .Include(x => x.StorageCondition)
                .Include(x => x.ProductType)
                .Include(x => x.SKUFollowType)
                .Include(x => x.SKUFollowUnit)
                .Include(x => x.ProductToProductGroupTypeDefinitions.Where(x => x.Status)).ThenInclude(x => x.ProductGroupTypeDefinition)
                .Include(x => x.ProductToProductGroupTypeDefinitions.Where(x => x.Status)).ThenInclude(x => x.ProductGroupType)

                .Skip(offset)
                .Take(limit)
                .ToListAsync();
            return products;
        }


        #region GetAllWithDetailsForWeb

        private async Task<Dictionary<int, string>> GetSellerNamesAsync(List<int> sellerIds, int companyId)
        {
            return await _sellerRepository
                .Where(s => sellerIds.Contains(s.Id) && s.CompanyId == companyId)
                .ToDictionaryAsync(s => s.Id, s => s.Name);
        }

        private async Task<Dictionary<int, string>> GetProductGroupNamesAsync(List<int> productGroupIds, int companyId)
        {
            return await _productGroupRepository
                .Where(pg => productGroupIds.Contains(pg.Id) && pg.CompanyId == companyId)
                .ToDictionaryAsync(pg => pg.Id, pg => pg.Name);
        }

        private async Task<Dictionary<int, string>> GetBrandNamesAsync(List<int> brandIds, int companyId)
        {
            return await _brandRepository
                .Where(b => brandIds.Contains(b.Id) && b.CompanyId == companyId)
                .ToDictionaryAsync(b => b.Id, b => b.Name);
        }

        public async Task<List<ProductsWithDetailsDto>> GetProductsWithDetailsForWebAsync(int companyId)
        {
            int year = DateTime.UtcNow.Year;

            var products = await _productRepository.Where(x => x.CompanyId == companyId)
                .AsNoTracking()
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.SellerId,
                    p.ProductGroupId,
                    p.BrandId
                })
                .ToListAsync();

            var sellerIds = products.Select(p => p.SellerId).Where(id => id.HasValue).Select(id => id.Value).Distinct().ToList();
            var sellerNames = await GetSellerNamesAsync(sellerIds, companyId);

            var productGroupIds = products.Select(p => p.ProductGroupId).Where(id => id.HasValue).Select(id => id.Value).Distinct().ToList();
            var productGroupNames = await GetProductGroupNamesAsync(productGroupIds, companyId);

            var brandIds = products.Select(p => p.BrandId).Where(id => id.HasValue).Select(id => id.Value).Distinct().ToList();
            var brandNames = await GetBrandNamesAsync(brandIds, companyId);

            var productDtos = products.Select(product => new ProductsWithDetailsDto
            {
                Id = product.Id,
                Name = product.Name
            }).ToList();

            return productDtos;
        }

        #endregion

        //public async Task<WebFilterResponseDto> GetAllWithDetailsForReportAsync(int companyId)
        //{
        //    var query = await _productRepository.Where(x => x.CompanyId == companyId)
        //        .Include(x => x.Seller)
        //        .Include(x => x.ProductGroup)
        //        .Include(x => x.Brand)
        //        .Include(x => x.StorageCondition)
        //        .Include(x => x.ProductType)
        //        .Include(x => x.SKUFollowType)
        //        .Include(x => x.SKUFollowUnit)
        //        .ToListAsync();

        //    WebFilterResponseDto webFilterResponseDto = new();

        //    var listDto = _mapper.Map<List<ProductsWithDetailsDto>>(query);

        //    foreach (var item in listDto)
        //    {
        //        item.SemiProduct = _mapper.Map<SemiProductDto>(_recipeRepository.Where(x => x.ProductId == item.Id).Select(x => x.SemiProduct).FirstOrDefault());
        //        item.Stock = new();
        //        item.Stock.Code1Stock = 0;
        //        item.Stock.Code2Stock = 0;
        //        item.Stock.Code3Stock = 0;
        //        item.Stock.TotalStock = 0;

        //        if (item.SemiProduct != null)
        //        {
        //            item.SemiProduct.Stocks = new();
        //            item.SemiProduct.Stocks.Code1Stock = 0;
        //            item.SemiProduct.Stocks.Code2Stock = 0;
        //            item.SemiProduct.Stocks.Code3Stock = 0;
        //            item.SemiProduct.Stocks.TotalStock = 0;
        //        }
        //    }

        //    var reportList = await _netsisService.Value.GetAllReport(listDto);
        //    webFilterResponseDto.RowCount = 1;
        //    webFilterResponseDto.ProductsWithDetails = reportList;
        //    return webFilterResponseDto;
        //}

        #region GetAllWithDetailsWithFilter
        public async Task<WebFilterResponseDto> GetAllWithDetailsWithFilterAsync(int limit, int offset, FilterCriteriaDto criteria, int companyId)
        {
            var query = _productRepository.Where(x => x.CompanyId == companyId)
                .Include(x => x.Seller)
                .Include(x => x.ProductGroup)
                .Include(x => x.Brand)
                .Include(x => x.StorageCondition)
                .Include(x => x.ProductType)
                .Include(x => x.SKUFollowType)
                .Include(x => x.SKUFollowUnit)
                .Include(x => x.ProductToProductGroupTypeDefinitions.Where(x => x.Status)).ThenInclude(x => x.ProductGroupTypeDefinition)
                .Include(x => x.ProductToProductGroupTypeDefinitions.Where(x => x.Status)).ThenInclude(x => x.ProductGroupType)
                .AsQueryable();

            if (criteria != null)
            {
                query = ApplyFilters(query, criteria);
                query = ApplySorting(query, criteria);
            }

            var count = query.Count();
            query = query.Skip(offset).Take(limit);

            var list = await query.ToListAsync();

            WebFilterResponseDto webFilterResponseDto = new();

            var listDto = _mapper.Map<List<ProductsWithDetailsDto>>(list);

            webFilterResponseDto.RowCount = count;

            webFilterResponseDto.ProductsWithDetails = listDto;

            return webFilterResponseDto;
        }

        private IQueryable<Product> ApplyFilters(IQueryable<Product> query, FilterCriteriaDto criteria)
        {
            if (!string.IsNullOrEmpty(criteria.Code))
            {
                query = query.Where(p => p.Code.ToLower().Contains(criteria.Code.ToLower()));
            }

            if (!string.IsNullOrEmpty(criteria.Name))
            {
                query = query.Where(p => p.Name.ToLower().Contains(criteria.Name.ToLower()));
            }

            if (criteria.Seller.Any())
            {
                query = query.Where(p => criteria.Seller.Any(brand => p.Seller.Name == brand));
            }

            if (criteria.ProductGroup.Any())
            {
                query = query.Where(p => criteria.ProductGroup.Any(brand => p.ProductGroup.Name == brand));
            }

            if (criteria.Brand.Any())
            {
                query = query.Where(p => criteria.Brand.Any(brand => p.Brand.Name == brand));
            }

            if (criteria.StorageCondition.Any())
            {
                query = query.Where(p => criteria.StorageCondition.Any(brand => p.StorageCondition.Name == brand));
            }

            return query;
        }

        private IQueryable<Product> ApplySorting(IQueryable<Product> query, FilterCriteriaDto criteria)
        {
            if (string.IsNullOrEmpty(criteria.OrderBy))
            {
                return query;
            }

            bool isDescending = string.Equals(criteria.OrderType, "desc", StringComparison.OrdinalIgnoreCase);

            query = criteria.OrderBy.ToLower() switch
            {
                "code" => isDescending ? query.OrderByDescending(p => p.Code) : query.OrderBy(p => p.Code),
                "name" => isDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
                "seller" => isDescending ? query.OrderByDescending(p => p.Seller.Name) : query.OrderBy(p => p.Seller.Name),
                "productGroup" => isDescending ? query.OrderByDescending(p => p.ProductGroup.Name) : query.OrderBy(p => p.ProductGroup.Name),
                "brand" => isDescending ? query.OrderByDescending(p => p.Brand.Name) : query.OrderBy(p => p.Brand.Name),
                "storageCondition" => isDescending ? query.OrderByDescending(p => p.StorageCondition.Name) : query.OrderBy(p => p.StorageCondition.Name),
                "createdDate" => isDescending ? query.OrderByDescending(p => p.CreatedDate) : query.OrderBy(p => p.CreatedDate),
                _ => query
            };

            return query;
        }

        #endregion

    }
}
