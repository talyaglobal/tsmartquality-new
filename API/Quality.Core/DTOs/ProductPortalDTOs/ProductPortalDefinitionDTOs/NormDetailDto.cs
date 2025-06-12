using Quality.Core.DTOs.BaseDTOs;

namespace Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs
{
    public class NormDetailDto : BaseDto
    {
        public int NormId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
    }
}
