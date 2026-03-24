import { useCallback, useEffect, useState } from 'react';
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getMenuItems, createMenuItem, updateMenuItem, toggleAvailability, deleteMenuItem,
} from '@/api/adminApi';
import type { Category, MenuItem, PaginatedResult } from '@/types';

export default function Products() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;

  const [catModal, setCatModal] = useState<{ open: boolean; editing?: Category }>({ open: false });
  const [itemModal, setItemModal] = useState<{ open: boolean; editing?: MenuItem }>({ open: false });

  const loadCategories = useCallback(() => {
    getCategories().then(setCategories).catch((e) => setError(e.message));
  }, []);

  const loadItems = useCallback(() => {
    getMenuItems({
      categoryId: selectedCat || undefined,
      page,
      pageSize: PAGE_SIZE,
    }).then((result: PaginatedResult<MenuItem>) => {
      setItems(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    }).catch((e) => setError(e.message));
  }, [selectedCat, page]);

  useEffect(loadCategories, [loadCategories]);
  useEffect(loadItems, [loadItems]);

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      loadCategories();
      if (selectedCat === id) setSelectedCat('');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
  };

  const handleToggleAvail = async (item: MenuItem) => {
    try {
      await toggleAvailability(item.id, !item.isAvailable);
      loadItems();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await deleteMenuItem(id);
      loadItems();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Management</h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">&times;</button>
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
          <button
            onClick={() => setCatModal({ open: true })}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            + Add Category
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Image URL</th>
                <th className="pb-2 font-medium">Sort Order</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">{cat.name}</td>
                  <td className="py-3 text-gray-500 truncate max-w-[200px]">{cat.imageUrl}</td>
                  <td className="py-3 text-gray-500">{cat.sortOrder}</td>
                  <td className="py-3 text-right space-x-2">
                    <button onClick={() => setCatModal({ open: true, editing: cat })}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">Edit</button>
                    <button onClick={() => handleDeleteCategory(cat.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-gray-400 text-center">No categories</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Menu Items Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Menu Items</h3>
          <div className="flex items-center gap-3">
            <select value={selectedCat} onChange={(e) => { setSelectedCat(e.target.value); setPage(1); }}
              className="border rounded-lg px-3 py-2 text-sm text-gray-700">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={() => setItemModal({ open: true })}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              + Add Item
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Price</th>
                <th className="pb-2 font-medium">Available</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const cat = categories.find((c) => c.id === item.categoryId);
                return (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <p className="text-xs text-gray-400 truncate max-w-[300px]">{item.description}</p>
                      </div>
                    </td>
                    <td className="py-3 text-gray-500">{cat?.name || 'Unknown'}</td>
                    <td className="py-3 font-medium text-gray-800">${item.price.toFixed(2)}</td>
                    <td className="py-3">
                      <button onClick={() => handleToggleAvail(item)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {item.isAvailable ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button onClick={() => setItemModal({ open: true, editing: item })}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">Edit</button>
                      <button onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-gray-400 text-center">No menu items</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="text-sm text-gray-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2.5 py-1.5 text-xs rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                «
              </button>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-2.5 py-1.5 text-xs rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-gray-400 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-2.5 py-1.5 text-xs rounded-lg border ${
                        p === page ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 text-xs rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 text-xs rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {catModal.open && (
        <CategoryModal editing={catModal.editing}
          onClose={() => setCatModal({ open: false })}
          onSaved={() => { setCatModal({ open: false }); loadCategories(); }} />
      )}
      {itemModal.open && (
        <MenuItemModal editing={itemModal.editing} categories={categories}
          onClose={() => setItemModal({ open: false })}
          onSaved={() => { setItemModal({ open: false }); loadItems(); }} />
      )}
    </div>
  );
}

// ─── Category Modal ───
function CategoryModal({ editing, onClose, onSaved }: { editing?: Category; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(editing?.name || '');
  const [imageUrl, setImageUrl] = useState(editing?.imageUrl || '');
  const [sortOrder, setSortOrder] = useState(editing?.sortOrder ?? 0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await updateCategory(editing.id, { name, imageUrl, sortOrder });
      else await createCategory({ name, imageUrl, sortOrder });
      onSaved();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Error'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Category' : 'New Category'}</h3>
        {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
        <label className="block mb-3">
          <span className="text-sm text-gray-600">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block mb-3">
          <span className="text-sm text-gray-600">Image URL</span>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block mb-4">
          <span className="text-sm text-gray-600">Sort Order</span>
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(+e.target.value)}
            className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm" />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── MenuItem Modal ───
function MenuItemModal({ editing, categories, onClose, onSaved }: {
  editing?: MenuItem; categories: Category[]; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(editing?.name || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [price, setPrice] = useState(editing?.price ?? 0);
  const [imageUrl, setImageUrl] = useState(editing?.imageUrl || '');
  const [categoryId, setCategoryId] = useState(editing?.categoryId || categories[0]?.id || '');
  const [isAvailable, setIsAvailable] = useState(editing?.isAvailable ?? true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name, description, price, imageUrl, categoryId, isAvailable };
      if (editing) await updateMenuItem(editing.id, data);
      else await createMenuItem(data);
      onSaved();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Error'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
        <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Menu Item' : 'New Menu Item'}</h3>
        {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
        <label className="block mb-3">
          <span className="text-sm text-gray-600">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block mb-3">
          <span className="text-sm text-gray-600">Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
            className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <label className="block">
            <span className="text-sm text-gray-600">Price ($)</span>
            <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(+e.target.value)} required
              className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Category</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
              className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
        <label className="block mb-3">
          <span className="text-sm text-gray-600">Image URL</span>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} className="rounded" />
          <span className="text-sm text-gray-600">Available</span>
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
