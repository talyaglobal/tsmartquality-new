using AutoMapper;
using Quality.Core.DTOs.BaseDTOs;
using Quality.Core.DTOs.BaseDTOs.DefinitionDTOs;
using Quality.Core.DTOs.ProductDTOs;
using Quality.Core.DTOs.ProductPortalDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.ProductPortalDefinitionDTOs;
using Quality.Core.DTOs.UpdateDTOs.BaseUpdateDTOs.DefinitionUpdateDTOs;
using Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs;
using Quality.Core.DTOs.UpdateDTOs.ProductPortalUpdateDTOs.ProductPortalDefinitionUpdateDtos;
using Quality.Core.Models.BaseModels.DefinitionModels;
using Quality.Core.Models.ProductModels;
using Quality.Core.Models.ProductPortalModels;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;

namespace Quality.Service.Mappings
{
    public class MapProfile : Profile
    {
        public MapProfile()
        {
            CreateMap<Role, RoleDto>().ReverseMap();
            //CreateMap<User, UserDto>().ReverseMap();
            CreateMap<Product, ProductDto>().ReverseMap();
            CreateMap<Brand, BrandDto>().ReverseMap();
            CreateMap<ColorType, ColorTypeDto>().ReverseMap();
            CreateMap<Country, CountryDto>().ReverseMap();
            CreateMap<Customer, CustomerDto>().ReverseMap();
            CreateMap<CuttingType, CuttingTypeDto>().ReverseMap();
            CreateMap<QualityType, QualityTypeDto>().ReverseMap();
            CreateMap<Seller, SellerDto>().ReverseMap();
            CreateMap<StorageCondition, StorageConditionDto>().ReverseMap();
            CreateMap<RawMaterial, RawMaterialDto>().ReverseMap();
            CreateMap<RawMaterialGroup, RawMaterialGroupDto>().ReverseMap();
            CreateMap<SemiProductGroup, SemiProductGroupDto>().ReverseMap();
            CreateMap<SemiProduct, SemiProductDto>().ReverseMap();
            CreateMap<Norm, NormDto>().ReverseMap();
            CreateMap<Recipe, RecipeDto>().ReverseMap();
            CreateMap<RecipeDetail, RecipeDetailDto>().ReverseMap();
            CreateMap<Spec, SpecDto>().ReverseMap();
            CreateMap<NormDetail, NormDetailDto>().ReverseMap();
            CreateMap<SpecDetail, SpecDetailDto>().ReverseMap();
            CreateMap<ProductionPlace, ProductionPlaceDto>().ReverseMap();
            CreateMap<ProductGroup, ProductGroupDto>().ReverseMap();
            CreateMap<BudgetGroup, BudgetGroupDto>().ReverseMap();
            CreateMap<SalesGroup, SalesGroupDto>().ReverseMap();
            CreateMap<Packaging, PackagingDto>().ReverseMap();
            CreateMap<ProductToCustomer, ProductToCustomerDto>().ReverseMap();
            CreateMap<PhotoType, PhotoTypeDto>().ReverseMap();
            CreateMap<Photo, PhotoDto>().ReverseMap();
            CreateMap<Group, GroupDto>().ReverseMap();
            CreateMap<GroupInRole, GroupInRoleDto>().ReverseMap();
            CreateMap<SalesBased, SalesBasedDto>().ReverseMap();
            CreateMap<ProductStatus, ProductStatusDto>().ReverseMap();
            CreateMap<ProductHistory, ProductHistoryDto>().ReverseMap();
            CreateMap<ProductType, ProductTypeDto>().ReverseMap();
            CreateMap<SKUFollowType, SKUFollowTypeDto>().ReverseMap();
            CreateMap<SKUFollowUnit, SKUFollowUnitDto>().ReverseMap();
            CreateMap<ProductGroupType, ProductGroupTypeDto>().ReverseMap();
            CreateMap<ProductGroupTypeDefinition, ProductGroupTypeDefinitionDto>().ReverseMap();
            CreateMap<NotificationToken, NotificationTokenDto>().ReverseMap();
            CreateMap<ProductToProductGroupTypeDefinition, ProductToProductGroupTypeDefinitionDto>().ReverseMap();

            CreateMap<RoleUpdateDto, Role>();
            //CreateMap<UserUpdateDto, User>();
            CreateMap<ProductUpdateDto, Product>();
            CreateMap<BrandUpdateDto, Brand>();
            CreateMap<ColorTypeUpdateDto, ColorType>();
            CreateMap<CountryUpdateDto, Country>();
            CreateMap<CustomerUpdateDto, Customer>();
            CreateMap<CuttingTypeUpdateDto, CuttingType>();
            CreateMap<QualityTypeUpdateDto, QualityType>();
            CreateMap<SellerUpdateDto, Seller>();
            CreateMap<StorageConditionUpdateDto, StorageCondition>();
            CreateMap<RawMaterialUpdateDto, RawMaterial>();
            CreateMap<RawMaterialGroupUpdateDto, RawMaterialGroup>();
            CreateMap<SemiProductGroupUpdateDto, SemiProductGroup>();
            CreateMap<SemiProductUpdateDto, SemiProduct>();
            CreateMap<NormUpdateDto, Norm>();
            CreateMap<RecipeUpdateDto, Recipe>();
            CreateMap<RecipeDetailUpdateDto, RecipeDetail>();
            CreateMap<SpecUpdateDto, Spec>();
            CreateMap<NormDetailUpdateDto, NormDetail>();
            CreateMap<SpecDetailUpdateDto, SpecDetail>();
            CreateMap<ProductGroupUpdateDto, ProductGroup>();
            CreateMap<BudgetGroupUpdateDto, BudgetGroup>();
            CreateMap<SalesGroupUpdateDto, SalesGroup>();
            CreateMap<PackagingUpdateDto, Packaging>();
            CreateMap<ProductToCustomerUpdateDto, ProductToCustomer>();
            CreateMap<PhotoTypeUpdateDto, PhotoType>();
            CreateMap<PhotoUpdateDto, Photo>();
            CreateMap<ProductionPlaceUpdateDto, ProductionPlace>();
            CreateMap<GroupUpdateDto, Group>();
            CreateMap<GroupInRoleUpdateDto, GroupInRole>();
            CreateMap<SalesBasedUpdateDto, SalesBased>();
            CreateMap<SKUFollowUnitUpdateDto, SKUFollowUnit>();
            CreateMap<SKUFollowTypeUpdateDto, SKUFollowType>();
            CreateMap<ProductStatusUpdateDto, ProductStatus>();
            CreateMap<ProductTypeUpdateDto, ProductType>();
            CreateMap<ProductGroupTypeUpdateDto, ProductGroupType>();
            CreateMap<ProductGroupTypeDefinitionUpdateDto, ProductGroupTypeDefinition>();
            CreateMap<NotificationTokenUpdateDto, NotificationToken>();
            CreateMap<ProductToProductGroupTypeDefinitionUpdateDto, ProductToProductGroupTypeDefinition>();

            CreateMap<Product, ProductsWithDetailsDto>().ReverseMap();

        }
    }
}

