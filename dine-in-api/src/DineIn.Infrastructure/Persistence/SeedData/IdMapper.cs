using System.Security.Cryptography;
using System.Text;

namespace DineIn.Infrastructure.Persistence.SeedData;

public static class IdMapper
{
    public static Guid ToGuid(string stringId)
    {
        var bytes = MD5.HashData(Encoding.UTF8.GetBytes(stringId));
        return new Guid(bytes);
    }
}
