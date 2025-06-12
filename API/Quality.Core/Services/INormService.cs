using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs.CustomDto;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Core.Services
{
    public interface INormService : IService<Norm>
    {
        Task<List<NormAllDto>> GetAllWithDetailsAsync();
        Task<NormDetailsDto> GetWithDetails(int normId);
    }
}
