using Kapehan.Components;
using Xunit;

namespace Kapehan.Components.Tests;

/// <summary>
/// KapeIcons.g.cs is generated from kapehan-icons.js, and `npm test` already proves it
/// matches. What it cannot prove is that the C# side behaves like the browser side, which
/// is what a consumer switching between the two will assume.
/// </summary>
public class IconTests
{
    [Fact]
    public void The_whole_set_is_present()
    {
        Assert.Equal(42, KapeIcons.All.Count);
    }

    [Fact]
    public void Names_and_aliases_both_resolve()
    {
        foreach (var icon in KapeIcons.All)
        {
            Assert.Equal(icon.Name, KapeIcons.Find(icon.Name)?.Name);
            foreach (var alias in icon.Aliases)
            {
                Assert.NotNull(KapeIcons.Find(alias));
            }
        }
    }

    /// <summary>Matches &lt;kape-icon&gt;: an unknown name renders nothing, it does not throw.</summary>
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    [InlineData("not-an-icon")]
    public void An_unknown_name_returns_null(string? name)
    {
        Assert.Null(KapeIcons.Find(name));
    }

    /// <summary>
    /// currentColor is the entire promise of the mono track. One literal hex left in a mono
    /// body means that icon silently ignores the theme, and it looks correct in every
    /// screenshot taken on the default palette.
    /// </summary>
    [Fact]
    public void Mono_bodies_carry_no_literal_colour()
    {
        foreach (var icon in KapeIcons.All)
        {
            Assert.DoesNotContain("#", icon.Mono);
            Assert.False(string.IsNullOrWhiteSpace(icon.Body), $"{icon.Name} has an empty colour body");
        }
    }

    [Fact]
    public void Every_label_is_human_readable()
    {
        foreach (var icon in KapeIcons.All)
        {
            Assert.DoesNotContain("-", icon.Label);
        }
    }
}
