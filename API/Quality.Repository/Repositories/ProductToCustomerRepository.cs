using Quality.Core.Models.ProductPortalModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class ProductToCustomerRepository(AppDbContext context) : GenericRepository<ProductToCustomer>(context), IProductToCustomerRepository
    {
    }
}
