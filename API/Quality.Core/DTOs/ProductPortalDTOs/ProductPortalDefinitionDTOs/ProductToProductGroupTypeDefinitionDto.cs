using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs
{
    public class ProductToProductGroupTypeDefinitionDto : BaseDto
    {
        public int ProductId { get; set; }
        public int ProductGroupTypeDefinitionId { get; set; }
        public int ProductGroupTypeId { get; set; }

        public ProductGroupTypeDefinitionDto? ProductGroupTypeDefinition { get; set; }
        public ProductGroupTypeDto? ProductGroupType { get; set; }
    }
}
