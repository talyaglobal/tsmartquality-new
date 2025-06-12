using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class ProductTypeRepository(AppDbContext context) : GenericRepository<ProductType>(context), IProductTypeRepository
    {
    }
}
