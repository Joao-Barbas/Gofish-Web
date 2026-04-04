namespace GofishApi.Options;

public class GamificationOptions
{
    public int UsernameChangeCost { get; set; } = 100;

    // Points awarded/deducted to the pin owner per vote
    public int UpvotePointGain { get; set; } = 1;
    public int DownvotePointLoss { get; set; } = 1;
}
