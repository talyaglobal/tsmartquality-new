namespace Quality.Core.Models.BaseModels.DefinitionModels
{
    public class Group : BaseEntity
    {
        public string Name { get; set; }
        public ICollection<User> Users { get; set; }
        public ICollection<GroupInRole> GroupInRoles { get; set; }
    }
}