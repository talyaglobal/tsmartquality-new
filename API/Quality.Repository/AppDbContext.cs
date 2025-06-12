using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Models.ProductModels;
using Quality.Core.Models.ProductPortalModels;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Repository.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace Quality.Repository
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<Role> Roles { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupInRole> GroupInRoles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<ColorType> ColorTypes { get; set; }
        public DbSet<Country> Countries { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<CuttingType> CuttingTypes { get; set; }
        public DbSet<QualityType> QualityTypes { get; set; }
        public DbSet<Seller> Seller { get; set; }
        public DbSet<StorageCondition> StorageConditions { get; set; }
        public DbSet<RawMaterial> RawMaterials { get; set; }
        public DbSet<RawMaterialGroup> RawMaterialGroups { get; set; }
        public DbSet<SemiProductGroup> SemiProductGroups { get; set; }
        public DbSet<SemiProduct> SemiProducts { get; set; }
        public DbSet<Norm> Norms { get; set; }
        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<RecipeDetail> RecipeDetails { get; set; }
        public DbSet<Spec> Specs { get; set; }
        public DbSet<NormDetail> NormDetails { get; set; }
        public DbSet<SpecDetail> SpecDetails { get; set; }
        public DbSet<ProductGroup> ProductGroups { get; set; }
        public DbSet<BudgetGroup> BudgetGroups { get; set; }
        public DbSet<SalesGroup> SalesGroups { get; set; }
        public DbSet<Packaging> Packagings { get; set; }
        public DbSet<ProductionPlace> ProductionPlaces { get; set; }
        public DbSet<ProductToCustomer> ProductToCustomers { get; set; }
        public DbSet<PhotoType> PhotoTypes { get; set; }
        public DbSet<Photo> Photos { get; set; }
        public DbSet<SalesBased> SalesBaseds { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<ERPSetting> ERPSettings { get; set; }
        public DbSet<Localization> Localizations { get; set; }
        public DbSet<ProductStatus> ProductStatuses { get; set; }
        public DbSet<ProductHistory> ProductHistories { get; set; }
        public DbSet<ProductType> ProductTypes { get; set; }
        public DbSet<SKUFollowType> SKUFollowTypes { get; set; }
        public DbSet<SKUFollowUnit> SKUFollowUnits { get; set; }
        public DbSet<ProductGroupType> ProductGroupTypes { get; set; }
        public DbSet<ProductGroupTypeDefinition> ProductGroupTypeDefinitions { get; set; }
        public DbSet<ProductToProductGroupTypeDefinition> ProductToProductGroupTypeDefinitions { get; set; }
        public DbSet<NotificationToken> NotificationTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            base.OnModelCreating(modelBuilder);
        }
    }
}
