using Autofac;
using Autofac.Extensions.DependencyInjection;
using Quality.API.Filters;
using Quality.API.Middlewares;
using Quality.API.Modules;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Models.ProductPortalModels;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Services;
using Quality.Repository;
using Quality.Service.Mappings;
using Quality.Service.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Globalization;
using System.Reflection;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();


builder.Services.AddControllers(options =>
{
    options.Filters.Add(new AuthorizeFilter());
});

#region Localization

builder.Services.AddLocalization();

var localizationOptions = new RequestLocalizationOptions();
var supportedCultures = new[]
{
    new CultureInfo("en-US"),
    new CultureInfo("tr-TR"),
    new CultureInfo("de-DE")
};

localizationOptions.SupportedCultures = supportedCultures;
localizationOptions.SupportedUICultures = supportedCultures;
localizationOptions.SetDefaultCulture("tr-TR");
localizationOptions.ApplyCurrentCultureToResponseHeaders = true;

#endregion

builder.Services.AddCors();
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowOrigin",
//    builder => builder.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
//});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateAudience = true,
        ValidateIssuer = true,
        ValidateLifetime = false,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Token:Issuer"],
        ValidAudience = builder.Configuration["Token:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Token:SecurityKey"])),
        ClockSkew = TimeSpan.Zero
    };
});

var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

builder.Services.AddDbContext<AppDbContext>(x =>
{
    x.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), option =>
    {
        option.MigrationsAssembly(Assembly.GetAssembly(typeof(AppDbContext)).GetName().Name);
    });
});

builder.Configuration.AddEnvironmentVariables();

builder.Services.AddHttpClient();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{ options.SuppressModelStateInvalidFilter = true; });

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

builder.Services.AddRateLimiter(op =>
{
    op.AddFixedWindowLimiter("Basic", _options =>
{
    _options.Window = TimeSpan.FromSeconds(5);
    _options.PermitLimit = 10;
    _options.QueueLimit = 2;
    _options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
});
});

builder.Services.AddOutputCache(op =>
{
    op.AddBasePolicy(builder => { builder.Expire(TimeSpan.FromSeconds(10)); });
    //op.AddPolicy("custom", c => { c.Expire(TimeSpan.FromDays(3)); });
});

builder.Services.AddScoped(typeof(NotFoundFilter<>));

builder.Services.AddAutoMapper(typeof(MapProfile));

//builder.Services.AddScoped<INetsisService, NetsisService>();

//AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);

//builder.Services.AddDbContext<AppDbContext>(x =>
//{
//    x.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), option =>
//    {
//        option.MigrationsAssembly(Assembly.GetAssembly(typeof(AppDbContext)).GetName().Name);
//    });
//});

#region Custom Update

builder.Services.AddScoped<ICustomUpdateService<Product>, CustomUpdateService<Product>>();
builder.Services.AddScoped<ICustomUpdateService<Brand>, CustomUpdateService<Brand>>();
builder.Services.AddScoped<ICustomUpdateService<BudgetGroup>, CustomUpdateService<BudgetGroup>>();
builder.Services.AddScoped<ICustomUpdateService<ColorType>, CustomUpdateService<ColorType>>();
builder.Services.AddScoped<ICustomUpdateService<Country>, CustomUpdateService<Country>>();
builder.Services.AddScoped<ICustomUpdateService<Customer>, CustomUpdateService<Customer>>();
builder.Services.AddScoped<ICustomUpdateService<CuttingType>, CustomUpdateService<CuttingType>>();
builder.Services.AddScoped<ICustomUpdateService<ProductGroup>, CustomUpdateService<ProductGroup>>();
builder.Services.AddScoped<ICustomUpdateService<Norm>, CustomUpdateService<Norm>>();
builder.Services.AddScoped<ICustomUpdateService<Packaging>, CustomUpdateService<Packaging>>();
builder.Services.AddScoped<ICustomUpdateService<ProductionPlace>, CustomUpdateService<ProductionPlace>>();
builder.Services.AddScoped<ICustomUpdateService<ProductToCustomer>, CustomUpdateService<ProductToCustomer>>();
builder.Services.AddScoped<ICustomUpdateService<QualityType>, CustomUpdateService<QualityType>>();
builder.Services.AddScoped<ICustomUpdateService<RawMaterialGroup>, CustomUpdateService<RawMaterialGroup>>();
builder.Services.AddScoped<ICustomUpdateService<RawMaterial>, CustomUpdateService<RawMaterial>>();
builder.Services.AddScoped<ICustomUpdateService<RecipeDetail>, CustomUpdateService<RecipeDetail>>();
builder.Services.AddScoped<ICustomUpdateService<Recipe>, CustomUpdateService<Recipe>>();
builder.Services.AddScoped<ICustomUpdateService<SalesGroup>, CustomUpdateService<SalesGroup>>();
builder.Services.AddScoped<ICustomUpdateService<Seller>, CustomUpdateService<Seller>>();
builder.Services.AddScoped<ICustomUpdateService<SemiProductGroup>, CustomUpdateService<SemiProductGroup>>();
builder.Services.AddScoped<ICustomUpdateService<SemiProduct>, CustomUpdateService<SemiProduct>>();
builder.Services.AddScoped<ICustomUpdateService<SpecDetail>, CustomUpdateService<SpecDetail>>();
builder.Services.AddScoped<ICustomUpdateService<Spec>, CustomUpdateService<Spec>>();
builder.Services.AddScoped<ICustomUpdateService<StorageCondition>, CustomUpdateService<StorageCondition>>();
builder.Services.AddScoped<ICustomUpdateService<Photo>, CustomUpdateService<Photo>>();
builder.Services.AddScoped<ICustomUpdateService<PhotoType>, CustomUpdateService<PhotoType>>();
builder.Services.AddScoped<ICustomUpdateService<Role>, CustomUpdateService<Role>>();
builder.Services.AddScoped<ICustomUpdateService<Group>, CustomUpdateService<Group>>();
builder.Services.AddScoped<ICustomUpdateService<GroupInRole>, CustomUpdateService<GroupInRole>>();
builder.Services.AddScoped<ICustomUpdateService<SalesBased>, CustomUpdateService<SalesBased>>();
builder.Services.AddScoped<ICustomUpdateService<Warehouse>, CustomUpdateService<Warehouse>>();
builder.Services.AddScoped<ICustomUpdateService<ERPSetting>, CustomUpdateService<ERPSetting>>();
builder.Services.AddScoped<ICustomUpdateService<Localization>, CustomUpdateService<Localization>>();
builder.Services.AddScoped<ICustomUpdateService<ProductStatus>, CustomUpdateService<ProductStatus>>();
builder.Services.AddScoped<ICustomUpdateService<ProductType>, CustomUpdateService<ProductType>>();
builder.Services.AddScoped<ICustomUpdateService<SKUFollowType>, CustomUpdateService<SKUFollowType>>();
builder.Services.AddScoped<ICustomUpdateService<SKUFollowUnit>, CustomUpdateService<SKUFollowUnit>>();
builder.Services.AddScoped<ICustomUpdateService<ProductGroupType>, CustomUpdateService<ProductGroupType>>();
builder.Services.AddScoped<ICustomUpdateService<ProductToProductGroupTypeDefinition>, CustomUpdateService<ProductToProductGroupTypeDefinition>>();
builder.Services.AddScoped<ICustomUpdateService<ProductGroupType>, CustomUpdateService<ProductGroupType>>();
builder.Services.AddScoped<ICustomUpdateService<ProductGroupTypeDefinition>, CustomUpdateService<ProductGroupTypeDefinition>>();
builder.Services.AddScoped<ICustomUpdateService<NotificationToken>, CustomUpdateService<NotificationToken>>();

#endregion

builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());
builder.Host.ConfigureContainer<ContainerBuilder>(containerBuilder =>
    containerBuilder.RegisterModule(new RepoServiceModule()));

var app = builder.Build();

app.UseRequestLocalization(localizationOptions);
app.UseRateLimiter();
app.UseOutputCache();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "contents")),
    RequestPath = "/contents"
});

app.UseCors(builder =>
builder.AllowAnyOrigin()
.AllowAnyMethod()
.AllowAnyHeader());

app.UseHttpsRedirection();

app.UseCustomException();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();