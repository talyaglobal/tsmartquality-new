using Quality.Core.Models.BaseModels;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Core.Models.ProductPortalModels
{
    public class ProductToCustomer : BaseEntity
    {
        public int ProductId { get; set; }
        public int CustomerId { get; set; }

        public Product Product { get; set; }
        public Customer Customer { get; set; }
    }
}
