using Quality.Core.Models.BaseModels.DefinitionModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Quality.Repository.Configurations
{
    public class PhotoTypeConfiguration : IEntityTypeConfiguration<PhotoType>
    {
        public void Configure(EntityTypeBuilder<PhotoType> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(x => x.Id).UseIdentityColumn();
            builder.Property(x => x.Status).HasDefaultValue(true);
            builder.HasQueryFilter(x => x.Status);

            builder.Property(x => x.Name).HasMaxLength(256).IsRequired();
        }
    }
}
