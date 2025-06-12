using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class Spec : BaseEntity
    {
        public string Name { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; }
        public ICollection<SpecDetail> SpecDetails { get; set; }

    }
}
