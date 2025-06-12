namespace Quality.Core.DTOs.ProductPortalDTOs.StockDTOs
{
    public class StockDto
    {
        public int? ProductId { get; set; }
        public int? SemiProductId { get; set; }
        public string? Code1 { get; set; }
        public string? Code2 { get; set; }
        public string? Code3 { get; set; }
        public int? Code1Stock { get; set; }
        public int? Code2Stock { get; set; }
        public int? Code3Stock { get; set; }
        public int? TotalStock { get; set; } // Code1 + Code2 + Code3
        public double? TotalStockInBox { get; set; } // Product için totalStock*qtyInBox
        public int? TotalProductStock { get; set; } // SemiProduct için productKoliAdet
        public int? TotalProductStockInBox { get; set; } // SemiProduct için productKoliAdet * qtyInBox
        public int? GrandTotalInBox { get; set; } // SemiProduct için TotalStockInBox + TotalProductStockInBox
    }
}
