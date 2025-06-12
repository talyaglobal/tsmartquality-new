namespace Quality.Core.DTOs.BaseDTOs.DefinitionDTOs
{
    public class UserDto : BaseDto
    {
        public bool IsConfirm { get; set; }
        public string Password { get; set; }
        public int GroupId { get; set; }
        public string? GroupName { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        public string? Phone { get; set; }
        public string? PhotoURL { get; set; }
    }
}
