using Quality.Core.DTOs.BaseDTOs;

namespace Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs
{
    public class ProductGroupTypeDto : BaseDto
    {
        public string Name { get; set; }
        public List<ProductGroupTypeDefinitionDto>? ProductGroupTypeDefinitions { get; set; }
    }
}
