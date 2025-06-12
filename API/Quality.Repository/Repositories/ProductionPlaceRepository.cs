using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class ProductionPlaceRepository(AppDbContext context) : GenericRepository<ProductionPlace>(context), IProductionPlaceRepository
    {
    }
}
