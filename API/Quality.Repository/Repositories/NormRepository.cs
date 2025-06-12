using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class NormRepository(AppDbContext context) : GenericRepository<Norm>(context), INormRepository
    {
    }
}
