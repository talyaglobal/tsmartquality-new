using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class ProductToProductGroupTypeDefinition : BaseEntity
    {
        public int ProductId { get; set; }
        public int ProductGroupTypeDefinitionId { get; set; }
        public int ProductGroupTypeId { get; set; }

        public Product Product { get; set; }
        public ProductGroupTypeDefinition ProductGroupTypeDefinition { get; set; }
        public ProductGroupType ProductGroupType { get; set; }
    }
}
