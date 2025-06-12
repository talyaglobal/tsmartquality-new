using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Quality.Repository.Configurations
{
    public class ProductToProductGroupTypeDefinitionConfiguration : IEntityTypeConfiguration<ProductToProductGroupTypeDefinition>
    {
        public void Configure(EntityTypeBuilder<ProductToProductGroupTypeDefinition> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(x => x.Id).UseIdentityColumn();
            builder.Property(x => x.Status).HasDefaultValue(true);
            builder.HasQueryFilter(x => x.Status);

            builder
               .HasOne(x => x.Product)
               .WithMany(x => x.ProductToProductGroupTypeDefinitions)
               .HasForeignKey(x => x.ProductId)
               .OnDelete(DeleteBehavior.NoAction);

            builder
                .HasOne(x => x.ProductGroupTypeDefinition)
                .WithMany(x => x.ProductToProductGroupTypeDefinitions)
                .HasForeignKey(x => x.ProductGroupTypeDefinitionId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
