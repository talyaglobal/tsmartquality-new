namespace Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs.CustomDto
{
    public class RecipeDetailsDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public int ProductId { get; set; }
        public ICollection<RecipeDetailDto> RecipeDetails { get; set; }
    }
}
