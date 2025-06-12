using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class StorageConditionRepository(AppDbContext context) : GenericRepository<StorageCondition>(context), IStorageConditionRepository
    {
    }
}
