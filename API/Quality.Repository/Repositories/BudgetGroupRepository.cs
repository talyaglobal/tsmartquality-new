using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class BudgetGroupRepository(AppDbContext context) : GenericRepository<BudgetGroup>(context), IBudgetGroupRepository
    {
    }
}
