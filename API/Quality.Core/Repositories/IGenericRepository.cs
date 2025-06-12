using System.Linq.Expressions;

namespace Quality.Core.Repositories
{
    public interface IGenericRepository<T> where T : class
    {
        Task<T> GetByIdAsync(int id);
        IQueryable<T> GetAll();
        int Count();
        IQueryable<T> Where(Expression<Func<T, bool>> expression);
        Task<bool> AnyAsync(Expression<Func<T, bool>> expression);
        Task AddAsync(T entity);
        void Update(T entity);
        void ChangeStatus(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);
        Task UpdateRangeAsync(List<T> entities);

    }
}
