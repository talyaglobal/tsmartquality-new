namespace Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs.ProductPortalDefinitionUpdateDtos
{
    public class RecipeUpdateDto
    {
        public int Id { get; set; }
        public int? ProductId { get; set; }
        public int? SemiProductId { get; set; }
        public string Name { get; set; }
    }
}
