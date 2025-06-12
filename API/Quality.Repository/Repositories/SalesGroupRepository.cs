using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class SalesGroupRepository(AppDbContext context) : GenericRepository<SalesGroup>(context), ISalesGroupRepository
    {
    }
}
