using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class CuttingTypeRepository(AppDbContext context) : GenericRepository<CuttingType>(context), ICuttingTypeRepository
    {
    }
}
