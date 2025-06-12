using AutoMapper;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class GroupService(IGenericRepository<Group> repository, IUnitOfWork unitOfWork, IMapper mapper, IGroupRepository groupRepository, ICustomUpdateService<Group> customUpdateService) : Service<Group>(repository, unitOfWork), IGroupService
    {
        private readonly IGroupRepository _groupRepository = groupRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<Group> _customUpdateService = customUpdateService;

        public override async Task<Group> AddAsync(Group group)
        {
            group.CreatedDate = DateTime.UtcNow;
            group.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(group);
        }

        public override async Task ChangeStatusAsync(Group group)
        {
            var current = await _groupRepository.GetByIdAsync(group.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = group.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(Group group)
        {
            var current = await _groupRepository.GetByIdAsync(group.Id);

            Group last = _customUpdateService.Check(current, group);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = group.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
