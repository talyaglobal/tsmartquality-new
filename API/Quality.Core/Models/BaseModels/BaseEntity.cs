namespace Quality.Core.Models.BaseModels
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public bool Status { get; set; } = true;
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
        public int? CompanyId { get; set; }
    }
}
