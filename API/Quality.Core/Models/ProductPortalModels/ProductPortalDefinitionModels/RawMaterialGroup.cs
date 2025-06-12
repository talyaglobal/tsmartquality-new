using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class RawMaterialGroup : BaseEntity
    {
        public string Name { get; set; }
        public string Code { get; set; }

        public ICollection<RawMaterial> RawMaterials { get; set; }
    }
}
