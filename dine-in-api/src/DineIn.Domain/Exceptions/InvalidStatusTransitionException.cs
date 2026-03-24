namespace DineIn.Domain.Exceptions;

public class InvalidStatusTransitionException : Exception
{
    public InvalidStatusTransitionException(string currentStatus, string requestedStatus)
        : base($"Cannot transition order from '{currentStatus}' to '{requestedStatus}'.") { }
}