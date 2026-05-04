using Microsoft.EntityFrameworkCore;

namespace SolutionOrders.API.Models.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<UnitOfMeasurement> UnitOfMeasurements { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Worker> Workers { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // UnitOfMeasurement
            modelBuilder.Entity<UnitOfMeasurement>(entity =>
            {
                entity.HasKey(e => e.IdUnitOfMeasurement);
                entity.Property(e => e.IsActive).IsRequired();
            });

            // Category
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.IdCategory);
                entity.Property(e => e.IsActive).IsRequired();
            });

            // Client
            modelBuilder.Entity<Client>(entity =>
            {
                entity.HasKey(e => e.IdClient);
                entity.Property(e => e.IsActive).IsRequired();
            });

            // Worker
            modelBuilder.Entity<Worker>(entity =>
            {
                entity.HasKey(e => e.IdWorker);
                entity.Property(e => e.Login).IsRequired();
                entity.Property(e => e.IsActive).IsRequired();
            });

            // Item
            modelBuilder.Entity<Item>(entity =>
            {
                entity.HasKey(e => e.IdItem);
                entity.Property(e => e.IdCategory).IsRequired();
                entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.Quantity).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.IsActive).IsRequired();

                entity.HasOne(e => e.Category)
                    .WithMany(c => c.Items)
                    .HasForeignKey(e => e.IdCategory)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.UnitOfMeasurement)
                    .WithMany(u => u.Items)
                    .HasForeignKey(e => e.IdUnitOfMeasurement)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Order
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.IdOrder);

                entity.HasOne(e => e.Client)
                    .WithMany(c => c.Orders)
                    .HasForeignKey(e => e.IdClient)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Worker)
                    .WithMany(w => w.Orders)
                    .HasForeignKey(e => e.IdWorker)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // OrderItem
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(e => e.IdOrderItem);
                entity.Property(e => e.IdOrder).IsRequired();
                entity.Property(e => e.IdItem).IsRequired();
                entity.Property(e => e.Quantity).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.IsActive).IsRequired();

                entity.HasOne(e => e.Order)
                    .WithMany(o => o.OrderItems)
                    .HasForeignKey(e => e.IdOrder)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Item)
                    .WithMany(i => i.OrderItems)
                    .HasForeignKey(e => e.IdItem)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Seed data - przykładowe dane
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // UnitOfMeasurement
            modelBuilder.Entity<UnitOfMeasurement>().HasData(
                new UnitOfMeasurement
                {
                    IdUnitOfMeasurement = 1,
                    Name = "szt",
                    Description = "Sztuki",
                    IsActive = true
                },
                new UnitOfMeasurement
                {
                    IdUnitOfMeasurement = 2,
                    Name = "kg",
                    Description = "Kilogramy",
                    IsActive = true
                },
                new UnitOfMeasurement
                {
                    IdUnitOfMeasurement = 3,
                    Name = "m",
                    Description = "Metry",
                    IsActive = true
                }
            );

            // Category
            modelBuilder.Entity<Category>().HasData(
                new Category
                {
                    IdCategory = 1,
                    Name = "Drukarki 3D",
                    Description = "Drukarki 3D FDM i inne urządzenia do druku przestrzennego",
                    IsActive = true
                },
                new Category
                {
                    IdCategory = 2,
                    Name = "Filamenty",
                    Description = "Materiały eksploatacyjne do drukarek 3D, np. PLA, PET-G, TPU",
                    IsActive = true
                },
                new Category
                {
                    IdCategory = 3,
                    Name = "Dysze",
                    Description = "Dysze do głowic drukarek 3D w różnych rozmiarach",
                    IsActive = true
                },
                new Category
                {
                    IdCategory = 4,
                    Name = "Stoły robocze",
                    Description = "Powierzchnie robocze, nakładki PEI i akcesoria do stołów",
                    IsActive = true
                },
                new Category
                {
                    IdCategory = 5,
                    Name = "Części",
                    Description = "Części zamienne i podzespoły do drukarek 3D",
                    IsActive = true
                },
                new Category
                {
                    IdCategory = 6,
                    Name = "Narzędzia",
                    Description = "Narzędzia serwisowe i akcesoria pomocnicze",
                    IsActive = true
                }
            );

            // Client
            modelBuilder.Entity<Client>().HasData(
                new Client
                {
                    IdClient = 1,
                    Name = "Jan Kowalski",
                    Adress = "ul. Główna 1, Warszawa",
                    PhoneNumber = "500-100-200",
                    IsActive = true
                },
                new Client
                {
                    IdClient = 2,
                    Name = "Anna Nowak",
                    Adress = "ul. Kwiatowa 5, Kraków",
                    PhoneNumber = "600-200-300",
                    IsActive = true
                },
                new Client
                {
                    IdClient = 3,
                    Name = "Marek Wiśniewski",
                    Adress = "ul. Leśna 12, Gdańsk",
                    PhoneNumber = "700-300-400",
                    IsActive = true
                }
            );

            // Worker
            modelBuilder.Entity<Worker>().HasData(
                new Worker
                {
                    IdWorker = 1,
                    FirstName = "Piotr",
                    LastName = "Kowalczyk",
                    Login = "pkowalczyk",
                    Password = "haslo123",
                    IsActive = true
                },
                new Worker
                {
                    IdWorker = 2,
                    FirstName = "Maria",
                    LastName = "Wiśniewska",
                    Login = "mwisniewska",
                    Password = "haslo456",
                    IsActive = true
                },
                new Worker
                {
                    IdWorker = 3,
                    FirstName = "Tomasz",
                    LastName = "Zieliński",
                    Login = "tzielinski",
                    Password = "haslo789",
                    IsActive = true
                }
            );

            // Item
            modelBuilder.Entity<Item>().HasData(
                new Item
                {
                    IdItem = 1,
                    Name = "Creality Ender 3 V3 SE",
                    Description = "Popularna drukarka 3D FDM, idealna dla początkujących.",
                    IdCategory = 1,
                    Price = 1099,
                    Quantity = 12,
                    IdUnitOfMeasurement = 1,
                    Code = "PRN001",
                    IsActive = true
                },
                new Item
                {
                    IdItem = 2,
                    Name = "Bambu Lab A1 Mini",
                    Description = "Kompaktowa i szybka drukarka 3D do zastosowań domowych.",
                    IdCategory = 1,
                    Price = 1499,
                    Quantity = 8,
                    IdUnitOfMeasurement = 1,
                    Code = "PRN002",
                    IsActive = true
                },
                new Item
                {
                    IdItem = 3,
                    Name = "Anycubic Kobra 2 Neo",
                    Description = "Nowoczesna drukarka 3D z automatycznym poziomowaniem stołu.",
                    IdCategory = 1,
                    Price = 1299,
                    Quantity = 6,
                    IdUnitOfMeasurement = 1,
                    Code = "PRN003",
                    IsActive = true
                },
                new Item
                {
                    IdItem = 4,
                    Name = "Filament PLA Black 1kg",
                    Description = "Uniwersalny filament PLA do codziennych wydruków.",
                    IdCategory = 2,
                    Price = 79,
                    Quantity = 40,
                    IdUnitOfMeasurement = 1,
                    Code = "FIL001",
                    IsActive = true
                },
                new Item
                {
                    IdItem = 5,
                    Name = "Filament PET-G White 1kg",
                    Description = "Wytrzymały filament PET-G do bardziej wymagających projektów.",
                    IdCategory = 2,
                    Price = 89,
                    Quantity = 25,
                    IdUnitOfMeasurement = 1,
                    Code = "FIL002",
                    IsActive = true
                },
                new Item
                {
                    IdItem = 6,
                    Name = "Filament TPU Flexible 1kg",
                    Description = "Elastyczny filament TPU do specjalistycznych wydruków.",
                    IdCategory = 2,
                    Price = 119,
                    Quantity = 15,
                    IdUnitOfMeasurement = 1,
                    Code = "FIL003",
                    IsActive = true
                },
                new Item
                {
                    IdItem = 7,
                    Name = "Dysza 0.4 mm Brass",
                    Description = "Standardowa mosiężna dysza 0.4 mm do drukarki 3D.",
                    IdCategory = 3,
                    Price = 15,
                    Quantity = 100,
                    IdUnitOfMeasurement = 1,
                    Code = "NOZ001",
                    IsActive = true
                },
                new Item
                {
                    IdItem = 8,
                    Name = "Zestaw dysz 0.2 / 0.4 / 0.6 / 0.8 mm",
                    Description = "Komplet dysz o różnych średnicach do precyzyjnych wydruków.",
                    IdCategory = 3,
                    Price = 39,
                    Quantity = 40,
                    IdUnitOfMeasurement = 1,
                    Code = "NOZ002",
                    IsActive = true
                },
                new Item
                {
                    IdItem = 9,
                    Name = "Płyta PEI 235x235 mm",
                    Description = "Elastyczna powierzchnia robocza PEI do drukarek 3D.",
                    IdCategory = 4,
                    Price = 89,
                    Quantity = 20,
                    IdUnitOfMeasurement = 1,
                    Code = "BED001",
                    IsActive = true
                },
                new Item
                {
                    IdItem = 10,
                    Name = "Szkło hartowane 235x235 mm",
                    Description = "Gładka powierzchnia robocza do stołu drukarki 3D.",
                    IdCategory = 4,
                    Price = 49,
                    Quantity = 18,
                    IdUnitOfMeasurement = 1,
                    Code = "BED002",
                    IsActive = true
                },
                new Item
                {
                    IdItem = 11,
                    Name = "Ekstruder metalowy MK8",
                    Description = "Wzmocniony ekstruder do popularnych drukarek 3D.",
                    IdCategory = 5,
                    Price = 59,
                    Quantity = 30,
                    IdUnitOfMeasurement = 1,
                    Code = "PRT001",
                    IsActive = true
                },
                new Item
                {
                    IdItem = 12,
                    Name = "Pasek GT2 5m",
                    Description = "Pasek napędowy GT2 do osi drukarki 3D.",
                    IdCategory = 5,
                    Price = 25,
                    Quantity = 22,
                    IdUnitOfMeasurement = 1,
                    Code = "PRT002",
                    IsActive = true
                },
                new Item
                {
                    IdItem = 13,
                    Name = "Zestaw kluczy i szczypiec do druku 3D",
                    Description = "Narzędzia do serwisu i wykańczania wydruków 3D.",
                    IdCategory = 6,
                    Price = 45,
                    Quantity = 35,
                    IdUnitOfMeasurement = 1,
                    Code = "TLS001",
                    IsActive = true
                },
                new Item
                {
                    IdItem = 14,
                    Name = "Szpachelka do zdejmowania wydruków",
                    Description = "Akcesorium pomocne przy zdejmowaniu modeli ze stołu.",
                    IdCategory = 6,
                    Price = 19,
                    Quantity = 50,
                    IdUnitOfMeasurement = 1,
                    Code = "TLS002",
                    IsActive = true
                }
            );
        }
    }
}   
