import { useCallback, useEffect, useState } from 'react';
import {
  getCategories, getMenuItems,
  createCustomizationGroup, updateCustomizationGroup, deleteCustomizationGroup,
  createCustomizationOption, updateCustomizationOption, deleteCustomizationOption,
  getAllCustomizationGroups, cloneGroupToMenuItem,
} from '@/api/adminApi';
import type { Category, MenuItem, CustomizationGroup, CustomizationOption, CustomizationGroupWithItem, PaginatedResult } from '@/types';

export default function Customizations() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;

  const [groupForm, setGroupForm] = useState<{ open: boolean; menuItemId: string; editing?: CustomizationGroup }>({ open: false, menuItemId: '' });
  const [optionForm, setOptionForm] = useState<{ open: boolean; groupId: string; editing?: CustomizationOption }>({ open: false, groupId: '' });
  const [allGroups, setAllGroups] = useState<CustomizationGroupWithItem[]>([]);
  const [cloneModal, setCloneModal] = useState<{ open: boolean; menuItemId: string }>({ open: false, menuItemId: '' });

  const loadCategories = useCallback(() => {
    getCategories().then(setCategories).catch((e) => setError(e.message));
  }, []);

  const loadItems = useCallback(() => {
    getMenuItems({
      categoryId: selectedCat || undefined,
      search: searchQuery || undefined,
      page,
      pageSize: PAGE_SIZE,
    }).then((result: PaginatedResult<MenuItem>) => {
      setItems(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    }).catch((e) => setError(e.message));
  }, [selectedCat, searchQuery, page]);

  const loadAllGroups = useCallback(() => {
    getAllCustomizationGroups().then(setAllGroups).catch((e) => setError(e.message));
  }, []);

  useEffect(loadCategories, [loadCategories]);
  useEffect(loadItems, [loadItems]);
  useEffect(loadAllGroups, [loadAllGroups]);

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Delete this customization group and all its options?')) return;
    try {
      await deleteCustomizationGroup(id);
      loadItems();
      loadAllGroups();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
  };

  const handleDeleteOption = async (id: string) => {
    if (!confirm('Delete this option?')) return;
    try {
      await deleteCustomizationOption(id);
      loadItems();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
  };

  const handleCloneGroup = async (groupId: string, menuItemId: string) => {
    try {
      await cloneGroupToMenuItem(groupId, menuItemId);
      setCloneModal({ open: false, menuItemId: '' });
      loadItems();
      loadAllGroups();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Customizations</h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">&times;</button>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center gap-4">
        <div className="relative">
          <span className="text-xs text-gray-500">Search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setExpandedItem(null); setPage(1); }}
            placeholder="Search menu items…"
            className="block mt-1 border rounded-lg px-3 py-2 text-sm text-gray-700 w-64"
          />
        </div>
        <label className="block">
          <span className="text-xs text-gray-500">Filter by Category</span>
          <select value={selectedCat} onChange={(e) => { setSelectedCat(e.target.value); setPage(1); }}
            className="block mt-1 border rounded-lg px-3 py-2 text-sm text-gray-700">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <span className="text-sm text-gray-500 ml-auto">{totalCount} menu items</span>
      </div>

      {/* Menu Items Accordion */}
      <div className="space-y-3">
        {items.map((item) => {
          const cat = categories.find((c) => c.id === item.categoryId);
          const isExpanded = expandedItem === item.id;
          const groupCount = item.customizationGroups?.length || 0;
          const optionCount = item.customizationGroups?.reduce((sum, g) => sum + (g.options?.length || 0), 0) || 0;

          return (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Item Header */}
              <button
                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div>
                  <span className="font-semibold text-gray-800">{item.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{cat?.name}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">${item.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {groupCount > 0 ? (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                      {groupCount} {groupCount === 1 ? 'group' : 'groups'}, {optionCount} {optionCount === 1 ? 'option' : 'options'}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">No customizations</span>
                  )}
                  <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t px-6 py-5 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Customization Groups</h4>
                    <div className="flex items-center gap-2">
                      {allGroups.length > 0 && (
                        <button
                          onClick={() => setCloneModal({ open: true, menuItemId: item.id })}
                          className="px-3 py-1.5 bg-white border border-indigo-600 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-50"
                        >
                          📋 Copy Existing Group
                        </button>
                      )}
                      <button
                        onClick={() => setGroupForm({ open: true, menuItemId: item.id })}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
                      >
                        + Add Group
                      </button>
                    </div>
                  </div>

                  {(!item.customizationGroups || item.customizationGroups.length === 0) && (
                    <p className="text-gray-400 text-sm text-center py-6">No customization groups yet. Click "+ Add Group" to get started.</p>
                  )}

                  <div className="space-y-3">
                    {item.customizationGroups?.map((group) => (
                      <div key={group.id} className="bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-800">{group.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${group.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                              {group.required ? 'Required' : 'Optional'}
                            </span>
                            <span className="text-xs text-gray-400">Max: {group.maxSelections}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setGroupForm({ open: true, menuItemId: item.id, editing: group })}
                              className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">Edit</button>
                            <button onClick={() => handleDeleteGroup(group.id)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Options</span>
                            <button onClick={() => setOptionForm({ open: true, groupId: group.id })}
                              className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">+ Add Option</button>
                          </div>

                          {group.options.length === 0 ? (
                            <p className="text-gray-400 text-xs text-center py-2">No options yet</p>
                          ) : (
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-gray-500 text-xs">
                                  <th className="pb-1.5 font-medium">Name</th>
                                  <th className="pb-1.5 font-medium">Price Adjustment</th>
                                  <th className="pb-1.5 font-medium text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.options.map((opt) => (
                                  <tr key={opt.id} className="border-t border-gray-200">
                                    <td className="py-2 text-gray-800">{opt.name}</td>
                                    <td className="py-2">
                                      {opt.priceAdjustment > 0 ? (
                                        <span className="text-green-700 font-medium">+${opt.priceAdjustment.toFixed(2)}</span>
                                      ) : opt.priceAdjustment < 0 ? (
                                        <span className="text-red-700 font-medium">-${Math.abs(opt.priceAdjustment).toFixed(2)}</span>
                                      ) : (
                                        <span className="text-gray-400">Free</span>
                                      )}
                                    </td>
                                    <td className="py-2 text-right space-x-2">
                                      <button onClick={() => setOptionForm({ open: true, groupId: group.id, editing: opt })}
                                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">Edit</button>
                                      <button onClick={() => handleDeleteOption(opt.id)}
                                        className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
            {searchQuery ? 'No menu items match your search' : 'No menu items found'}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
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
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
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

      {/* Group Form Modal */}
      {groupForm.open && (
        <GroupFormModal
          menuItemId={groupForm.menuItemId}
          editing={groupForm.editing}
          onClose={() => setGroupForm({ open: false, menuItemId: '' })}
          onSaved={() => { setGroupForm({ open: false, menuItemId: '' }); loadItems(); loadAllGroups(); }}
        />
      )}

      {/* Option Form Modal */}
      {optionForm.open && (
        <OptionFormModal
          groupId={optionForm.groupId}
          editing={optionForm.editing}
          onClose={() => setOptionForm({ open: false, groupId: '' })}
          onSaved={() => { setOptionForm({ open: false, groupId: '' }); loadItems(); }}
        />
      )}

      {/* Clone Group Modal */}
      {cloneModal.open && (
        <CloneGroupModal
          groups={allGroups}
          targetMenuItemId={cloneModal.menuItemId}
          onClone={(groupId) => handleCloneGroup(groupId, cloneModal.menuItemId)}
          onClose={() => setCloneModal({ open: false, menuItemId: '' })}
        />
      )}
    </div>
  );
}

function GroupFormModal({ menuItemId, editing, onClose, onSaved }: {
  menuItemId: string; editing?: CustomizationGroup; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(editing?.name || '');
  const [required, setRequired] = useState(editing?.required ?? false);
  const [maxSelections, setMaxSelections] = useState(editing?.maxSelections ?? 1);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await updateCustomizationGroup(editing.id, { name, required, maxSelections });
      else await createCustomizationGroup(menuItemId, { name, required, maxSelections });
      onSaved();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Error'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Group' : 'New Customization Group'}</h3>
        {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
        <label className="block mb-3">
          <span className="text-sm text-gray-600">Group Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Size, Toppings, Sauce"
            className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} className="rounded" />
            <span className="text-sm text-gray-600">Required</span>
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Max Selections</span>
            <input type="number" min="1" value={maxSelections} onChange={(e) => setMaxSelections(+e.target.value)}
              className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm" />
          </label>
        </div>
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

function OptionFormModal({ groupId, editing, onClose, onSaved }: {
  groupId: string; editing?: CustomizationOption; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(editing?.name || '');
  const [priceAdjustment, setPriceAdjustment] = useState(editing?.priceAdjustment ?? 0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await updateCustomizationOption(editing.id, { name, priceAdjustment });
      else await createCustomizationOption(groupId, { name, priceAdjustment });
      onSaved();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Error'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Option' : 'New Option'}</h3>
        {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
        <label className="block mb-3">
          <span className="text-sm text-gray-600">Option Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Large, Extra Cheese"
            className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block mb-4">
          <span className="text-sm text-gray-600">Price Adjustment ($)</span>
          <input type="number" step="0.01" value={priceAdjustment} onChange={(e) => setPriceAdjustment(+e.target.value)}
            className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm" />
          <p className="text-xs text-gray-400 mt-1">Use 0 for no extra charge, positive for upcharge</p>
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

function CloneGroupModal({ groups, targetMenuItemId, onClone, onClose }: {
  groups: CustomizationGroupWithItem[]; targetMenuItemId: string; onClone: (groupId: string) => void; onClose: () => void;
}) {
  const [selected, setSelected] = useState<string>('');
  const [search, setSearch] = useState('');

  // Filter out groups that already belong to the target menu item, and apply search
  const available = groups.filter((g) =>
    g.menuItemId !== targetMenuItemId &&
    (g.name.toLowerCase().includes(search.toLowerCase()) || g.menuItemName.toLowerCase().includes(search.toLowerCase()))
  );

  // Group by name for easier browsing
  const grouped = available.reduce<Record<string, CustomizationGroupWithItem[]>>((acc, g) => {
    (acc[g.name] ??= []).push(g);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
        <h3 className="text-lg font-bold mb-1">Copy Existing Group</h3>
        <p className="text-sm text-gray-500 mb-4">Select a customization group to copy. A duplicate with all options will be created on this menu item.</p>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search groups or menu items…"
          className="border rounded-lg px-3 py-2 text-sm mb-3 w-full"
        />

        <div className="overflow-y-auto flex-1 space-y-3 mb-4">
          {Object.keys(grouped).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No groups available to copy</p>
          ) : (
            Object.entries(grouped).map(([name, items]) => (
              <div key={name}>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{name}</div>
                <div className="space-y-1">
                  {items.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelected(g.id)}
                      className={`w-full text-left border rounded-lg p-3 transition-colors ${
                        selected === g.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-600">from <span className="font-medium text-gray-800">{g.menuItemName}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${g.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                            {g.required ? 'Required' : 'Optional'}
                          </span>
                          <span className="text-xs text-gray-400">Max: {g.maxSelections}</span>
                        </div>
                      </div>
                      {g.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {g.options.map((opt) => (
                            <span key={opt.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {opt.name}{opt.priceAdjustment > 0 ? ` +$${opt.priceAdjustment.toFixed(2)}` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onClone(selected)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            Copy Group
          </button>
        </div>
      </div>
    </div>
  );
}
