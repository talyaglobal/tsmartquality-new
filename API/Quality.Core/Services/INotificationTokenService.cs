using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Core.Services
{
    public interface INotificationTokenService : IService<NotificationToken>
    {
        Task SaveOrUpdateNotificationToken(int? userId, string accessToken);
        Task<NotificationToken> GetByUserIdAsync(int userId);

    }
}
