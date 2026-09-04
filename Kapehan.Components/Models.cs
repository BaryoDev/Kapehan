// The record types the generated components bind to.
//
// Hand-written, unlike everything else in this project, because none of it is in the design
// canvas. The canvas carries markup, props and the accessibility contract; it does not carry
// a schema for the rows those components render. Rather than invent one in the canvas and
// have four framework generators disagree about it, the shapes live here and the blazor
// generator's check() fails the build if a canvas edit starts binding to a type this file
// does not define.
//
// Every one is a plain record with init-only members and a usable default, so a consumer can
// build one with an object initialiser and nothing here throws on a partially filled row.

using Microsoft.AspNetCore.Components;

namespace Kapehan.Components;

/// <summary>A drink on the menu, as rendered by KapeMenuRow and KapeCard.</summary>
public sealed record MenuItem
{
    /// <summary>Kapehan icon name, e.g. <c>barako</c>. Resolved by <see cref="KapeIcons.Find"/>.</summary>
    public string Icon { get; init; } = "";

    /// <summary>Display name.</summary>
    public string Name { get; init; } = "";

    /// <summary>Second line under the name in KapeMenuRow.</summary>
    public string Sub { get; init; } = "";

    /// <summary>Serving size, e.g. <c>16 oz</c>. Shown by KapeCard.</summary>
    public string Size { get; init; } = "";

    /// <summary>Hot or iced. Shown by KapeCard.</summary>
    public string Temp { get; init; } = "";

    /// <summary>Price. The markup renders the number; the currency symbol is the host app's.</summary>
    public decimal Price { get; init; }

    /// <summary>Optional badge text, e.g. <c>New</c>. Null renders no badge.</summary>
    public string? Badge { get; init; }
}

/// <summary>A shop location, for KapeSelect and KapeMultiSelect.</summary>
public sealed record Branch
{
    /// <summary>Stable id, used as the option value and the selection key.</summary>
    public string Id { get; init; } = "";

    /// <summary>Display name.</summary>
    public string Name { get; init; } = "";
}

/// <summary>Someone on the crew, for KapeAvatars.</summary>
public sealed record Person
{
    /// <summary>Stable id.</summary>
    public string Id { get; init; } = "";

    /// <summary>One or two letters shown in the circle.</summary>
    public string Initials { get; init; } = "";

    /// <summary>Full name, for a title or tooltip in the host app.</summary>
    public string Name { get; init; } = "";
}

/// <summary>A question and answer pair, for KapeAccordion.</summary>
public sealed record Faq
{
    /// <summary>The summary line.</summary>
    public string Question { get; init; } = "";

    /// <summary>The body revealed when the details element opens.</summary>
    public string Answer { get; init; } = "";
}

/// <summary>A row in KapeTable.</summary>
public sealed record Order
{
    /// <summary>Order number, rendered after a hash.</summary>
    public string Id { get; init; } = "";

    /// <summary>One-line description of the items.</summary>
    public string Summary { get; init; } = "";

    /// <summary>Free text. The value <c>making</c> is styled with the accent tag.</summary>
    public string Status { get; init; } = "";

    /// <summary>Order total.</summary>
    public decimal Total { get; init; }
}

/// <summary>One step in KapeCrumbs. The last in the trail renders as text, not a link.</summary>
public sealed record Crumb
{
    /// <summary>Visible text.</summary>
    public string Label { get; init; } = "";

    /// <summary>Target, ignored for the last crumb.</summary>
    public string Href { get; init; } = "";
}

/// <summary>A file already accepted by KapeUpload, with its progress.</summary>
public sealed record UploadFile
{
    /// <summary>File name.</summary>
    public string Name { get; init; } = "";

    /// <summary>Extension shown in the badge, e.g. <c>CSV</c>.</summary>
    public string Ext { get; init; } = "";

    /// <summary>Progress from 0 to 100. Written straight into a width, so clamp it upstream.</summary>
    public int Percent { get; init; }
}

/// <summary>An editable stock row in KapeEditableTable.</summary>
public sealed record Drink
{
    /// <summary>Stable id. KapeEditableTable tracks which row is in edit mode by this.</summary>
    public string Id { get; init; } = "";

    /// <summary>Display name.</summary>
    public string Name { get; init; } = "";

    /// <summary>Serving size.</summary>
    public string Size { get; init; } = "";

    /// <summary>Price. The only editable cell, and the value handed to OnSave.</summary>
    public decimal Price { get; init; }

    /// <summary>Units on hand.</summary>
    public int Stock { get; init; }
}

/// <summary>An extra a customer can add, for KapeCombobox.</summary>
public sealed record Addon
{
    /// <summary>Stable id, used as the selection key and in the option's DOM id.</summary>
    public string Id { get; init; } = "";

    /// <summary>Display name. KapeCombobox filters on this.</summary>
    public string Name { get; init; } = "";

    /// <summary>Surcharge, rendered after a plus sign.</summary>
    public decimal Price { get; init; }
}

/// <summary>A named shortcut in KapeDateRange, e.g. "Last 7 days".</summary>
public sealed record RangePreset
{
    /// <summary>Visible text.</summary>
    public string Label { get; init; } = "";

    /// <summary>First day, inclusive.</summary>
    public DateOnly From { get; init; }

    /// <summary>Last day, inclusive.</summary>
    public DateOnly To { get; init; }
}

/// <summary>An entry in KapeCommandPalette.</summary>
public sealed record Command
{
    /// <summary>Stable id, used in the option's DOM id for aria-activedescendant.</summary>
    public string Id { get; init; } = "";

    /// <summary>Visible text. The palette filters on this.</summary>
    public string Label { get; init; } = "";

    /// <summary>Heading the command is listed under. Commands are grouped in order of first use.</summary>
    public string Group { get; init; } = "";

    /// <summary>What running the command does. Invoked after the palette closes.</summary>
    public EventCallback Run { get; init; }
}

/// <summary>One line of an order, for KapeDrawer.</summary>
public sealed record OrderLine
{
    /// <summary>Stable id.</summary>
    public string Id { get; init; } = "";

    /// <summary>Item name.</summary>
    public string Name { get; init; } = "";

    /// <summary>How many.</summary>
    public int Qty { get; init; }

    /// <summary>Line total. KapeDrawer sums these for the footer.</summary>
    public decimal Total { get; init; }
}
