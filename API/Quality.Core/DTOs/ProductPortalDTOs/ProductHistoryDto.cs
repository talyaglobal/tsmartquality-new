using Quality.Core.DTOs.BaseDTOs;

namespace Quality.Core.DTOs.ProductPortalDTOs
{
    public class ProductHistoryDto : BaseDto
    {
        public int ProductId { get; set; }
        public int? ProductStatusId_Old { get; set; } // ProductStatus
        public int? ProductStatusId_New { get; set; } // ProductStatus
        public int? SellerId_Old { get; set; } // Seller
        public int? SellerId_New { get; set; } // Seller
        public string? Code_Old { get; set; }
        public string? Code_New { get; set; }
        public string? Code2_Old { get; set; }
        public string? Code2_New { get; set; }
        public string? Code3_Old { get; set; }
        public string? Code3_New { get; set; }
        public int? ProductGroupId_Old { get; set; } // ProductGroup
        public int? ProductGroupId_New { get; set; } // ProductGroup
        public string? Name_Old { get; set; }
        public string? Name_New { get; set; }
        public string? Name2_Old { get; set; }
        public string? Name2_New { get; set; }
        public int? BrandId_Old { get; set; } // Brand
        public int? BrandId_New { get; set; } // Brand
        public int? BudgetGroupId_Old { get; set; } // BudgetGroup
        public int? BudgetGroupId_New { get; set; } // BudgetGroup
        public int? SalesGroupId_Old { get; set; } // SalesGroup
        public int? SalesGroupId_New { get; set; } // SalesGroup
        public double? UnitStrainedWeight_Old { get; set; } // Netsis
        public double? UnitStrainedWeight_New { get; set; } // Netsis
        public double? BoxStrainedWeight_Old { get; set; } // Netsis
        public double? BoxStrainedWeight_New { get; set; } // Netsis
        public double? UnitNetWeight_Old { get; set; } // Netsis
        public double? UnitNetWeight_New { get; set; } // Netsis
        public double? BoxNetWeight_Old { get; set; } // Netsis
        public double? BoxNetWeight_New { get; set; } // Netsis
        public double? UnitGrossWeight_Old { get; set; } // Netsis
        public double? UnitGrossWeight_New { get; set; } // Netsis
        public double? BoxGrossWeight_Old { get; set; } // Netsis
        public double? BoxGrossWeight_New { get; set; } // Netsis
        public int? BoxQtyAt80x120Pallet_Old { get; set; } // Netsis
        public int? BoxQtyAt80x120Pallet_New { get; set; } // Netsis
        public int? BoxQtyAt100x120Pallet_Old { get; set; } // Netsis
        public int? BoxQtyAt100x120Pallet_New { get; set; } // Netsis
        public double? QtyInBox_Old { get; set; } // Netsis
        public double? QtyInBox_New { get; set; } // Netsis
        public int? HeightOf80x120Pallet_Old { get; set; }
        public int? HeightOf80x120Pallet_New { get; set; }
        public int? HeightOf100x120Pallet_Old { get; set; }
        public int? HeightOf100x120Pallet_New { get; set; }
        public string? Unit_Old { get; set; }
        public string? Unit_New { get; set; }
        public int? RawMaterialGroupId_Old { get; set; } // RawMaterialGroup
        public int? RawMaterialGroupId_New { get; set; } // RawMaterialGroup
        public int? StorageConditionId_Old { get; set; } // StorageCondition
        public int? StorageConditionId_New { get; set; } // StorageCondition
        public int? PackagingId_Old { get; set; } // Packaging
        public int? PackagingId_New { get; set; } // Packaging
        public int? ProductionPlaceId_Old { get; set; } // ProductionPlace
        public int? ProductionPlaceId_New { get; set; } // ProductionPlace
        public int? CuttingTypeId_Old { get; set; } // CuttingType
        public int? CuttingTypeId_New { get; set; } // CuttingType
        public int? QualityTypeId_Old { get; set; } // QualityType
        public int? QualityTypeId_New { get; set; } // QualityType
        public bool IsOrganic_Old { get; set; }
        public bool IsOrganic_New { get; set; }
        public int? ColorTypeId_Old { get; set; } // ColorType
        public int? ColorTypeId_New { get; set; } // ColorType
        public string? ExpireDate_Old { get; set; }
        public string? ExpireDate_New { get; set; }
        public string? NormFile_Old { get; set; }
        public string? NormFile_New { get; set; }
        public string? SpecificationFileId_Old { get; set; } // SpecificationFile
        public string? SpecificationFileId_New { get; set; } // SpecificationFile
        public string? FlowChartFileId_Old { get; set; } // FlowChartFile
        public string? FlowChartFileId_New { get; set; } // FlowChartFile
        public string? HACCPFileId_Old { get; set; } // HACCPFile
        public string? HACCPFileId_New { get; set; } // HACCPFile
        public string? LabelForm_Old { get; set; }
        public string? LabelForm_New { get; set; }
        public string? PrintedLabel_Old { get; set; }
        public string? PrintedLabel_New { get; set; }
        public int? SalesBasedId_Old { get; set; }
        public int? SalesBasedId_New { get; set; }
        public string? SpecCode_Old { get; set; }
        public string? SpecCode_New { get; set; }
        public string? HSCode_Old { get; set; }
        public string? HSCode_New { get; set; }
        public double? MaterialCostRate_Old { get; set; }
        public double? MaterialCostRate_New { get; set; }
        public double? LabourCostRate_Old { get; set; }
        public double? LabourCostRate_New { get; set; }
        public int? SemiProductGroupId_Old { get; set; }
        public int? SemiProductGroupId_New { get; set; }

        public bool IsERP1Updated { get; set; }
        public bool IsERP2Updated { get; set; }
        public bool IsERP3Updated { get; set; }
        public DateTime? ERP1UpdateTime { get; set; }
        public DateTime? ERP2UpdateTime { get; set; }
        public DateTime? ERP3UpdateTime { get; set; }
        public DateTime? LastUpdateTryTime { get; set; }
    }
}
