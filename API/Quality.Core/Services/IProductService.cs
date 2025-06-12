using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductDTOs;
using Quality.Core.DTOs.ProductPortalDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.FilterDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.NewProductDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.StockDTOs;
using Quality.Core.Models.ProductPortalModels;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Core.Services
{
    public interface IProductService : IService<Product>
    {
        Task<CustomResponseDto<ProductsWithDetailsDto>> GetProductByIdWithDetailsAsync(int productId);
        //Task<string> GetCreatedByAsync(int productId);
        //Task<string> GetUpdatedByAsync(int productId);
        Task<List<ProductsWithDetailsDto>> GetProductsWithDetailsForWebAsync(int companyId);
        List<Product> FilteredList(ProductListFilterDto productListFilterDto, int companyId);
        FilterItemsDto GetProductFilterItems(int companyId);
        //List<Product> GetProductsBySemiProductId(int semiProductId);
        //SemiProductDto GetSpReport(int semiProductId);
        //SemiProductGroupDto GetSPGReport(int semiProductGroupId);
        //Task<RawMaterialDto> GetRMReportAsync(int rawMaterialId);
        //Task<RawMaterialGroupDto> GetRMGReportAsync(int rawMaterialGroupId);
        //List<SemiProduct> GetSemiProductsByRawMaterialId(int rawMaterialId);
        //Task<FoundProductsFromNetsisDto> PreNewProductFromNetsisAsync(StockDto stockDto);
        //bool CheckDbForNewProduct(StockDto stockDto);
        //bool CheckDbForSaveProduct(ProductDto productDto);
        Task<List<Product>> GetProductsWithDetailsAsync(int companyId);
        Task<List<Product>> GetProductsWithDetailsAsync(int limit, int offset, int companyId);
        Task<WebFilterResponseDto> GetAllWithDetailsWithFilterAsync(int limit, int offset, FilterCriteriaDto criteria, int companyId);
        DashboardCountDto GetDashboardCounts(int companyId);
        //Task<WebFilterResponseDto> GetAllWithDetailsForReportAsync(int companyId);

    }
}
