using AutoMapper;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class RoleService(IGenericRepository<Role> repository, IUnitOfWork unitOfWork, IMapper mapper, IRoleRepository roleRepository, ICustomUpdateService<Role> customUpdateService) : Service<Role>(repository, unitOfWork), IRoleService
    {
        private readonly IRoleRepository _roleRepository = roleRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<Role> _customUpdateService = customUpdateService;

        public override async Task<Role> AddAsync(Role role)
        {
            role.CreatedDate = DateTime.UtcNow;
            role.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(role);
        }

        public override async Task ChangeStatusAsync(Role role)
        {
            var current = await _roleRepository.GetByIdAsync(role.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = role.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(Role role)
        {
            var current = await _roleRepository.GetByIdAsync(role.Id);

            Role last = _customUpdateService.Check(current, role);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = role.UpdatedBy;

            await base.UpdateAsync(last);
        }

        public async Task<List<Role>> GetRolesAsync(List<int> roleIds)
        {
            List<Role> roles = [];
            if (roleIds != null)
            {
                foreach (var roleId in roleIds)
                {
                    roles.Add(await _roleRepository.GetByIdAsync(roleId));
                }
            }
            return roles;
        }
    }
}
