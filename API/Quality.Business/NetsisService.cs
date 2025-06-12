using Quality.Core.DTOs.ProductDTOs;
using Quality.Core.DTOs.ProductPortalDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.NewProductDTOs;
using Quality.Core.DTOs.ProductPortalDTOs.StockDTOs;
using Quality.Core.Models.ProductModels;
using Quality.Core.Models.ProductPortalModels.ProductPortalDefinitionModels;
using Quality.Core.Repositories;
//using NetOpenX.Rest.Client;
//using NetOpenX.Rest.Client.BLL;
//using NetOpenX.Rest.Client.Model;
//using NetOpenX.Rest.Client.Model.NetOpenX;
namespace Quality.Business
{
    //public class NetsisService : INetsisService
    //{
    //    public string token;
    //    //private string comp1Db = "EKO2023V2024";
    //    //private string comp2Db = "TAG2023V2024";
    //    //private string comp3Db = "GURME2023V2024";
    //    private oAuth2 _oAuth2Comp1 = null;
    //    private oAuth2 _oAuth2Comp2 = null;
    //    private oAuth2 _oAuth2Comp3 = null;
    //    private readonly IProductGroupRepository _productGroupRepository;
    //    private readonly ISalesGroupRepository _salesGroupRepository;
    //    private readonly IRawMaterialGroupRepository _rawMaterialGroupRepository;
    //    private readonly IPackagingRepository _packagingRepository;
    //    private readonly IProductionPlaceRepository _productionPlaceRepository;
    //    private readonly IERPSettingRepository _erpSettingRepository;
    //    public NetsisService(IProductGroupRepository productGroupRepository, ISalesGroupRepository salesGroupRepository, IRawMaterialGroupRepository rawMaterialGroupRepository, IPackagingRepository packagingRepository, IProductionPlaceRepository productionPlaceRepository, IERPSettingRepository erpSettingRepository)
    //    {
    //        _productGroupRepository = productGroupRepository;
    //        _salesGroupRepository = salesGroupRepository;
    //        _rawMaterialGroupRepository = rawMaterialGroupRepository;
    //        _packagingRepository = packagingRepository;
    //        _productionPlaceRepository = productionPlaceRepository;
    //        _erpSettingRepository = erpSettingRepository;
    //    }

    //    public async Task<List<ProductsWithDetailsDto>> GetAllReport(List<ProductsWithDetailsDto> productList)
    //    {
    //        OAuthLogin oAuthLogin = new OAuthLogin();
    //        var erpSetting = _erpSettingRepository.Where(x => x.Status).Take(1).OrderBy(x => x.Id).FirstOrDefault();
    //        if (erpSetting != null)
    //        {
    //            if (erpSetting.Company1Db != null && erpSetting.Company1Db != "")
    //            {
    //                _oAuth2Comp1 = await oAuthLogin.LoginAsync(erpSetting.Company1Db);
    //            }

    //            if (erpSetting.Company2Db != null && erpSetting.Company2Db != "")
    //            {
    //                _oAuth2Comp2 = await oAuthLogin.LoginAsync(erpSetting.Company2Db);
    //            }

    //            if (erpSetting.Company3Db != null && erpSetting.Company3Db != "")
    //            {
    //                _oAuth2Comp3 = await oAuthLogin.LoginAsync(erpSetting.Company3Db);
    //            }

    //            List<string> stokList1 = productList.Where(x => x.Code != null && x.Code != "").Select(x => x.Code).ToList();
    //            List<string> stokList2 = productList.Where(x => x.Code2 != null && x.Code2 != "").Select(x => x.Code2).ToList();
    //            List<string> stokList3 = productList.Where(x => x.Code3 != null && x.Code3 != "").Select(x => x.Code3).ToList();

    //            stokList1.AddRange(productList.Where(x => x.SemiProduct != null && x.SemiProduct.Code != null && x.SemiProduct.Code != "").Select(x => x.SemiProduct.Code).ToList());
    //            stokList2.AddRange(productList.Where(x => x.SemiProduct != null && x.SemiProduct.Code2 != null && x.SemiProduct.Code2 != "").Select(x => x.SemiProduct.Code2).ToList());
    //            stokList3.AddRange(productList.Where(x => x.SemiProduct != null && x.SemiProduct.Code3 != null && x.SemiProduct.Code3 != "").Select(x => x.SemiProduct.Code3).ToList());

    //            if (_oAuth2Comp1 != null)
    //            {
    //                ItemTransactionsManager manager = new(_oAuth2Comp1);
    //                string whereFilter = "";
    //                int i = 0;
    //                Dictionary<string, double> stocks = [];

    //                if (stokList1.Count > 0)
    //                {
    //                    foreach (string s in stokList1)
    //                    {
    //                        if (s != null && s != "")
    //                        {
    //                            if (!stocks.ContainsKey(s.ToUpper()))
    //                            {
    //                                stocks.Add(s.ToUpper(), 0);
    //                            }

    //                            if (i == 0)
    //                            {
    //                                whereFilter += " STOK_KODU = '" + s + "'";
    //                            }
    //                            else
    //                            {
    //                                whereFilter += " OR STOK_KODU = '" + s + "'";
    //                            }
    //                        }
    //                        i++;
    //                    }
    //                    SelectFilter filter = new()
    //                    {
    //                        Fields = ["Stok_Kodu", "Sthar_Gckod", "Sthar_Gcmik"],
    //                        Filter = "STOK_KODU LIKE 'MM-%'  OR STOK_KODU LIKE 'YM-%' OR STOK_KODU LIKE 'YMO-%'",
    //                        Limit = 100000000
    //                    };
    //                    try
    //                    {
    //                        var tmpResult2 = manager.GetInternal(filter);

    //                        var tmpResult = tmpResult2.Data;
    //                        foreach (var item in tmpResult)
    //                        {

    //                            if (item.Sthar_Gckod == "G")
    //                            {
    //                                if (stocks.ContainsKey(item.Stok_Kodu.ToUpper()))
    //                                {
    //                                    stocks[item.Stok_Kodu.ToUpper()] += item.Sthar_Gcmik.Value;
    //                                }
    //                            }
    //                            if (item.Sthar_Gckod == "C")
    //                            {
    //                                if (stocks.ContainsKey(item.Stok_Kodu.ToUpper()))
    //                                {
    //                                    stocks[item.Stok_Kodu.ToUpper()] -= item.Sthar_Gcmik.Value;
    //                                }
    //                            }
    //                        }

    //                        foreach (var product in productList)
    //                        {
    //                            if (product.Code != null && stocks.ContainsKey(product.Code.ToUpper()))
    //                            {
    //                                product.Stock.Code1Stock = Convert.ToInt32(stocks[product.Code.ToUpper()]);
    //                            }
    //                            if (product.SemiProduct != null && product.SemiProduct.Code != null && stocks.ContainsKey(product.SemiProduct.Code.ToUpper()))
    //                            {
    //                                product.SemiProduct.Stocks.Code1Stock = Convert.ToInt32(stocks[product.SemiProduct.Code.ToUpper()]);
    //                            }
    //                        }
    //                    }
    //                    catch (Exception)
    //                    {
    //                    }
    //                }
    //            }

    //            if (_oAuth2Comp2 != null)
    //            {
    //                ItemTransactionsManager manager = new(_oAuth2Comp2);
    //                string whereFilter = "";
    //                int i = 0;
    //                Dictionary<string, double> stocks = [];

    //                if (stokList2.Count > 0)
    //                {
    //                    foreach (string s in stokList2)
    //                    {
    //                        if (s != null && s != "")
    //                        {
    //                            if (!stocks.ContainsKey(s.ToUpper()))
    //                            {
    //                                stocks.Add(s.ToUpper(), 0);
    //                            }

    //                            if (i == 0)
    //                            {
    //                                whereFilter += " STOK_KODU = '" + s + "'";
    //                            }
    //                            else
    //                            {
    //                                whereFilter += " OR STOK_KODU = '" + s + "'";
    //                            }
    //                        }
    //                        i++;
    //                    }

    //                    SelectFilter filter = new()
    //                    {
    //                        Fields = ["Stok_Kodu", "Sthar_Gckod", "Sthar_Gcmik"],
    //                        Filter = "STOK_KODU LIKE 'MM-%'  OR STOK_KODU LIKE 'YM-%' OR STOK_KODU LIKE 'YMO-%'",
    //                        Limit = 100000000
    //                    };

    //                    var tmpResult2 = manager.GetInternal(filter);
    //                    var tmpResult = tmpResult2.Data;
    //                    foreach (var item in tmpResult)
    //                    {

    //                        if (item.Sthar_Gckod == "G")
    //                        {
    //                            if (stocks.ContainsKey(item.Stok_Kodu.ToUpper()))
    //                            {
    //                                stocks[item.Stok_Kodu.ToUpper()] += item.Sthar_Gcmik.Value;
    //                            }
    //                        }
    //                        if (item.Sthar_Gckod == "C")
    //                        {
    //                            if (stocks.ContainsKey(item.Stok_Kodu.ToUpper()))
    //                            {
    //                                stocks[item.Stok_Kodu.ToUpper()] -= item.Sthar_Gcmik.Value;
    //                            }
    //                        }
    //                    }

    //                    foreach (var product in productList)
    //                    {
    //                        if (product.Code2 != null && stocks.ContainsKey(product.Code2.ToUpper()))
    //                        {
    //                            product.Stock.Code2Stock = Convert.ToInt32(stocks[product.Code2.ToUpper()]);
    //                        }
    //                        if (product.SemiProduct != null && product.SemiProduct.Code2 != null && stocks.ContainsKey(product.SemiProduct.Code2.ToUpper()))
    //                        {
    //                            product.SemiProduct.Stocks.Code2Stock = Convert.ToInt32(stocks[product.SemiProduct.Code2.ToUpper()]);
    //                        }
    //                    }
    //                }
    //            }

    //            if (_oAuth2Comp3 != null)
    //            {
    //                ItemTransactionsManager manager = new(_oAuth2Comp3);
    //                string whereFilter = "";
    //                int i = 0;
    //                Dictionary<string, double> stocks = [];

    //                if (stokList3.Count > 0)
    //                {
    //                    foreach (string s in stokList3)
    //                    {
    //                        if (s != null && s != "")
    //                        {
    //                            if (!stocks.ContainsKey(s.ToUpper()))
    //                            {
    //                                stocks.Add(s.ToUpper(), 0);
    //                            }

    //                            if (i == 0)
    //                            {
    //                                whereFilter += " STOK_KODU = '" + s + "'";
    //                            }
    //                            else
    //                            {
    //                                whereFilter += " OR STOK_KODU = '" + s + "'";
    //                            }
    //                        }
    //                        i++;

    //                    }
    //                    SelectFilter filter = new()
    //                    {
    //                        Fields = ["Stok_Kodu", "Sthar_Gckod", "Sthar_Gcmik"],
    //                        Filter = "STOK_KODU LIKE 'MM-%'  OR STOK_KODU LIKE 'YM-%' OR STOK_KODU LIKE 'YMO-%'",
    //                        Limit = 100000000
    //                    };

    //                    var tmpResult2 = manager.GetInternal(filter);
    //                    var tmpResult = tmpResult2.Data;
    //                    foreach (var item in tmpResult)
    //                    {

    //                        if (item.Sthar_Gckod == "G")
    //                        {
    //                            if (stocks.ContainsKey(item.Stok_Kodu.ToUpper()))
    //                            {
    //                                stocks[item.Stok_Kodu.ToUpper()] += item.Sthar_Gcmik.Value;
    //                            }
    //                        }
    //                        if (item.Sthar_Gckod == "C")
    //                        {
    //                            if (stocks.ContainsKey(item.Stok_Kodu.ToUpper()))
    //                            {
    //                                stocks[item.Stok_Kodu.ToUpper()] -= item.Sthar_Gcmik.Value;
    //                            }
    //                        }
    //                    }
    //                    foreach (var product in productList)
    //                    {
    //                        if (product.Code3 != null && stocks.ContainsKey(product.Code3.ToUpper()))
    //                        {
    //                            product.Stock.Code3Stock = Convert.ToInt32(stocks[product.Code3.ToUpper()]);
    //                        }
    //                        if (product.SemiProduct != null && product.SemiProduct.Code3 != null && stocks.ContainsKey(product.SemiProduct.Code3.ToUpper()))
    //                        {
    //                            product.SemiProduct.Stocks.Code3Stock = Convert.ToInt32(stocks[product.SemiProduct.Code3.ToUpper()]);
    //                        }
    //                    }
    //                }
    //            }
    //            foreach (var product in productList)
    //            {
    //                product.Stock.TotalStock = (product.Stock.Code1Stock != null ? product.Stock.Code1Stock : 0) + (product.Stock.Code2Stock != null ? product.Stock.Code2Stock : 0) + (product.Stock.Code3Stock != null ? product.Stock.Code3Stock : 0);
    //                if (product.SemiProduct != null)
    //                {
    //                    product.SemiProduct.Stocks.TotalStock = (product.SemiProduct.Stocks.Code1Stock != null ? product.SemiProduct.Stocks.Code1Stock : 0) + (product.SemiProduct.Stocks.Code2Stock != null ? product.SemiProduct.Stocks.Code2Stock : 0) + (product.SemiProduct.Stocks.Code3Stock != null ? product.SemiProduct.Stocks.Code3Stock : 0);
    //                }
    //            }
    //        }
    //        return productList;
    //    }

    //    public async Task<ProductHistory> UpdateProduct(ProductHistory product)
    //    {
    //        var erpSetting = _erpSettingRepository.Where(x => x.Status).Take(1).OrderBy(x => x.Id).FirstOrDefault();

    //        OAuthLogin oAuthLogin = new();
    //        if (erpSetting != null)
    //        {
    //            if (!product.IsERP1Updated && erpSetting.Company1Db != "" && erpSetting.Company1Db != null && product.Code_Old != null)
    //            {
    //                _oAuth2Comp1 = await oAuthLogin.LoginAsync(erpSetting.Company1Db);
    //                if (_oAuth2Comp1 != null)
    //                {

    //                    ItemsManager itemsManager = new(_oAuth2Comp1);

    //                    SelectFilter filter = new();

    //                    filter.Filter = "STOK_KODU = '" + product.Code_Old + "'";
    //                    filter.Limit = 1;
    //                    var item = await itemsManager.GetInternalAsync(filter);

    //                    Items netsisProduct = new();

    //                    if (item != null && item.Data.Count > 0)
    //                    {
    //                        netsisProduct = item.Data[0];

    //                        netsisProduct.StokTemelBilgi.Payda_1 = product.QtyInBox_New;

    //                        netsisProduct.StokTemelBilgi.Kod_1 = _productGroupRepository.Where(x => x.Id == product.ProductGroupId_New).Select(x => x.Code).FirstOrDefault();
    //                        netsisProduct.StokTemelBilgi.Kod_2 = _salesGroupRepository.Where(x => x.Id == product.SalesGroupId_New).Select(x => x.Code).FirstOrDefault();
    //                        netsisProduct.StokTemelBilgi.Kod_3 = _rawMaterialGroupRepository.Where(x => x.Id == product.RawMaterialGroupId_New).Select(x => x.Code).FirstOrDefault();
    //                        netsisProduct.StokTemelBilgi.Kod_4 = _packagingRepository.Where(x => x.Id == product.PackagingId_New).Select(x => x.Code).FirstOrDefault();
    //                        netsisProduct.StokTemelBilgi.Kod_5 = _productionPlaceRepository.Where(x => x.Id == product.ProductionPlaceId_New).Select(x => x.Code).FirstOrDefault();

    //                        netsisProduct.StokEkBilgi.Kull5S = product.SpecCode_New;
    //                        netsisProduct.StokTemelBilgi.Stok_Adi = product.Name_New;
    //                        netsisProduct.StokEkBilgi.Ingisim = product.Name2_New;
    //                        netsisProduct.StokEkBilgi.Ingisim = product.Name2_New;
    //                        netsisProduct.StokEkBilgi.Kull1N = product.UnitStrainedWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull2N = product.BoxStrainedWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull3N = product.UnitNetWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull4N = product.BoxNetWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull5N = product.UnitGrossWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull6N = product.BoxGrossWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull7N = product.BoxQtyAt80x120Pallet_New;
    //                        netsisProduct.StokEkBilgi.Kull8N = product.BoxQtyAt100x120Pallet_New;
    //                        netsisProduct.StokEkBilgi.Kull7S = product.IsOrganic_New ? "organik" : "konvansiyonel";
    //                        netsisProduct.StokTemelBilgi.Olcu_Br1 = product.Unit_New;

    //                        //netsisProduct.StokTemelBilgi.Stok_Adi = netsisProduct.StokTemelBilgi.Stok_Adi + " batu";
    //                        var result = await itemsManager.PutInternalAsync(netsisProduct.StokTemelBilgi.Stok_Kodu, netsisProduct);
    //                        Console.WriteLine(result.Serialize() + " sadasd ");

    //                        if (result.IsSuccessful)
    //                        {
                                //product.ERP1UpdateTime = DateTime.UtcNow;
    //                            product.IsERP1Updated = true;

    //                        }
    //                    }
    //                }
    //            }

    //            if (!product.IsERP2Updated && erpSetting.Company2Db != "" && erpSetting.Company2Db != null && product.Code2_Old != null)
    //            {
    //                _oAuth2Comp2 = await oAuthLogin.LoginAsync(erpSetting.Company2Db);
    //                if (_oAuth2Comp2 != null)
    //                {

    //                    ItemsManager itemsManager = new(_oAuth2Comp2);

    //                    SelectFilter filter = new();

    //                    filter.Filter = "STOK_KODU = '" + product.Code2_Old + "'";
    //                    filter.Limit = 1;
    //                    var item = await itemsManager.GetInternalAsync(filter);

    //                    Items netsisProduct = new();

    //                    if (item != null && item.Data.Count > 0)
    //                    {
    //                        netsisProduct = item.Data[0];

    //                        netsisProduct.StokTemelBilgi.Payda_1 = product.QtyInBox_New;

    //                        netsisProduct.StokTemelBilgi.Kod_1 = _productGroupRepository.Where(x => x.Id == product.ProductGroupId_New).Select(x => x.Code).FirstOrDefault();
    //                        netsisProduct.StokTemelBilgi.Kod_2 = _salesGroupRepository.Where(x => x.Id == product.SalesGroupId_New).Select(x => x.Code).FirstOrDefault();
    //                        netsisProduct.StokTemelBilgi.Kod_3 = _rawMaterialGroupRepository.Where(x => x.Id == product.RawMaterialGroupId_New).Select(x => x.Code).FirstOrDefault();
    //                        netsisProduct.StokTemelBilgi.Kod_4 = _packagingRepository.Where(x => x.Id == product.PackagingId_New).Select(x => x.Code).FirstOrDefault();
    //                        netsisProduct.StokTemelBilgi.Kod_5 = _productionPlaceRepository.Where(x => x.Id == product.ProductionPlaceId_New).Select(x => x.Code).FirstOrDefault();

    //                        netsisProduct.StokEkBilgi.Kull5S = product.SpecCode_New;
    //                        netsisProduct.StokTemelBilgi.Stok_Adi = product.Name_New;
    //                        netsisProduct.StokEkBilgi.Ingisim = product.Name2_New;
    //                        netsisProduct.StokEkBilgi.Ingisim = product.Name2_New;
    //                        netsisProduct.StokEkBilgi.Kull1N = product.UnitStrainedWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull2N = product.BoxStrainedWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull3N = product.UnitNetWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull4N = product.BoxNetWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull5N = product.UnitGrossWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull6N = product.BoxGrossWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull7N = product.BoxQtyAt80x120Pallet_New;
    //                        netsisProduct.StokEkBilgi.Kull8N = product.BoxQtyAt100x120Pallet_New;
    //                        netsisProduct.StokEkBilgi.Kull7S = product.IsOrganic_New ? "organik" : "konvansiyonel";
    //                        netsisProduct.StokTemelBilgi.Olcu_Br1 = product.Unit_New;

    //                        //netsisProduct.StokTemelBilgi.Stok_Adi = netsisProduct.StokTemelBilgi.Stok_Adi + " batu";
    //                        var result = await itemsManager.PutInternalAsync(netsisProduct.StokTemelBilgi.Stok_Kodu, netsisProduct);
    //                        Console.WriteLine(result.Serialize() + " sadasd ");
    //                        if (result.IsSuccessful)
    //                        {
    //                            product.ERP2UpdateTime = DateTime.UtcNow;
    //                            product.IsERP2Updated = true;
    //                        }
    //                    }
    //                }
    //            }

    //            if (!product.IsERP3Updated && erpSetting.Company3Db != "" && erpSetting.Company3Db != null && product.Code3_Old != null)
    //            {
    //                _oAuth2Comp3 = await oAuthLogin.LoginAsync(erpSetting.Company3Db);
    //                if (_oAuth2Comp3 != null)
    //                {

    //                    ItemsManager itemsManager = new(_oAuth2Comp3);

    //                    SelectFilter filter = new();

    //                    filter.Filter = "STOK_KODU = '" + product.Code3_Old + "'";
    //                    filter.Limit = 1;
    //                    var item = await itemsManager.GetInternalAsync(filter);

    //                    Items netsisProduct = new();

    //                    if (item != null && item.Data.Count > 0)
    //                    {
    //                        netsisProduct = item.Data[0];

    //                        netsisProduct.StokTemelBilgi.Payda_1 = product.QtyInBox_New;

    //                        netsisProduct.StokTemelBilgi.Kod_1 = _productGroupRepository.Where(x => x.Id == product.ProductGroupId_New).Select(x => x.Code).FirstOrDefault();
    //                        netsisProduct.StokTemelBilgi.Kod_2 = _salesGroupRepository.Where(x => x.Id == product.SalesGroupId_New).Select(x => x.Code).FirstOrDefault();
    //                        netsisProduct.StokTemelBilgi.Kod_3 = _rawMaterialGroupRepository.Where(x => x.Id == product.RawMaterialGroupId_New).Select(x => x.Code).FirstOrDefault();
    //                        netsisProduct.StokTemelBilgi.Kod_4 = _packagingRepository.Where(x => x.Id == product.PackagingId_New).Select(x => x.Code).FirstOrDefault();
    //                        netsisProduct.StokTemelBilgi.Kod_5 = _productionPlaceRepository.Where(x => x.Id == product.ProductionPlaceId_New).Select(x => x.Code).FirstOrDefault();

    //                        netsisProduct.StokEkBilgi.Kull5S = product.SpecCode_New;
    //                        netsisProduct.StokTemelBilgi.Stok_Adi = product.Name_New;
    //                        netsisProduct.StokEkBilgi.Ingisim = product.Name2_New;
    //                        netsisProduct.StokEkBilgi.Ingisim = product.Name2_New;
    //                        netsisProduct.StokEkBilgi.Kull1N = product.UnitStrainedWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull2N = product.BoxStrainedWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull3N = product.UnitNetWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull4N = product.BoxNetWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull5N = product.UnitGrossWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull6N = product.BoxGrossWeight_New;
    //                        netsisProduct.StokEkBilgi.Kull7N = product.BoxQtyAt80x120Pallet_New;
    //                        netsisProduct.StokEkBilgi.Kull8N = product.BoxQtyAt100x120Pallet_New;
    //                        netsisProduct.StokEkBilgi.Kull7S = product.IsOrganic_New ? "organik" : "konvansiyonel";
    //                        netsisProduct.StokTemelBilgi.Olcu_Br1 = product.Unit_New;

    //                        var result = await itemsManager.PutInternalAsync(netsisProduct.StokTemelBilgi.Stok_Kodu, netsisProduct);
    //                        Console.WriteLine(result.Serialize() + " sadasd ");
    //                        if (result.IsSuccessful)
    //                        {
    //                            product.ERP3UpdateTime = DateTime.UtcNow;
    //                            product.IsERP3Updated = true;
    //                        }
    //                    }
    //                }
    //                product.LastUpdateTryTime = DateTime.UtcNow;
    //            }
    //        }

    //        product.LastUpdateTryTime = DateTime.UtcNow;
    //        return product;
    //    }

    //    public async Task<FoundProductsFromNetsisDto> PreNewProductFromNetsis(StockDto stockDto)
    //    {
    //        FoundProductsFromNetsisDto foundProductsFromNetsisDto = new()
    //        {
    //            Code1Product = new(),
    //            Code2Product = new(),
    //            Code3Product = new(),
    //        };
    //        OAuthLogin oAuthLogin = new();
    //        var erpSetting = _erpSettingRepository.Where(x => x.Status).Take(1).OrderBy(x => x.Id).FirstOrDefault();

    //        if (erpSetting != null)
    //        {
    //            if (stockDto.Code1 != null && erpSetting != null && erpSetting.Company1Db != null && erpSetting.Company1Db != "")
    //            {
    //                _oAuth2Comp1 = await oAuthLogin.LoginAsync(erpSetting.Company1Db);
    //                if (_oAuth2Comp1 != null)
    //                {
    //                    ProductDto productDto = new();

    //                    ItemsManager itemsManager = new(_oAuth2Comp1);

    //                    SelectFilter filter = new();

    //                    filter.Filter = "STOK_KODU = '" + stockDto.Code1 + "'";

    //                    var item = itemsManager.GetInternal(filter);

    //                    if (item != null && item.Data.Count > 0)
    //                    {
    //                        var product = item.Data[0];

    //                        if (stockDto.Code1 != "" && stockDto.Code1 != null)
    //                        {
    //                            productDto.Code = stockDto.Code1.ToUpper();
    //                        }
    //                        if (stockDto.Code2 != "" && stockDto.Code2 != null)
    //                        {
    //                            productDto.Code2 = stockDto.Code2.ToUpper();
    //                        }
    //                        if (stockDto.Code3 != "" && stockDto.Code3 != null)
    //                        {
    //                            productDto.Code3 = stockDto.Code3.ToUpper();
    //                        }

    //                        if (product.StokTemelBilgi.Kod_1 != "" && product.StokTemelBilgi.Kod_1 != null)
    //                        {
    //                            var productGroupId = _productGroupRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_1).Select(x => x.Id).FirstOrDefault();
    //                            productDto.ProductGroupId = productGroupId;
    //                        }

    //                        if (product.StokTemelBilgi.Kod_2 != "" && product.StokTemelBilgi.Kod_2 != null)
    //                        {
    //                            var salesGroupId = _salesGroupRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_2).Select(x => x.Id).FirstOrDefault();
    //                            productDto.SalesGroupId = salesGroupId;
    //                        }

    //                        if (product.StokTemelBilgi.Kod_3 != "" && product.StokTemelBilgi.Kod_3 != null)
    //                        {
    //                            var rawMaterialGroupId = _rawMaterialGroupRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_3).Select(x => x.Id).FirstOrDefault();
    //                            productDto.RawMaterialGroupId = rawMaterialGroupId;
    //                        }

    //                        if (product.StokTemelBilgi.Payda_1 != null)
    //                        {
    //                            productDto.QtyInBox = product.StokTemelBilgi.Payda_1;
    //                        }

    //                        if (product.StokTemelBilgi.Kod_4 != "" && product.StokTemelBilgi.Kod_4 != null)
    //                        {
    //                            var packagingId = _packagingRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_4).Select(x => x.Id).FirstOrDefault();
    //                            productDto.PackagingId = packagingId;
    //                        }

    //                        if (product.StokTemelBilgi.Kod_5 != "" && product.StokTemelBilgi.Kod_5 != null)
    //                        {
    //                            var productionPlaceId = _productionPlaceRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_5).Select(x => x.Id).FirstOrDefault();
    //                            productDto.ProductionPlaceId = productionPlaceId;
    //                        }


    //                        if (product.StokEkBilgi.Kull5S != "" && product.StokEkBilgi.Kull5S != null)
    //                        {
    //                            productDto.SpecificationFileId = product.StokEkBilgi.Kull5S;
    //                        }

    //                        if (product.StokTemelBilgi.Stok_Adi != "" && product.StokTemelBilgi.Stok_Adi != null)
    //                        {
    //                            productDto.Name = product.StokTemelBilgi.Stok_Adi;
    //                        }

    //                        if (product.StokEkBilgi.Ingisim != "" && product.StokEkBilgi.Ingisim != null)
    //                        {
    //                            productDto.Name2 = product.StokEkBilgi.Ingisim;
    //                        }

    //                        if (product.StokEkBilgi.Kull1N != null)
    //                        {
    //                            productDto.UnitStrainedWeight = product.StokEkBilgi.Kull1N;
    //                        }
    //                        if (product.StokEkBilgi.Kull2N != null)
    //                        {
    //                            productDto.BoxStrainedWeight = product.StokEkBilgi.Kull2N;
    //                        }
    //                        if (product.StokEkBilgi.Kull3N != null)
    //                        {
    //                            productDto.UnitNetWeight = product.StokEkBilgi.Kull3N;
    //                        }
    //                        if (product.StokEkBilgi.Kull4N != null)
    //                        {
    //                            productDto.BoxNetWeight = product.StokEkBilgi.Kull4N;
    //                        }
    //                        if (product.StokEkBilgi.Kull5N != null)
    //                        {
    //                            productDto.UnitGrossWeight = product.StokEkBilgi.Kull5N;
    //                        }
    //                        if (product.StokEkBilgi.Kull6N != null)
    //                        {
    //                            productDto.BoxGrossWeight = product.StokEkBilgi.Kull6N;
    //                        }
    //                        if (product.StokEkBilgi.Kull7N != null)
    //                        {
    //                            productDto.BoxQtyAt80x120Pallet = Convert.ToInt32(product.StokEkBilgi.Kull7N);
    //                        }
    //                        if (product.StokEkBilgi.Kull8N != null)
    //                        {
    //                            productDto.BoxQtyAt100x120Pallet = Convert.ToInt32(product.StokEkBilgi.Kull8N);
    //                        }

    //                        if (product.StokEkBilgi.Kull7S != "" && product.StokEkBilgi.Kull7S != null)
    //                        {
    //                            productDto.IsOrganic = product.StokEkBilgi.Kull7S.ToLower() == "organic" || product.StokEkBilgi.Kull7S.ToLower() == "organik" ? true : false;
    //                        }
    //                        if (product.StokTemelBilgi.Olcu_Br1 != "" && product.StokTemelBilgi.Olcu_Br1 != null)
    //                        {
    //                            productDto.Unit = product.StokTemelBilgi.Olcu_Br1;
    //                        }

    //                        foundProductsFromNetsisDto.Code1Product = productDto;
    //                    }
    //                }
    //            }
    //            if (stockDto.Code2 != null && erpSetting != null && erpSetting.Company2Db != null && erpSetting.Company2Db != "")
    //            {
    //                _oAuth2Comp2 = await oAuthLogin.LoginAsync(erpSetting.Company2Db);
    //                if (_oAuth2Comp2 != null)
    //                {
    //                    ProductDto productDto = new();
    //                    ItemsManager itemsManager = new(_oAuth2Comp2);

    //                    SelectFilter filter = new()
    //                    {
    //                        Filter = "STOK_KODU = '" + stockDto.Code2 + "'"
    //                    };

    //                    var item = itemsManager.GetInternal(filter);

    //                    if (item != null && item.Data.Count > 0)
    //                    {
    //                        var product = item.Data[0];

    //                        if (stockDto.Code1 != "" && stockDto.Code1 != null)
    //                        {
    //                            productDto.Code = stockDto.Code1.ToUpper();
    //                        }
    //                        if (stockDto.Code2 != "" && stockDto.Code2 != null)
    //                        {
    //                            productDto.Code2 = stockDto.Code2.ToUpper();
    //                        }
    //                        if (stockDto.Code3 != "" && stockDto.Code3 != null)
    //                        {
    //                            productDto.Code3 = stockDto.Code3.ToUpper();
    //                        }

    //                        if (product.StokTemelBilgi.Kod_1 != "" && product.StokTemelBilgi.Kod_1 != null)
    //                        {
    //                            var productGroupId = _productGroupRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_1).Select(x => x.Id).FirstOrDefault();
    //                            productDto.ProductGroupId = productGroupId;
    //                        }

    //                        if (product.StokTemelBilgi.Kod_2 != "" && product.StokTemelBilgi.Kod_2 != null)
    //                        {
    //                            var salesGroupId = _salesGroupRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_2).Select(x => x.Id).FirstOrDefault();
    //                            productDto.SalesGroupId = salesGroupId;
    //                        }

    //                        if (product.StokTemelBilgi.Payda_1 != null)
    //                        {
    //                            productDto.QtyInBox = product.StokTemelBilgi.Payda_1;
    //                        }

    //                        if (product.StokTemelBilgi.Kod_3 != "" && product.StokTemelBilgi.Kod_3 != null)
    //                        {
    //                            var rawMaterialGroupId = _rawMaterialGroupRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_3).Select(x => x.Id).FirstOrDefault();
    //                            productDto.RawMaterialGroupId = rawMaterialGroupId;
    //                        }

    //                        if (product.StokTemelBilgi.Kod_4 != "" && product.StokTemelBilgi.Kod_4 != null)
    //                        {
    //                            var packagingId = _packagingRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_4).Select(x => x.Id).FirstOrDefault();
    //                            productDto.PackagingId = packagingId;
    //                        }

    //                        if (product.StokTemelBilgi.Kod_5 != "" && product.StokTemelBilgi.Kod_5 != null)
    //                        {
    //                            var productionPlaceId = _productionPlaceRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_5).Select(x => x.Id).FirstOrDefault();
    //                            productDto.ProductionPlaceId = productionPlaceId;
    //                        }


    //                        if (product.StokEkBilgi.Kull5S != "" && product.StokEkBilgi.Kull5S != null)
    //                        {
    //                            productDto.SpecificationFileId = product.StokEkBilgi.Kull5S;
    //                        }

    //                        if (product.StokTemelBilgi.Stok_Adi != "" && product.StokTemelBilgi.Stok_Adi != null)
    //                        {
    //                            productDto.Name = product.StokTemelBilgi.Stok_Adi;
    //                        }

    //                        if (product.StokEkBilgi.Ingisim != "" && product.StokEkBilgi.Ingisim != null)
    //                        {
    //                            productDto.Name2 = product.StokEkBilgi.Ingisim;
    //                        }

    //                        if (product.StokEkBilgi.Kull1N != null)
    //                        {
    //                            productDto.UnitStrainedWeight = product.StokEkBilgi.Kull1N;
    //                        }
    //                        if (product.StokEkBilgi.Kull2N != null)
    //                        {
    //                            productDto.BoxStrainedWeight = product.StokEkBilgi.Kull2N;
    //                        }
    //                        if (product.StokEkBilgi.Kull3N != null)
    //                        {
    //                            productDto.UnitNetWeight = product.StokEkBilgi.Kull3N;
    //                        }
    //                        if (product.StokEkBilgi.Kull4N != null)
    //                        {
    //                            productDto.BoxNetWeight = product.StokEkBilgi.Kull4N;
    //                        }
    //                        if (product.StokEkBilgi.Kull5N != null)
    //                        {
    //                            productDto.UnitGrossWeight = product.StokEkBilgi.Kull5N;
    //                        }
    //                        if (product.StokEkBilgi.Kull6N != null)
    //                        {
    //                            productDto.BoxGrossWeight = product.StokEkBilgi.Kull6N;
    //                        }
    //                        if (product.StokEkBilgi.Kull7N != null)
    //                        {
    //                            productDto.BoxQtyAt80x120Pallet = Convert.ToInt32(product.StokEkBilgi.Kull7N);
    //                        }
    //                        if (product.StokEkBilgi.Kull8N != null)
    //                        {
    //                            productDto.BoxQtyAt100x120Pallet = Convert.ToInt32(product.StokEkBilgi.Kull8N);
    //                        }

    //                        if (product.StokEkBilgi.Kull7S != "" && product.StokEkBilgi.Kull7S != null)
    //                        {
    //                            productDto.IsOrganic = product.StokEkBilgi.Kull7S.ToLower() == "organic" || product.StokEkBilgi.Kull7S.ToLower() == "organik" ? true : false;
    //                        }
    //                        if (product.StokTemelBilgi.Olcu_Br1 != "" && product.StokTemelBilgi.Olcu_Br1 != null)
    //                        {
    //                            productDto.Unit = product.StokTemelBilgi.Olcu_Br1;
    //                        }

    //                        foundProductsFromNetsisDto.Code2Product = productDto;
    //                    }
    //                }
    //            }
    //            if (stockDto.Code3 != null && erpSetting != null && erpSetting.Company3Db != null && erpSetting.Company3Db != "")
    //            {
    //                _oAuth2Comp3 = await oAuthLogin.LoginAsync(erpSetting.Company3Db);
    //                if (_oAuth2Comp3 != null)
    //                {
    //                    ProductDto productDto = new();
    //                    ItemsManager itemsManager = new(_oAuth2Comp3);

    //                    SelectFilter filter = new()
    //                    {
    //                        Filter = "STOK_KODU = '" + stockDto.Code3 + "'"
    //                    };

    //                    var item = itemsManager.GetInternal(filter);

    //                    if (item != null && item.Data.Count > 0)
    //                    {
    //                        var product = item.Data[0];

    //                        if (stockDto.Code1 != "" && stockDto.Code1 != null)
    //                        {
    //                            productDto.Code = stockDto.Code1.ToUpper();
    //                        }
    //                        if (stockDto.Code2 != "" && stockDto.Code2 != null)
    //                        {
    //                            productDto.Code2 = stockDto.Code2.ToUpper();
    //                        }
    //                        if (stockDto.Code3 != "" && stockDto.Code3 != null)
    //                        {
    //                            productDto.Code3 = stockDto.Code3.ToUpper();
    //                        }

    //                        if (product.StokTemelBilgi.Kod_1 != "" && product.StokTemelBilgi.Kod_1 != null)
    //                        {
    //                            var productGroupId = _productGroupRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_1).Select(x => x.Id).FirstOrDefault();
    //                            productDto.ProductGroupId = productGroupId;
    //                        }

    //                        if (product.StokTemelBilgi.Kod_2 != "" && product.StokTemelBilgi.Kod_2 != null)
    //                        {
    //                            var salesGroupId = _salesGroupRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_2).Select(x => x.Id).FirstOrDefault();
    //                            productDto.SalesGroupId = salesGroupId;
    //                        }

    //                        if (product.StokTemelBilgi.Kod_3 != "" && product.StokTemelBilgi.Kod_3 != null)
    //                        {
    //                            var rawMaterialGroupId = _rawMaterialGroupRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_3).Select(x => x.Id).FirstOrDefault();
    //                            productDto.RawMaterialGroupId = rawMaterialGroupId;
    //                        }

    //                        if (product.StokTemelBilgi.Payda_1 != null)
    //                        {
    //                            productDto.QtyInBox = product.StokTemelBilgi.Payda_1;
    //                        }

    //                        if (product.StokTemelBilgi.Kod_4 != "" && product.StokTemelBilgi.Kod_4 != null)
    //                        {
    //                            var packagingId = _packagingRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_4).Select(x => x.Id).FirstOrDefault();
    //                            productDto.PackagingId = packagingId;
    //                        }

    //                        if (product.StokTemelBilgi.Kod_5 != "" && product.StokTemelBilgi.Kod_5 != null)
    //                        {
    //                            var productionPlaceId = _productionPlaceRepository.Where(x => x.Code == product.StokTemelBilgi.Kod_5).Select(x => x.Id).FirstOrDefault();
    //                            productDto.ProductionPlaceId = productionPlaceId;
    //                        }


    //                        if (product.StokEkBilgi.Kull5S != "" && product.StokEkBilgi.Kull5S != null)
    //                        {
    //                            productDto.SpecificationFileId = product.StokEkBilgi.Kull5S;
    //                        }

    //                        if (product.StokTemelBilgi.Stok_Adi != "" && product.StokTemelBilgi.Stok_Adi != null)
    //                        {
    //                            productDto.Name = product.StokTemelBilgi.Stok_Adi;
    //                        }

    //                        if (product.StokEkBilgi.Ingisim != "" && product.StokEkBilgi.Ingisim != null)
    //                        {
    //                            productDto.Name2 = product.StokEkBilgi.Ingisim;
    //                        }

    //                        if (product.StokEkBilgi.Kull1N != null)
    //                        {
    //                            productDto.UnitStrainedWeight = product.StokEkBilgi.Kull1N;
    //                        }
    //                        if (product.StokEkBilgi.Kull2N != null)
    //                        {
    //                            productDto.BoxStrainedWeight = product.StokEkBilgi.Kull2N;
    //                        }
    //                        if (product.StokEkBilgi.Kull3N != null)
    //                        {
    //                            productDto.UnitNetWeight = product.StokEkBilgi.Kull3N;
    //                        }
    //                        if (product.StokEkBilgi.Kull4N != null)
    //                        {
    //                            productDto.BoxNetWeight = product.StokEkBilgi.Kull4N;
    //                        }
    //                        if (product.StokEkBilgi.Kull5N != null)
    //                        {
    //                            productDto.UnitGrossWeight = product.StokEkBilgi.Kull5N;
    //                        }
    //                        if (product.StokEkBilgi.Kull6N != null)
    //                        {
    //                            productDto.BoxGrossWeight = product.StokEkBilgi.Kull6N;
    //                        }
    //                        if (product.StokEkBilgi.Kull7N != null)
    //                        {
    //                            productDto.BoxQtyAt80x120Pallet = Convert.ToInt32(product.StokEkBilgi.Kull7N);
    //                        }
    //                        if (product.StokEkBilgi.Kull8N != null)
    //                        {
    //                            productDto.BoxQtyAt100x120Pallet = Convert.ToInt32(product.StokEkBilgi.Kull8N);
    //                        }
    //                        if (product.StokEkBilgi.Kull7S != "" && product.StokEkBilgi.Kull7S != null)
    //                        {
    //                            productDto.IsOrganic = product.StokEkBilgi.Kull7S.ToLower() == "organic" || product.StokEkBilgi.Kull7S.ToLower() == "organik" ? true : false;
    //                        }
    //                        if (product.StokTemelBilgi.Olcu_Br1 != "" && product.StokTemelBilgi.Olcu_Br1 != null)
    //                        {
    //                            productDto.Unit = product.StokTemelBilgi.Olcu_Br1;
    //                        }

    //                        foundProductsFromNetsisDto.Code3Product = productDto;
    //                    }
    //                }
    //            }
    //        }
    //        if (foundProductsFromNetsisDto.Code1Product.Id == null && foundProductsFromNetsisDto.Code2Product.Id == null && foundProductsFromNetsisDto.Code3Product.Id == null)
    //        {
    //            return null;
    //        }
    //        else
    //        {
    //            return foundProductsFromNetsisDto;
    //        }
    //    }

    //    public SpReportDto GetSPReport(SpReportDto spReportDto) // TODO Netsis Login
    //    {
    //        ///CODE1
    //        if (_oAuth2Comp1 != null)
    //        {

    //            ItemTransactionsManager manager = new(_oAuth2Comp1);
    //            string q = "";
    //            if (spReportDto.SPStock.Code1 != null && spReportDto.SPStock.Code1 != "")
    //            {
    //                q += " STOK_KODU = '" + spReportDto.SPStock.Code1 + "'";

    //            }
    //            if (spReportDto.ProductStocks != null && spReportDto.ProductStocks.Count > 0)
    //            {

    //                foreach (var p in spReportDto.ProductStocks)
    //                {
    //                    if (p.Code1 != null && p.Code1 != "")
    //                    {
    //                        if (q == "")
    //                        {
    //                            q += " STOK_KODU ='" + p.Code1 + "'";
    //                        }
    //                        else
    //                        {
    //                            q += " OR STOK_KODU ='" + p.Code1 + "'";
    //                        }
    //                    }
    //                }
    //            }

    //            SelectFilter filter = new()
    //            {
    //                Fields = ["Stok_Kodu", "Sthar_Gckod", "Sthar_Gcmik"],
    //                Filter = q,
    //                Limit = 100000
    //            };
    //            if (q != "")
    //            {
    //                var tmpResult = manager.GetInternal(filter).Data;

    //                if (tmpResult.Count > 0)
    //                {
    //                    var groupedEntries = tmpResult.GroupBy(entry => entry.Stok_Kodu.ToUpper());

    //                    foreach (var group in groupedEntries)
    //                    {
    //                        double kalanMiktar = (double)group.Sum(entry =>
    //                            entry.Sthar_Gckod == "G" ? entry.Sthar_Gcmik : -entry.Sthar_Gcmik);

    //                        if (group.Key.ToUpper() == spReportDto.SPStock.Code1.ToUpper())
    //                        {
    //                            spReportDto.SPStock.Code1Stock = Convert.ToInt32(kalanMiktar);
    //                        }
    //                        else
    //                        {
    //                            var stock = spReportDto.ProductStocks.FirstOrDefault(x => x.Code1.ToUpper() == group.Key.ToUpper());
    //                            stock.Code1Stock = Convert.ToInt32(kalanMiktar);
    //                        }
    //                    }


    //                }
    //            }

    //        }
    //        ///CODE2
    //        if (_oAuth2Comp2 != null)
    //        {
    //            ItemTransactionsManager manager = new(_oAuth2Comp2);
    //            string q = "";
    //            if (spReportDto.SPStock.Code2 != null && spReportDto.SPStock.Code2 != "")
    //            {
    //                q += " STOK_KODU = '" + spReportDto.SPStock.Code2 + "'";
    //            }
    //            if (spReportDto.ProductStocks != null && spReportDto.ProductStocks.Count > 0)
    //            {
    //                foreach (var p in spReportDto.ProductStocks)
    //                {
    //                    if (p.Code2 != null && p.Code2 != "")
    //                    {
    //                        if (q == "") { q += " STOK_KODU ='" + p.Code2 + "'"; }
    //                        else
    //                        {
    //                            q += " OR STOK_KODU ='" + p.Code2 + "'";
    //                        }
    //                    }
    //                }
    //            }

    //            SelectFilter filter = new()
    //            {
    //                Fields = ["Stok_Kodu", "Sthar_Gckod", "Sthar_Gcmik"],
    //                Filter = q,
    //                Limit = 100000
    //            };
    //            if (q != "")
    //            {
    //                var tmpResult = manager.GetInternal(filter).Data;

    //                if (tmpResult.Count > 0)
    //                {
    //                    var groupedEntries = tmpResult.GroupBy(entry => entry.Stok_Kodu.ToUpper());

    //                    foreach (var group in groupedEntries)
    //                    {
    //                        double kalanMiktar = (double)group.Sum(entry =>
    //                            entry.Sthar_Gckod == "G" ? entry.Sthar_Gcmik : -entry.Sthar_Gcmik);

    //                        if (group.Key.ToUpper() == spReportDto.SPStock.Code2.ToUpper())
    //                        {

    //                            spReportDto.SPStock.Code2Stock = Convert.ToInt32(kalanMiktar);
    //                        }
    //                        else
    //                        {
    //                            var stock = spReportDto.ProductStocks.FirstOrDefault(x => x.Code2.ToUpper() == group.Key.ToUpper());
    //                            stock.Code2Stock = Convert.ToInt32(kalanMiktar);
    //                        }
    //                    }


    //                }
    //            }

    //        }
    //        else { Console.WriteLine("NULL"); }
    //        ///CODE3
    //        if (_oAuth2Comp3 != null)
    //        {
    //            ItemTransactionsManager manager = new(_oAuth2Comp3);
    //            string q = "";
    //            if (spReportDto.SPStock.Code3 != null && spReportDto.SPStock.Code3 != "")
    //            {

    //                q += " STOK_KODU = '" + spReportDto.SPStock.Code3 + "'";
    //            }

    //            if (spReportDto.ProductStocks != null && spReportDto.ProductStocks.Count > 0)
    //            {
    //                foreach (var p in spReportDto.ProductStocks)
    //                {
    //                    if (p.Code3 != null && p.Code3 != "")
    //                    {
    //                        if (q == "")
    //                        {

    //                            q += " STOK_KODU ='" + p.Code3 + "'";
    //                        }
    //                        else
    //                        {
    //                            q += " OR STOK_KODU ='" + p.Code3 + "'";
    //                        }
    //                    }
    //                }
    //            }

    //            SelectFilter filter = new()
    //            {
    //                Fields = ["Stok_Kodu", "Sthar_Gckod", "Sthar_Gcmik"],
    //                Filter = q,
    //                Limit = 100000
    //            };
    //            if (q != "")
    //            {
    //                var tmpResult = manager.GetInternal(filter).Data;

    //                if (tmpResult.Count > 0)
    //                {
    //                    var groupedEntries = tmpResult.GroupBy(entry => entry.Stok_Kodu.ToUpper());

    //                    foreach (var group in groupedEntries)
    //                    {
    //                        double kalanMiktar = (double)group.Sum(entry =>
    //                            entry.Sthar_Gckod == "G" ? entry.Sthar_Gcmik : -entry.Sthar_Gcmik);

    //                        if (group.Key.ToUpper() == spReportDto.SPStock.Code3.ToUpper())
    //                        {

    //                            spReportDto.SPStock.Code3Stock = Convert.ToInt32(kalanMiktar);
    //                        }
    //                        else
    //                        {
    //                            var stock = spReportDto.ProductStocks.FirstOrDefault(x => x.Code3.ToUpper() == group.Key.ToUpper());
    //                            stock.Code3Stock = Convert.ToInt32(kalanMiktar);
    //                        }
    //                    }


    //                }
    //            }

    //        }

    //        return spReportDto;
    //    }
    //    public List<ProductionPlace> GetCode1sFromERP()
    //    {
    //        List<ProductionPlace> liste = [];
    //        if (_oAuth2Comp1 != null)
    //        {
    //            QueryManager queryManager = new QueryManager(_oAuth2Comp1);

    //            var dd = queryManager.NetRS("select GRUP_KOD,GRUP_ISIM from TBLSTOKKOD5").Data;

    //            liste = dd.Select(j => new ProductionPlace { Code = (string)j["GRUP_KOD"], Name = (string)j["GRUP_ISIM"] }).ToList();
    //        }
    //        return liste;
    //    }

    //    //public List<JObject> GetQueryResultFromNetsis(string query)
    //    //{
    //    //    List<Warehouse> liste = new List<Warehouse>();
    //    //    if (_oAuth2Comp1 != null)
    //    //    {
    //    //        QueryManager queryManager = new QueryManager(_oAuth2Comp1);

    //    //        var result = queryManager.NetRS("select DEPO_KODU,DEPO_ISMI from TBLSTOKDP").Data;

    //    //    return result;
    //    //    }
    //    //}

    //    public async Task<StockDto> GetStockByProductId(StockDto stockDto)
    //    {
    //        var erpSetting = _erpSettingRepository.Where(x => x.Status).Take(1).OrderBy(x => x.Id).FirstOrDefault();

    //        OAuthLogin oAuthLogin = new();

    //        if (erpSetting != null)
    //        {
    //            if (erpSetting.Company1Db != "" && erpSetting.Company1Db != null && (stockDto.Code1 != null && stockDto.Code1 != ""))
    //            {
    //                _oAuth2Comp1 = await oAuthLogin.LoginAsync(erpSetting.Company1Db);
    //                if (_oAuth2Comp1 != null)
    //                {
    //                    ItemTransactionsManager manager = new(_oAuth2Comp1);

    //                    SelectFilter filter = new()
    //                    {
    //                        Fields = ["Stok_Kodu", "Sthar_Gckod", "Sthar_Gcmik"],
    //                        Filter = "STOK_KODU = '" + stockDto.Code1 + "'",
    //                        Limit = 100000
    //                    };

    //                    var tmpResult = manager.GetInternal(filter).Data;

    //                    int total = 0;

    //                    foreach (var item in tmpResult)
    //                    {

    //                        if (item.Sthar_Gckod == "G") { var i = Convert.ToInt32(item.Sthar_Gcmik); total += i; }
    //                        if (item.Sthar_Gckod == "C") { var i = Convert.ToInt32(item.Sthar_Gcmik); total -= i; }
    //                    }

    //                    stockDto.Code1Stock = total;
    //                }
    //            }
    //            if (erpSetting.Company2Db != "" && erpSetting.Company2Db != null && (stockDto.Code2 != null && stockDto.Code2 != ""))
    //            {
    //                _oAuth2Comp2 = await oAuthLogin.LoginAsync(erpSetting.Company2Db);
    //                if (_oAuth2Comp2 != null)
    //                {
    //                    ItemTransactionsManager manager = new ItemTransactionsManager(_oAuth2Comp2);

    //                    SelectFilter filter = new()
    //                    {
    //                        Fields = ["Stok_Kodu", "Sthar_Gckod", "Sthar_Gcmik"],
    //                        Filter = "STOK_KODU = '" + stockDto.Code2 + "'",
    //                        Limit = 100000
    //                    };

    //                    var tmpResult = manager.GetInternal(filter).Data;

    //                    int total = 0;

    //                    foreach (var item in tmpResult)
    //                    {
    //                        if (item.Sthar_Gckod == "G") { var i = Convert.ToInt32(item.Sthar_Gcmik); total += i; }
    //                        if (item.Sthar_Gckod == "C") { var i = Convert.ToInt32(item.Sthar_Gcmik); total -= i; }
    //                    }

    //                    stockDto.Code2Stock = total;
    //                }
    //            }
    //            if (erpSetting.Company3Db != "" && erpSetting.Company3Db != null && (stockDto.Code3 != null && stockDto.Code3 != ""))
    //            {
    //                _oAuth2Comp3 = await oAuthLogin.LoginAsync(erpSetting.Company3Db);
    //                if (_oAuth2Comp3 != null)
    //                {
    //                    ItemTransactionsManager manager = new(_oAuth2Comp3);

    //                    SelectFilter filter = new()
    //                    {
    //                        Fields = ["Stok_Kodu", "Sthar_Gckod", "Sthar_Gcmik"],
    //                        Filter = "STOK_KODU = '" + stockDto.Code3 + "'",
    //                        Limit = 100000
    //                    };

    //                    var tmpResult = manager.GetInternal(filter).Data;

    //                    int total = 0;

    //                    foreach (var item in tmpResult)
    //                    {
    //                        if (item.Sthar_Gckod == "G") { var i = Convert.ToInt32(item.Sthar_Gcmik); total += i; }
    //                        if (item.Sthar_Gckod == "C") { var i = Convert.ToInt32(item.Sthar_Gcmik); total -= i; }
    //                    }

    //                    stockDto.Code3Stock = total;
    //                }
    //            }
    //        }
    //        return stockDto;
    //    }
    //}
}
