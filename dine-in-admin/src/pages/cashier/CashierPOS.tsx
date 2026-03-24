import { useCallback, useEffect, useState } from 'react';
import { getCashierMenu, placeCashierOrder } from '@/api/cashierApi';
import type { CashierPlaceOrderRequest, CartItem, Category, MenuItem } from '@/types';

export default function CashierPOS() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'DineIn' | 'Pickup' | 'Delivery'>('DineIn');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'none'>('cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customizeModal, setCustomizeModal] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMenu = useCallback(() => {
    setLoading(true);
    getCashierMenu()
      .then((data) => {
        setCategories(data.categories);
        setAllItems(data.items);
        if (data.categories.length > 0 && !selectedCat) {
          setSelectedCat(data.categories[0].id);
        }
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Failed to load menu');
      })
      .finally(() => setLoading(false));
  }, [selectedCat]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const filteredItems = selectedCat
    ? allItems.filter((i) => i.categoryId === selectedCat)
    : allItems;

  const subtotal = cart.reduce((sum, c) => sum + c.lineTotal, 0);
  const taxRate = 0.08;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const deliveryFee = orderType === 'Delivery' ? 4.99 : 0;
  const total = subtotal + tax + deliveryFee;
  const change = paymentMethod === 'cash' && amountTendered ? parseFloat(amountTendered) - total : 0;

  const canPlace =
    cart.length > 0 &&
    (orderType === 'DineIn'
      ? tableNumber.trim() !== ''
      : orderType === 'Pickup'
        ? customerName.trim() !== ''
        : customerName.trim() !== '' && street.trim() !== '') &&
    (paymentMethod === 'none' ||
      paymentMethod === 'card' ||
      (amountTendered !== '' && parseFloat(amountTendered) >= total));

  const addToCart = (
    item: MenuItem,
    quantity: number,
    customizations: Record<string, string[]>,
    specialInstructions: string,
  ) => {
    let customizationTotal = 0;
    for (const [, optionIds] of Object.entries(customizations)) {
      for (const optId of optionIds) {
        const opt = item.customizationGroups
          ?.flatMap((g) => g.options)
          .find((o) => o.id === optId);
        if (opt) customizationTotal += opt.priceAdjustment;
      }
    }

    const lineTotal = (item.price + customizationTotal) * quantity;
    setCart((prev) => [
      ...prev,
      {
        menuItem: item,
        quantity,
        selectedCustomizations: customizations,
        specialInstructions,
        lineTotal,
      },
    ]);
    setCustomizeModal(null);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearOrder = () => {
    setCart([]);
    setTableNumber('');
    setCustomerName('');
    setPhoneNumber('');
    setStreet('');
    setCity('');
    setZip('');
    setAmountTendered('');
    setPaymentMethod('cash');
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setError('');
    try {
      const req: CashierPlaceOrderRequest = {
        orderType,
        paymentMethod,
        items: cart.map((c) => ({
          menuItemId: c.menuItem.id,
          quantity: c.quantity,
          selectedCustomizations:
            Object.keys(c.selectedCustomizations).length > 0 ? c.selectedCustomizations : undefined,
          specialInstructions: c.specialInstructions || undefined,
        })),
      };

      if (orderType === 'DineIn') {
        req.tableNumber = tableNumber;
      }

      if (orderType === 'Pickup' || orderType === 'Delivery') {
        req.customerName = customerName;
        req.phoneNumber = phoneNumber || undefined;
      }

      if (orderType === 'Delivery') {
        req.street = street;
        req.city = city || undefined;
        req.zip = zip || undefined;
      }

      if (paymentMethod === 'cash') {
        req.amountTendered = parseFloat(amountTendered);
      }

      await placeCashierOrder(req);
      setSuccess('Order placed successfully!');
      clearOrder();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to place order');
    }
    setPlacing(false);
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center text-gray-400">Loading menu...</div>;
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col overflow-hidden border-r bg-white">
        <div className="shrink-0 border-b bg-gray-50 p-4">
          <div className="flex gap-2">
            {(['DineIn', 'Pickup', 'Delivery'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                  orderType === t
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'border bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t === 'DineIn' ? 'Dine In' : t === 'Pickup' ? 'Pickup' : 'Delivery'}
              </button>
            ))}
          </div>
        </div>

        <div className="shrink-0 overflow-x-auto border-b p-3">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCat === cat.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.customizationGroups && item.customizationGroups.length > 0) {
                    setCustomizeModal(item);
                  } else {
                    addToCart(item, 1, {}, '');
                  }
                }}
                className="rounded-xl bg-gray-50 p-4 text-left transition-all active:scale-95 hover:bg-indigo-50 hover:ring-2 hover:ring-indigo-200"
              >
                <div className="text-sm font-medium leading-tight text-gray-800">{item.name}</div>
                <div className="mt-2 font-semibold text-indigo-600">${item.price.toFixed(2)}</div>
                {item.customizationGroups && item.customizationGroups.length > 0 && (
                  <div className="mt-1 text-xs text-gray-400">
                    {item.customizationGroups.length} customization
                    {item.customizationGroups.length > 1 ? 's' : ''}
                  </div>
                )}
              </button>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400">No items in this category</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-[420px] flex-col overflow-hidden bg-white">
        {error && (
          <div className="mx-4 mt-3 flex shrink-0 items-center justify-between rounded-lg bg-red-50 p-2.5 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-2 text-red-400">
              &times;
            </button>
          </div>
        )}
        {success && (
          <div className="mx-4 mt-3 shrink-0 rounded-lg bg-green-50 p-2.5 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="shrink-0 border-b p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Customer Details</div>

          {orderType === 'DineIn' && (
            <input
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Table Number *"
              type="number"
              min="1"
              className="w-full rounded-lg border px-3 py-2.5 text-sm"
            />
          )}

          {(orderType === 'Pickup' || orderType === 'Delivery') && (
            <div className="space-y-2">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name *"
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
              />
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
              />
            </div>
          )}

          {orderType === 'Delivery' && (
            <div className="mt-2 space-y-2">
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Street Address *"
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
              />
              <div className="flex gap-2">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="flex-1 rounded-lg border px-3 py-2.5 text-sm"
                />
                <input
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="Zip"
                  className="w-24 rounded-lg border px-3 py-2.5 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Order Items ({cart.length})
          </div>

          {cart.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">Tap items to add to order</div>
          ) : (
            <div className="space-y-2">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between rounded-lg bg-gray-50 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
                        {item.quantity}x
                      </span>
                      <span className="truncate text-sm font-medium text-gray-800">{item.menuItem.name}</span>
                    </div>

                    {Object.entries(item.selectedCustomizations).map(([, optionIds]) =>
                      optionIds.map((optId) => {
                        const opt = item.menuItem.customizationGroups
                          ?.flatMap((g) => g.options)
                          .find((o) => o.id === optId);
                        return opt ? (
                          <div key={optId} className="ml-6 text-xs text-gray-400">
                            + {opt.name}
                          </div>
                        ) : null;
                      }),
                    )}

                    {item.specialInstructions && (
                      <div className="ml-6 text-xs italic text-gray-400">Note: {item.specialInstructions}</div>
                    )}
                  </div>

                  <div className="ml-2 flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">${item.lineTotal.toFixed(2)}</span>
                    <button
                      onClick={() => removeFromCart(idx)}
                      className="text-lg leading-none text-red-400 hover:text-red-600"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-3 border-t p-4">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {orderType === 'Delivery' && (
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1 text-lg font-bold text-gray-800">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                paymentMethod === 'cash'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cash
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                paymentMethod === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Card
            </button>
            <button
              onClick={() => setPaymentMethod('none')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                paymentMethod === 'none'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ⏱️ Pay Later
            </button>
          </div>

          {paymentMethod === 'cash' && (
            <div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
                placeholder="Amount Tendered"
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
              />
              {amountTendered && parseFloat(amountTendered) >= total && (
                <div className="mt-1.5 flex justify-between text-sm font-semibold text-green-700">
                  <span>Change</span>
                  <span>${change.toFixed(2)}</span>
                </div>
              )}
              {amountTendered && parseFloat(amountTendered) < total && (
                <div className="mt-1 text-xs text-red-500">Insufficient amount</div>
              )}
            </div>
          )}

          {paymentMethod === 'none' && (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              Payment deferred. Order will be marked as unpaid and can be processed later.
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={clearOrder}
              disabled={cart.length === 0 && !customerName && !tableNumber}
              className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 disabled:opacity-40"
            >
              Clear
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={!canPlace || placing}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-all active:scale-[0.98] hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {placing
                ? 'Placing...'
                : paymentMethod === 'none'
                  ? `Start Order — $${total.toFixed(2)}`
                  : `Place Order — $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      {customizeModal && (
        <ItemCustomizationModal
          item={customizeModal}
          onAdd={addToCart}
          onClose={() => setCustomizeModal(null)}
        />
      )}
    </div>
  );
}

function ItemCustomizationModal({
  item,
  onAdd,
  onClose,
}: {
  item: MenuItem;
  onAdd: (item: MenuItem, qty: number, customizations: Record<string, string[]>, notes: string) => void;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState('');

  const toggleOption = (groupId: string, optionId: string, maxSelections: number) => {
    setSelections((prev) => {
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      if (maxSelections === 1) {
        return { ...prev, [groupId]: [optionId] };
      }
      if (current.length >= maxSelections) {
        return prev;
      }
      return { ...prev, [groupId]: [...current, optionId] };
    });
  };

  const requiredGroups = item.customizationGroups?.filter((g) => g.required) || [];
  const allRequiredFilled = requiredGroups.every((g) => (selections[g.id]?.length || 0) > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="shrink-0 border-b p-5">
          <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
          <p className="font-semibold text-indigo-600">${item.price.toFixed(2)}</p>
          {item.description && <p className="mt-1 text-sm text-gray-500">{item.description}</p>}
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {item.customizationGroups?.map((group) => (
            <div key={group.id}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">{group.name}</span>
                <div className="flex items-center gap-2">
                  {group.required && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Required
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {group.maxSelections === 1 ? 'Pick one' : `Up to ${group.maxSelections}`}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                {group.options.map((opt) => {
                  const isSelected = selections[group.id]?.includes(opt.id) || false;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleOption(group.id, opt.id, group.maxSelections)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium">{opt.name}</span>
                      <span className="text-gray-500">
                        {opt.priceAdjustment > 0
                          ? `+$${opt.priceAdjustment.toFixed(2)}`
                          : opt.priceAdjustment < 0
                            ? `-$${Math.abs(opt.priceAdjustment).toFixed(2)}`
                            : 'Free'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <span className="text-sm font-medium text-gray-800">Special Instructions</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests..."
              rows={2}
              className="mt-1.5 w-full resize-none rounded-xl border px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="shrink-0 border-t p-5">
          <div className="mb-4 flex items-center justify-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-10 w-10 rounded-full bg-gray-100 text-lg font-bold transition-colors hover:bg-gray-200"
            >
              -
            </button>
            <span className="w-8 text-center text-xl font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="h-10 w-10 rounded-full bg-gray-100 text-lg font-bold transition-colors hover:bg-gray-200"
            >
              +
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => onAdd(item, quantity, selections, notes)}
              disabled={!allRequiredFilled}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-40"
            >
              Add to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
