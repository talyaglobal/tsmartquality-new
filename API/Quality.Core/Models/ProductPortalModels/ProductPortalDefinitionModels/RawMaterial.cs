using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class RawMaterial : BaseEntity
    {
        public string? Code { get; set; }
        public string? Code2 { get; set; }
        public string? Code3 { get; set; }
        public string Name { get; set; }
        public int RawMaterialGroupId { get; set; }
        public RawMaterialGroup RawMaterialGroup { get; set; }
    }
}
