using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Core.DTOs.ProductPortalDTOs.FilterDTOs
{
    public class ProductListFilterDto
    {
        public int? ProductGroupTypeId { get; set; }
        public int? ProductGroupTypeDefinitionId { get; set; }
        public int? SellerId { get; set; }
        public int? BrandId { get; set; }
        public int? ProductGroupId { get; set; }
        public int? StorageConditionId { get; set; }
        public int? ProductTypeId { get; set; }
        public int? SKUFollowTypeId { get; set; }
        public int? SKUFollowUnitId { get; set; }
        public int? Limit { get; set; }
        public int? Offset { get; set; }
        public string? CodeOrName { get; set; }

    }
}
