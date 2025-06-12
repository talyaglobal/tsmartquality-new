namespace Quality.Core.Models.BaseModels.DefinitionModels
{
    public class NotificationToken : BaseEntity
    {
        public int UserId { get; set; } // ccmden login olduğu zaman ccmdeki userId ile karşılaştır o userId ise token boş değilse update boşsa kaydet
        public string Token { get; set; }
    }
}
