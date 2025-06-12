using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class GroupInRoleRepository(AppDbContext context) : GenericRepository<GroupInRole>(context), IGroupInRoleRepository
    {
    }
}
