using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class SemiProductGroupRepository(AppDbContext context) : GenericRepository<SemiProductGroup>(context), ISemiProductGroupRepository
    {
    }
}
