namespace Quality.Core.DTOs.BaseDTOs
{
    public abstract class BaseDto
    {
        public int Id { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
