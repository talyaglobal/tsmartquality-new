using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.StockDTOs;

namespace Quality.Core.DTOs.ProductPortalDTOs
{
    public class ProductDtoForStockReports : BaseDto
    {
        public string? Name { get; set; }
        public string? Code { get; set; }
        public string? Code2 { get; set; }
        public string? Code3 { get; set; }
        public StockDto Stock { get; set; }

    }
}
