using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs.CustomDto;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Core.Services
{
    public interface ISpecService : IService<Spec>
    {
        Task<List<SpecAllDto>> GetAllWithDetailsAsync();
        Task<SpecDetailsDto> GetWithDetails(int specId);
    }
}
