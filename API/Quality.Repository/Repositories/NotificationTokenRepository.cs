using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class NotificationTokenRepository(AppDbContext context) : GenericRepository<NotificationToken>(context), INotificationTokenRepository
    {
    }
}
