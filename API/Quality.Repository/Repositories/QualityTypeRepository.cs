using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class QualityTypeRepository(AppDbContext context) : GenericRepository<QualityType>(context), IQualityTypeRepository
    {
    }
}
