namespace Quality.Core.Models.BaseModels.DefinitionModels
{
    public class Localization : BaseEntity
    {
        public string Keyword { get; set; }
        public string? TR { get; set; }
        public string? EN { get; set; }
        public string? ES { get; set; }
        public string? FR { get; set; }
        public string? IT { get; set; }
        public string? RU { get; set; }
        public string? DE { get; set; }
    }
}
