using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class SemiProductRepository(AppDbContext context) : GenericRepository<SemiProduct>(context), ISemiProductRepository
    {
    }
}
