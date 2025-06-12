using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Core.Services
{
    public interface IProductGroupTypeService : IService<ProductGroupType>
    {
        Task<List<ProductGroupTypeDto>> GetAllWithDetailsAsync(int companyId);
        Task<ProductGroupTypeDto> GetWithDetailsAsync(int productGroupTypeId, int companyId);

    }
}
