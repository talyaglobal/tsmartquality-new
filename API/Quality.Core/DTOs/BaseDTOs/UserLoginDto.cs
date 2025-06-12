namespace Quality.Core.DTOs.BaseDTOs
{
    public class UserLoginDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string? NotificationToken { get; set; }
        public string Password { get; set; }
    }
}
