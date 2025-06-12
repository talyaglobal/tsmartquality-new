using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.StockDTOs;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Core.DTOs.ProductPortalDTOs
{
    public class ProductsWithDetailsDto : BaseDto
    {
        #region General Informations
        public int? SellerId { get; set; }
        public string? Code { get; set; }
        public int? ProductGroupId { get; set; }
        public string? Name { get; set; }
        public int? BrandId { get; set; }
        public int? ProductTypeId { get; set; }
        public int? SKUFollowTypeId { get; set; }
        public int? SKUFollowUnitId { get; set; }
        public int? StorageConditionId { get; set; }
        public double? Weight { get; set; }
        public double? Volume { get; set; }
        public double? Density { get; set; }
        public double? Width { get; set; }
        public double? Length { get; set; }
        public double? Height { get; set; }
        public double? CriticalStockAmount { get; set; }
        public double? ShelflifeLimit { get; set; }
        public int? MaxStack { get; set; }
        public bool? StockTracking { get; set; }
        public bool? BBDTracking { get; set; }
        public bool? LotTracking { get; set; }
        public bool? IsBlocked { get; set; }
        public bool? IsSettedProduct { get; set; }

        #endregion

        #region GetWithDetails
        public string? CreatedByName { get; set; }
        public string? UpdatedByName { get; set; }
        public DateTime UpdatedDate { get; set; }
        public SellerDto? Seller { get; set; }
        public ProductGroupDto? ProductGroup { get; set; }
        public ProductTypeDto? ProductType { get; set; }
        public BrandDto? Brand { get; set; }
        public SKUFollowTypeDto? SKUFollowType { get; set; }
        public SKUFollowUnitDto? SKUFollowUnit { get; set; }
        public StorageConditionDto? StorageCondition { get; set; }
        public ICollection<ProductToProductGroupTypeDefinitionDto>? ProductToProductGroupTypeDefinitions { get; set; }
        public List<String>? Photos { get; set; }

        #endregion
    }
}
