# Kapehan.Components

Hand-drawn coffee-shop UI for Blazor: 30 components and 42 icons, styled
entirely by CSS variables. No JavaScript except `<dialog>.showModal()`, no data fetching,
no hard-coded colour anywhere.

```sh
dotnet add package Kapehan.Components
```

Reference the stylesheet once, in `App.razor` or `index.html`:

```html
<link rel="stylesheet" href="_content/Kapehan.Components/kapehan.css" />
```

The dialog, drawer and command palette need one script for `showModal()`:

```html
<script type="module" src="_content/Kapehan.Components/kapehan.interop.js"></script>
```

Then:

```razor
@using Kapehan.Components

<KapeButton Label="Order now" Variant="primary" Icon="barako" OnClick="Order" />
<KapeIcon Name="cup-cold" Size="32" Colour />
```

## Theming

Every component reads CSS variables, so a palette is six declarations:

```css
:root {
  --paper: #FFF7EC;
  --surface: #FFFFFF;
  --ink: #241A13;
  --accent: #A3663B;
  --pop: #D98E4A;
  --on-accent: #FFF7EC;
}
```

The 28 palettes on the site are the same six keys. `palettes.json` in the npm package
carries them all.

## Components

| Tag | Group | Name |
| --- | --- | --- |
| `<KapeButton>` | Actions | Button |
| `<KapeChips>` | Actions | Chips |
| `<KapeInput>` | Forms | Input |
| `<KapeSegmented>` | Actions | Segmented |
| `<KapeToast>` | Feedback | Toast |
| `<KapeStamps>` | Feedback | Stamp card |
| `<KapeMenuRow>` | Data | Menu row |
| `<KapeStepper>` | Forms | Stepper |
| `<KapeSwitch>` | Actions | Switch |
| `<KapeChoice>` | Forms | Checkbox · Radio |
| `<KapeSelect>` | Forms | Select |
| `<KapeTabs>` | Navigation | Tabs |
| `<KapeCard>` | Data | Card |
| `<KapeTag>` | Data | Badge |
| `<KapeAvatars>` | Navigation | Avatar |
| `<KapeDialog>` | Feedback | Dialog |
| `<KapeTip>` | Navigation | Tooltip |
| `<KapeSkeleton>` | Data | Skeleton |
| `<KapeProgress>` | Feedback | Progress |
| `<KapePager>` | Navigation | Pagination |
| `<KapeAccordion>` | Data | Accordion |
| `<KapeTable>` | Data | Table |
| `<KapeCrumbs>` | Navigation | Breadcrumb |
| `<KapeUpload>` | Forms | File upload |
| `<KapeEditableTable>` | Data | Editable table |
| `<KapeCombobox>` | Forms | Combobox |
| `<KapeMultiSelect>` | Forms | Multi-select |
| `<KapeDateRange>` | Forms | Date range |
| `<KapeCommandPalette>` | Overlays | Command palette |
| `<KapeDrawer>` | Overlays | Drawer |

## Prerendering

`KapeDialog`, `KapeDrawer` and `KapeCommandPalette` inject `IJSRuntime`. Every interop
call is behind an `OnAfterRenderAsync` gate, so server prerendering, which has no JS
runtime, does not touch them. Nothing else in the package needs JavaScript.

## Licence

MIT (c) BaryoDev. Source: <https://github.com/BaryoDev/Kapehan>
