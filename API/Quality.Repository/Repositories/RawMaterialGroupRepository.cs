using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class RawMaterialGroupRepository(AppDbContext context) : GenericRepository<RawMaterialGroup>(context), IRawMaterialGroupRepository
    {
    }
}
