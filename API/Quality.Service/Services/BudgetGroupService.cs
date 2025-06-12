using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class BudgetGroupService(IGenericRepository<BudgetGroup> repository, IUnitOfWork unitOfWork, IMapper mapper, IBudgetGroupRepository budgetGroupRepository, ICustomUpdateService<BudgetGroup> customUpdateService) : Service<BudgetGroup>(repository, unitOfWork), IBudgetGroupService
    {
        private readonly IBudgetGroupRepository _budgetGroupRepository = budgetGroupRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<BudgetGroup> _customUpdateService = customUpdateService;

        public override async Task<BudgetGroup> AddAsync(BudgetGroup budgetGroup)
        {
            budgetGroup.CreatedDate = DateTime.UtcNow;
            budgetGroup.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(budgetGroup);
        }

        public override async Task ChangeStatusAsync(BudgetGroup budgetGroup)
        {
            var current = await _budgetGroupRepository.GetByIdAsync(budgetGroup.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = budgetGroup.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(BudgetGroup budgetGroup)
        {
            var current = await _budgetGroupRepository.GetByIdAsync(budgetGroup.Id);

            BudgetGroup last = _customUpdateService.Check(current, budgetGroup);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = budgetGroup.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
