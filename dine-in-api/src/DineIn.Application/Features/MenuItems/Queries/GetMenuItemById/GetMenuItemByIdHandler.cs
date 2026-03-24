using DineIn.Application.DTOs;
using DineIn.Application.Interfaces;
using DineIn.Application.Mappings;
using DineIn.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DineIn.Application.Features.MenuItems.Queries.GetMenuItemById;

public class GetMenuItemByIdHandler(IApplicationDbContext dbContext) : IRequestHandler<GetMenuItemByIdQuery, MenuItemDto>
{
    public async Task<MenuItemDto> Handle(GetMenuItemByIdQuery request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.Id, out var menuItemId))
        {
            throw new NotFoundException("MenuItem", request.Id);
        }

        var item = await dbContext.MenuItems
            .Include(x => x.CustomizationGroups)
            .ThenInclude(x => x.Options)
            .FirstOrDefaultAsync(x => x.Id == menuItemId, cancellationToken);

        if (item is null)
        {
            throw new NotFoundException("MenuItem", request.Id);
        }

        return item.ToDto();
    }
}