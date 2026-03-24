using DineIn.Application.DTOs;
using MediatR;

namespace DineIn.Application.Features.Categories.Queries.GetCategories;

public record GetCategoriesQuery : IRequest<List<CategoryDto>>;