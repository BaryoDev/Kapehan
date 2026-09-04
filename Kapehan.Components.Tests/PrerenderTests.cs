using System.Reflection;
using Kapehan.Components;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.JSInterop;
using Xunit;

namespace Kapehan.Components.Tests;

/// <summary>
/// The .NET shape of the bug that shipped in 0.2.0.
///
/// There, an entry point that only ever ran in a browser was imported by a server renderer
/// and threw on the import alone, and nothing caught it because the only thing that loaded
/// the file was a browser test. Here the same mistake is one JS interop call outside
/// OnAfterRenderAsync: during prerender there is no JS runtime at all, the call throws, and
/// every consumer prerendering the component gets a 500 while it looks fine in a browser.
///
/// So this renders every component through HtmlRenderer, which is prerendering, with an
/// IJSRuntime that throws on any call, which is what static server rendering registers. A
/// component that reaches for JavaScript too early fails here rather than in someone's app.
/// </summary>
public class PrerenderTests
{
    /// <summary>What ASP.NET registers during static server rendering: a runtime that refuses.</summary>
    private sealed class RefusingJSRuntime : IJSRuntime
    {
        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, object?[]? args) =>
            throw new InvalidOperationException(
                $"JavaScript interop call '{identifier}' during prerendering. " +
                "Interop must wait for OnAfterRenderAsync.");

        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, CancellationToken cancellationToken, object?[]? args) =>
            InvokeAsync<TValue>(identifier, args);
    }

    private static ServiceProvider Services()
    {
        var services = new ServiceCollection();
        services.AddSingleton<IJSRuntime, RefusingJSRuntime>();
        return services.BuildServiceProvider();
    }

    private static async Task<string> Render(Type component, IDictionary<string, object?>? parameters = null)
    {
        await using var services = Services();
        await using var renderer = new HtmlRenderer(services, NullLoggerFactory.Instance);

        return await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var view = parameters is null ? ParameterView.Empty : ParameterView.FromDictionary(parameters);
            var output = await renderer.RenderComponentAsync(component, view);
            return output.ToHtmlString();
        });
    }

    /// <summary>Every component type in the package, found the way a consumer's tooling would.</summary>
    public static IEnumerable<object[]> AllComponents() =>
        typeof(KapeIcons).Assembly
            .GetTypes()
            .Where(t => typeof(IComponent).IsAssignableFrom(t) && t is { IsAbstract: false, IsPublic: true })
            .OrderBy(t => t.Name)
            .Select(t => new object[] { t });

    /// <summary>
    /// Every component, with no parameters at all.
    ///
    /// Nothing may be fed in here. EditorRequired is a warning in the consumer's project and
    /// never an error, so a bare tag with no attributes is what a consumer writes first and
    /// what a prerender then has to survive. Feeding this fixture the one parameter a
    /// component needs is how KapeCard shipped a NullReferenceException with a green suite.
    /// </summary>
    [Theory]
    [MemberData(nameof(AllComponents))]
    public async Task Renders_during_prerender_without_touching_javascript(Type component)
    {
        var html = await Render(component);
        Assert.NotNull(html);
    }

    /// <summary>
    /// The same rule stated where it broke: a card with no drink renders nothing at all,
    /// rather than dereferencing the item it was promised.
    /// </summary>
    [Fact]
    public async Task Card_with_no_item_renders_nothing()
    {
        var html = await Render(typeof(KapeCard));
        Assert.True(string.IsNullOrWhiteSpace(html), $"expected nothing, got: {html}");
    }

    /// <summary>
    /// The three that inject IJSRuntime, in the state where the interop would fire. Open is
    /// the parameter that makes a dialog call showModal, so rendering with Open set is the
    /// case that catches an ungated call; rendering with it unset proves nothing.
    /// </summary>
    [Theory]
    [InlineData("KapeDialog")]
    [InlineData("KapeDrawer")]
    [InlineData("KapeCommandPalette")]
    public async Task Open_dialogs_still_prerender(string typeName)
    {
        var type = typeof(KapeIcons).Assembly.GetType($"Kapehan.Components.{typeName}");
        Assert.NotNull(type);

        var html = await Render(type!, new Dictionary<string, object?> { ["Open"] = true });
        Assert.Contains("<dialog", html);
    }

    /// <summary>
    /// The collection-driven components with rows in them. Rendering them empty exercises
    /// none of the loops, which is where an index or a First() with no match would throw.
    /// </summary>
    [Fact]
    public async Task Renders_with_real_rows()
    {
        var branches = new[] { new Branch { Id = "kor", Name = "Koronadal" }, new Branch { Id = "gsc", Name = "General Santos" } };
        var addons = new[] { new Addon { Id = "oat", Name = "Oat milk", Price = 20m }, new Addon { Id = "shot", Name = "Extra shot", Price = 30m } };

        var cases = new (string Type, Dictionary<string, object?> Parameters)[]
        {
            ("KapeMenuRow", new() { ["Items"] = new[] { new MenuItem { Icon = "barako", Name = "Barako", Sub = "Local beans", Price = 150m, Badge = "New" } } }),
            ("KapeCard", new() { ["Item"] = new MenuItem { Icon = "cup-cold", Name = "Iced latte", Size = "16 oz", Temp = "Iced", Price = 180m } }),
            ("KapeTable", new() { ["Rows"] = new[] { new Order { Id = "1043", Summary = "2 items", Status = "making", Total = 330m } }, ["Caption"] = "Orders" }),
            ("KapeDrawer", new() { ["Lines"] = new[] { new OrderLine { Id = "l1", Name = "Barako", Qty = 2, Total = 300m } }, ["Title"] = "Order #1043" }),
            ("KapeAccordion", new() { ["Items"] = new[] { new Faq { Question = "Do you deliver?", Answer = "Yes." } }, ["OpenFirst"] = true }),
            ("KapeCrumbs", new() { ["Trail"] = new[] { new Crumb { Label = "Menu", Href = "/menu" }, new Crumb { Label = "Barako", Href = "/menu/barako" } } }),
            ("KapeAvatars", new() { ["People"] = new[] { new Person { Id = "a", Initials = "AR" }, new Person { Id = "b", Initials = "JD" }, new Person { Id = "c", Initials = "MP" } } }),
            ("KapeSelect", new() { ["Options"] = branches, ["Value"] = "kor" }),
            ("KapeMultiSelect", new() { ["Options"] = branches, ["Value"] = new[] { "kor" } }),
            ("KapeCombobox", new() { ["Options"] = addons, ["Value"] = new[] { "oat" } }),
            ("KapeEditableTable", new() { ["Rows"] = new[] { new Drink { Id = "d1", Name = "Barako", Size = "12 oz", Price = 150m, Stock = 40 } } }),
            ("KapeUpload", new() { ["Files"] = new[] { new UploadFile { Name = "menu.csv", Ext = "CSV", Percent = 60 } } }),
            ("KapeCommandPalette", new() { ["Commands"] = new[] { new Command { Id = "new", Label = "New order", Group = "Orders" } }, ["Open"] = true }),
            ("KapeDateRange", new() { ["Presets"] = new[] { new RangePreset { Label = "Last 7 days", From = new DateOnly(2026, 9, 1), To = new DateOnly(2026, 9, 7) } } }),
            ("KapeStamps", new() { ["Total"] = 10, ["Filled"] = 4 }),
            ("KapePager", new() { ["Page"] = 2, ["Pages"] = 5 }),
        };

        foreach (var (typeName, parameters) in cases)
        {
            var type = typeof(KapeIcons).Assembly.GetType($"Kapehan.Components.{typeName}");
            Assert.NotNull(type);

            var html = await Render(type!, parameters);
            Assert.False(string.IsNullOrWhiteSpace(html), $"{typeName} rendered nothing with rows supplied");
        }
    }

    /// <summary>
    /// A selection naming an option that is not in the list. The canvas writes this lookup
    /// as a JS find, which yields undefined, so the port must render the chip empty rather
    /// than throw: Options arriving from a service one render after Value is the ordinary
    /// way these are used, and First() made that first render a 500.
    /// </summary>
    [Theory]
    [InlineData("KapeCombobox")]
    [InlineData("KapeMultiSelect")]
    public async Task Renders_a_selection_that_is_not_in_the_options(string typeName)
    {
        var type = typeof(KapeIcons).Assembly.GetType($"Kapehan.Components.{typeName}")!;

        var html = await Render(type, new Dictionary<string, object?>
        {
            ["Value"] = new[] { "ghost" },
        });

        Assert.Contains("kape-chip", html);
    }
}
