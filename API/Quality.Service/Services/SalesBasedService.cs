using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class SalesBasedService(IGenericRepository<SalesBased> repository, IUnitOfWork unitOfWork, IMapper mapper, ISalesBasedRepository salesBasedRepository, ICustomUpdateService<SalesBased> customUpdateService) : Service<SalesBased>(repository, unitOfWork), ISalesBasedService
    {
        private readonly ISalesBasedRepository _salesBasedRepository = salesBasedRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<SalesBased> _customUpdateService = customUpdateService;

        public override async Task<SalesBased> AddAsync(SalesBased salesBased)
        {
            salesBased.CreatedDate = DateTime.UtcNow;
            salesBased.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(salesBased);
        }

        public override async Task ChangeStatusAsync(SalesBased salesBased)
        {
            var current = await _salesBasedRepository.GetByIdAsync(salesBased.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = salesBased.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(SalesBased salesBased)
        {
            var current = await _salesBasedRepository.GetByIdAsync(salesBased.Id);

            SalesBased last = _customUpdateService.Check(current, salesBased);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = salesBased.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
