using Quality.Core.DTOs.BaseDTOs;

namespace Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs
{
    public class SpecDto : BaseDto
    {
        public string Name { get; set; }
        public int ProductId { get; set; }
        public ICollection<SpecDetailDto>? SpecDetails { get; set; }
    }
}
