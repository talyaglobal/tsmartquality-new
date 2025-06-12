namespace Quality.Core.DTOs.BaseDTOs
{
    public class NotificationTokenDto : BaseDto
    {
        public int UserId { get; set; }
        public string Token { get; set; }
    }
}
