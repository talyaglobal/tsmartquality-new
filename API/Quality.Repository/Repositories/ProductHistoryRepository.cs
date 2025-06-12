using Quality.Core.Models.ProductModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class ProductHistoryRepository(AppDbContext context) : GenericRepository<ProductHistory>(context), IProductHistoryRepository
    {
    }
}
