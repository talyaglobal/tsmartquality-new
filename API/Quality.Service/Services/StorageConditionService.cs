using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class StorageConditionService(IGenericRepository<StorageCondition> repository, IUnitOfWork unitOfWork, IMapper mapper, IStorageConditionRepository storageConditionRepository, ICustomUpdateService<StorageCondition> customUpdateService) : Service<StorageCondition>(repository, unitOfWork), IStorageConditionService
    {
        private readonly IStorageConditionRepository _storageConditionRepository = storageConditionRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<StorageCondition> _customUpdateService = customUpdateService;

        public override async Task<StorageCondition> AddAsync(StorageCondition storageCondition)
        {
            storageCondition.CreatedDate = DateTime.UtcNow;
            storageCondition.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(storageCondition);
        }

        public override async Task ChangeStatusAsync(StorageCondition storageCondition)
        {
            var current = await _storageConditionRepository.GetByIdAsync(storageCondition.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = storageCondition.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(StorageCondition storageCondition)
        {
            var current = await _storageConditionRepository.GetByIdAsync(storageCondition.Id);

            StorageCondition last = _customUpdateService.Check(current, storageCondition);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = storageCondition.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
