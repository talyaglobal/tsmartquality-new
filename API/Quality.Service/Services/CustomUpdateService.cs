using Quality.Core.Services;

namespace Quality.Service.Services
{
    public class CustomUpdateService<T> : ICustomUpdateService<T> where T : class
    {
        public T Check(T oldEntity, T newEntity)
        {
            var properties = typeof(T).GetProperties();

            foreach (var property in properties)
            {
                var newValue = property.GetValue(newEntity);
                var oldValue = property.GetValue(oldEntity);
                if (property.Name == "CreatedDate" || property.Name == "CreatedBy" || property.Name == "Status")
                {
                    continue;
                }
                if ((newValue != null) && !newValue.Equals(oldValue))
                {
                    if (!newValue.Equals(0))
                    {
                        property.SetValue(oldEntity, newValue);
                    }
                }

            }


            return oldEntity;
        }
    }
}
