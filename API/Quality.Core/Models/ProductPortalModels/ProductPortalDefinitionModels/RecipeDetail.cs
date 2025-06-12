using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class RecipeDetail : BaseEntity
    {
        public int RecipeId { get; set; }
        public Recipe Recipe { get; set; }
        public int? SemiProductId { get; set; }
        public SemiProduct SemiProduct { get; set; }
        public int? RawMaterialId { get; set; }
        public RawMaterial RawMaterial { get; set; }
        public string PackageCode { get; set; }
        public string AuxMaterialCode { get; set; }
        public int Amount { get; set; }
        public string Unit { get; set; }
    }
}
