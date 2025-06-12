using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class ProductGroupTypeDefinition : BaseEntity
    {
        public int ProductGroupTypeId { get; set; }
        public string Name { get; set; }

        public ProductGroupType ProductGroupType { get; set; }
        public ICollection<ProductToProductGroupTypeDefinition> ProductToProductGroupTypeDefinitions { get; set; }

    }
}
