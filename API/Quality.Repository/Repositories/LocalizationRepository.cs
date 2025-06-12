using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class LocalizationRepository(AppDbContext context) : GenericRepository<Localization>(context), ILocalizationRepository
    {
    }
}
