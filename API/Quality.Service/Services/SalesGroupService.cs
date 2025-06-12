using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class SalesGroupService(IGenericRepository<SalesGroup> repository, IUnitOfWork unitOfWork, IMapper mapper, ISalesGroupRepository salesGroupRepository, ICustomUpdateService<SalesGroup> customUpdateService) : Service<SalesGroup>(repository, unitOfWork), ISalesGroupService
    {
        private readonly ISalesGroupRepository _salesGroupRepository = salesGroupRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<SalesGroup> _customUpdateService = customUpdateService;
        public override async Task<SalesGroup> AddAsync(SalesGroup salesGroup)
        {
            salesGroup.CreatedDate = DateTime.UtcNow;
            salesGroup.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(salesGroup);
        }

        public override async Task ChangeStatusAsync(SalesGroup salesGroup)
        {
            var current = await _salesGroupRepository.GetByIdAsync(salesGroup.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = salesGroup.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(SalesGroup salesGroup)
        {
            var current = await _salesGroupRepository.GetByIdAsync(salesGroup.Id);

            SalesGroup last = _customUpdateService.Check(current, salesGroup);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = salesGroup.UpdatedBy;

            await base.UpdateAsync(last);
        }

    }
}
