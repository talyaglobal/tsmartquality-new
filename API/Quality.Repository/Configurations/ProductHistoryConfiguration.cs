using Quality.Core.Models.ProductModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Quality.Repository.Configurations
{
    public class ProductHistoryConfiguration : IEntityTypeConfiguration<ProductHistory>
    {
        public void Configure(EntityTypeBuilder<ProductHistory> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(x => x.Id).UseIdentityColumn();
            builder.Property(x => x.Status).HasDefaultValue(true);
            builder.HasQueryFilter(x => x.Status);

            // Old relationships
            builder.HasOne(ph => ph.ProductStatus)
                .WithMany()
                .HasForeignKey(ph => ph.ProductStatusId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.Seller)
                .WithMany()
                .HasForeignKey(ph => ph.SellerId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.ProductGroup)
                .WithMany()
                .HasForeignKey(ph => ph.ProductGroupId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.Brand)
                .WithMany()
                .HasForeignKey(ph => ph.BrandId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.BudgetGroup)
                .WithMany()
                .HasForeignKey(ph => ph.BudgetGroupId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.SalesGroup)
                .WithMany()
                .HasForeignKey(ph => ph.SalesGroupId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.RawMaterialGroup)
                .WithMany()
                .HasForeignKey(ph => ph.RawMaterialGroupId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.StorageCondition)
                .WithMany()
                .HasForeignKey(ph => ph.StorageConditionId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.Packaging)
                .WithMany()
                .HasForeignKey(ph => ph.PackagingId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.ProductionPlace)
                .WithMany()
                .HasForeignKey(ph => ph.ProductionPlaceId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.CuttingType)
                .WithMany()
                .HasForeignKey(ph => ph.CuttingTypeId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.QualityType)
                .WithMany()
                .HasForeignKey(ph => ph.QualityTypeId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.ColorType)
                .WithMany()
                .HasForeignKey(ph => ph.ColorTypeId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.SalesBased)
                .WithMany()
                .HasForeignKey(ph => ph.SalesBasedId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.SemiProductGroup)
                .WithMany()
                .HasForeignKey(ph => ph.SemiProductGroupId_Old)
                .OnDelete(DeleteBehavior.NoAction);

            // New relationships
            builder.HasOne(ph => ph.ProductStatus)
                .WithMany()
                .HasForeignKey(ph => ph.ProductStatusId_New)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.Seller)
                .WithMany()
                .HasForeignKey(ph => ph.SellerId_New)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.ProductGroup)
                .WithMany()
                .HasForeignKey(ph => ph.ProductGroupId_New)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.Brand)
                .WithMany()
                .HasForeignKey(ph => ph.BrandId_New)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.BudgetGroup)
                .WithMany()
                .HasForeignKey(ph => ph.BudgetGroupId_New)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.SalesGroup)
                .WithMany()
                .HasForeignKey(ph => ph.SalesGroupId_New)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.RawMaterialGroup)
                .WithMany()
                .HasForeignKey(ph => ph.RawMaterialGroupId_New)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.StorageCondition)
                .WithMany()
                .HasForeignKey(ph => ph.StorageConditionId_New)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.Packaging)
                .WithMany()
                .HasForeignKey(ph => ph.PackagingId_New)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.ProductionPlace)
                .WithMany()
                .HasForeignKey(ph => ph.ProductionPlaceId_New)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.CuttingType)
                .WithMany()
                .HasForeignKey(ph => ph.CuttingTypeId_New)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.QualityType)
                .WithMany()
                .HasForeignKey(ph => ph.QualityTypeId_New)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.ColorType)
                .WithMany()
                .HasForeignKey(ph => ph.ColorTypeId_New)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.SalesBased)
                .WithMany()
                .HasForeignKey(ph => ph.SalesBasedId_New)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ph => ph.SemiProductGroup)
                .WithMany()
                .HasForeignKey(ph => ph.SemiProductGroupId_New)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
