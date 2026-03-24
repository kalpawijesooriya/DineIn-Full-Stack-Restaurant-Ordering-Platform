using DineIn.Application.DTOs;
using DineIn.Application.Interfaces;
using DineIn.Application.Mappings;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DineIn.Application.Features.Categories.Queries.GetCategories;

public class GetCategoriesHandler(IApplicationDbContext dbContext) : IRequestHandler<GetCategoriesQuery, List<CategoryDto>>
{
    public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        _ = request;

        var categories = await dbContext.Categories
            .OrderBy(x => x.SortOrder)
            .ToListAsync(cancellationToken);

        return categories.Select(x => x.ToDto()).ToList();
    }
}