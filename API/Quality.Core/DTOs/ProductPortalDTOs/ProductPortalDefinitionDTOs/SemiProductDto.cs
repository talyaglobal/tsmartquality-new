using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.StockDTOs;

namespace Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs
{
    public class SemiProductDto : BaseDto
    {
        public string? OldCode { get; set; }

        public string? Code { get; set; }
        public string? Code2 { get; set; }
        public string? Code3 { get; set; }
        public string Name { get; set; }

        public string? SemiProductGroupName { get; set; }
        public StockDto? Stocks { get; set; }
        public List<ProductDto>? Products { get; set; }
        public List<ProductsWithDetailsDto>? ProductWithDetails { get; set; }
    }
}
