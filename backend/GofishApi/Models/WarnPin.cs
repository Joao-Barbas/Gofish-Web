namespace GofishApi.Models
{
    public class WarnPin : Pin
    {
        public const int ExpiresInDays = 1;
        public WarningType WarnPinType;
    }
}
