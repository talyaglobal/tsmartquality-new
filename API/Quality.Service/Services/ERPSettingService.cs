using AutoMapper;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class ERPSettingService(IGenericRepository<ERPSetting> repository, IUnitOfWork unitOfWork, IMapper mapper, IERPSettingRepository erpSettingRepository, ICustomUpdateService<ERPSetting> customUpdateService) : Service<ERPSetting>(repository, unitOfWork), IERPSettingService
    {
        private readonly IERPSettingRepository _erpSettingRepository = erpSettingRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<ERPSetting> _customUpdateService = customUpdateService;

        public override async Task<ERPSetting> AddAsync(ERPSetting erpSetting)
        {
            erpSetting.CreatedDate = DateTime.UtcNow;
            erpSetting.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(erpSetting);
        }

        public override async Task ChangeStatusAsync(ERPSetting erpSetting)
        {
            var current = await _erpSettingRepository.GetByIdAsync(erpSetting.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = erpSetting.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(ERPSetting erpSetting)
        {
            var current = await _erpSettingRepository.GetByIdAsync(erpSetting.Id);

            ERPSetting last = _customUpdateService.Check(current, erpSetting);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = erpSetting.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
