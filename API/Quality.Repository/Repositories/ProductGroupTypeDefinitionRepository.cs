using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class ProductGroupTypeDefinitionRepository(AppDbContext context) : GenericRepository<ProductGroupTypeDefinition>(context), IProductGroupTypeDefinitionRepository
    {
    }
}
