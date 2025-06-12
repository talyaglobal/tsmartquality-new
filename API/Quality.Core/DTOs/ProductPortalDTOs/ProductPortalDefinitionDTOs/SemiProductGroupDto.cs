using Quality.Core.DTOs.BaseDTOs;

namespace Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs
{
    public class SemiProductGroupDto : BaseDto
    {
        public string Name { get; set; }
        public string Code { get; set; }
        public int? TotalStock { get; set; }

        public List<SemiProductDto> SemiProducts { get; set; }
    }
}
