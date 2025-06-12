namespace Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs.ProductPortalDefinitionUpdateDtos
{
    public class RecipeDetailUpdateDto
    {
        public int Id { get; set; }
        public int RecipeId { get; set; }
        public string? SemiProductId { get; set; }
        public string? RawMaterialId { get; set; }
        public string PackageCode { get; set; }
        public string AuxMaterialCode { get; set; }
        public int Amount { get; set; }
        public string Unit { get; set; }
    }
}
