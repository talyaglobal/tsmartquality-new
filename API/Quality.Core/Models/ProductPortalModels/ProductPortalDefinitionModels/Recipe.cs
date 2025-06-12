using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class Recipe : BaseEntity
    {
        public int? ProductId { get; set; }
        public int? SemiProductId { get; set; }
        public string Name { get; set; }

        public Product Product { get; set; }
        public SemiProduct SemiProduct { get; set; }
        public ICollection<RecipeDetail> RecipeDetails { get; set; }
    }
}
