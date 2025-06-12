using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.StockDTOs;

namespace Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs
{
    public class RawMaterialDto : BaseDto
    {
        public string? Code { get; set; }
        public string? Code2 { get; set; }
        public string? Code3 { get; set; }
        public string Name { get; set; }
        public int RawMaterialGroupId { get; set; }
        public StockDto Stocks { get; set; }
        public List<SemiProductDto> SemiProducts { get; set; }
    }
}
