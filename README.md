# PMAB20026TSaran

Aplikacja mobilna sklepu **3D Print Shop** wykonana w React Native. Projekt obsługuje sklep z produktami do druku 3D, koszyk, składanie zamówień, konto klienta oraz panel pracownika i administratora.

Projekt składa się z aplikacji mobilnej, API backendowego oraz bazy danych SQL Server uruchamianej lokalnie lub przez Docker.

## Spis treści

```txt
1. Opis projektu
2. Technologie
3. Jak działa cały system
4. Docker
5. Uruchomienie projektu
6. Konfiguracja API
7. Struktura projektu
8. CQRS
9. Role użytkowników
10. Sklep i koszyk
11. Zamówienia i płatności
12. Panel obsługi
13. Komunikacja z API
14. Przydatne komendy
```

## Opis projektu

Projekt przedstawia mobilny sklep **3D Print Shop**. Użytkownik może przeglądać produkty, filtrować ofertę, dodawać produkty do koszyka i składać zamówienia. Klient po zalogowaniu może zarządzać swoim kontem, sprawdzać historię zamówień, drukować podgląd zamówienia oraz ponowić wcześniejsze zamówienie.

Pracownik i administrator mają dostęp do panelu obsługi. Panel pozwala zarządzać produktami, kategoriami, jednostkami miary, klientami, pracownikami, zamówieniami oraz pozycjami zamówień.

Projekt korzysta z API, które odpowiada za logikę biznesową, zapis danych, odczyt danych oraz komunikację z bazą SQL Server.

## Technologie

### Aplikacja mobilna

```txt
React Native
TypeScript
React Navigation
Context API
REST API
Android / iOS
```

### Backend

```txt
ASP.NET Core
C#
Entity Framework Core
SQL Server
CQRS
REST API
Docker
```

### Infrastruktura lokalna

```txt
Docker
Docker Compose
SQL Server 2022
```

## Jak działa cały system

Całość działa w prostym układzie:

```txt
Aplikacja mobilna React Native
        |
        | REST API
        v
Backend ASP.NET Core
        |
        | Entity Framework Core
        v
SQL Server
```

Aplikacja mobilna nie komunikuje się bezpośrednio z bazą danych. Wszystkie dane pobiera i zapisuje przez API.

Przykład działania:

```txt
1. Użytkownik otwiera aplikację.
2. Aplikacja pobiera produkty z API.
3. API pobiera dane z SQL Server.
4. Użytkplikacja pobiera produkty z API.
3. API pobiera dane z SQL Server.
4. Użytkownik dodaje produkt do koszyka.
5. Koszyk jest przechowywany w aplikacji mobilnej.
6. Użytkownik składa zamówienie.
7. Aplikacja wysyła zamówienie do API.
8. API zapisuje zamówienie i pozycje zamówienia w bazie.
9. Aplikacja pokazuje potwierdzenie i wydruk zamówienia.
```

## Docker

Projekt wykorzystuje Dockera do uruchomienia backendu i bazy danych w kontenerach.

W repozytorium znajdują się pliki:

```txt
docker-compose.yml
docker-compose-db.yml
SolutionOrders.API/Dockerfile
.dockerignore
```

### `docker-compose.yml`

Ten plik uruchamia cały backend:

```txt
- kontener API
- kontener SQL Server
- wspólną sieć Docker
- wolumen z danymi bazy
```

API jest uruchamiane w kontenerze i wystawiane na komputerze lokalnym pod portem:

```txt
http://localhost:5000
```

Wewnątrz kontenera API działa na porcie `8080`, ale Docker mapuje go na port `5000` na komputerze:

```txt
5000:8080
```

Baza SQL Server jest wystawiona na porcie:

```txt
1433
```

Dane bazy są trzymane w wolumenie Dockera, dlatego po ponownym uruchomieniu kontenerów baza nie znika, dopóki nie usunie się wolumenu.

### `docker-compose-db.yml`

Ten plik uruchamia tylko SQL Server. Jest przydatny wtedy, gdy API uruchamiasz lokalnie przez `dotnet run`, a bazę chcesz mieć w Dockerze.

### `SolutionOrders.API/Dockerfile`

Dockerfile buduje i uruchamia backend ASP.NET Core. Jest to wieloetapowy build:

```txt
1. obraz bazowy ASP.NET
2. obraz SDK do budowania projektu
3. restore paczek NuGet
4. build projektu
5. publish projektu
6. uruchomienie gotowego API
```

## Uruchomienie z Dockerem

Najprostszy wariant: uruchomienie API i bazy razem.

W katalogu głównym repozytorium:

```bash
docker compose up --build
```

Po uruchomieniu:

```txt
API:        http://localhost:5000/api
SQL Server: localhost,1433
```

Zatrzymanie kontenerów:

```bash
docker compose down
```

Zatrzymanie kontenerów i usunięcie danych bazy:

```bash
docker compose down -v
```

## Uruchomienie tylko bazy w Dockerze

Jeżeli chcesz uruchomić tylko SQL Server:

```bash
docker compose -f docker-compose-db.yml up -d
```

Następnie API można uruchomić lokalnie:

```bash
cd SolutionOrders.API
dotnet run --urls http://localhost:5000
```

Zatrzymanie samej bazy:

```bash
docker compose -f docker-compose-db.yml down
```

## Uruchomienie aplikacji mobilnej

Aplikacja mobilna znajduje się w katalogu:

```txt
SolutionOrdersMobile
```

Przejście do katalogu aplikacji:

```bash
cd SolutionOrdersMobile
```

Instalacja zależności:

```bash
pnpm install
```

Uruchomienie Metro Bundler:

```bash
pnpm start
```

Uruchomienie aplikacji na Androidzie:

```bash
pnpm android
```

Uruchomienie aplikacji na iOS:

```bash
pnpm ios
```

Sprawdzenie typów TypeScript:

```bash
pnpm typecheck
```

Lint:

```bash
pnpm lint
```

Testy:

```bash
pnpm test
```

## Konfiguracja API w aplikacji mobilnej

Adres API znajduje się w pliku:

```txt
SolutionOrdersMobile/src/api/config.ts
```

W trybie developerskim aplikacja używa różnych adresów zależnie od platformy:

```txt
Android emulator: http://10.0.2.2:5000/api
iOS simulator:   http://localhost:5000/api
```

Dla Android Emulator nie używa się `localhost`, ponieważ `localhost` oznaczałby emulator, a nie komputer. Adres `10.0.2.2` wskazuje z emulatora na komputer hosta.

Jeżeli API działa w Dockerze i jest wystawione na porcie `5000`, Android Emulator połączy się z nim przez:

```txt
http://10.0.2.2:5000/api
```

Jeżeli aplikacja działa na fizycznym telefonie, trzeba użyć adresu IP komputera w sieci lokalnej zamiast `10.0.2.2`.

## Kolejność uruchamiania projektu

Najwygodniejsza kolejność:

```txt
1. Uruchomić Docker Desktop.
2. Uruchomić backend i bazę:
   docker compose up --build

3. Przejść do aplikacji mobilnej:
   cd SolutionOrdersMobile

4. Uruchomić Metro:
   pnpm start

5. W drugim terminalu uruchomić aplikację:
   pnpm android
```

Wtedy aplikacja mobilna łączy się z API, a API z bazą SQL Server.

## Najczęstsze problemy przy uruchamianiu

### API nie działa

Sprawdź, czy kontenery działają:

```bash
docker ps
```

Sprawdź logi:

```bash
docker compose logs api
docker compose logs sqlserver
```

### Port 5000 jest zajęty

Jeżeli port `5000` jest już używany, API może się nie uruchomić. Trzeba zatrzymać inny proces albo zmienić port w `docker-compose.yml`.

### Port 1433 jest zajęty

Jeżeli masz lokalnie zainstalowany SQL Server, port `1433` może być zajęty. Wtedy kontener SQL Server może się nie uruchomić poprawnie.

### Aplikacja mobilna nie widzi API

Dla Android Emulator sprawdź, czy adres w aplikacji to:

```txt
http://10.0.2.2:5000/api
```

Dla iOS Simulator:

```txt
http://localhost:5000/api
```

Dla fizycznego telefonu potrzebny jest adres IP komputera, np.:

```txt
http://192.168.1.100:5000/api
```

## Główna struktura projektu

```txt
PMAB20026TSaran
├── docker-compose.yml
├── docker-compose-db.yml
├── SolutionOrders.API
├── SolutionOrdersMobile
└── README.md
```

## Struktura backendu

```txt
SolutionOrders.API
├── Configuration
├── Controllers
├── Features
├── Migrations
├── Models
├── Program.cs
├── appsettings.json
├── appsettings.Development.json
└── Dockerfile
```

### `Configuration`

Zawiera konfigurację backendu, np. konfigurację bazy danych, mapowania lub ustawienia aplikacji.

### `Controllers`

Zawiera kontrolery API. Kontrolery odbierają żądania HTTP z aplikacji mobilnej i przekazują je dalej do logiki aplikacji.

Przykładowo:

```txt
GET /api/Item
POST /api/Checkout
GET /api/Order
```

### `Features`

Zawiera główną logikę aplikacji podzieloną według funkcji systemu.

Przykładowe obszary:

```txt
Categories
Clients
Items
UnitOfMeasurements
Workers
Orders
OrderItems
Dashboard
Checkout
Auth
```

W tych katalogach znajdują się komendy, zapytania, handlery, DTO i providery.

### `Migrations`

Zawiera migracje Entity Framework Core. Migracje opisują zmiany w strukturze bazy danych.

### `Models`

Zawiera modele encji używane przez Entity Framework Core, np. produkt, klient, zamówienie, pozycja zamówienia, pracownik, kategoria i jednostka miary.

### `Program.cs`

Główny plik startowy API. Konfiguruje aplikację, kontrolery, bazę danych, zależności i uruchomienie serwera.

## Struktura aplikacji mobilnej

```txt
SolutionOrdersMobile
├── src
│   ├── api
│   ├── components
│   ├── context
│   ├── navigation
│   ├── screens
│   ├── types
│   └── utils
├── package.json
└── tsconfig.json
```

### `src/api`

Zawiera komunikację z backendem.

Najważniejsze pliki:

```txt
src/api/config.ts
src/api/apiService.ts
```

`config.ts` ustawia adres API.

`apiService.ts` zawiera metody komunikujące aplikację z backendem, np. pobieranie produktów, logowanie, rejestrację, tworzenie zamówienia, pobieranie zamówień, edycję danych i archiwizację rekordów.

### `src/components`

Zawiera wspólne komponenty.

Najważniejsze elementy:

```txt
AppDialog.tsx
styles/sharedStyles.ts
```

`AppDialog` jest wspólnym oknem do komunikatów, błędów i potwierdzeń. Dzięki temu wiele ekranów używa jednego sposobu pokazywania informacji użytkownikowi.

### `src/context`

Zawiera globalny stan aplikacji.

Najważniejsze pliki:

```txt
AuthContext.tsx
CartContext.tsx
ItemsContext.tsx
```

`AuthContext` przechowuje informacje o zalogowanym użytkowniku i jego roli.

`CartContext` przechowuje koszyk, produkty w koszyku, ilości i wartość zamówienia.

`ItemsContext` przechowuje produkty i odpowiada za ich odświeżanie po zmianach.

### `src/navigation`

Zawiera konfigurację nawigacji.

Najważniejsze pliki:

```txt
RootNavigator.tsx
types.ts
```

`RootNavigator.tsx` definiuje ekrany i zabezpieczenia dostępu.

`types.ts` definiuje parametry przekazywane między ekranami.

### `src/screens`

Zawiera ekrany aplikacji.

Ekrany klienta:

```txt
HomeScreen.tsx
ItemsScreen.tsx
ItemDetailsScreen.tsx
CartScreen.tsx
OrderSuccessScreen.tsx
TrackOrderScreen.tsx
OrderPrintScreen.tsx
ClientPanelScreen.tsx
CustomerProfileScreen.tsx
CustomerOrdersScreen.tsx
LoginScreen.tsx
RegisterScreen.tsx
```

Ekrany panelu obsługi:

```txt
AdminPanelScreen.tsx
DashboardScreen.tsx
AdminItemsScreen.tsx
ItemFormScreen.tsx
CategoriesScreen.tsx
CategoryFormScreen.tsx
UnitsScreen.tsx
UnitFormScreen.tsx
ClientsScreen.tsx
ClientFormScreen.tsx
WorkersScreen.tsx
WorkerFormScreen.tsx
OrdersScreen.tsx
OrderFormScreen.tsx
OrderItemsScreen.tsx
OrderItemFormScreen.tsx
```

### `src/types`

Zawiera modele i typy DTO.

Najważniejszy plik:

```txt
src/types/models.ts
```

Są tam typy dla produktów, kategorii, jednostek miary, klientów, pracowników, zamówień, pozycji zamówień, logowania, rejestracji i koszyka.

### `src/utils`

Zawiera funkcje pomocnicze.

Przykład:

```txt
orderPrint.ts
```

Ten plik odpowiada za przygotowanie danych i tekstu do podglądu lub udostępnienia wydruku zamówienia.

## CQRS w projekcie

Projekt wykorzystuje podejście **CQRS**, czyli rozdzielenie operacji odczytu danych od operacji zapisu danych.

CQRS oznacza **Command Query Responsibility Segregation**.

W praktyce:

```txt
Query   = odczyt danych
Command = zmiana danych
```

Dzięki temu pobieranie danych jest oddzielone od tworzenia, edycji i archiwizacji danych.

## Operacje Query

Operacje typu Query służą tylko do pobierania danych.

Przykłady:

```txt
getItems()
getCategories()
getUnits()
getClients()
getWorkers()
getOrders()
getOrdersByClient()
getOrder()
getOrderItems()
getOrderItemsByOrder()
getDashboard()
```

Takie metody są używane przez listy, szczegóły, dashboard i historię zamówień.

## Operacje Command

Operacje typu Command zmieniają dane.

Przykłady:

```txt
createItem()
updateItem()
deleteItem()

createCategory()
updateCategory()
deleteCategory()

createUnit()
updateUnit()
deleteUnit()

createClient()
updateClient()
deleteClient()

createWorker()
updateWorker()
deleteWorker()

createOrder()
updateOrder()
deleteOrder()

createOrderItem()
updateOrderItem()
deleteOrderItem()

createCheckoutOrder()
```

Takie metody są używane przez formularze, przyciski zapisu, archiwizację i składanie zamówienia.

## CQRS na przykładzie produktów

Odczyt produktów:

```txt
getItems()
```

Zmiana produktów:

```txt
createItem()
updateItem()
deleteItem()
```

Lista produktów pobiera dane, a formularz produktu zmienia dane.

## CQRS na przykładzie zamówień

Odczyt zamówień:

```txt
getOrders()
getOrdersByClient()
getOrder()
getOrderItemsByOrder()
```

Zmiana zamówień:

```txt
createCheckoutOrder()
createOrder()
updateOrder()
deleteOrder()
```

Koszyk tworzy zamówienie przez osobną komendę, a historia zamówień pobiera dane przez zapytania.

## Korzyści z CQRS

```txt
- czytelniejszy podział odpowiedzialności,
- prostsze rozróżnienie odczytu i zapisu,
- łatwiejsze testowanie,
- łatwiejsze rozwijanie API,
- łatwiejsze utrzymanie formularzy i list,
- mniejsze ryzyko mieszania logiki pobierania z logiką modyfikacji.
```

## Role użytkowników

Aplikacja obsługuje cztery typy użytkowników:

```txt
Gość
Klient
Pracownik
Administrator
```

## Gość

Gość może:

```txt
- przeglądać stronę główną,
- przeglądać produkty,
- zobaczyć szczegóły produktu,
- dodać produkty do koszyka,
- przejść do koszyka,
- śledzić zamówienie po numerze,
- zarejestrować konto,
- zalogować się.
```

## Klient

Klient może:

```txt
- przeglądać produkty,
- korzystać z koszyka,
- złożyć zamówienie,
- wybrać dostawę,
- wybrać płatność,
- zobaczyć potwierdzenie zamówienia,
- zobaczyć wydruk zamówienia,
- sprawdzić status zamówienia,
- zobaczyć historię zamówień,
- ponowić zamówienie,
- edytować dane konta.
```

## Pracownik

Pracownik ma dostęp do panelu obsługi.

Może:

```txt
- zarządzać produktami,
- zarządzać kategoriami,
- zarządzać jednostkami miary,
- zarządzać klientami,
- obsługiwać zamówienia,
- sprawdzać pozycje zamówień,
- korzystać z dashboardu.
```

## Administrator

Administrator ma dostęp do funkcji pracownika oraz dodatkowo do zarządzania pracownikami.

Może:

```txt
- dodawać pracowników,
- edytować pracowników,
- archiwizować pracowników,
- filtrować pracowników,
- rozróżniać role pracownik/admin.
```

## Jak działa logowanie

Logowanie obsługuje `AuthContext`.

Jeżeli login nie zawiera znaku `@`, aplikacja traktuje go jako login pracownika.

Jeżeli login zawiera `@`, aplikacja traktuje go jako e-mail klienta.

Po zalogowaniu aplikacja zapisuje dane użytkownika w stanie globalnym i na tej podstawie ustala dostęp do ekranów.

Przykład:

```txt
login bez @  -> pracownik lub administrator
login z @    -> klient
```

## Jak działa sklep

Strona główna pokazuje:

```txt
- skróty do najważniejszych funkcji,
- wyszukiwarkę,
- koszyk,
- kategorie,
- produkty,
- produkt dnia.
```

Ekran produktów pozwala:

```txt
- wyszukiwać produkty,
- filtrować po kategorii,
- filtrować po dostępności,
- sortować,
- przejść do szczegółów,
- szybko dodać produkt do koszyka.
```

Ekran szczegółów produktu pokazuje:

```txt
- nazwę,
- kod,
- kategorię,
- cenę,
- dostępność,
- opis,
- wybór ilości,
- dodanie do koszyka,
- udostępnienie produktu.
```

## Jak działa koszyk

Koszyk jest przechowywany w `CartContext`.

Koszyk obsługuje:

```txt
- dodanie produktu,
- szybkie dodanie produktu z listy,
- zmianę ilości,
- usunięcie produktu,
- wyczyszczenie koszyka,
- przeliczenie liczby produktów,
- przeliczenie wartości koszyka.
```

Aplikacja sprawdza, czy produkt jest dostępny i czy ilość w koszyku nie przekracza stanu magazynowego.

## Jak działa składanie zamówienia

Zamówienie jest składane z poziomu koszyka.

Użytkownik wybiera:

```txt
- metodę dostawy,
- metodę płatności,
- dane dostawy,
- opcjonalną notatkę.
```

Dostępne metody dostawy:

```txt
Kurier
Paczkomat
Odbiór osobisty
```

Dostępne metody płatności:

```txt
BLIK
Karta
Przelew
Przy odbiorze
```

Dla BLIK aplikacja pokazuje pole na 6-cyfrowy kod.

Dla przelewu aplikacja pokazuje dane do przelewu:

```txt
Odbiorca
Numer konta
Tytuł przelewu
Kwota
```

Wybrana metoda płatności i dostawy trafia do notatki zamówienia, która jest wysyłana do API razem z zamówieniem.

Po złożeniu zamówienia aplikacja:

```txt
1. wysyła dane do API,
2. czyści koszyk,
3. odświeża produkty,
4. przechodzi na ekran potwierdzenia.
```

## Jak działa potwierdzenie i wydruk zamówienia

Po złożeniu zamówienia użytkownik widzi ekran potwierdzenia z numerem zamówienia, wartością, dostawą i płatnością.

Z poziomu potwierdzenia można przejść do wydruku zamówienia.

Wydruk zamówienia pokazuje:

```txt
- numer zamówienia,
- datę,
- status,
- dane zamówienia,
- pozycje zamówienia,
- wartość,
- informacje dodatkowe.
```

Wydruk można udostępnić przez systemowe udostępnianie telefonu.

## Jak działa historia zamówień klienta

Klient może wejść do ekranu „Moje zamówienia”.

Dostępne funkcje:

```txt
- lista zamówień,
- filtrowanie,
- sortowanie,
- szczegóły zamówienia,
- wydruk zamówienia,
- ponowienie zamówienia.
```

Funkcja „Ponów zamówienie” pobiera pozycje starego zamówienia, sprawdza aktualną dostępność produktów i dodaje dostępne produkty do koszyka.

## Jak działa śledzenie zamówienia

Użytkownik może podać numer zamówienia i sprawdzić jego status. Aplikacja pobiera dane zamówienia z API oraz pozycje zamówienia.

Z tego ekranu można przejść do wydruku zamówienia.

## Panel obsługi

Panel obsługi jest dostępny dla pracownika i administratora.

Moduły panelu:

```txt
Dashboard
Produkty
Kategorie
Jednostki miary
Klienci
Zamówienia
Pozycje zamówień
Pracownicy
```

Pracownicy widzą moduły potrzebne do obsługi sklepu. Administrator ma dodatkowo dostęp do zarządzania pracownikami.

## Dashboard

Dashboard pokazuje podsumowanie sklepu:

```txt
- liczbę zamówień,
- liczbę produktów,
- liczbę klientów,
- statusy zamówień,
- najnowsze zamówienia,
- popularne produkty,
- kategorie,
- produkty z niskim stanem.
```

Dashboard pobiera dane z API przez operację odczytu.

## Produkty

Panel produktów pozwala zarządzać asortymentem.

Funkcje:

```txt
- lista produktów,
- wyszukiwanie,
- filtrowanie,
- sortowanie,
- dodawanie produktu,
- edycja produktu,
- archiwizacja produktu.
```

Produkt posiada:

```txt
- nazwę,
- opis,
- kod,
- cenę,
- ilość,
- kategorię,
- jednostkę miary,
- status aktywności.
```

## Kategorie

Kategorie służą do porządkowania produktów.

Funkcje:

```txt
- lista kategorii,
- dodawanie kategorii,
- edycja kategorii,
- archiwizacja kategorii,
- filtrowanie,
- sortowanie.
```

## Jednostki miary

Jednostki miary określają sposób liczenia produktu.

Przykłady:

```txt
szt
kg
rolka
opakowanie
```

Funkcje:

```txt
- lista jednostek,
- dodawanie jednostki,
- edycja jednostki,
- archiwizacja jednostki,
- filtrowanie,
- sortowanie.
```

## Klienci

Panel klientów pozwala zarządzać danymi klientów.

Funkcje:

```txt
- lista klientów,
- dodawanie klienta,
- edycja klienta,
- archiwizacja klienta,
- filtrowanie,
- szybki kontakt telefoniczny,
- szybki kontakt e-mail.
```

## Pracownicy

Moduł pracowników jest dostępny dla administratora.

Funkcje:

```txt
- lista pracowników,
- dodawanie pracownika,
- edycja pracownika,
- archiwizacja pracownika,
- filtrowanie,
- rozróżnienie ról.
```

## Zamówienia

Panel zamówień pokazuje zamówienia złożone przez klientów.

Funkcje:

```txt
- lista zamówień,
- filtrowanie,
- sortowanie,
- szczegóły,
- przejście do pozycji zamówienia,
- wydruk zamówienia.
```

## Pozycje zamówień

Pozycje zamówień pokazują produkty przypisane do konkretnego zamówienia.

Pracownik może sprawdzić:

```txt
- nazwę produktu,
- ilość,
- cenę,
- wartość pozycji,
- powiązanie z zamówieniem.
```

## Komunikacja z API

Cała komunikacja z backendem przechodzi przez `apiService.ts`.

Najważniejsze metody:

```txt
loginWorker()
loginCustomer()
registerCustomer()

createCheckoutOrder()

getDashboard()

getItems()
createItem()
updateItem()
deleteItem()

getCategories()
createCategory()
updateCategory()
deleteCategory()

getUnits()
createUnit()
updateUnit()
deleteUnit()

getClients()
createClient()
updateClient()
deleteClient()

getWorkers()
createWorker()
updateWorker()
deleteWorker()

getOrders()
getOrdersByClient()
getOrder()
createOrder()
updateOrder()
deleteOrder()

getOrderItems()
getOrderItemsByOrder()
createOrderItem()
updateOrderItem()
deleteOrderItem()
```

Metoda `request()` buduje adres endpointu, wysyła zapytanie HTTP, obsługuje JSON i zamienia błędy API na komunikaty możliwe do pokazania w aplikacji.

## Najważniejsze przepływy w aplikacji

### Zakup jako klient

```txt
Home
-> Produkty
-> Szczegóły produktu
-> Koszyk
-> Złożenie zamówienia
-> Potwierdzenie
-> Wydruk
```

### Zakup z szybkim dodaniem

```txt
Home
-> Produkty
-> + Koszyk
-> Koszyk
-> Złożenie zamówienia
```

### Sprawdzenie statusu zamówienia

```txt
Home
-> Status
-> Podanie numeru zamówienia
-> Szczegóły
-> Wydruk
```

### Historia klienta

```txt
Logowanie klienta
-> Moje konto
-> Moje zamówienia
-> Szczegóły / Wydruk / Ponów zamówienie
```

### Obsługa przez pracownika

```txt
Logowanie pracownika
-> Panel obsługi
-> Produkty / Klienci / Zamówienia / Kategorie / Jednostki
```

### Obsługa przez administratora

```txt
Logowanie administratora
-> Panel obsługi
-> Pracownicy
```

## Walidacja danych

Aplikacja sprawdza dane przed wysłaniem do API.

Przykłady walidacji:

```txt
- wymagane imię i nazwisko klienta,
- wymagany adres dostawy,
- wymagany telefon,
- kod BLIK musi mieć 6 cyfr,
- produkt musi być dostępny,
- ilość w koszyku nie może przekraczać stanu magazynowego,
- formularz produktu sprawdza wymagane pola,
- formularz kategorii sprawdza nazwę,
- formularz jednostki sprawdza nazwę,
- formularz klienta sprawdza dane klienta,
- formularz pracownika sprawdza dane pracownika.
```

## Archiwizacja danych

W projekcie wiele rekordów jest archiwizowanych zamiast trwale usuwanych.

Dotyczy to między innymi:

```txt
- produktów,
- kategorii,
- jednostek miary,
- klientów,
- pracowników,
- zamówień,
- pozycji zamówień.
```

Archiwizacja polega na ustawieniu rekordu jako nieaktywnego. Dzięki temu dane mogą dalej istnieć w bazie i historii, ale nie muszą być pokazywane jako bieżące.

## Uruchomienie backendu lokalnie bez Dockera

Jeżeli baza danych jest już dostępna, API można uruchomić lokalnie:

```bash
cd SolutionOrders.API
dotnet restore
dotnet build
dotnet run --urls http://localhost:5000
```

Aktualizacja bazy przez Entity Framework:

```bash
cd SolutionOrders.API
dotnet ef database update
```

## Uruchomienie backendu i bazy przez Docker

Najprościej:

```bash
docker compose up --build
```

Po uruchomieniu API powinno działać pod adresem:

```txt
http://localhost:5000/api
```

A SQL Server pod:

```txt
localhost,1433
```

## Uruchomienie aplikacji mobilnej z backendem w Dockerze

```bash
cd SolutionOrdersMobile
pnpm install
pnpm start
```

W drugim terminalu:

```bash
cd SolutionOrdersMobile
pnpm android
```

Aplikacja na Android Emulator połączy się z API przez:

```txt
http://10.0.2.2:5000/api
```

## Przydatne komendy

### Docker

```bash
docker compose up --build
docker compose down
docker compose down -v
docker compose logs api
docker compose logs sqlserver
docker ps
```

### Tylko baza w Dockerze

```bash
docker compose -f docker-compose-db.yml up -d
docker compose -f docker-compose-db.yml down
```

### Backend lokalnie

```bash
cd SolutionOrders.API
dotnet restore
dotnet build
dotnet run --urls http://localhost:5000
dotnet ef database update
```

### Aplikacja mobilna

```bash
cd SolutionOrdersMobile
pnpm install
pnpm start
pnpm android
pnpm ios
pnpm typecheck
pnpm lint
pnpm test
```

### Reset cache Metro

```bash
cd SolutionOrdersMobile
pnpm start --reset-cache
```

## Podsumowanie

Projekt składa się z aplikacji mobilnej React Native, backendu ASP.NET Core i bazy SQL Server. Docker ułatwia uruchomienie API oraz bazy danych bez ręcznej konfiguracji SQL Servera. Aplikacja mobilna komunikuje się z backendem przez REST API. Backend obsługuje logikę sklepu, korzysta z Entity Framework Core i zapisuje dane w SQL Server.

Projekt wykorzystuje podejście CQRS, czyli oddzielenie operacji odczytu od operacji zapisu. Dzięki temu listy i szczegóły danych korzystają z zapytań, a formularze i akcje użytkownika korzystają z komend.

Najważniejsze funkcje projektu to sklep z produktami, koszyk, składanie zamówień, płatności BLIK/karta/przelew/przy odbiorze, historia zamówień, ponawianie zamówień, wydruk zamówienia, panel pracownika, panel administratora, dashboard oraz zarządzanie danymi sklepu.
