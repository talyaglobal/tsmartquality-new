using Quality.Core.DTOs.BaseDTOs;

namespace Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs
{
    public class RecipeDto : BaseDto
    {
        public int? ProductId { get; set; }
        public int? SemiProductId { get; set; }
        public string Name { get; set; }
        public SemiProductDto? SemiProduct { get; set; }
        public ICollection<RecipeDetailDto>? RecipeDetails { get; set; }
    }
}
