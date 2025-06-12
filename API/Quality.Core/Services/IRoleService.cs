using Quality.Core.Models.BaseModels.DefinitionModels;
namespace Quality.Core.Services
{
    public interface IRoleService : IService<Role>
    {
        Task<List<Role>> GetRolesAsync(List<int> roleIds);
    }
}
