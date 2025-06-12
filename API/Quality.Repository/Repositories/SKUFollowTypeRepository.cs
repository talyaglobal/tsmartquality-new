using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class SKUFollowTypeRepository(AppDbContext context) : GenericRepository<SKUFollowType>(context), ISKUFollowTypeRepository
    {
    }
}
