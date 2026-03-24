using DineIn.Application.DTOs;
using MediatR;

namespace DineIn.Application.Features.MenuItems.Queries.GetMenuItems;

public record GetMenuItemsQuery(string? CategoryId) : IRequest<List<MenuItemDto>>;