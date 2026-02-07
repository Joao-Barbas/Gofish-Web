namespace GofishApi.Models
{
    public class WarnPin : PinBase
    {
        public const int ExpiredInDays = 1;
        public WarnPinType WarnPinType;
    }
}
