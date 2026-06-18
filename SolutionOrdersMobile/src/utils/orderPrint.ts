import type {OrderDto, OrderItemDto} from '../types/models.ts';

export function formatPrintMoney(value?: number | null): string {
  const safeValue = value ?? 0;

  return `${safeValue.toFixed(2)} zł`;
}

export function formatPrintDate(value?: string | null): string {
  if (!value) {
    return 'Brak daty';
  }

  return value.substring(0, 10);
}

export function getPrintOrderStatus(order: OrderDto): string {
  const status = order.status?.trim();

  if (!status || status.length === 0) {
    return 'Nowe';
  }

  return status;
}

export function buildOrderPrintText(
  order: OrderDto,
  orderItems: OrderItemDto[],
): string {
  const status = getPrintOrderStatus(order);

  const lines = orderItems.map((item, index) => {
    const quantity = item.quantity ?? 0;
    const itemPrice = item.itemPrice ?? 0;
    const lineValue = item.lineValue ?? itemPrice * quantity;

    return [
      `${index + 1}. ${item.itemName ?? 'Produkt'}`,
      `   Kod: ${item.itemCode ?? 'brak'}`,
      `   Ilość: ${quantity}`,
      `   Cena: ${formatPrintMoney(itemPrice)}`,
      `   Wartość: ${formatPrintMoney(lineValue)}`,
    ].join('\n');
  });

  return [
    '3D PRINT SHOP',
    'PODSUMOWANIE ZAMÓWIENIA',
    '',
    `Numer zamówienia: #${order.idOrder}`,
    `Data zamówienia: ${formatPrintDate(order.dataOrder)}`,
    `Status: ${status}`,
    '',
    'Klient:',
    `${order.clientName ?? 'Brak klienta'}`,
    '',
    'Pracownik:',
    `${order.workerName ?? 'Nieprzypisany'}`,
    '',
    'Dostawa:',
    `Data dostawy: ${formatPrintDate(order.deliveryDate)}`,
    '',
    'Pozycje zamówienia:',
    orderItems.length > 0 ? lines.join('\n\n') : 'Brak pozycji zamówienia.',
    '',
    'Podsumowanie:',
    `Liczba pozycji: ${order.orderItemsCount ?? orderItems.length}`,
    `Wartość razem: ${formatPrintMoney(order.totalValue)}`,
    '',
    'Notatki:',
    `${order.notes ?? 'Brak notatek'}`,
    '',
    'Dziękujemy za zakupy w 3D Print Shop.',
  ].join('\n');
}