using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class ProductToProductGroupTypeDefinitionRepository(AppDbContext context) : GenericRepository<ProductToProductGroupTypeDefinition>(context), IProductToProductGroupTypeDefinitionRepository
    {
    }
}
