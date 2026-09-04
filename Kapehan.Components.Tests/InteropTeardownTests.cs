using System.Reflection;
using Microsoft.JSInterop;
using Xunit;

namespace Kapehan.Components.Tests;

/// <summary>
/// The listener leak, run rather than read.
///
/// KapeCommandPalette binds a window keydown listener through bindHotkey and hands
/// JavaScript a DotNetObjectReference to call back on. Both outlive the component unless
/// teardown releases them, and on Blazor Server "the component" is one circuit navigation:
/// go away and come back and Ctrl+K fires Toggle on every dead instance as well as the live
/// one. The static gate in scripts/generators/blazor.mjs reads the generated file for that
/// shape. This drives it: real Blazor lifecycle methods, a runtime that records what is
/// called on it, and assertions on what teardown actually did.
///
/// What this does NOT cover, and cannot from here: the browser side of the same handle.
/// DotNet.createJSObjectReference marshalling the returned object back as an
/// IJSObjectReference, and removeEventListener then firing on the listener bindHotkey
/// added, need a Blazor host and a DOM. There is neither in this repo, so the gate for that
/// half is check()'s comparison of the method name C# invokes against the methods the
/// handle in kapehan.interop.js actually carries.
/// </summary>
public class InteropTeardownTests
{
    /// <summary>An IJSObjectReference that remembers what was called on it and whether it was released.</summary>
    private sealed class Recorder : IJSObjectReference
    {
        public List<string> Calls { get; } = new();
        public bool Disposed { get; private set; }

        /// <summary>What this hands back when the caller asks for another reference, e.g. the bindHotkey handle.</summary>
        public Recorder? Child { get; private set; }

        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, object?[]? args)
        {
            Calls.Add(identifier);
            if (typeof(TValue) == typeof(IJSObjectReference))
            {
                Child ??= new Recorder();
                return ValueTask.FromResult((TValue)(object)Child);
            }

            return ValueTask.FromResult(default(TValue)!);
        }

        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, CancellationToken cancellationToken, object?[]? args) =>
            InvokeAsync<TValue>(identifier, args);

        public ValueTask DisposeAsync()
        {
            Disposed = true;
            return ValueTask.CompletedTask;
        }
    }

    /// <summary>The interactive runtime, which is what exists once prerendering is over.</summary>
    private sealed class RecordingRuntime : IJSRuntime
    {
        public List<string> Calls { get; } = new();
        public Recorder Module { get; } = new();

        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, object?[]? args)
        {
            Calls.Add(identifier);
            if (typeof(TValue) == typeof(IJSObjectReference)) return ValueTask.FromResult((TValue)(object)Module);
            return ValueTask.FromResult(default(TValue)!);
        }

        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, CancellationToken cancellationToken, object?[]? args) =>
            InvokeAsync<TValue>(identifier, args);
    }

    private static void Inject(object target, string property, object value) =>
        target.GetType()
            .GetProperty(property, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)!
            .SetValue(target, value);

    private static object? Field(object target, string name) =>
        target.GetType().GetField(name, BindingFlags.Instance | BindingFlags.NonPublic)!.GetValue(target);

    private static Task Lifecycle(object target, string method, params object?[] args) =>
        (Task)target.GetType().GetMethod(method, BindingFlags.Instance | BindingFlags.NonPublic)!.Invoke(target, args)!;

    [Fact]
    public async Task Command_palette_releases_its_hotkey_subscription_and_its_object_reference()
    {
        var js = new RecordingRuntime();
        var palette = new KapeCommandPalette();
        Inject(palette, "JS", js);

        await Lifecycle(palette, "OnAfterRenderAsync", true);

        // The first render is what subscribes, so the leak only exists after this point.
        Assert.Contains("import", js.Calls);
        Assert.Contains("bindHotkey", js.Module.Calls);

        var subscription = js.Module.Child;
        Assert.NotNull(subscription);

        var self = (DotNetObjectReference<KapeCommandPalette>?)Field(palette, "_self");
        Assert.NotNull(self);

        await palette.DisposeAsync();

        // dispose() is what removes the window listener in the browser; without this call the
        // listener stays bound to a component that no longer exists.
        Assert.Contains("dispose", subscription!.Calls);
        Assert.True(subscription.Disposed, "the bindHotkey handle was never released");
        Assert.True(js.Module.Disposed, "the imported module reference was never released");

        // And the callback target: a live DotNetObjectReference is a rooted managed object
        // that JavaScript can still invoke Toggle on.
        Assert.Throws<ObjectDisposedException>(() => _ = self!.Value);
    }

    /// <summary>
    /// Teardown after the circuit has already gone. JSDisconnectedException is the ordinary
    /// way DisposeAsync runs on Blazor Server, and throwing out of it takes the rest of the
    /// teardown with it, including the DotNetObjectReference.
    /// </summary>
    [Fact]
    public async Task Command_palette_teardown_survives_a_circuit_that_has_already_gone()
    {
        var js = new DisconnectedRuntime();
        var palette = new KapeCommandPalette();
        Inject(palette, "JS", js);

        await Lifecycle(palette, "OnAfterRenderAsync", true);
        var self = (DotNetObjectReference<KapeCommandPalette>?)Field(palette, "_self");
        Assert.NotNull(self);

        await palette.DisposeAsync();

        Assert.Throws<ObjectDisposedException>(() => _ = self!.Value);
    }

    /// <summary>A module whose every call fails the way a dropped circuit fails.</summary>
    private sealed class Dropped : IJSObjectReference
    {
        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, object?[]? args)
        {
            if (typeof(TValue) == typeof(IJSObjectReference)) return ValueTask.FromResult((TValue)(object)new Dropped());
            throw new JSDisconnectedException("the circuit is gone");
        }

        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, CancellationToken cancellationToken, object?[]? args) =>
            InvokeAsync<TValue>(identifier, args);

        public ValueTask DisposeAsync() => throw new JSDisconnectedException("the circuit is gone");
    }

    private sealed class DisconnectedRuntime : IJSRuntime
    {
        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, object?[]? args)
        {
            if (typeof(TValue) == typeof(IJSObjectReference)) return ValueTask.FromResult((TValue)(object)new Dropped());
            throw new JSDisconnectedException("the circuit is gone");
        }

        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, CancellationToken cancellationToken, object?[]? args) =>
            InvokeAsync<TValue>(identifier, args);
    }
}
