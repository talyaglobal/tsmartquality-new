using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Quality.Repository.Configurations
{
    public class NotificationTokenConfiguration : IEntityTypeConfiguration<NotificationToken>
    {
        public void Configure(EntityTypeBuilder<NotificationToken> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(x => x.Id).UseIdentityColumn();
            builder.Property(x => x.Status).HasDefaultValue(true);
            builder.HasQueryFilter(x => x.Status);

        }
    }
}
