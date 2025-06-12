namespace Quality.Core.DTOs.ProductPortalDTOs.FilterDTOs
{
    public class FilterCriteriaDto
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string Name2 { get; set; }
        public List<string> Seller { get; set; } = new List<string>();
        public List<string> Brand { get; set; } = new List<string>();
        public List<string> BudgetGroup { get; set; } = new List<string>();
        public List<string> SalesGroup { get; set; } = new List<string>();
        public List<string> ProductionPlace { get; set; } = new List<string>();
        public List<string> RawMaterialGroup { get; set; } = new List<string>();
        public List<string> Packaging { get; set; } = new List<string>();
        public List<string> StorageCondition { get; set; } = new List<string>();
        public List<string> SalesBased { get; set; } = new List<string>();
        public List<string> CuttingType { get; set; } = new List<string>();
        public List<string> QualityType { get; set; } = new List<string>();
        public List<string> ColorType { get; set; } = new List<string>();
        public List<string> ProductStatus { get; set; } = new List<string>();
        public List<string> ProductGroup { get; set; } = new List<string>();
        public List<string> SemiProductGroup { get; set; } = new List<string>();
        public List<string> ProductGroupTypeDefinition { get; set; } = new List<string>();
        public List<string> CreatedBy { get; set; } = new List<string>();
        public List<string> UpdatedBy { get; set; } = new List<string>();

        public string OrderBy { get; set; }
        public string OrderType { get; set; }
    }

}
