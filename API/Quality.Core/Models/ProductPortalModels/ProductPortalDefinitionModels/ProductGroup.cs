using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class ProductGroup : BaseEntity
    {
        public string Name { get; set; }
        public ICollection<Product> Products { get; set; }
    }
}
