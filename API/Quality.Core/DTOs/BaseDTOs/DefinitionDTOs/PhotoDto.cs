using Microsoft.AspNetCore.Http;

namespace Quality.Core.DTOs.BaseDTOs.DefinitionDTOs
{
    public class PhotoDto : BaseDto
    {
        public string PhotoUrl { get; set; }
        public int? ProductId { get; set; }

        public List<IFormFile> PhotoFiles { get; set; }
    }
}
