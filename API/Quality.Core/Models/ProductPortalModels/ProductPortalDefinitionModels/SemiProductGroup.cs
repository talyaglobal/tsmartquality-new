using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class SemiProductGroup : BaseEntity
    {
        public string Name { get; set; }
        public string Code { get; set; }
        public ICollection<SemiProduct> SemiProducts { get; set; }
        public ICollection<Product> Products { get; set; }
    }
}
