using AutoMapper;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
using Quality.Core.Services;
using Quality.Core.UnitOfWorks;

namespace Quality.Service.Services
{
    public class ColorTypeService(IGenericRepository<ColorType> repository, IUnitOfWork unitOfWork, IMapper mapper, IColorTypeRepository colorTypeRepository, ICustomUpdateService<ColorType> customUpdateService) : Service<ColorType>(repository, unitOfWork), IColorTypeService
    {
        private readonly IColorTypeRepository _colorTypeRepository = colorTypeRepository;
        private readonly IMapper _mapper = mapper;
        private readonly ICustomUpdateService<ColorType> _customUpdateService = customUpdateService;

        public override async Task<ColorType> AddAsync(ColorType colorType)
        {
            colorType.CreatedDate = DateTime.UtcNow;
            colorType.UpdatedDate = DateTime.UtcNow;

            return await base.AddAsync(colorType);
        }

        public override async Task ChangeStatusAsync(ColorType colorType)
        {
            var current = await _colorTypeRepository.GetByIdAsync(colorType.Id);

            if (current.Status)
            {
                current.Status = false;
            }

            else
            {
                current.Status = true;
            }

            current.UpdatedDate = DateTime.UtcNow;
            current.UpdatedBy = colorType.UpdatedBy;

            await base.ChangeStatusAsync(current);
        }

        public override async Task UpdateAsync(ColorType colorType)
        {
            var current = await _colorTypeRepository.GetByIdAsync(colorType.Id);

            ColorType last = _customUpdateService.Check(current, colorType);

            last.UpdatedDate = DateTime.UtcNow;
            last.UpdatedBy = colorType.UpdatedBy;

            await base.UpdateAsync(last);
        }
    }
}
