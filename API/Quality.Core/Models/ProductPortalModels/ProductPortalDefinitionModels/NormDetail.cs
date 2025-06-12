using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class NormDetail : BaseEntity
    {
        public int NormId { get; set; }
        public Norm Norm { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
    }
}
