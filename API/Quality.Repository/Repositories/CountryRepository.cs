using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class CountryRepository(AppDbContext context) : GenericRepository<Country>(context), ICountryRepository
    {
    }
}
