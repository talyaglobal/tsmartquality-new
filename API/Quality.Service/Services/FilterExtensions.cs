using Quality.Core.DTOs.ProductPortalDTOs.FilterDTOs;
using Quality.Core.Models.ProductPortalModels;
using System.Reflection;

namespace Quality.Service.Services
{
    public static class FilterExtensions
    {
        public static IQueryable<T> ApplyFilters<T>(this IQueryable<T> query, ProductListFilterDto filterDto)
        {
            PropertyInfo[] properties = typeof(ProductListFilterDto).GetProperties();
            PropertyInfo[] products = typeof(Product).GetProperties();

            foreach (var property in properties)
            {
                object value = property.GetValue(filterDto);

                if (value != null)
                {
                    query = query.Where(p => (int)typeof(Product).GetProperty(property.Name).GetValue(p) == (int)value);
                }
            }
            return query;
        }
    }

}
