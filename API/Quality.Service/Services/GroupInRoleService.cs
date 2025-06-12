using AutoMapper;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class GroupInRoleService(IGenericRepository<GroupInRole> repository, IUnitOfWork unitOfWork, IMapper mapper, IGroupInRoleRepository groupInRoleRepository, ICustomUpdateService<GroupInRole> customUpdateService) : Service<GroupInRole>(repository, unitOfWork), IGroupInRoleService
    {
        private readonly IGroupInRoleRepository _groupInRoleRepository = groupInRoleRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<GroupInRole> _customUpdateService = customUpdateService;

        public override async Task<GroupInRole> AddAsync(GroupInRole groupInRole)
        {
            groupInRole.CreatedDate = DateTime.UtcNow;
            groupInRole.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(groupInRole);
        }

        public override async Task ChangeStatusAsync(GroupInRole groupInRole)
        {
            var current = await _groupInRoleRepository.GetByIdAsync(groupInRole.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = groupInRole.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(GroupInRole groupInRole)
        {
            var current = await _groupInRoleRepository.GetByIdAsync(groupInRole.Id);

            GroupInRole last = _customUpdateService.Check(current, groupInRole);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = groupInRole.UpdatedBy;

            await base.UpdateAsync(last);
        }

        public List<int> GetRoleIdsByGroupId(int groupId)
        {
            var idList = _groupInRoleRepository.Where(x => x.GroupId == groupId).ToList();
            var roleIds = new List<int>();
            foreach (var id in idList)
            {
                roleIds.Add(id.RoleId);
            }
            return roleIds;
        }
    }
}
