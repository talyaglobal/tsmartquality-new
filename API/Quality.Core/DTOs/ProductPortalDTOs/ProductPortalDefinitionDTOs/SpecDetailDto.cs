using Quality.Core.DTOs.BaseDTOs;

namespace Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs
{
    public class SpecDetailDto : BaseDto
    {
        public int SpecId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
    }
}
