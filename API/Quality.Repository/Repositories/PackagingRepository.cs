using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class PackagingRepository(AppDbContext context) : GenericRepository<Packaging>(context), IPackagingRepository
    {
    }
}
