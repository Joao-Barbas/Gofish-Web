namespace GofishApi.Models
{
    public class WarnPin : PinBase
    {
        public const int ExpiresInDays = 1;
        public WarnPinType WarnPinType;
    }
}
