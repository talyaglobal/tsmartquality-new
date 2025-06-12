using Microsoft.AspNetCore.Http;

namespace Quality.Core.DTOs.UpdateDTOs.BaseUpdateDTOs.DefinitionUpdateDTOs
{
    public class PhotoUpdateDto
    {
        public int Id { get; set; }
        public string PhotoUrl { get; set; }
        public int? ProductId { get; set; }

        public List<IFormFile> PhotoFiles { get; set; }
    }
}
