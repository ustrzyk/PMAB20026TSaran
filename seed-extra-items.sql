USE PMAB20026TSaran;
GO

-- Dodatkowe drukarki 3D
IF NOT EXISTS (SELECT 1 FROM Items WHERE Code = 'PRN004')
INSERT INTO Items
(Name, Description, IdCategory, Price, Quantity, FotoUrl, IdUnitOfMeasurement, Code, IsActive)
VALUES
('Prusa MINI+', 'Kompaktowa i dokładna drukarka 3D do domu oraz nauki.', 1, 1899, 4, 'https://example.com/images/prusa-mini.jpg', 1, 'PRN004', 1);

IF NOT EXISTS (SELECT 1 FROM Items WHERE Code = 'PRN005')
INSERT INTO Items
(Name, Description, IdCategory, Price, Quantity, FotoUrl, IdUnitOfMeasurement, Code, IsActive)
VALUES
('Elegoo Neptune 4 Pro', 'Szybka drukarka 3D FDM z dobrym stosunkiem ceny do możliwości.', 1, 1399, 7, 'https://example.com/images/elegoo-neptune-4-pro.jpg', 1, 'PRN005', 1);

IF NOT EXISTS (SELECT 1 FROM Items WHERE Code = 'PRN006')
INSERT INTO Items
(Name, Description, IdCategory, Price, Quantity, FotoUrl, IdUnitOfMeasurement, Code, IsActive)
VALUES
('Creality K1C', 'Zamknięta drukarka 3D CoreXY do szybszego druku i materiałów technicznych.', 1, 2399, 3, 'https://example.com/images/creality-k1c.jpg', 1, 'PRN006', 1);


-- Dodatkowe filamenty
IF NOT EXISTS (SELECT 1 FROM Items WHERE Code = 'FIL004')
INSERT INTO Items
(Name, Description, IdCategory, Price, Quantity, FotoUrl, IdUnitOfMeasurement, Code, IsActive)
VALUES
('Filament PLA Red 1kg', 'Czerwony filament PLA do codziennych wydruków 3D.', 2, 82, 30, 'https://example.com/images/filament-pla-red.jpg', 1, 'FIL004', 1);

IF NOT EXISTS (SELECT 1 FROM Items WHERE Code = 'FIL005')
INSERT INTO Items
(Name, Description, IdCategory, Price, Quantity, FotoUrl, IdUnitOfMeasurement, Code, IsActive)
VALUES
('Filament PET-G Black 1kg', 'Wytrzymały filament PET-G odporny na uszkodzenia mechaniczne.', 2, 94, 22, 'https://example.com/images/filament-petg-black.jpg', 1, 'FIL005', 1);

IF NOT EXISTS (SELECT 1 FROM Items WHERE Code = 'FIL006')
INSERT INTO Items
(Name, Description, IdCategory, Price, Quantity, FotoUrl, IdUnitOfMeasurement, Code, IsActive)
VALUES
('Filament ABS Gray 1kg', 'Filament ABS do bardziej technicznych i odpornych wydruków.', 2, 99, 14, 'https://example.com/images/filament-abs-gray.jpg', 1, 'FIL006', 1);


-- Dysze
IF NOT EXISTS (SELECT 1 FROM Items WHERE Code = 'NOZ003')
INSERT INTO Items
(Name, Description, IdCategory, Price, Quantity, FotoUrl, IdUnitOfMeasurement, Code, IsActive)
VALUES
('Dysza 0.6 mm Hardened Steel', 'Utwardzana dysza do filamentów technicznych i ściernych.', 3, 29, 60, 'https://example.com/images/nozzle-06-hardened.jpg', 1, 'NOZ003', 1);

IF NOT EXISTS (SELECT 1 FROM Items WHERE Code = 'NOZ004')
INSERT INTO Items
(Name, Description, IdCategory, Price, Quantity, FotoUrl, IdUnitOfMeasurement, Code, IsActive)
VALUES
('Dysza 0.8 mm Brass', 'Mosiężna dysza 0.8 mm do szybszego druku większych modeli.', 3, 18, 45, 'https://example.com/images/nozzle-08-brass.jpg', 1, 'NOZ004', 1);


-- Stoły robocze
IF NOT EXISTS (SELECT 1 FROM Items WHERE Code = 'BED003')
INSERT INTO Items
(Name, Description, IdCategory, Price, Quantity, FotoUrl, IdUnitOfMeasurement, Code, IsActive)
VALUES
('Mata magnetyczna 235x235 mm', 'Elastyczna mata magnetyczna ułatwiająca zdejmowanie wydruków.', 4, 69, 16, 'https://example.com/images/magnetic-bed.jpg', 1, 'BED003', 1);


-- Części
IF NOT EXISTS (SELECT 1 FROM Items WHERE Code = 'PRT003')
INSERT INTO Items
(Name, Description, IdCategory, Price, Quantity, FotoUrl, IdUnitOfMeasurement, Code, IsActive)
VALUES
('Wentylator hotendu 4010', 'Zapasowy wentylator chłodzenia hotendu do drukarek 3D.', 5, 24, 40, 'https://example.com/images/fan-4010.jpg', 1, 'PRT003', 1);

IF NOT EXISTS (SELECT 1 FROM Items WHERE Code = 'PRT004')
INSERT INTO Items
(Name, Description, IdCategory, Price, Quantity, FotoUrl, IdUnitOfMeasurement, Code, IsActive)
VALUES
('Rurka PTFE Capricorn 1m', 'Precyzyjna rurka PTFE do prowadzenia filamentu.', 5, 35, 28, 'https://example.com/images/ptfe-capricorn.jpg', 1, 'PRT004', 1);


-- Narzędzia
IF NOT EXISTS (SELECT 1 FROM Items WHERE Code = 'TLS003')
INSERT INTO Items
(Name, Description, IdCategory, Price, Quantity, FotoUrl, IdUnitOfMeasurement, Code, IsActive)
VALUES
('Obcinaczki do filamentu', 'Małe obcinaczki przydatne przy pracy z filamentem.', 6, 22, 35, 'https://example.com/images/filament-cutter.jpg', 1, 'TLS003', 1);

IF NOT EXISTS (SELECT 1 FROM Items WHERE Code = 'TLS004')
INSERT INTO Items
(Name, Description, IdCategory, Price, Quantity, FotoUrl, IdUnitOfMeasurement, Code, IsActive)
VALUES
('Zestaw igieł do czyszczenia dysz', 'Zestaw igieł do udrażniania dysz drukarki 3D.', 6, 15, 50, 'https://example.com/images/nozzle-cleaning-needles.jpg', 1, 'TLS004', 1);

GO

SELECT 
    i.IdItem,
    i.Name AS ItemName,
    c.Name AS CategoryName,
    i.Price,
    i.Quantity,
    i.Code
FROM Items i
JOIN Categories c ON i.IdCategory = c.IdCategory
WHERE i.IsActive = 1
ORDER BY i.Name;
GO