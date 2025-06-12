using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;

namespace Quality.Core.DTOs.ProductPortalDTOs.FilterDTOs
{
    public class FilterItemsDto
    {
        public List<ProductGroupTypeDto>? ProductGroupTypes { get; set; }
        public List<SellerDto>? Sellers { get; set; }
        public List<BrandDto>? Brands { get; set; }
        public List<ProductGroupDto>? ProductGroups { get; set; }
        public List<StorageConditionDto>? StorageConditions { get; set; }
        public List<ProductTypeDto>? ProductTypes { get; set; }
        public List<SKUFollowTypeDto>? SKUFollowTypes { get; set; }
        public List<SKUFollowUnitDto>? SKUFollowUnits { get; set; }
    }
}
