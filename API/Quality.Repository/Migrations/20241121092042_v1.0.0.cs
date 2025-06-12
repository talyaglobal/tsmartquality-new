using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Quality.Repository.Migrations
{
    /// <inheritdoc />
    public partial class v100 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Brands",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brands", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BudgetGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ColorTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ColorTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Countries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Countries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CuttingTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CuttingTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ERPSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code1Name = table.Column<string>(type: "text", nullable: true),
                    Code2Name = table.Column<string>(type: "text", nullable: true),
                    Code3Name = table.Column<string>(type: "text", nullable: true),
                    Company1Db = table.Column<string>(type: "text", nullable: true),
                    Company2Db = table.Column<string>(type: "text", nullable: true),
                    Company3Db = table.Column<string>(type: "text", nullable: true),
                    ERPUserName = table.Column<string>(type: "text", nullable: false),
                    ERPUserPassword = table.Column<string>(type: "text", nullable: false),
                    ERPDbUser = table.Column<string>(type: "text", nullable: false),
                    ERPDbPassword = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ERPSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Groups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Localizations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Keyword = table.Column<string>(type: "text", nullable: false),
                    TR = table.Column<string>(type: "text", nullable: true),
                    EN = table.Column<string>(type: "text", nullable: true),
                    ES = table.Column<string>(type: "text", nullable: true),
                    FR = table.Column<string>(type: "text", nullable: true),
                    IT = table.Column<string>(type: "text", nullable: true),
                    RU = table.Column<string>(type: "text", nullable: true),
                    DE = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Localizations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Packagings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Packagings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PhotoTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhotoTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductGroupTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductGroupTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductionPlaces",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionPlaces", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QualityTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QualityTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RawMaterialGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RawMaterialGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SalesBaseds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesBaseds", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SalesGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Seller",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Seller", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SemiProductGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SemiProductGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SKUFollowTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SKUFollowTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SKUFollowUnits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SKUFollowUnits", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StorageConditions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StorageConditions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Warehouses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Warehouses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IsConfirm = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    PasswordSalt = table.Column<byte[]>(type: "bytea", nullable: false),
                    PasswordHash = table.Column<byte[]>(type: "bytea", nullable: false),
                    GroupId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Surname = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Email = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: false),
                    NotificationToken = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductGroupTypeDefinitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductGroupTypeId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductGroupTypeDefinitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductGroupTypeDefinitions_ProductGroupTypes_ProductGroupT~",
                        column: x => x.ProductGroupTypeId,
                        principalTable: "ProductGroupTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RawMaterials",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "text", nullable: true),
                    Code2 = table.Column<string>(type: "text", nullable: true),
                    Code3 = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    RawMaterialGroupId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RawMaterials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RawMaterials_RawMaterialGroups_RawMaterialGroupId",
                        column: x => x.RawMaterialGroupId,
                        principalTable: "RawMaterialGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GroupInRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GroupId = table.Column<int>(type: "integer", nullable: false),
                    RoleId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupInRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupInRoles_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GroupInRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SemiProducts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OldCode = table.Column<string>(type: "text", nullable: true),
                    Code = table.Column<string>(type: "text", nullable: true),
                    Code2 = table.Column<string>(type: "text", nullable: true),
                    Code3 = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    SemiProductGroupId = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SemiProducts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SemiProducts_SemiProductGroups_SemiProductGroupId",
                        column: x => x.SemiProductGroupId,
                        principalTable: "SemiProductGroups",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SellerId = table.Column<int>(type: "integer", nullable: true),
                    Code = table.Column<string>(type: "text", nullable: true),
                    ProductGroupId = table.Column<int>(type: "integer", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: true),
                    BrandId = table.Column<int>(type: "integer", nullable: true),
                    ProductTypeId = table.Column<int>(type: "integer", nullable: true),
                    SKUFollowTypeId = table.Column<int>(type: "integer", nullable: true),
                    SKUFollowUnitId = table.Column<int>(type: "integer", nullable: true),
                    StorageConditionId = table.Column<int>(type: "integer", nullable: true),
                    Weight = table.Column<double>(type: "double precision", nullable: true),
                    Volume = table.Column<double>(type: "double precision", nullable: true),
                    Density = table.Column<double>(type: "double precision", nullable: true),
                    Width = table.Column<double>(type: "double precision", nullable: true),
                    Length = table.Column<double>(type: "double precision", nullable: true),
                    Height = table.Column<double>(type: "double precision", nullable: true),
                    CriticalStockAmount = table.Column<double>(type: "double precision", nullable: true),
                    ShelflifeLimit = table.Column<double>(type: "double precision", nullable: true),
                    MaxStack = table.Column<int>(type: "integer", nullable: true),
                    StockTracking = table.Column<bool>(type: "boolean", nullable: true),
                    BBDTracking = table.Column<bool>(type: "boolean", nullable: true),
                    LotTracking = table.Column<bool>(type: "boolean", nullable: true),
                    IsBlocked = table.Column<bool>(type: "boolean", nullable: true),
                    IsSettedProduct = table.Column<bool>(type: "boolean", nullable: true),
                    BudgetGroupId = table.Column<int>(type: "integer", nullable: true),
                    ColorTypeId = table.Column<int>(type: "integer", nullable: true),
                    CuttingTypeId = table.Column<int>(type: "integer", nullable: true),
                    PackagingId = table.Column<int>(type: "integer", nullable: true),
                    ProductStatusId = table.Column<int>(type: "integer", nullable: true),
                    ProductionPlaceId = table.Column<int>(type: "integer", nullable: true),
                    QualityTypeId = table.Column<int>(type: "integer", nullable: true),
                    SalesBasedId = table.Column<int>(type: "integer", nullable: true),
                    SalesGroupId = table.Column<int>(type: "integer", nullable: true),
                    SemiProductGroupId = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_BudgetGroups_BudgetGroupId",
                        column: x => x.BudgetGroupId,
                        principalTable: "BudgetGroups",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_ColorTypes_ColorTypeId",
                        column: x => x.ColorTypeId,
                        principalTable: "ColorTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_CuttingTypes_CuttingTypeId",
                        column: x => x.CuttingTypeId,
                        principalTable: "CuttingTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_Packagings_PackagingId",
                        column: x => x.PackagingId,
                        principalTable: "Packagings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_ProductGroups_ProductGroupId",
                        column: x => x.ProductGroupId,
                        principalTable: "ProductGroups",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_ProductStatuses_ProductStatusId",
                        column: x => x.ProductStatusId,
                        principalTable: "ProductStatuses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_ProductTypes_ProductTypeId",
                        column: x => x.ProductTypeId,
                        principalTable: "ProductTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_ProductionPlaces_ProductionPlaceId",
                        column: x => x.ProductionPlaceId,
                        principalTable: "ProductionPlaces",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_QualityTypes_QualityTypeId",
                        column: x => x.QualityTypeId,
                        principalTable: "QualityTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_SKUFollowTypes_SKUFollowTypeId",
                        column: x => x.SKUFollowTypeId,
                        principalTable: "SKUFollowTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_SKUFollowUnits_SKUFollowUnitId",
                        column: x => x.SKUFollowUnitId,
                        principalTable: "SKUFollowUnits",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_SalesBaseds_SalesBasedId",
                        column: x => x.SalesBasedId,
                        principalTable: "SalesBaseds",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_SalesGroups_SalesGroupId",
                        column: x => x.SalesGroupId,
                        principalTable: "SalesGroups",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_Seller_SellerId",
                        column: x => x.SellerId,
                        principalTable: "Seller",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_SemiProductGroups_SemiProductGroupId",
                        column: x => x.SemiProductGroupId,
                        principalTable: "SemiProductGroups",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_StorageConditions_StorageConditionId",
                        column: x => x.StorageConditionId,
                        principalTable: "StorageConditions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Norms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Norms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Norms_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Photos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PhotoUrl = table.Column<string>(type: "text", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    PhotoTypeId = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Photos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Photos_PhotoTypes_PhotoTypeId",
                        column: x => x.PhotoTypeId,
                        principalTable: "PhotoTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Photos_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Photos_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProductHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    ProductStatusId_Old = table.Column<int>(type: "integer", nullable: true),
                    ProductStatusId_New = table.Column<int>(type: "integer", nullable: true),
                    SellerId_Old = table.Column<int>(type: "integer", nullable: true),
                    SellerId_New = table.Column<int>(type: "integer", nullable: true),
                    Code_Old = table.Column<string>(type: "text", nullable: true),
                    Code_New = table.Column<string>(type: "text", nullable: true),
                    Code2_Old = table.Column<string>(type: "text", nullable: true),
                    Code2_New = table.Column<string>(type: "text", nullable: true),
                    Code3_Old = table.Column<string>(type: "text", nullable: true),
                    Code3_New = table.Column<string>(type: "text", nullable: true),
                    ProductGroupId_Old = table.Column<int>(type: "integer", nullable: true),
                    ProductGroupId_New = table.Column<int>(type: "integer", nullable: true),
                    Name_Old = table.Column<string>(type: "text", nullable: true),
                    Name_New = table.Column<string>(type: "text", nullable: true),
                    Name2_Old = table.Column<string>(type: "text", nullable: true),
                    Name2_New = table.Column<string>(type: "text", nullable: true),
                    BrandId_Old = table.Column<int>(type: "integer", nullable: true),
                    BrandId_New = table.Column<int>(type: "integer", nullable: true),
                    BudgetGroupId_Old = table.Column<int>(type: "integer", nullable: true),
                    BudgetGroupId_New = table.Column<int>(type: "integer", nullable: true),
                    SalesGroupId_Old = table.Column<int>(type: "integer", nullable: true),
                    SalesGroupId_New = table.Column<int>(type: "integer", nullable: true),
                    UnitStrainedWeight_Old = table.Column<double>(type: "double precision", nullable: true),
                    UnitStrainedWeight_New = table.Column<double>(type: "double precision", nullable: true),
                    BoxStrainedWeight_Old = table.Column<double>(type: "double precision", nullable: true),
                    BoxStrainedWeight_New = table.Column<double>(type: "double precision", nullable: true),
                    UnitNetWeight_Old = table.Column<double>(type: "double precision", nullable: true),
                    UnitNetWeight_New = table.Column<double>(type: "double precision", nullable: true),
                    BoxNetWeight_Old = table.Column<double>(type: "double precision", nullable: true),
                    BoxNetWeight_New = table.Column<double>(type: "double precision", nullable: true),
                    UnitGrossWeight_Old = table.Column<double>(type: "double precision", nullable: true),
                    UnitGrossWeight_New = table.Column<double>(type: "double precision", nullable: true),
                    BoxGrossWeight_Old = table.Column<double>(type: "double precision", nullable: true),
                    BoxGrossWeight_New = table.Column<double>(type: "double precision", nullable: true),
                    BoxQtyAt80x120Pallet_Old = table.Column<int>(type: "integer", nullable: true),
                    BoxQtyAt80x120Pallet_New = table.Column<int>(type: "integer", nullable: true),
                    BoxQtyAt100x120Pallet_Old = table.Column<int>(type: "integer", nullable: true),
                    BoxQtyAt100x120Pallet_New = table.Column<int>(type: "integer", nullable: true),
                    QtyInBox_Old = table.Column<double>(type: "double precision", nullable: true),
                    QtyInBox_New = table.Column<double>(type: "double precision", nullable: true),
                    HeightOf80x120Pallet_Old = table.Column<int>(type: "integer", nullable: true),
                    HeightOf80x120Pallet_New = table.Column<int>(type: "integer", nullable: true),
                    HeightOf100x120Pallet_Old = table.Column<int>(type: "integer", nullable: true),
                    HeightOf100x120Pallet_New = table.Column<int>(type: "integer", nullable: true),
                    Unit_Old = table.Column<string>(type: "text", nullable: true),
                    Unit_New = table.Column<string>(type: "text", nullable: true),
                    RawMaterialGroupId_Old = table.Column<int>(type: "integer", nullable: true),
                    RawMaterialGroupId_New = table.Column<int>(type: "integer", nullable: true),
                    StorageConditionId_Old = table.Column<int>(type: "integer", nullable: true),
                    StorageConditionId_New = table.Column<int>(type: "integer", nullable: true),
                    PackagingId_Old = table.Column<int>(type: "integer", nullable: true),
                    PackagingId_New = table.Column<int>(type: "integer", nullable: true),
                    ProductionPlaceId_Old = table.Column<int>(type: "integer", nullable: true),
                    ProductionPlaceId_New = table.Column<int>(type: "integer", nullable: true),
                    CuttingTypeId_Old = table.Column<int>(type: "integer", nullable: true),
                    CuttingTypeId_New = table.Column<int>(type: "integer", nullable: true),
                    QualityTypeId_Old = table.Column<int>(type: "integer", nullable: true),
                    QualityTypeId_New = table.Column<int>(type: "integer", nullable: true),
                    IsOrganic_Old = table.Column<bool>(type: "boolean", nullable: false),
                    IsOrganic_New = table.Column<bool>(type: "boolean", nullable: false),
                    ColorTypeId_Old = table.Column<int>(type: "integer", nullable: true),
                    ColorTypeId_New = table.Column<int>(type: "integer", nullable: true),
                    ExpireDate_Old = table.Column<string>(type: "text", nullable: true),
                    ExpireDate_New = table.Column<string>(type: "text", nullable: true),
                    NormFile_Old = table.Column<string>(type: "text", nullable: true),
                    NormFile_New = table.Column<string>(type: "text", nullable: true),
                    SpecificationFileId_Old = table.Column<string>(type: "text", nullable: true),
                    SpecificationFileId_New = table.Column<string>(type: "text", nullable: true),
                    FlowChartFileId_Old = table.Column<string>(type: "text", nullable: true),
                    FlowChartFileId_New = table.Column<string>(type: "text", nullable: true),
                    HACCPFileId_Old = table.Column<string>(type: "text", nullable: true),
                    HACCPFileId_New = table.Column<string>(type: "text", nullable: true),
                    LabelForm_Old = table.Column<string>(type: "text", nullable: true),
                    LabelForm_New = table.Column<string>(type: "text", nullable: true),
                    PrintedLabel_Old = table.Column<string>(type: "text", nullable: true),
                    PrintedLabel_New = table.Column<string>(type: "text", nullable: true),
                    SalesBasedId_Old = table.Column<int>(type: "integer", nullable: true),
                    SalesBasedId_New = table.Column<int>(type: "integer", nullable: true),
                    SpecCode_Old = table.Column<string>(type: "text", nullable: true),
                    SpecCode_New = table.Column<string>(type: "text", nullable: true),
                    HSCode_Old = table.Column<string>(type: "text", nullable: true),
                    HSCode_New = table.Column<string>(type: "text", nullable: true),
                    MaterialCostRate_Old = table.Column<double>(type: "double precision", nullable: true),
                    MaterialCostRate_New = table.Column<double>(type: "double precision", nullable: true),
                    LabourCostRate_Old = table.Column<double>(type: "double precision", nullable: true),
                    LabourCostRate_New = table.Column<double>(type: "double precision", nullable: true),
                    SemiProductGroupId_Old = table.Column<int>(type: "integer", nullable: true),
                    SemiProductGroupId_New = table.Column<int>(type: "integer", nullable: true),
                    IsERP1Updated = table.Column<bool>(type: "boolean", nullable: false),
                    IsERP2Updated = table.Column<bool>(type: "boolean", nullable: false),
                    IsERP3Updated = table.Column<bool>(type: "boolean", nullable: false),
                    ERP1UpdateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ERP2UpdateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ERP3UpdateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateTryTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductHistories_Brands_BrandId_New",
                        column: x => x.BrandId_New,
                        principalTable: "Brands",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductHistories_BudgetGroups_BudgetGroupId_New",
                        column: x => x.BudgetGroupId_New,
                        principalTable: "BudgetGroups",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductHistories_ColorTypes_ColorTypeId_New",
                        column: x => x.ColorTypeId_New,
                        principalTable: "ColorTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductHistories_CuttingTypes_CuttingTypeId_New",
                        column: x => x.CuttingTypeId_New,
                        principalTable: "CuttingTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductHistories_Packagings_PackagingId_New",
                        column: x => x.PackagingId_New,
                        principalTable: "Packagings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductHistories_ProductGroups_ProductGroupId_New",
                        column: x => x.ProductGroupId_New,
                        principalTable: "ProductGroups",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductHistories_ProductStatuses_ProductStatusId_New",
                        column: x => x.ProductStatusId_New,
                        principalTable: "ProductStatuses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductHistories_ProductionPlaces_ProductionPlaceId_New",
                        column: x => x.ProductionPlaceId_New,
                        principalTable: "ProductionPlaces",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductHistories_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductHistories_QualityTypes_QualityTypeId_New",
                        column: x => x.QualityTypeId_New,
                        principalTable: "QualityTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductHistories_RawMaterialGroups_RawMaterialGroupId_New",
                        column: x => x.RawMaterialGroupId_New,
                        principalTable: "RawMaterialGroups",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductHistories_SalesBaseds_SalesBasedId_New",
                        column: x => x.SalesBasedId_New,
                        principalTable: "SalesBaseds",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductHistories_SalesGroups_SalesGroupId_New",
                        column: x => x.SalesGroupId_New,
                        principalTable: "SalesGroups",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductHistories_Seller_SellerId_New",
                        column: x => x.SellerId_New,
                        principalTable: "Seller",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductHistories_SemiProductGroups_SemiProductGroupId_New",
                        column: x => x.SemiProductGroupId_New,
                        principalTable: "SemiProductGroups",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductHistories_StorageConditions_StorageConditionId_New",
                        column: x => x.StorageConditionId_New,
                        principalTable: "StorageConditions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProductToCustomers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    CustomerId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductToCustomers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductToCustomers_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductToCustomers_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductToProductGroupTypeDefinitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    ProductGroupTypeDefinitionId = table.Column<int>(type: "integer", nullable: false),
                    ProductGroupTypeId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductToProductGroupTypeDefinitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductToProductGroupTypeDefinitions_ProductGroupTypeDefini~",
                        column: x => x.ProductGroupTypeDefinitionId,
                        principalTable: "ProductGroupTypeDefinitions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductToProductGroupTypeDefinitions_ProductGroupTypes_Prod~",
                        column: x => x.ProductGroupTypeId,
                        principalTable: "ProductGroupTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductToProductGroupTypeDefinitions_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Recipes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: true),
                    SemiProductId = table.Column<int>(type: "integer", nullable: true),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recipes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Recipes_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Recipes_SemiProducts_SemiProductId",
                        column: x => x.SemiProductId,
                        principalTable: "SemiProducts",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Specs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Specs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Specs_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NormDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NormId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NormDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NormDetails_Norms_NormId",
                        column: x => x.NormId,
                        principalTable: "Norms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecipeDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RecipeId = table.Column<int>(type: "integer", nullable: false),
                    SemiProductId = table.Column<int>(type: "integer", nullable: true),
                    RawMaterialId = table.Column<int>(type: "integer", nullable: true),
                    PackageCode = table.Column<string>(type: "text", nullable: false),
                    AuxMaterialCode = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<int>(type: "integer", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecipeDetails_RawMaterials_RawMaterialId",
                        column: x => x.RawMaterialId,
                        principalTable: "RawMaterials",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecipeDetails_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecipeDetails_SemiProducts_SemiProductId",
                        column: x => x.SemiProductId,
                        principalTable: "SemiProducts",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SpecDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SpecId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpecDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SpecDetails_Specs_SpecId",
                        column: x => x.SpecId,
                        principalTable: "Specs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GroupInRoles_GroupId",
                table: "GroupInRoles",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupInRoles_RoleId",
                table: "GroupInRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Localizations_Keyword",
                table: "Localizations",
                column: "Keyword",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NormDetails_NormId",
                table: "NormDetails",
                column: "NormId");

            migrationBuilder.CreateIndex(
                name: "IX_Norms_ProductId",
                table: "Norms",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Photos_PhotoTypeId",
                table: "Photos",
                column: "PhotoTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Photos_ProductId",
                table: "Photos",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Photos_UserId",
                table: "Photos",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductGroupTypeDefinitions_ProductGroupTypeId",
                table: "ProductGroupTypeDefinitions",
                column: "ProductGroupTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_BrandId_New",
                table: "ProductHistories",
                column: "BrandId_New");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_BudgetGroupId_New",
                table: "ProductHistories",
                column: "BudgetGroupId_New");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_ColorTypeId_New",
                table: "ProductHistories",
                column: "ColorTypeId_New");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_CuttingTypeId_New",
                table: "ProductHistories",
                column: "CuttingTypeId_New");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_PackagingId_New",
                table: "ProductHistories",
                column: "PackagingId_New");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_ProductGroupId_New",
                table: "ProductHistories",
                column: "ProductGroupId_New");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_ProductId",
                table: "ProductHistories",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_ProductionPlaceId_New",
                table: "ProductHistories",
                column: "ProductionPlaceId_New");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_ProductStatusId_New",
                table: "ProductHistories",
                column: "ProductStatusId_New");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_QualityTypeId_New",
                table: "ProductHistories",
                column: "QualityTypeId_New");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_RawMaterialGroupId_New",
                table: "ProductHistories",
                column: "RawMaterialGroupId_New");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_SalesBasedId_New",
                table: "ProductHistories",
                column: "SalesBasedId_New");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_SalesGroupId_New",
                table: "ProductHistories",
                column: "SalesGroupId_New");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_SellerId_New",
                table: "ProductHistories",
                column: "SellerId_New");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_SemiProductGroupId_New",
                table: "ProductHistories",
                column: "SemiProductGroupId_New");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistories_StorageConditionId_New",
                table: "ProductHistories",
                column: "StorageConditionId_New");

            migrationBuilder.CreateIndex(
                name: "IX_Products_BrandId",
                table: "Products",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_BudgetGroupId",
                table: "Products",
                column: "BudgetGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_ColorTypeId",
                table: "Products",
                column: "ColorTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CuttingTypeId",
                table: "Products",
                column: "CuttingTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_PackagingId",
                table: "Products",
                column: "PackagingId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_ProductGroupId",
                table: "Products",
                column: "ProductGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_ProductionPlaceId",
                table: "Products",
                column: "ProductionPlaceId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_ProductStatusId",
                table: "Products",
                column: "ProductStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_ProductTypeId",
                table: "Products",
                column: "ProductTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_QualityTypeId",
                table: "Products",
                column: "QualityTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_SalesBasedId",
                table: "Products",
                column: "SalesBasedId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_SalesGroupId",
                table: "Products",
                column: "SalesGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_SellerId",
                table: "Products",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_SemiProductGroupId",
                table: "Products",
                column: "SemiProductGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_SKUFollowTypeId",
                table: "Products",
                column: "SKUFollowTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_SKUFollowUnitId",
                table: "Products",
                column: "SKUFollowUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_StorageConditionId",
                table: "Products",
                column: "StorageConditionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductToCustomers_CustomerId",
                table: "ProductToCustomers",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductToCustomers_ProductId",
                table: "ProductToCustomers",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductToProductGroupTypeDefinitions_ProductGroupTypeDefini~",
                table: "ProductToProductGroupTypeDefinitions",
                column: "ProductGroupTypeDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductToProductGroupTypeDefinitions_ProductGroupTypeId",
                table: "ProductToProductGroupTypeDefinitions",
                column: "ProductGroupTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductToProductGroupTypeDefinitions_ProductId",
                table: "ProductToProductGroupTypeDefinitions",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_RawMaterials_RawMaterialGroupId",
                table: "RawMaterials",
                column: "RawMaterialGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeDetails_RawMaterialId",
                table: "RecipeDetails",
                column: "RawMaterialId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeDetails_RecipeId",
                table: "RecipeDetails",
                column: "RecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeDetails_SemiProductId",
                table: "RecipeDetails",
                column: "SemiProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_ProductId",
                table: "Recipes",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_SemiProductId",
                table: "Recipes",
                column: "SemiProductId");

            migrationBuilder.CreateIndex(
                name: "IX_SemiProducts_SemiProductGroupId",
                table: "SemiProducts",
                column: "SemiProductGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_SpecDetails_SpecId",
                table: "SpecDetails",
                column: "SpecId");

            migrationBuilder.CreateIndex(
                name: "IX_Specs_ProductId",
                table: "Specs",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_GroupId",
                table: "Users",
                column: "GroupId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Countries");

            migrationBuilder.DropTable(
                name: "ERPSettings");

            migrationBuilder.DropTable(
                name: "GroupInRoles");

            migrationBuilder.DropTable(
                name: "Localizations");

            migrationBuilder.DropTable(
                name: "NormDetails");

            migrationBuilder.DropTable(
                name: "Photos");

            migrationBuilder.DropTable(
                name: "ProductHistories");

            migrationBuilder.DropTable(
                name: "ProductToCustomers");

            migrationBuilder.DropTable(
                name: "ProductToProductGroupTypeDefinitions");

            migrationBuilder.DropTable(
                name: "RecipeDetails");

            migrationBuilder.DropTable(
                name: "SpecDetails");

            migrationBuilder.DropTable(
                name: "Warehouses");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Norms");

            migrationBuilder.DropTable(
                name: "PhotoTypes");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "ProductGroupTypeDefinitions");

            migrationBuilder.DropTable(
                name: "RawMaterials");

            migrationBuilder.DropTable(
                name: "Recipes");

            migrationBuilder.DropTable(
                name: "Specs");

            migrationBuilder.DropTable(
                name: "Groups");

            migrationBuilder.DropTable(
                name: "ProductGroupTypes");

            migrationBuilder.DropTable(
                name: "RawMaterialGroups");

            migrationBuilder.DropTable(
                name: "SemiProducts");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Brands");

            migrationBuilder.DropTable(
                name: "BudgetGroups");

            migrationBuilder.DropTable(
                name: "ColorTypes");

            migrationBuilder.DropTable(
                name: "CuttingTypes");

            migrationBuilder.DropTable(
                name: "Packagings");

            migrationBuilder.DropTable(
                name: "ProductGroups");

            migrationBuilder.DropTable(
                name: "ProductStatuses");

            migrationBuilder.DropTable(
                name: "ProductTypes");

            migrationBuilder.DropTable(
                name: "ProductionPlaces");

            migrationBuilder.DropTable(
                name: "QualityTypes");

            migrationBuilder.DropTable(
                name: "SKUFollowTypes");

            migrationBuilder.DropTable(
                name: "SKUFollowUnits");

            migrationBuilder.DropTable(
                name: "SalesBaseds");

            migrationBuilder.DropTable(
                name: "SalesGroups");

            migrationBuilder.DropTable(
                name: "Seller");

            migrationBuilder.DropTable(
                name: "SemiProductGroups");

            migrationBuilder.DropTable(
                name: "StorageConditions");
        }
    }
}
