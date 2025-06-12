using Quality.Core.Models.BaseModels;

namespace Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels
{
    public class SemiProduct : BaseEntity
    {
        public string? OldCode { get; set; }
        public string? Code { get; set; }
        public string? Code2 { get; set; }
        public string? Code3 { get; set; }
        public string Name { get; set; }
        public ICollection<RecipeDetail> RecipeDetails { get; set; }
        public ICollection<Recipe> Recipes { get; set; }

    }
}
