using Quality.Core.DTOs.BaseDTOs;

namespace Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs
{
    public class NormDto : BaseDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; }
        public ICollection<NormDetailDto>? NormDetails { get; set; }
    }
}
