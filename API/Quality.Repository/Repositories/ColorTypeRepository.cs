using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class ColorTypeRepository(AppDbContext context) : GenericRepository<ColorType>(context), IColorTypeRepository
    {
    }
}
