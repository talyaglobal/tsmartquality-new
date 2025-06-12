using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Quality.Repository.Configurations
{
    public class ProductGroupTypeDefinitionConfiguration : IEntityTypeConfiguration<ProductGroupTypeDefinition>
    {
        public void Configure(EntityTypeBuilder<ProductGroupTypeDefinition> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(x => x.Id).UseIdentityColumn();
            builder.Property(x => x.Status).HasDefaultValue(true);
            builder.HasQueryFilter(x => x.Status);

            builder.Property(x => x.Name).HasMaxLength(256).IsRequired();
        }
    }
}
