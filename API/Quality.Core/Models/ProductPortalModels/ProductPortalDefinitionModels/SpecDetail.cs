using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class SpecDetail : BaseEntity
    {
        public int SpecId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public Spec Spec { get; set; }
    }
}
