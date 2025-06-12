namespace Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs.CustomDto
{
    public class NormDetailsDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public int ProductId { get; set; }
        public ICollection<NormDetailDto> NormDetails { get; set; }
    }
}
