using Quality.Core.DTOs.ProductDTOs;

namespace Quality.Core.DTOs.ProductPortalDTOs.FilterDTOs
{
    public class WebFilterResponseDto
    {
        public List<ProductsWithDetailsDto> ProductsWithDetails { get; set; }
        public List<ProductDto> Products { get; set; }
        public int RowCount { get; set; }
    }
}
