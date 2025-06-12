using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;

namespace Quality.Repository.Repositories
{
    public class UserRepository(AppDbContext context) : GenericRepository<User>(context), IUserRepository
    {
    }
}

