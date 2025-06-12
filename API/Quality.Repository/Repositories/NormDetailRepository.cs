using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class NormDetailRepository(AppDbContext context) : GenericRepository<NormDetail>(context), INormDetailRepository
    {
    }
}
