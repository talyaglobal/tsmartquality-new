using Quality.Core.Models.ProductPortalModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class ProductRepository(AppDbContext context) : GenericRepository<Product>(context), IProductRepository
    {
    }
}
