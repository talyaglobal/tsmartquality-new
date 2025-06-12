using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class ProductGroupTypeRepository(AppDbContext context) : GenericRepository<ProductGroupType>(context), IProductGroupTypeRepository
    {
    }
}
