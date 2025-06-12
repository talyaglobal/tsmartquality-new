using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class ERPSettingRepository(AppDbContext context) : GenericRepository<ERPSetting>(context), IERPSettingRepository
    {
    }
}
