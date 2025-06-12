using Quality.Core.DTOs.BaseDTOs;

namespace Quality.Core.DTOs.ProductPortalDTOs
{
    public class ProductToCustomerDto : BaseDto
    {
        public int ProductId { get; set; }
        public int CustomerId { get; set; }
    }
}
