using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Core.Services
{
    public interface ISemiProductService : IService<SemiProduct>
    {
        Task<CustomResponseDto<SemiProductDto>> GetSemiProductByIdWithDetailsAsync(int semiProductId);
        Task<string> GetSemiProductGroupNameAsync(int semiProductId);

    }
}
