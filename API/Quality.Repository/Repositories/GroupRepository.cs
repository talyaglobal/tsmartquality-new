using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class GroupRepository(AppDbContext context) : GenericRepository<Group>(context), IGroupRepository
    {
    }
}
