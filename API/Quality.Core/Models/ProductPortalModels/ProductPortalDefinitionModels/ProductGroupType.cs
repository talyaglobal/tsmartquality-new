using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class ProductGroupType : BaseEntity
    {
        public string Name { get; set; }
        public ICollection<ProductGroupTypeDefinition> ProductGroupTypeDefinitions { get; set; }
        public ICollection<ProductToProductGroupTypeDefinition> ProductToProductGroupTypeDefinitions { get; set; }

    }
}
