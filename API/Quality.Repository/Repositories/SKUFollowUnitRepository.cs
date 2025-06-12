using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class SKUFollowUnitRepository(AppDbContext context) : GenericRepository<SKUFollowUnit>(context), ISKUFollowUnitRepository
    {
    }
}
