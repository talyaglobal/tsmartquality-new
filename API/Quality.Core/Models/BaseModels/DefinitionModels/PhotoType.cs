namespace Quality.Core.Models.BaseModels.DefinitionModels
{
    public class PhotoType : BaseEntity
    {
        public string Name { get; set; }

        public ICollection<Photo> Photo { get; set; }
    }
}
