using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs
{
    public class RecipeDetailDto : BaseDto
    {
        public int RecipeId { get; set; }
        public string? SemiProductId { get; set; }
        public string? RawMaterialId { get; set; }
        public string? PackageCode { get; set; }
        public string? AuxMaterialCode { get; set; }
        public int Amount { get; set; }
        public string? Unit { get; set; }
        public ICollection<RawMaterial>? RawMaterials { get; set; }
        public ICollection<SemiProduct>? SemiProducts { get; set; }
    }
}
