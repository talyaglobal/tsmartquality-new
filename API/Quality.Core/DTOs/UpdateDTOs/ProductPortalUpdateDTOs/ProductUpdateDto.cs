using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs
{
    public class ProductUpdateDto
    {
        public int Id { get; set; }
        public int? SellerId { get; set; }
        public Seller? Seller { get; set; }
        public string? Code { get; set; }
        public int? ProductGroupId { get; set; }
        public ProductGroup? ProductGroup { get; set; }
        public string? Name { get; set; }
        public int? BrandId { get; set; }
        public Brand? Brand { get; set; }
        public int? ProductTypeId { get; set; }
        public ProductType? ProductType { get; set; }
        public int? SKUFollowTypeId { get; set; }
        public SKUFollowType? SKUFollowType { get; set; }
        public int? SKUFollowUnitId { get; set; }
        public SKUFollowUnit? SKUFollowUnit { get; set; }
        public int? StorageConditionId { get; set; }
        public StorageCondition? StorageCondition { get; set; }
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

        public ICollection<ProductToProductGroupTypeDefinitionDto>? ProductToProductGroupTypeDefinitions { get; set; }
    }
}
