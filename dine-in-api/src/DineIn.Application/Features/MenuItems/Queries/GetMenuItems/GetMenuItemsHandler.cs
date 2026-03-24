using DineIn.Application.DTOs;
using DineIn.Application.Interfaces;
using DineIn.Application.Mappings;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DineIn.Application.Features.MenuItems.Queries.GetMenuItems;

public class GetMenuItemsHandler(IApplicationDbContext dbContext) : IRequestHandler<GetMenuItemsQuery, List<MenuItemDto>>
{
    public async Task<List<MenuItemDto>> Handle(GetMenuItemsQuery request, CancellationToken cancellationToken)
    {
        var query = dbContext.MenuItems
            .Include(x => x.CustomizationGroups)
            .ThenInclude(x => x.Options)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.CategoryId) && Guid.TryParse(request.CategoryId, out var categoryId))
        {
            query = query.Where(x => x.CategoryId == categoryId);
        }

        var items = await query.ToListAsync(cancellationToken);
        return items.Select(x => x.ToDto()).ToList();
    }
}