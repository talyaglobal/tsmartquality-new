using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class ProductGroupRepository(AppDbContext context) : GenericRepository<ProductGroup>(context), IProductGroupRepository
    {
    }
}
