using DineIn.Application.DTOs;
using MediatR;

namespace DineIn.Application.Features.MenuItems.Queries.GetMenuItemById;

public record GetMenuItemByIdQuery(string Id) : IRequest<MenuItemDto>;