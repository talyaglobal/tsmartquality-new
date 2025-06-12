using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class RawMaterialRepository(AppDbContext context) : GenericRepository<RawMaterial>(context), IRawMaterialRepository
    {
    }
}
