using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class ProductStatusRepository(AppDbContext context) : GenericRepository<ProductStatus>(context), IProductStatusRepository
    {
    }
}
