using Quality.Core.Models.ProductPortalModels;

namespace Quality.Core.Models.BaseModels.DefinitionModels
{
    public class Photo : BaseEntity
    {
        public string PhotoUrl { get; set; }
        public int? ProductId { get; set; }
        public int? UserId { get; set; }

        public Product Product { get; set; }
        public User User { get; set; }
    }
}
