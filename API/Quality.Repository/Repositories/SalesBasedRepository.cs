using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class SalesBasedRepository(AppDbContext context) : GenericRepository<SalesBased>(context), ISalesBasedRepository
    {
    }
}
