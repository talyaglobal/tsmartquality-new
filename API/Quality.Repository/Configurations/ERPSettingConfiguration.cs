using Quality.Core.Models.BaseModels.DefinitionModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Quality.Repository.Configurations
{
    public class ERPSettingConfiguration : IEntityTypeConfiguration<ERPSetting>
    {
        public void Configure(EntityTypeBuilder<ERPSetting> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(x => x.Id).UseIdentityColumn();
            builder.Property(x => x.Status).HasDefaultValue(true);
            builder.HasQueryFilter(x => x.Status);

        }
    }
}
