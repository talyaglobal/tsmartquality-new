using Quality.Core.Repositories;

namespace Quality.Business
{
    public class NetsisSyncService : INetsisSyncService
    {
        private readonly IProductGroupRepository _productGroupRepository;
        private readonly ISalesGroupRepository _salesGroupRepository;
        private readonly IRawMaterialGroupRepository _rawMaterialGroupRepository;
        private readonly IPackagingRepository _packagingRepository;
        private readonly IProductionPlaceRepository _productionPlaceRepository;
        private readonly IWarehouseRepository _warehouseRepository;
        private readonly INetsisService _netsisService;

        public NetsisSyncService(IProductGroupRepository productGroupRepository, ISalesGroupRepository salesGroupRepository, IRawMaterialGroupRepository rawMaterialGroupRepository, IPackagingRepository packagingRepository, IProductionPlaceRepository productionPlaceRepository, IWarehouseRepository warehouseRepository/*, INetsisService netsisService*/)
        {
            _productGroupRepository = productGroupRepository;
            _salesGroupRepository = salesGroupRepository;
            _rawMaterialGroupRepository = rawMaterialGroupRepository;
            _packagingRepository = packagingRepository;
            _productionPlaceRepository = productionPlaceRepository;
            _warehouseRepository = warehouseRepository;
            //_netsisService = netsisService;
        }

        //public bool SyncNow()
        //{
        //    throw new NotImplementedException();
        //}

        // ProductGroup, SalesGroup, RawMaterialGroup, Packaging, ProductionPlace, Warehouse

    }
}
