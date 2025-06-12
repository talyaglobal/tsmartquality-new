namespace Quality.Core.DTOs.ProductPortalDTOs.StockDTOs
{
    public class RmReportDto
    {
        public StockDto RmStock { get; set; }
        public List<SpReportDto> SemiProductStocks { get; set; }
    }
}
