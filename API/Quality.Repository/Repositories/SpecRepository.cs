using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class SpecRepository(AppDbContext context) : GenericRepository<Spec>(context), ISpecRepository
    {
    }
}
