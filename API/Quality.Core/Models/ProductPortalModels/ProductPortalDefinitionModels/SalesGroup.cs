using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class SalesGroup : BaseEntity
    {
        public string Name { get; set; }
        public string Code { get; set; }

        public ICollection<Product> Products { get; set; }
    }
}
