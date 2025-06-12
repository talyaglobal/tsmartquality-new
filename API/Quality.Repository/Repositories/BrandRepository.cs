using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class BrandRepository(AppDbContext context) : GenericRepository<Brand>(context), IBrandRepository
    {
    }
}
