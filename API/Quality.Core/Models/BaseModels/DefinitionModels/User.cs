namespace Quality.Core.Models.BaseModels.DefinitionModels
{
    public class User : BaseEntity
    {
        //public bool IsConfirm { get; set; }
        //public byte[] PasswordSalt { get; set; }
        //public byte[] PasswordHash { get; set; }
        //public int GroupId { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        //public string Phone { get; set; }
        //public string? NotificationToken { get; set; }

        //public Group Group { get; set; }
        public ICollection<Photo> Photos { get; set; }
    }
}
