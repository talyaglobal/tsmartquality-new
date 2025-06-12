using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class SemiProductGroupService(IGenericRepository<SemiProductGroup> repository, IUnitOfWork unitOfWork, IMapper mapper, ISemiProductGroupRepository semiProductGroupRepository, ICustomUpdateService<SemiProductGroup> customUpdateService) : Service<SemiProductGroup>(repository, unitOfWork), ISemiProductGroupService
    {
        private readonly ISemiProductGroupRepository _semiProductGroupRepository = semiProductGroupRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<SemiProductGroup> _customUpdateService = customUpdateService;

        public override async Task<SemiProductGroup> AddAsync(SemiProductGroup semiProductGroup)
        {
            semiProductGroup.CreatedDate = DateTime.UtcNow;
            semiProductGroup.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(semiProductGroup);
        }

        public override async Task ChangeStatusAsync(SemiProductGroup semiProductGroup)
        {
            var current = await _semiProductGroupRepository.GetByIdAsync(semiProductGroup.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = semiProductGroup.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(SemiProductGroup semiProductGroup)
        {
            var current = await _semiProductGroupRepository.GetByIdAsync(semiProductGroup.Id);

            SemiProductGroup last = _customUpdateService.Check(current, semiProductGroup);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = semiProductGroup.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
