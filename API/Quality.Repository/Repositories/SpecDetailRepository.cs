using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class SpecDetailRepository(AppDbContext context) : GenericRepository<SpecDetail>(context), ISpecDetailRepository
    {
    }
}
