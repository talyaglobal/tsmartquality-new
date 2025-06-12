using AutoMapper;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;
using Microsoft.EntityFrameworkCore;

namespace Quality.Service.Services
{
    public class NotificationTokenService(IGenericRepository<NotificationToken> repository, IUnitOfWork unitOfWork, IMapper mapper, INotificationTokenRepository notificationTokenRepository, ICustomUpdateService<NotificationToken> customUpdateService) : Service<NotificationToken>(repository, unitOfWork), INotificationTokenService
    {
        private readonly INotificationTokenRepository _notificationTokenRepository = notificationTokenRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<NotificationToken> _customUpdateService = customUpdateService;

        public override async Task<NotificationToken> AddAsync(NotificationToken notificationToken)
        {
            notificationToken.CreatedDate = DateTime.UtcNow;
            notificationToken.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(notificationToken);
        }

        public override async Task ChangeStatusAsync(NotificationToken notificationToken)
        {
            var current = await _notificationTokenRepository.GetByIdAsync(notificationToken.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = notificationToken.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(NotificationToken notificationToken)
        {
            var current = await _notificationTokenRepository.GetByIdAsync(notificationToken.Id);

            NotificationToken last = _customUpdateService.Check(current, notificationToken);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = notificationToken.UpdatedBy;

            await base.UpdateAsync(last);
        }

        public async Task SaveOrUpdateNotificationToken(int? userId, string accessToken)
        {
            var existingToken = await GetByUserIdAsync(userId.Value);

            if (existingToken != null)
            {
                existingToken.Token = accessToken;
                existingToken.UpdatedDate = DateTime.UtcNow;
                await UpdateAsync(existingToken);
            }
            else
            {
                var newToken = new NotificationToken
                {
                    UserId = userId.Value,
                    Token = accessToken,
                    CreatedDate = DateTime.UtcNow
                };
                await AddAsync(newToken);
            }
        }

        public async Task<NotificationToken> GetByUserIdAsync(int userId)
        {
            return await _notificationTokenRepository.Where(x => x.UserId == userId)
                .FirstOrDefaultAsync();
        }

    }
}
