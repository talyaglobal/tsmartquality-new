using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class Norm : BaseEntity
    {
        public int ProductId { get; set; }
        public string Name { get; set; }

        public Product Product { get; set; }
        public ICollection<NormDetail> NormDetails { get; set; }
    }
}
