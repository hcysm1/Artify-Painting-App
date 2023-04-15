
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value, mounting) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        if (!mounting || value !== undefined) {
            select.selectedIndex = -1; // no option should be selected
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked');
        return selected_option && selected_option.__value;
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
                // make sure an initial resize event is fired _after_ the iframe is loaded (which is asynchronous)
                // see https://github.com/sveltejs/svelte/issues/4233
                fn();
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.57.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    //Draw Circle
    const drawCircle = (e, ctx, prevMouseX, prevMouseY) => {
      ctx.beginPath();
      let radius = Math.sqrt(
        Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2)
      );
      ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI); // creating circle according to the mouse pointer
      ctx.stroke();
    };

    //Draw Triangle
    const drawTriangle = (e, ctx, prevMouseX, prevMouseY) => {
      ctx.beginPath();
      ctx.moveTo(prevMouseX, prevMouseY); // moving triangle to the mouse pointer
      ctx.lineTo(e.offsetX, e.offsetY); // creating first line according to the mouse pointer
      ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY); // creating bottom line of triangle
      ctx.closePath(); // closing path of a triangle so the third line draw automatically
      ctx.stroke();
    };

    //Draw Rectangle or square
    const drawRect = (e, ctx, prevMouseX, prevMouseY) => {
      ctx.strokeRect(
        e.offsetX,
        e.offsetY,
        prevMouseX - e.offsetX,
        prevMouseY - e.offsetY
      );
    };

    //draw hexagon
    const drawHexagon = (e, ctx, prevMouseX, prevMouseY) => {
      // Calculate the radius of the polygon based on the distance between the starting and ending points
      const radius = Math.sqrt(
        (e.offsetX - prevMouseX) ** 2 + (e.offsetY - prevMouseY) ** 2
      );

      // Calculate the angle between each point of the polygon
      const angle = (2 * Math.PI) / 6;

      // Begin the path
      ctx.beginPath();

      // Move to the starting point
      ctx.moveTo(
        prevMouseX + radius * Math.cos(0),
        prevMouseY + radius * Math.sin(0)
      );

      // Draw each point of the polygon
      for (let i = 1; i <= 5; i++) {
        ctx.lineTo(
          prevMouseX + radius * Math.cos(i * angle),
          prevMouseY + radius * Math.sin(i * angle)
        );
      }

      // Close the path and stroke it
      ctx.closePath();
      ctx.stroke();
    };

    //draw Ellipse
    const drawEllipse = (e, ctx, prevMouseX, prevMouseY) => {
      // Calculate the center point of the ellipse
      const centerX = (prevMouseX + e.offsetX) / 2;
      const centerY = (prevMouseY + e.offsetY) / 2;

      // Calculate the radius in the X and Y directions
      const radiusX = Math.abs(e.offsetX - prevMouseX) / 2;
      const radiusY = Math.abs(e.offsetY - prevMouseY) / 2;

      // Begin the path
      ctx.beginPath();

      // Create an ellipse path using the arc method
      ctx.save(); // Save the current context state
      ctx.translate(centerX, centerY); // Translate to the center point
      ctx.scale(radiusX / radiusY, 1); // Scale the x-axis to create an ellipse
      ctx.arc(0, 0, radiusY, 0, 2 * Math.PI); // Draw the ellipse
      ctx.restore(); // Restore the context state

      // Stroke the path
      ctx.stroke();
    };

    const pen = (e, ctx) => {
      ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
      ctx.stroke();
    };

    //Draw Line
    const drawLine = (e, ctx, prevMouseX, prevMouseY) => {
      ctx.beginPath();
      ctx.moveTo(prevMouseX, prevMouseY); // moving polygon to the mouse pointer
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };

    //dashed stroke
    const dashedLline = (e, ctx) => {
      ctx.setLineDash([10, 10]);
      ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
      ctx.stroke();
    };

    //gradient line
    const gradientLine = (e, ctx, hex) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 500);
      gradient.addColorStop(0.5, "blue");
      gradient.addColorStop(1, "green");
      gradient.addColorStop(0, hex);
      ctx.strokeStyle = gradient;
      ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
      ctx.stroke();
    };

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const selectedShape = writable("rectangle");
    const selectedStroke = writable("pen");
    const shape = writable(false);
    const stroke = writable(true);
    const isErasing = writable(false);

    /* src\Canvas.svelte generated by Svelte v3.57.0 */

    const { console: console_1 } = globals;
    const file$6 = "src\\Canvas.svelte";

    function create_fragment$8(ctx) {
    	let canvas_1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			canvas_1 = element("canvas");
    			add_location(canvas_1, file$6, 163, 0, 4776);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, canvas_1, anchor);
    			/*canvas_1_binding*/ ctx[17](canvas_1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(canvas_1, "pointerdown", /*handleStart*/ ctx[1], false, false, false, false),
    					listen_dev(canvas_1, "pointerup", /*handleEnd*/ ctx[2], false, false, false, false),
    					listen_dev(canvas_1, "pointermove", /*handleMove*/ ctx[3], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(canvas_1);
    			/*canvas_1_binding*/ ctx[17](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let hex;
    	let $shape;
    	let $selectedStroke;
    	let $stroke;
    	let $selectedShape;
    	let $isErasing;
    	validate_store(shape, 'shape');
    	component_subscribe($$self, shape, $$value => $$invalidate(25, $shape = $$value));
    	validate_store(selectedStroke, 'selectedStroke');
    	component_subscribe($$self, selectedStroke, $$value => $$invalidate(26, $selectedStroke = $$value));
    	validate_store(stroke, 'stroke');
    	component_subscribe($$self, stroke, $$value => $$invalidate(27, $stroke = $$value));
    	validate_store(selectedShape, 'selectedShape');
    	component_subscribe($$self, selectedShape, $$value => $$invalidate(28, $selectedShape = $$value));
    	validate_store(isErasing, 'isErasing');
    	component_subscribe($$self, isErasing, $$value => $$invalidate(16, $isErasing = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Canvas', slots, []);
    	let { brushsize } = $$props;
    	let { color } = $$props;
    	let canvas;
    	let context;
    	let isDrawing = false;
    	let prevMouseX, prevMouseY, snapshot;
    	let undoStack = [];
    	let redoStack = [];
    	let scale = 1;

    	const setCanvasBackground = () => {
    		// setting canvas to the original background color
    		$$invalidate(14, context.fillStyle = "#fffbeb", context);

    		context.fillRect(0, 0, canvas.width, canvas.height);
    	};

    	window.addEventListener("load", () => {
    		// setting canvas width/height... offsetwidth/height returns viewable width/height of an element
    		$$invalidate(0, canvas.width = window.innerWidth, canvas);

    		$$invalidate(0, canvas.height = window.innerHeight, canvas);
    		setCanvasBackground();
    	});

    	onMount(() => {
    		$$invalidate(14, context = canvas.getContext("2d"));
    	});

    	const handleErase = () => {
    		set_store_value(selectedStroke, $selectedStroke = "pen", $selectedStroke);
    		set_store_value(isErasing, $isErasing = true, $isErasing);
    	};

    	const handleStart = e => {
    		e.preventDefault();
    		isDrawing = true;
    		prevMouseX = e.offsetX / scale; // passing current mouseX position as prevMouseX value
    		prevMouseY = e.offsetY / scale; // passing current mouseY position as prevMouseY value
    		context.beginPath();
    		snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
    		undoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
    	};

    	const handleEnd = () => {
    		isDrawing = false;
    	};

    	//to set the erase value to true
    	const handleMove = e => {
    		e.preventDefault();
    		if (!isDrawing) return;

    		// adding copied canvas data on to this canvas
    		context.putImageData(snapshot, 0, 0);

    		if ($isErasing) {
    			pen(e, context);
    		} else {
    			//if condition to select a shape or stroke
    			if ($selectedShape === "rectangle" && !$stroke) {
    				drawRect(e, context, prevMouseX, prevMouseY);
    			} else if ($selectedShape === "triangle" && !$stroke) {
    				drawTriangle(e, context, prevMouseX, prevMouseY);
    			} else if ($selectedShape === "circle" && !$stroke) {
    				drawCircle(e, context, prevMouseX, prevMouseY);
    			} else if ($selectedShape === "hexagon" && !$stroke) {
    				drawHexagon(e, context, prevMouseX, prevMouseY);
    			} else if ($selectedShape === "ellipse" && !$stroke) {
    				drawEllipse(e, context, prevMouseX, prevMouseY);
    			} else if ($selectedStroke === "line" && !$shape) {
    				drawLine(e, context, prevMouseX, prevMouseY);
    			} else if ($selectedStroke === "pen" && !$shape) {
    				pen(e, context);
    			} else if ($selectedStroke === "gradientLine" && !$shape) {
    				gradientLine(e, context, hex);
    				$$invalidate(14, context.strokeStyle = hex, context);
    			} else if ($selectedStroke === "dashedLine" && !$shape) {
    				dashedLline(e, context);
    				context.setLineDash([]);
    			} else {
    				console.log("not a valid stroke or shape selected");
    			}
    		}
    	};

    	const handleClear = () => {
    		setCanvasBackground();
    		undoStack = [];
    		redoStack = [];
    	};

    	const handleSave = () => {
    		const link = document.createElement("a"); // creating <a> element
    		link.href = canvas.toDataURL("image/jpeg"); // passing canvasData as link href value
    		link.download = "canvas.jpg";
    		link.click(); // clicking link to download image
    	};

    	const handleShare = () => {
    		
    	};

    	const handleZoomIn = () => {
    		scale += 0.1;
    		$$invalidate(0, canvas.style.transform = `scale(${scale})`, canvas);
    	};

    	const handleZoomOut = () => {
    		if (scale > 0.1) {
    			scale -= 0.1;
    			$$invalidate(0, canvas.style.transform = `scale(${scale})`, canvas);
    		}
    	};

    	const handleUndo = () => {
    		if (undoStack.length > 0) {
    			redoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
    			context.putImageData(undoStack.pop(), 0, 0);
    		}
    	};

    	const handleRedo = () => {
    		if (redoStack.length > 0) {
    			undoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
    			context.putImageData(redoStack.pop(), 0, 0);
    		}
    	};

    	$$self.$$.on_mount.push(function () {
    		if (brushsize === undefined && !('brushsize' in $$props || $$self.$$.bound[$$self.$$.props['brushsize']])) {
    			console_1.warn("<Canvas> was created without expected prop 'brushsize'");
    		}

    		if (color === undefined && !('color' in $$props || $$self.$$.bound[$$self.$$.props['color']])) {
    			console_1.warn("<Canvas> was created without expected prop 'color'");
    		}
    	});

    	const writable_props = ['brushsize', 'color'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Canvas> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			canvas = $$value;
    			$$invalidate(0, canvas);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('brushsize' in $$props) $$invalidate(4, brushsize = $$props.brushsize);
    		if ('color' in $$props) $$invalidate(5, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		drawCircle,
    		drawRect,
    		drawTriangle,
    		drawHexagon,
    		drawEllipse,
    		pen,
    		dashedLline,
    		drawLine,
    		gradientLine,
    		selectedShape,
    		selectedStroke,
    		shape,
    		stroke,
    		isErasing,
    		brushsize,
    		color,
    		canvas,
    		context,
    		isDrawing,
    		prevMouseX,
    		prevMouseY,
    		snapshot,
    		undoStack,
    		redoStack,
    		scale,
    		setCanvasBackground,
    		handleErase,
    		handleStart,
    		handleEnd,
    		handleMove,
    		handleClear,
    		handleSave,
    		handleShare,
    		handleZoomIn,
    		handleZoomOut,
    		handleUndo,
    		handleRedo,
    		hex,
    		$shape,
    		$selectedStroke,
    		$stroke,
    		$selectedShape,
    		$isErasing
    	});

    	$$self.$inject_state = $$props => {
    		if ('brushsize' in $$props) $$invalidate(4, brushsize = $$props.brushsize);
    		if ('color' in $$props) $$invalidate(5, color = $$props.color);
    		if ('canvas' in $$props) $$invalidate(0, canvas = $$props.canvas);
    		if ('context' in $$props) $$invalidate(14, context = $$props.context);
    		if ('isDrawing' in $$props) isDrawing = $$props.isDrawing;
    		if ('prevMouseX' in $$props) prevMouseX = $$props.prevMouseX;
    		if ('prevMouseY' in $$props) prevMouseY = $$props.prevMouseY;
    		if ('snapshot' in $$props) snapshot = $$props.snapshot;
    		if ('undoStack' in $$props) undoStack = $$props.undoStack;
    		if ('redoStack' in $$props) redoStack = $$props.redoStack;
    		if ('scale' in $$props) scale = $$props.scale;
    		if ('hex' in $$props) $$invalidate(15, hex = $$props.hex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 32) {
    			$$invalidate(15, hex = color.toHex8String()); //changing the color value to hex format
    		}

    		if ($$self.$$.dirty & /*context, $isErasing, hex, brushsize*/ 114704) {
    			//when the color or size changes this statement will run
    			if (context) {
    				$$invalidate(14, context.strokeStyle = $isErasing ? "#fffbeb" : hex, context);
    				$$invalidate(14, context.lineWidth = brushsize, context); //changing size
    				$$invalidate(14, context.lineCap = "round", context); //change brush shape
    				$$invalidate(14, context.lineJoin = "round", context); //change brush shape
    			}
    		}
    	};

    	return [
    		canvas,
    		handleStart,
    		handleEnd,
    		handleMove,
    		brushsize,
    		color,
    		handleErase,
    		handleClear,
    		handleSave,
    		handleShare,
    		handleZoomIn,
    		handleZoomOut,
    		handleUndo,
    		handleRedo,
    		context,
    		hex,
    		$isErasing,
    		canvas_1_binding
    	];
    }

    class Canvas extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			brushsize: 4,
    			color: 5,
    			handleErase: 6,
    			handleClear: 7,
    			handleSave: 8,
    			handleShare: 9,
    			handleZoomIn: 10,
    			handleZoomOut: 11,
    			handleUndo: 12,
    			handleRedo: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Canvas",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get brushsize() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set brushsize(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleErase() {
    		return this.$$.ctx[6];
    	}

    	set handleErase(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClear() {
    		return this.$$.ctx[7];
    	}

    	set handleClear(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleSave() {
    		return this.$$.ctx[8];
    	}

    	set handleSave(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleShare() {
    		return this.$$.ctx[9];
    	}

    	set handleShare(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleZoomIn() {
    		return this.$$.ctx[10];
    	}

    	set handleZoomIn(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleZoomOut() {
    		return this.$$.ctx[11];
    	}

    	set handleZoomOut(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleUndo() {
    		return this.$$.ctx[12];
    	}

    	set handleUndo(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleRedo() {
    		return this.$$.ctx[13];
    	}

    	set handleRedo(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * Take input from [0, n] and return it as [0, 1]
     * @hidden
     */
    function bound01(n, max) {
        if (isOnePointZero(n)) {
            n = '100%';
        }
        var isPercent = isPercentage(n);
        n = max === 360 ? n : Math.min(max, Math.max(0, parseFloat(n)));
        // Automatically convert percentage into number
        if (isPercent) {
            n = parseInt(String(n * max), 10) / 100;
        }
        // Handle floating point rounding errors
        if (Math.abs(n - max) < 0.000001) {
            return 1;
        }
        // Convert into [0, 1] range if it isn't already
        if (max === 360) {
            // If n is a hue given in degrees,
            // wrap around out-of-range values into [0, 360] range
            // then convert into [0, 1].
            n = (n < 0 ? (n % max) + max : n % max) / parseFloat(String(max));
        }
        else {
            // If n not a hue given in degrees
            // Convert into [0, 1] range if it isn't already.
            n = (n % max) / parseFloat(String(max));
        }
        return n;
    }
    /**
     * Force a number between 0 and 1
     * @hidden
     */
    function clamp01(val) {
        return Math.min(1, Math.max(0, val));
    }
    /**
     * Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
     * <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
     * @hidden
     */
    function isOnePointZero(n) {
        return typeof n === 'string' && n.indexOf('.') !== -1 && parseFloat(n) === 1;
    }
    /**
     * Check to see if string passed in is a percentage
     * @hidden
     */
    function isPercentage(n) {
        return typeof n === 'string' && n.indexOf('%') !== -1;
    }
    /**
     * Return a valid alpha value [0,1] with all invalid values being set to 1
     * @hidden
     */
    function boundAlpha(a) {
        a = parseFloat(a);
        if (isNaN(a) || a < 0 || a > 1) {
            a = 1;
        }
        return a;
    }
    /**
     * Replace a decimal with it's percentage value
     * @hidden
     */
    function convertToPercentage(n) {
        if (n <= 1) {
            return "".concat(Number(n) * 100, "%");
        }
        return n;
    }
    /**
     * Force a hex value to have 2 characters
     * @hidden
     */
    function pad2(c) {
        return c.length === 1 ? '0' + c : String(c);
    }

    // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
    // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>
    /**
     * Handle bounds / percentage checking to conform to CSS color spec
     * <http://www.w3.org/TR/css3-color/>
     * *Assumes:* r, g, b in [0, 255] or [0, 1]
     * *Returns:* { r, g, b } in [0, 255]
     */
    function rgbToRgb(r, g, b) {
        return {
            r: bound01(r, 255) * 255,
            g: bound01(g, 255) * 255,
            b: bound01(b, 255) * 255,
        };
    }
    /**
     * Converts an RGB color value to HSL.
     * *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
     * *Returns:* { h, s, l } in [0,1]
     */
    function rgbToHsl(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h = 0;
        var s = 0;
        var l = (max + min) / 2;
        if (max === min) {
            s = 0;
            h = 0; // achromatic
        }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return { h: h, s: s, l: l };
    }
    function hue2rgb(p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * (6 * t);
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }
    /**
     * Converts an HSL color value to RGB.
     *
     * *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
     * *Returns:* { r, g, b } in the set [0, 255]
     */
    function hslToRgb(h, s, l) {
        var r;
        var g;
        var b;
        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);
        if (s === 0) {
            // achromatic
            g = l;
            b = l;
            r = l;
        }
        else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return { r: r * 255, g: g * 255, b: b * 255 };
    }
    /**
     * Converts an RGB color value to HSV
     *
     * *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
     * *Returns:* { h, s, v } in [0,1]
     */
    function rgbToHsv(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h = 0;
        var v = max;
        var d = max - min;
        var s = max === 0 ? 0 : d / max;
        if (max === min) {
            h = 0; // achromatic
        }
        else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return { h: h, s: s, v: v };
    }
    /**
     * Converts an HSV color value to RGB.
     *
     * *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
     * *Returns:* { r, g, b } in the set [0, 255]
     */
    function hsvToRgb(h, s, v) {
        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);
        var i = Math.floor(h);
        var f = h - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);
        var mod = i % 6;
        var r = [v, q, p, p, t, v][mod];
        var g = [t, v, v, q, p, p][mod];
        var b = [p, p, t, v, v, q][mod];
        return { r: r * 255, g: g * 255, b: b * 255 };
    }
    /**
     * Converts an RGB color to hex
     *
     * Assumes r, g, and b are contained in the set [0, 255]
     * Returns a 3 or 6 character hex
     */
    function rgbToHex(r, g, b, allow3Char) {
        var hex = [
            pad2(Math.round(r).toString(16)),
            pad2(Math.round(g).toString(16)),
            pad2(Math.round(b).toString(16)),
        ];
        // Return a 3 character hex if possible
        if (allow3Char &&
            hex[0].startsWith(hex[0].charAt(1)) &&
            hex[1].startsWith(hex[1].charAt(1)) &&
            hex[2].startsWith(hex[2].charAt(1))) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
        }
        return hex.join('');
    }
    /**
     * Converts an RGBA color plus alpha transparency to hex
     *
     * Assumes r, g, b are contained in the set [0, 255] and
     * a in [0, 1]. Returns a 4 or 8 character rgba hex
     */
    // eslint-disable-next-line max-params
    function rgbaToHex(r, g, b, a, allow4Char) {
        var hex = [
            pad2(Math.round(r).toString(16)),
            pad2(Math.round(g).toString(16)),
            pad2(Math.round(b).toString(16)),
            pad2(convertDecimalToHex(a)),
        ];
        // Return a 4 character hex if possible
        if (allow4Char &&
            hex[0].startsWith(hex[0].charAt(1)) &&
            hex[1].startsWith(hex[1].charAt(1)) &&
            hex[2].startsWith(hex[2].charAt(1)) &&
            hex[3].startsWith(hex[3].charAt(1))) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
        }
        return hex.join('');
    }
    /** Converts a decimal to a hex value */
    function convertDecimalToHex(d) {
        return Math.round(parseFloat(d) * 255).toString(16);
    }
    /** Converts a hex value to a decimal */
    function convertHexToDecimal(h) {
        return parseIntFromHex(h) / 255;
    }
    /** Parse a base-16 hex value into a base-10 integer */
    function parseIntFromHex(val) {
        return parseInt(val, 16);
    }
    function numberInputToObject(color) {
        return {
            r: color >> 16,
            g: (color & 0xff00) >> 8,
            b: color & 0xff,
        };
    }

    // https://github.com/bahamas10/css-color-names/blob/master/css-color-names.json
    /**
     * @hidden
     */
    var names = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgreen: '#006400',
        darkgrey: '#a9a9a9',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkslategrey: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1e90ff',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        goldenrod: '#daa520',
        gold: '#ffd700',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        grey: '#808080',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        lavenderblush: '#fff0f5',
        lavender: '#e6e6fa',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrodyellow: '#fafad2',
        lightgray: '#d3d3d3',
        lightgreen: '#90ee90',
        lightgrey: '#d3d3d3',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370db',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#db7093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        rebeccapurple: '#663399',
        red: '#ff0000',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32',
    };

    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */
    /**
     * Given a string or object, convert that input to RGB
     *
     * Possible string inputs:
     * ```
     * "red"
     * "#f00" or "f00"
     * "#ff0000" or "ff0000"
     * "#ff000000" or "ff000000"
     * "rgb 255 0 0" or "rgb (255, 0, 0)"
     * "rgb 1.0 0 0" or "rgb (1, 0, 0)"
     * "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
     * "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
     * "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
     * "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
     * "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
     * ```
     */
    function inputToRGB(color) {
        var rgb = { r: 0, g: 0, b: 0 };
        var a = 1;
        var s = null;
        var v = null;
        var l = null;
        var ok = false;
        var format = false;
        if (typeof color === 'string') {
            color = stringInputToObject(color);
        }
        if (typeof color === 'object') {
            if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
                format = String(color.r).substr(-1) === '%' ? 'prgb' : 'rgb';
            }
            else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
                s = convertToPercentage(color.s);
                v = convertToPercentage(color.v);
                rgb = hsvToRgb(color.h, s, v);
                ok = true;
                format = 'hsv';
            }
            else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
                s = convertToPercentage(color.s);
                l = convertToPercentage(color.l);
                rgb = hslToRgb(color.h, s, l);
                ok = true;
                format = 'hsl';
            }
            if (Object.prototype.hasOwnProperty.call(color, 'a')) {
                a = color.a;
            }
        }
        a = boundAlpha(a);
        return {
            ok: ok,
            format: color.format || format,
            r: Math.min(255, Math.max(rgb.r, 0)),
            g: Math.min(255, Math.max(rgb.g, 0)),
            b: Math.min(255, Math.max(rgb.b, 0)),
            a: a,
        };
    }
    // <http://www.w3.org/TR/css3-values/#integers>
    var CSS_INTEGER = '[-\\+]?\\d+%?';
    // <http://www.w3.org/TR/css3-values/#number-value>
    var CSS_NUMBER = '[-\\+]?\\d*\\.\\d+%?';
    // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
    var CSS_UNIT = "(?:".concat(CSS_NUMBER, ")|(?:").concat(CSS_INTEGER, ")");
    // Actual matching.
    // Parentheses and commas are optional, but not required.
    // Whitespace can take the place of commas or opening paren
    var PERMISSIVE_MATCH3 = "[\\s|\\(]+(".concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")\\s*\\)?");
    var PERMISSIVE_MATCH4 = "[\\s|\\(]+(".concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")\\s*\\)?");
    var matchers = {
        CSS_UNIT: new RegExp(CSS_UNIT),
        rgb: new RegExp('rgb' + PERMISSIVE_MATCH3),
        rgba: new RegExp('rgba' + PERMISSIVE_MATCH4),
        hsl: new RegExp('hsl' + PERMISSIVE_MATCH3),
        hsla: new RegExp('hsla' + PERMISSIVE_MATCH4),
        hsv: new RegExp('hsv' + PERMISSIVE_MATCH3),
        hsva: new RegExp('hsva' + PERMISSIVE_MATCH4),
        hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
        hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
    };
    /**
     * Permissive string parsing.  Take in a number of formats, and output an object
     * based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
     */
    function stringInputToObject(color) {
        color = color.trim().toLowerCase();
        if (color.length === 0) {
            return false;
        }
        var named = false;
        if (names[color]) {
            color = names[color];
            named = true;
        }
        else if (color === 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0, format: 'name' };
        }
        // Try to match string input using regular expressions.
        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
        // Just return an object and let the conversion functions handle that.
        // This way the result will be the same whether the tinycolor is initialized with string or object.
        var match = matchers.rgb.exec(color);
        if (match) {
            return { r: match[1], g: match[2], b: match[3] };
        }
        match = matchers.rgba.exec(color);
        if (match) {
            return { r: match[1], g: match[2], b: match[3], a: match[4] };
        }
        match = matchers.hsl.exec(color);
        if (match) {
            return { h: match[1], s: match[2], l: match[3] };
        }
        match = matchers.hsla.exec(color);
        if (match) {
            return { h: match[1], s: match[2], l: match[3], a: match[4] };
        }
        match = matchers.hsv.exec(color);
        if (match) {
            return { h: match[1], s: match[2], v: match[3] };
        }
        match = matchers.hsva.exec(color);
        if (match) {
            return { h: match[1], s: match[2], v: match[3], a: match[4] };
        }
        match = matchers.hex8.exec(color);
        if (match) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                a: convertHexToDecimal(match[4]),
                format: named ? 'name' : 'hex8',
            };
        }
        match = matchers.hex6.exec(color);
        if (match) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                format: named ? 'name' : 'hex',
            };
        }
        match = matchers.hex4.exec(color);
        if (match) {
            return {
                r: parseIntFromHex(match[1] + match[1]),
                g: parseIntFromHex(match[2] + match[2]),
                b: parseIntFromHex(match[3] + match[3]),
                a: convertHexToDecimal(match[4] + match[4]),
                format: named ? 'name' : 'hex8',
            };
        }
        match = matchers.hex3.exec(color);
        if (match) {
            return {
                r: parseIntFromHex(match[1] + match[1]),
                g: parseIntFromHex(match[2] + match[2]),
                b: parseIntFromHex(match[3] + match[3]),
                format: named ? 'name' : 'hex',
            };
        }
        return false;
    }
    /**
     * Check to see if it looks like a CSS unit
     * (see `matchers` above for definition).
     */
    function isValidCSSUnit(color) {
        return Boolean(matchers.CSS_UNIT.exec(String(color)));
    }

    var TinyColor = /** @class */ (function () {
        function TinyColor(color, opts) {
            if (color === void 0) { color = ''; }
            if (opts === void 0) { opts = {}; }
            var _a;
            // If input is already a tinycolor, return itself
            if (color instanceof TinyColor) {
                // eslint-disable-next-line no-constructor-return
                return color;
            }
            if (typeof color === 'number') {
                color = numberInputToObject(color);
            }
            this.originalInput = color;
            var rgb = inputToRGB(color);
            this.originalInput = color;
            this.r = rgb.r;
            this.g = rgb.g;
            this.b = rgb.b;
            this.a = rgb.a;
            this.roundA = Math.round(100 * this.a) / 100;
            this.format = (_a = opts.format) !== null && _a !== void 0 ? _a : rgb.format;
            this.gradientType = opts.gradientType;
            // Don't let the range of [0,255] come back in [0,1].
            // Potentially lose a little bit of precision here, but will fix issues where
            // .5 gets interpreted as half of the total, instead of half of 1
            // If it was supposed to be 128, this was already taken care of by `inputToRgb`
            if (this.r < 1) {
                this.r = Math.round(this.r);
            }
            if (this.g < 1) {
                this.g = Math.round(this.g);
            }
            if (this.b < 1) {
                this.b = Math.round(this.b);
            }
            this.isValid = rgb.ok;
        }
        TinyColor.prototype.isDark = function () {
            return this.getBrightness() < 128;
        };
        TinyColor.prototype.isLight = function () {
            return !this.isDark();
        };
        /**
         * Returns the perceived brightness of the color, from 0-255.
         */
        TinyColor.prototype.getBrightness = function () {
            // http://www.w3.org/TR/AERT#color-contrast
            var rgb = this.toRgb();
            return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        };
        /**
         * Returns the perceived luminance of a color, from 0-1.
         */
        TinyColor.prototype.getLuminance = function () {
            // http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
            var rgb = this.toRgb();
            var R;
            var G;
            var B;
            var RsRGB = rgb.r / 255;
            var GsRGB = rgb.g / 255;
            var BsRGB = rgb.b / 255;
            if (RsRGB <= 0.03928) {
                R = RsRGB / 12.92;
            }
            else {
                // eslint-disable-next-line prefer-exponentiation-operator
                R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
            }
            if (GsRGB <= 0.03928) {
                G = GsRGB / 12.92;
            }
            else {
                // eslint-disable-next-line prefer-exponentiation-operator
                G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
            }
            if (BsRGB <= 0.03928) {
                B = BsRGB / 12.92;
            }
            else {
                // eslint-disable-next-line prefer-exponentiation-operator
                B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
            }
            return 0.2126 * R + 0.7152 * G + 0.0722 * B;
        };
        /**
         * Returns the alpha value of a color, from 0-1.
         */
        TinyColor.prototype.getAlpha = function () {
            return this.a;
        };
        /**
         * Sets the alpha value on the current color.
         *
         * @param alpha - The new alpha value. The accepted range is 0-1.
         */
        TinyColor.prototype.setAlpha = function (alpha) {
            this.a = boundAlpha(alpha);
            this.roundA = Math.round(100 * this.a) / 100;
            return this;
        };
        /**
         * Returns whether the color is monochrome.
         */
        TinyColor.prototype.isMonochrome = function () {
            var s = this.toHsl().s;
            return s === 0;
        };
        /**
         * Returns the object as a HSVA object.
         */
        TinyColor.prototype.toHsv = function () {
            var hsv = rgbToHsv(this.r, this.g, this.b);
            return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this.a };
        };
        /**
         * Returns the hsva values interpolated into a string with the following format:
         * "hsva(xxx, xxx, xxx, xx)".
         */
        TinyColor.prototype.toHsvString = function () {
            var hsv = rgbToHsv(this.r, this.g, this.b);
            var h = Math.round(hsv.h * 360);
            var s = Math.round(hsv.s * 100);
            var v = Math.round(hsv.v * 100);
            return this.a === 1 ? "hsv(".concat(h, ", ").concat(s, "%, ").concat(v, "%)") : "hsva(".concat(h, ", ").concat(s, "%, ").concat(v, "%, ").concat(this.roundA, ")");
        };
        /**
         * Returns the object as a HSLA object.
         */
        TinyColor.prototype.toHsl = function () {
            var hsl = rgbToHsl(this.r, this.g, this.b);
            return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this.a };
        };
        /**
         * Returns the hsla values interpolated into a string with the following format:
         * "hsla(xxx, xxx, xxx, xx)".
         */
        TinyColor.prototype.toHslString = function () {
            var hsl = rgbToHsl(this.r, this.g, this.b);
            var h = Math.round(hsl.h * 360);
            var s = Math.round(hsl.s * 100);
            var l = Math.round(hsl.l * 100);
            return this.a === 1 ? "hsl(".concat(h, ", ").concat(s, "%, ").concat(l, "%)") : "hsla(".concat(h, ", ").concat(s, "%, ").concat(l, "%, ").concat(this.roundA, ")");
        };
        /**
         * Returns the hex value of the color.
         * @param allow3Char will shorten hex value to 3 char if possible
         */
        TinyColor.prototype.toHex = function (allow3Char) {
            if (allow3Char === void 0) { allow3Char = false; }
            return rgbToHex(this.r, this.g, this.b, allow3Char);
        };
        /**
         * Returns the hex value of the color -with a # prefixed.
         * @param allow3Char will shorten hex value to 3 char if possible
         */
        TinyColor.prototype.toHexString = function (allow3Char) {
            if (allow3Char === void 0) { allow3Char = false; }
            return '#' + this.toHex(allow3Char);
        };
        /**
         * Returns the hex 8 value of the color.
         * @param allow4Char will shorten hex value to 4 char if possible
         */
        TinyColor.prototype.toHex8 = function (allow4Char) {
            if (allow4Char === void 0) { allow4Char = false; }
            return rgbaToHex(this.r, this.g, this.b, this.a, allow4Char);
        };
        /**
         * Returns the hex 8 value of the color -with a # prefixed.
         * @param allow4Char will shorten hex value to 4 char if possible
         */
        TinyColor.prototype.toHex8String = function (allow4Char) {
            if (allow4Char === void 0) { allow4Char = false; }
            return '#' + this.toHex8(allow4Char);
        };
        /**
         * Returns the shorter hex value of the color depends on its alpha -with a # prefixed.
         * @param allowShortChar will shorten hex value to 3 or 4 char if possible
         */
        TinyColor.prototype.toHexShortString = function (allowShortChar) {
            if (allowShortChar === void 0) { allowShortChar = false; }
            return this.a === 1 ? this.toHexString(allowShortChar) : this.toHex8String(allowShortChar);
        };
        /**
         * Returns the object as a RGBA object.
         */
        TinyColor.prototype.toRgb = function () {
            return {
                r: Math.round(this.r),
                g: Math.round(this.g),
                b: Math.round(this.b),
                a: this.a,
            };
        };
        /**
         * Returns the RGBA values interpolated into a string with the following format:
         * "RGBA(xxx, xxx, xxx, xx)".
         */
        TinyColor.prototype.toRgbString = function () {
            var r = Math.round(this.r);
            var g = Math.round(this.g);
            var b = Math.round(this.b);
            return this.a === 1 ? "rgb(".concat(r, ", ").concat(g, ", ").concat(b, ")") : "rgba(".concat(r, ", ").concat(g, ", ").concat(b, ", ").concat(this.roundA, ")");
        };
        /**
         * Returns the object as a RGBA object.
         */
        TinyColor.prototype.toPercentageRgb = function () {
            var fmt = function (x) { return "".concat(Math.round(bound01(x, 255) * 100), "%"); };
            return {
                r: fmt(this.r),
                g: fmt(this.g),
                b: fmt(this.b),
                a: this.a,
            };
        };
        /**
         * Returns the RGBA relative values interpolated into a string
         */
        TinyColor.prototype.toPercentageRgbString = function () {
            var rnd = function (x) { return Math.round(bound01(x, 255) * 100); };
            return this.a === 1
                ? "rgb(".concat(rnd(this.r), "%, ").concat(rnd(this.g), "%, ").concat(rnd(this.b), "%)")
                : "rgba(".concat(rnd(this.r), "%, ").concat(rnd(this.g), "%, ").concat(rnd(this.b), "%, ").concat(this.roundA, ")");
        };
        /**
         * The 'real' name of the color -if there is one.
         */
        TinyColor.prototype.toName = function () {
            if (this.a === 0) {
                return 'transparent';
            }
            if (this.a < 1) {
                return false;
            }
            var hex = '#' + rgbToHex(this.r, this.g, this.b, false);
            for (var _i = 0, _a = Object.entries(names); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                if (hex === value) {
                    return key;
                }
            }
            return false;
        };
        TinyColor.prototype.toString = function (format) {
            var formatSet = Boolean(format);
            format = format !== null && format !== void 0 ? format : this.format;
            var formattedString = false;
            var hasAlpha = this.a < 1 && this.a >= 0;
            var needsAlphaFormat = !formatSet && hasAlpha && (format.startsWith('hex') || format === 'name');
            if (needsAlphaFormat) {
                // Special case for "transparent", all other non-alpha formats
                // will return rgba when there is transparency.
                if (format === 'name' && this.a === 0) {
                    return this.toName();
                }
                return this.toRgbString();
            }
            if (format === 'rgb') {
                formattedString = this.toRgbString();
            }
            if (format === 'prgb') {
                formattedString = this.toPercentageRgbString();
            }
            if (format === 'hex' || format === 'hex6') {
                formattedString = this.toHexString();
            }
            if (format === 'hex3') {
                formattedString = this.toHexString(true);
            }
            if (format === 'hex4') {
                formattedString = this.toHex8String(true);
            }
            if (format === 'hex8') {
                formattedString = this.toHex8String();
            }
            if (format === 'name') {
                formattedString = this.toName();
            }
            if (format === 'hsl') {
                formattedString = this.toHslString();
            }
            if (format === 'hsv') {
                formattedString = this.toHsvString();
            }
            return formattedString || this.toHexString();
        };
        TinyColor.prototype.toNumber = function () {
            return (Math.round(this.r) << 16) + (Math.round(this.g) << 8) + Math.round(this.b);
        };
        TinyColor.prototype.clone = function () {
            return new TinyColor(this.toString());
        };
        /**
         * Lighten the color a given amount. Providing 100 will always return white.
         * @param amount - valid between 1-100
         */
        TinyColor.prototype.lighten = function (amount) {
            if (amount === void 0) { amount = 10; }
            var hsl = this.toHsl();
            hsl.l += amount / 100;
            hsl.l = clamp01(hsl.l);
            return new TinyColor(hsl);
        };
        /**
         * Brighten the color a given amount, from 0 to 100.
         * @param amount - valid between 1-100
         */
        TinyColor.prototype.brighten = function (amount) {
            if (amount === void 0) { amount = 10; }
            var rgb = this.toRgb();
            rgb.r = Math.max(0, Math.min(255, rgb.r - Math.round(255 * -(amount / 100))));
            rgb.g = Math.max(0, Math.min(255, rgb.g - Math.round(255 * -(amount / 100))));
            rgb.b = Math.max(0, Math.min(255, rgb.b - Math.round(255 * -(amount / 100))));
            return new TinyColor(rgb);
        };
        /**
         * Darken the color a given amount, from 0 to 100.
         * Providing 100 will always return black.
         * @param amount - valid between 1-100
         */
        TinyColor.prototype.darken = function (amount) {
            if (amount === void 0) { amount = 10; }
            var hsl = this.toHsl();
            hsl.l -= amount / 100;
            hsl.l = clamp01(hsl.l);
            return new TinyColor(hsl);
        };
        /**
         * Mix the color with pure white, from 0 to 100.
         * Providing 0 will do nothing, providing 100 will always return white.
         * @param amount - valid between 1-100
         */
        TinyColor.prototype.tint = function (amount) {
            if (amount === void 0) { amount = 10; }
            return this.mix('white', amount);
        };
        /**
         * Mix the color with pure black, from 0 to 100.
         * Providing 0 will do nothing, providing 100 will always return black.
         * @param amount - valid between 1-100
         */
        TinyColor.prototype.shade = function (amount) {
            if (amount === void 0) { amount = 10; }
            return this.mix('black', amount);
        };
        /**
         * Desaturate the color a given amount, from 0 to 100.
         * Providing 100 will is the same as calling greyscale
         * @param amount - valid between 1-100
         */
        TinyColor.prototype.desaturate = function (amount) {
            if (amount === void 0) { amount = 10; }
            var hsl = this.toHsl();
            hsl.s -= amount / 100;
            hsl.s = clamp01(hsl.s);
            return new TinyColor(hsl);
        };
        /**
         * Saturate the color a given amount, from 0 to 100.
         * @param amount - valid between 1-100
         */
        TinyColor.prototype.saturate = function (amount) {
            if (amount === void 0) { amount = 10; }
            var hsl = this.toHsl();
            hsl.s += amount / 100;
            hsl.s = clamp01(hsl.s);
            return new TinyColor(hsl);
        };
        /**
         * Completely desaturates a color into greyscale.
         * Same as calling `desaturate(100)`
         */
        TinyColor.prototype.greyscale = function () {
            return this.desaturate(100);
        };
        /**
         * Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
         * Values outside of this range will be wrapped into this range.
         */
        TinyColor.prototype.spin = function (amount) {
            var hsl = this.toHsl();
            var hue = (hsl.h + amount) % 360;
            hsl.h = hue < 0 ? 360 + hue : hue;
            return new TinyColor(hsl);
        };
        /**
         * Mix the current color a given amount with another color, from 0 to 100.
         * 0 means no mixing (return current color).
         */
        TinyColor.prototype.mix = function (color, amount) {
            if (amount === void 0) { amount = 50; }
            var rgb1 = this.toRgb();
            var rgb2 = new TinyColor(color).toRgb();
            var p = amount / 100;
            var rgba = {
                r: (rgb2.r - rgb1.r) * p + rgb1.r,
                g: (rgb2.g - rgb1.g) * p + rgb1.g,
                b: (rgb2.b - rgb1.b) * p + rgb1.b,
                a: (rgb2.a - rgb1.a) * p + rgb1.a,
            };
            return new TinyColor(rgba);
        };
        TinyColor.prototype.analogous = function (results, slices) {
            if (results === void 0) { results = 6; }
            if (slices === void 0) { slices = 30; }
            var hsl = this.toHsl();
            var part = 360 / slices;
            var ret = [this];
            for (hsl.h = (hsl.h - ((part * results) >> 1) + 720) % 360; --results;) {
                hsl.h = (hsl.h + part) % 360;
                ret.push(new TinyColor(hsl));
            }
            return ret;
        };
        /**
         * taken from https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js
         */
        TinyColor.prototype.complement = function () {
            var hsl = this.toHsl();
            hsl.h = (hsl.h + 180) % 360;
            return new TinyColor(hsl);
        };
        TinyColor.prototype.monochromatic = function (results) {
            if (results === void 0) { results = 6; }
            var hsv = this.toHsv();
            var h = hsv.h;
            var s = hsv.s;
            var v = hsv.v;
            var res = [];
            var modification = 1 / results;
            while (results--) {
                res.push(new TinyColor({ h: h, s: s, v: v }));
                v = (v + modification) % 1;
            }
            return res;
        };
        TinyColor.prototype.splitcomplement = function () {
            var hsl = this.toHsl();
            var h = hsl.h;
            return [
                this,
                new TinyColor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l }),
                new TinyColor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l }),
            ];
        };
        /**
         * Compute how the color would appear on a background
         */
        TinyColor.prototype.onBackground = function (background) {
            var fg = this.toRgb();
            var bg = new TinyColor(background).toRgb();
            var alpha = fg.a + bg.a * (1 - fg.a);
            return new TinyColor({
                r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / alpha,
                g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / alpha,
                b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / alpha,
                a: alpha,
            });
        };
        /**
         * Alias for `polyad(3)`
         */
        TinyColor.prototype.triad = function () {
            return this.polyad(3);
        };
        /**
         * Alias for `polyad(4)`
         */
        TinyColor.prototype.tetrad = function () {
            return this.polyad(4);
        };
        /**
         * Get polyad colors, like (for 1, 2, 3, 4, 5, 6, 7, 8, etc...)
         * monad, dyad, triad, tetrad, pentad, hexad, heptad, octad, etc...
         */
        TinyColor.prototype.polyad = function (n) {
            var hsl = this.toHsl();
            var h = hsl.h;
            var result = [this];
            var increment = 360 / n;
            for (var i = 1; i < n; i++) {
                result.push(new TinyColor({ h: (h + i * increment) % 360, s: hsl.s, l: hsl.l }));
            }
            return result;
        };
        /**
         * compare color vs current color
         */
        TinyColor.prototype.equals = function (color) {
            return this.toRgbString() === new TinyColor(color).toRgbString();
        };
        return TinyColor;
    }());

    function clamp(min, max, x) {
        if (x < min) {
            return min;
        }
        else if (x > max) {
            return max;
        }
        else {
            return x;
        }
    }
    let isMac;
    function checkModifiers(e, options = {}) {
        if (isMac === undefined) {
            isMac = navigator.userAgent.indexOf('Mac') != -1;
        }
        const target = {
            shift: options.shift || false,
            alt: options.alt || false,
            ctrl: (!isMac && options.cmdOrCtrl) || false,
            meta: (isMac && options.cmdOrCtrl) || false,
        };
        const pressed = {
            shift: !!e.shiftKey,
            alt: !!e.altKey,
            ctrl: !!e.ctrlKey,
            meta: !!e.metaKey,
        };
        return (pressed.shift === target.shift &&
            pressed.alt === target.alt &&
            pressed.ctrl === target.ctrl &&
            pressed.meta === target.meta);
    }
    function checkShortcut(e, key, options = {}) {
        if (e.key.toUpperCase() !== key.toUpperCase())
            return false;
        return checkModifiers(e, options);
    }

    class Color {
        h;
        s;
        v;
        a;
        constructor(value) {
            if (typeof value === 'string') {
                const hsv = new TinyColor(value).toHsv();
                this.h = hsv.h;
                this.s = hsv.s;
                this.v = hsv.v;
                this.a = hsv.a;
            }
            else {
                this.h = clamp(0, 360, value.h);
                this.s = clamp(0, 1, value.s);
                this.v = clamp(0, 1, value.v);
                this.a = clamp(0, 1, value.a);
            }
        }
        toHexString() {
            return new TinyColor({ h: this.h, s: this.s, v: this.v }).toHexString();
        }
        toHex8String() {
            return new TinyColor({ h: this.h, s: this.s, v: this.v, a: this.a }).toHex8String();
        }
    }

    /* node_modules\color-picker-svelte\ColorArea.svelte generated by Svelte v3.57.0 */
    const file$5 = "node_modules\\color-picker-svelte\\ColorArea.svelte";

    function create_fragment$7(ctx) {
    	let div1;
    	let div0;
    	let div1_resize_listener;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "handle svelte-9yiigw");
    			set_style(div0, "top", (1 - /*color*/ ctx[0].v) * 100 + '%');
    			set_style(div0, "left", /*color*/ ctx[0].s * 100 + '%');
    			set_style(div0, "background-color", /*color*/ ctx[0].toHexString());
    			add_location(div0, file$5, 68, 2, 1379);
    			attr_dev(div1, "class", "color-area svelte-9yiigw");
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[12].call(div1));
    			set_style(div1, "--hue-color", `hsl(${Math.round(/*hue*/ ctx[2])},100%,50%)`);
    			add_location(div1, file$5, 60, 0, 1180);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			/*div1_binding*/ ctx[11](div1);
    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[12].bind(div1));

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "mousemove", /*onMouse*/ ctx[4], false, false, false, false),
    					listen_dev(window, "mouseup", /*mouseUp*/ ctx[6], false, false, false, false),
    					listen_dev(window, "touchmove", /*onTouch*/ ctx[7], false, false, false, false),
    					listen_dev(window, "touchend", /*touchEnd*/ ctx[9], false, false, false, false),
    					listen_dev(div1, "mousedown", /*mouseDown*/ ctx[5], false, false, false, false),
    					listen_dev(div1, "touchstart", prevent_default(/*touchStart*/ ctx[8]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 1) {
    				set_style(div0, "top", (1 - /*color*/ ctx[0].v) * 100 + '%');
    			}

    			if (dirty & /*color*/ 1) {
    				set_style(div0, "left", /*color*/ ctx[0].s * 100 + '%');
    			}

    			if (dirty & /*color*/ 1) {
    				set_style(div0, "background-color", /*color*/ ctx[0].toHexString());
    			}

    			if (dirty & /*hue*/ 4) {
    				set_style(div1, "--hue-color", `hsl(${Math.round(/*hue*/ ctx[2])},100%,50%)`);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*div1_binding*/ ctx[11](null);
    			div1_resize_listener();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ColorArea', slots, []);
    	let { color } = $$props;
    	let { clientHeight = 0 } = $$props;

    	let { onInput = () => {
    		
    	} } = $$props;

    	let hue = color.h;
    	let parent;

    	function pickPos(clientX, clientY) {
    		const rect = parent.getBoundingClientRect();
    		const x = clientX - rect.left;
    		const y = clientY - rect.top;

    		$$invalidate(0, color = new Color({
    				h: hue,
    				s: x / rect.width,
    				v: 1 - y / rect.height,
    				a: color.a
    			}));

    		onInput(color);
    	}

    	function onMouse(e) {
    		if (mouseHold && e.target instanceof HTMLElement) {
    			pickPos(e.clientX, e.clientY);
    		}
    	}

    	let mouseHold = false;

    	function mouseDown(e) {
    		if (e.buttons === 1) {
    			mouseHold = true;
    			pickPos(e.clientX, e.clientY);
    		}
    	}

    	function mouseUp() {
    		mouseHold = false;
    	}

    	let touching = false;

    	function onTouch(e) {
    		if (touching) {
    			pickPos(e.touches[0].clientX, e.touches[0].clientY);
    		}
    	}

    	function touchStart(e) {
    		if (e.touches.length === 1) {
    			touching = true;
    			pickPos(e.touches[0].clientX, e.touches[0].clientY);
    		}
    	}

    	function touchEnd() {
    		touching = false;
    	}

    	$$self.$$.on_mount.push(function () {
    		if (color === undefined && !('color' in $$props || $$self.$$.bound[$$self.$$.props['color']])) {
    			console.warn("<ColorArea> was created without expected prop 'color'");
    		}
    	});

    	const writable_props = ['color', 'clientHeight', 'onInput'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ColorArea> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			parent = $$value;
    			$$invalidate(3, parent);
    		});
    	}

    	function div1_elementresize_handler() {
    		clientHeight = this.clientHeight;
    		$$invalidate(1, clientHeight);
    	}

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('clientHeight' in $$props) $$invalidate(1, clientHeight = $$props.clientHeight);
    		if ('onInput' in $$props) $$invalidate(10, onInput = $$props.onInput);
    	};

    	$$self.$capture_state = () => ({
    		Color,
    		color,
    		clientHeight,
    		onInput,
    		hue,
    		parent,
    		pickPos,
    		onMouse,
    		mouseHold,
    		mouseDown,
    		mouseUp,
    		touching,
    		onTouch,
    		touchStart,
    		touchEnd
    	});

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('clientHeight' in $$props) $$invalidate(1, clientHeight = $$props.clientHeight);
    		if ('onInput' in $$props) $$invalidate(10, onInput = $$props.onInput);
    		if ('hue' in $$props) $$invalidate(2, hue = $$props.hue);
    		if ('parent' in $$props) $$invalidate(3, parent = $$props.parent);
    		if ('mouseHold' in $$props) mouseHold = $$props.mouseHold;
    		if ('touching' in $$props) touching = $$props.touching;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 1) {
    			$$invalidate(2, hue = color.h);
    		}
    	};

    	return [
    		color,
    		clientHeight,
    		hue,
    		parent,
    		onMouse,
    		mouseDown,
    		mouseUp,
    		onTouch,
    		touchStart,
    		touchEnd,
    		onInput,
    		div1_binding,
    		div1_elementresize_handler
    	];
    }

    class ColorArea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { color: 0, clientHeight: 1, onInput: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorArea",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get color() {
    		throw new Error("<ColorArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ColorArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clientHeight() {
    		throw new Error("<ColorArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clientHeight(value) {
    		throw new Error("<ColorArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onInput() {
    		throw new Error("<ColorArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onInput(value) {
    		throw new Error("<ColorArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\color-picker-svelte\Slider.svelte generated by Svelte v3.57.0 */
    const file$4 = "node_modules\\color-picker-svelte\\Slider.svelte";

    function create_fragment$6(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let t;
    	let div2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "slider-track-overlay svelte-1pjwcgx");
    			add_location(div0, file$4, 65, 4, 1317);
    			attr_dev(div1, "class", "slider-track svelte-1pjwcgx");
    			add_location(div1, file$4, 64, 2, 1286);
    			attr_dev(div2, "class", "slider-handle svelte-1pjwcgx");
    			set_style(div2, "top", /*value*/ ctx[0] / /*max*/ ctx[1] * 100 + '%');
    			set_style(div2, "background-color", /*handleColor*/ ctx[3]);
    			add_location(div2, file$4, 67, 2, 1365);
    			attr_dev(div3, "class", "slider svelte-1pjwcgx");
    			set_style(div3, "--color", /*color*/ ctx[2].toHexString());
    			toggle_class(div3, "hue", /*style*/ ctx[4] === 'hue');
    			toggle_class(div3, "alpha", /*style*/ ctx[4] === 'alpha');
    			add_location(div3, file$4, 55, 0, 1063);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div3, t);
    			append_dev(div3, div2);
    			/*div3_binding*/ ctx[13](div3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "mousemove", /*onMouse*/ ctx[6], false, false, false, false),
    					listen_dev(window, "mouseup", /*mouseUp*/ ctx[8], false, false, false, false),
    					listen_dev(window, "touchmove", /*onTouch*/ ctx[9], false, false, false, false),
    					listen_dev(window, "touchend", /*touchEnd*/ ctx[11], false, false, false, false),
    					listen_dev(div3, "mousedown", /*mouseDown*/ ctx[7], false, false, false, false),
    					listen_dev(div3, "touchstart", prevent_default(/*touchStart*/ ctx[10]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value, max*/ 3) {
    				set_style(div2, "top", /*value*/ ctx[0] / /*max*/ ctx[1] * 100 + '%');
    			}

    			if (dirty & /*handleColor*/ 8) {
    				set_style(div2, "background-color", /*handleColor*/ ctx[3]);
    			}

    			if (dirty & /*color*/ 4) {
    				set_style(div3, "--color", /*color*/ ctx[2].toHexString());
    			}

    			if (dirty & /*style*/ 16) {
    				toggle_class(div3, "hue", /*style*/ ctx[4] === 'hue');
    			}

    			if (dirty & /*style*/ 16) {
    				toggle_class(div3, "alpha", /*style*/ ctx[4] === 'alpha');
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*div3_binding*/ ctx[13](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Slider', slots, []);
    	let { value } = $$props;
    	let { max } = $$props;
    	let { color } = $$props;
    	let { handleColor = void 0 } = $$props;
    	let { style } = $$props;

    	let { onInput = () => {
    		
    	} } = $$props;

    	let parent;

    	function pickPos(clientY) {
    		const rect = parent.getBoundingClientRect();
    		const y = clientY - rect.top;
    		const percentage = y / rect.height;
    		$$invalidate(0, value = clamp(0, max, percentage * max));
    		onInput(value);
    	}

    	function onMouse(e) {
    		if (mouseHold && e.target instanceof HTMLElement) {
    			pickPos(e.clientY);
    		}
    	}

    	let mouseHold = false;

    	function mouseDown(e) {
    		if (e.buttons === 1) {
    			mouseHold = true;
    			pickPos(e.clientY);
    		}
    	}

    	function mouseUp() {
    		mouseHold = false;
    	}

    	let touching = false;

    	function onTouch(e) {
    		if (touching) {
    			pickPos(e.touches[0].clientY);
    		}
    	}

    	function touchStart(e) {
    		if (e.touches.length === 1) {
    			touching = true;
    			pickPos(e.touches[0].clientY);
    		}
    	}

    	function touchEnd() {
    		touching = false;
    	}

    	$$self.$$.on_mount.push(function () {
    		if (value === undefined && !('value' in $$props || $$self.$$.bound[$$self.$$.props['value']])) {
    			console.warn("<Slider> was created without expected prop 'value'");
    		}

    		if (max === undefined && !('max' in $$props || $$self.$$.bound[$$self.$$.props['max']])) {
    			console.warn("<Slider> was created without expected prop 'max'");
    		}

    		if (color === undefined && !('color' in $$props || $$self.$$.bound[$$self.$$.props['color']])) {
    			console.warn("<Slider> was created without expected prop 'color'");
    		}

    		if (style === undefined && !('style' in $$props || $$self.$$.bound[$$self.$$.props['style']])) {
    			console.warn("<Slider> was created without expected prop 'style'");
    		}
    	});

    	const writable_props = ['value', 'max', 'color', 'handleColor', 'style', 'onInput'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			parent = $$value;
    			$$invalidate(5, parent);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('max' in $$props) $$invalidate(1, max = $$props.max);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('handleColor' in $$props) $$invalidate(3, handleColor = $$props.handleColor);
    		if ('style' in $$props) $$invalidate(4, style = $$props.style);
    		if ('onInput' in $$props) $$invalidate(12, onInput = $$props.onInput);
    	};

    	$$self.$capture_state = () => ({
    		clamp,
    		value,
    		max,
    		color,
    		handleColor,
    		style,
    		onInput,
    		parent,
    		pickPos,
    		onMouse,
    		mouseHold,
    		mouseDown,
    		mouseUp,
    		touching,
    		onTouch,
    		touchStart,
    		touchEnd
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('max' in $$props) $$invalidate(1, max = $$props.max);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('handleColor' in $$props) $$invalidate(3, handleColor = $$props.handleColor);
    		if ('style' in $$props) $$invalidate(4, style = $$props.style);
    		if ('onInput' in $$props) $$invalidate(12, onInput = $$props.onInput);
    		if ('parent' in $$props) $$invalidate(5, parent = $$props.parent);
    		if ('mouseHold' in $$props) mouseHold = $$props.mouseHold;
    		if ('touching' in $$props) touching = $$props.touching;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		max,
    		color,
    		handleColor,
    		style,
    		parent,
    		onMouse,
    		mouseDown,
    		mouseUp,
    		onTouch,
    		touchStart,
    		touchEnd,
    		onInput,
    		div3_binding
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			value: 0,
    			max: 1,
    			color: 2,
    			handleColor: 3,
    			style: 4,
    			onInput: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get value() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleColor() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleColor(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onInput() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onInput(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\color-picker-svelte\HueSlider.svelte generated by Svelte v3.57.0 */

    function create_fragment$5(ctx) {
    	let slider;
    	let updating_value;
    	let current;

    	function slider_value_binding(value) {
    		/*slider_value_binding*/ ctx[2](value);
    	}

    	let slider_props = {
    		color: /*color*/ ctx[0],
    		max: 360,
    		handleColor: "hsl(" + /*color*/ ctx[0].h + ",100%,50%)",
    		style: "hue",
    		onInput: /*onInput*/ ctx[1]
    	};

    	if (/*color*/ ctx[0].h !== void 0) {
    		slider_props.value = /*color*/ ctx[0].h;
    	}

    	slider = new Slider({ props: slider_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider, 'value', slider_value_binding));

    	const block = {
    		c: function create() {
    			create_component(slider.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(slider, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const slider_changes = {};
    			if (dirty & /*color*/ 1) slider_changes.color = /*color*/ ctx[0];
    			if (dirty & /*color*/ 1) slider_changes.handleColor = "hsl(" + /*color*/ ctx[0].h + ",100%,50%)";
    			if (dirty & /*onInput*/ 2) slider_changes.onInput = /*onInput*/ ctx[1];

    			if (!updating_value && dirty & /*color*/ 1) {
    				updating_value = true;
    				slider_changes.value = /*color*/ ctx[0].h;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider.$set(slider_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(slider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HueSlider', slots, []);
    	let { color } = $$props;

    	let { onInput = () => {
    		
    	} } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (color === undefined && !('color' in $$props || $$self.$$.bound[$$self.$$.props['color']])) {
    			console.warn("<HueSlider> was created without expected prop 'color'");
    		}
    	});

    	const writable_props = ['color', 'onInput'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HueSlider> was created with unknown prop '${key}'`);
    	});

    	function slider_value_binding(value) {
    		if ($$self.$$.not_equal(color.h, value)) {
    			color.h = value;
    			$$invalidate(0, color);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('onInput' in $$props) $$invalidate(1, onInput = $$props.onInput);
    	};

    	$$self.$capture_state = () => ({ Slider, color, onInput });

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('onInput' in $$props) $$invalidate(1, onInput = $$props.onInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, onInput, slider_value_binding];
    }

    class HueSlider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { color: 0, onInput: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HueSlider",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get color() {
    		throw new Error("<HueSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<HueSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onInput() {
    		throw new Error("<HueSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onInput(value) {
    		throw new Error("<HueSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\color-picker-svelte\AlphaSlider.svelte generated by Svelte v3.57.0 */

    function create_fragment$4(ctx) {
    	let slider;
    	let updating_value;
    	let current;

    	function slider_value_binding(value) {
    		/*slider_value_binding*/ ctx[2](value);
    	}

    	let slider_props = {
    		color: /*color*/ ctx[0],
    		max: 1,
    		handleColor: "hsla(" + /*color*/ ctx[0].h + "," + /*color*/ ctx[0].s * 100 + "%," + /*color*/ ctx[0].v * 100 + "%," + /*color*/ ctx[0].a + ")",
    		style: "alpha",
    		onInput: /*onInput*/ ctx[1]
    	};

    	if (/*color*/ ctx[0].a !== void 0) {
    		slider_props.value = /*color*/ ctx[0].a;
    	}

    	slider = new Slider({ props: slider_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider, 'value', slider_value_binding));

    	const block = {
    		c: function create() {
    			create_component(slider.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(slider, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const slider_changes = {};
    			if (dirty & /*color*/ 1) slider_changes.color = /*color*/ ctx[0];
    			if (dirty & /*color*/ 1) slider_changes.handleColor = "hsla(" + /*color*/ ctx[0].h + "," + /*color*/ ctx[0].s * 100 + "%," + /*color*/ ctx[0].v * 100 + "%," + /*color*/ ctx[0].a + ")";
    			if (dirty & /*onInput*/ 2) slider_changes.onInput = /*onInput*/ ctx[1];

    			if (!updating_value && dirty & /*color*/ 1) {
    				updating_value = true;
    				slider_changes.value = /*color*/ ctx[0].a;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider.$set(slider_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(slider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AlphaSlider', slots, []);
    	let { color } = $$props;

    	let { onInput = () => {
    		
    	} } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (color === undefined && !('color' in $$props || $$self.$$.bound[$$self.$$.props['color']])) {
    			console.warn("<AlphaSlider> was created without expected prop 'color'");
    		}
    	});

    	const writable_props = ['color', 'onInput'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AlphaSlider> was created with unknown prop '${key}'`);
    	});

    	function slider_value_binding(value) {
    		if ($$self.$$.not_equal(color.a, value)) {
    			color.a = value;
    			$$invalidate(0, color);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('onInput' in $$props) $$invalidate(1, onInput = $$props.onInput);
    	};

    	$$self.$capture_state = () => ({ Slider, color, onInput });

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('onInput' in $$props) $$invalidate(1, onInput = $$props.onInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, onInput, slider_value_binding];
    }

    class AlphaSlider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { color: 0, onInput: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AlphaSlider",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get color() {
    		throw new Error("<AlphaSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<AlphaSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onInput() {
    		throw new Error("<AlphaSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onInput(value) {
    		throw new Error("<AlphaSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\color-picker-svelte\ColorPicker.svelte generated by Svelte v3.57.0 */
    const file$3 = "node_modules\\color-picker-svelte\\ColorPicker.svelte";

    // (16:2) {#if showAlphaSlider}
    function create_if_block(ctx) {
    	let alphaslider;
    	let updating_color;
    	let current;

    	function alphaslider_color_binding(value) {
    		/*alphaslider_color_binding*/ ctx[7](value);
    	}

    	let alphaslider_props = { onInput: /*onInput*/ ctx[3] };

    	if (/*color*/ ctx[0] !== void 0) {
    		alphaslider_props.color = /*color*/ ctx[0];
    	}

    	alphaslider = new AlphaSlider({ props: alphaslider_props, $$inline: true });
    	binding_callbacks.push(() => bind(alphaslider, 'color', alphaslider_color_binding));

    	const block = {
    		c: function create() {
    			create_component(alphaslider.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(alphaslider, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const alphaslider_changes = {};
    			if (dirty & /*onInput*/ 8) alphaslider_changes.onInput = /*onInput*/ ctx[3];

    			if (!updating_color && dirty & /*color*/ 1) {
    				updating_color = true;
    				alphaslider_changes.color = /*color*/ ctx[0];
    				add_flush_callback(() => updating_color = false);
    			}

    			alphaslider.$set(alphaslider_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(alphaslider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(alphaslider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(alphaslider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(16:2) {#if showAlphaSlider}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let colorarea;
    	let updating_color;
    	let t0;
    	let hueslider;
    	let updating_color_1;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;

    	function colorarea_color_binding(value) {
    		/*colorarea_color_binding*/ ctx[5](value);
    	}

    	let colorarea_props = { onInput: /*onInput*/ ctx[3] };

    	if (/*color*/ ctx[0] !== void 0) {
    		colorarea_props.color = /*color*/ ctx[0];
    	}

    	colorarea = new ColorArea({ props: colorarea_props, $$inline: true });
    	binding_callbacks.push(() => bind(colorarea, 'color', colorarea_color_binding));

    	function hueslider_color_binding(value) {
    		/*hueslider_color_binding*/ ctx[6](value);
    	}

    	let hueslider_props = { onInput: /*onInput*/ ctx[3] };

    	if (/*color*/ ctx[0] !== void 0) {
    		hueslider_props.color = /*color*/ ctx[0];
    	}

    	hueslider = new HueSlider({ props: hueslider_props, $$inline: true });
    	binding_callbacks.push(() => bind(hueslider, 'color', hueslider_color_binding));
    	let if_block = /*showAlphaSlider*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(colorarea.$$.fragment);
    			t0 = space();
    			create_component(hueslider.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "color-picker svelte-iwvr3r");
    			toggle_class(div, "hidden", !/*isOpen*/ ctx[1]);
    			add_location(div, file$3, 12, 0, 291);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(colorarea, div, null);
    			append_dev(div, t0);
    			mount_component(hueslider, div, null);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "touchstart", prevent_default(/*touchstart_handler*/ ctx[4]), false, true, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const colorarea_changes = {};
    			if (dirty & /*onInput*/ 8) colorarea_changes.onInput = /*onInput*/ ctx[3];

    			if (!updating_color && dirty & /*color*/ 1) {
    				updating_color = true;
    				colorarea_changes.color = /*color*/ ctx[0];
    				add_flush_callback(() => updating_color = false);
    			}

    			colorarea.$set(colorarea_changes);
    			const hueslider_changes = {};
    			if (dirty & /*onInput*/ 8) hueslider_changes.onInput = /*onInput*/ ctx[3];

    			if (!updating_color_1 && dirty & /*color*/ 1) {
    				updating_color_1 = true;
    				hueslider_changes.color = /*color*/ ctx[0];
    				add_flush_callback(() => updating_color_1 = false);
    			}

    			hueslider.$set(hueslider_changes);

    			if (/*showAlphaSlider*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showAlphaSlider*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*isOpen*/ 2) {
    				toggle_class(div, "hidden", !/*isOpen*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(colorarea.$$.fragment, local);
    			transition_in(hueslider.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(colorarea.$$.fragment, local);
    			transition_out(hueslider.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(colorarea);
    			destroy_component(hueslider);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ColorPicker', slots, []);
    	let { color } = $$props;
    	let { isOpen = false } = $$props;
    	let { showAlphaSlider = false } = $$props;

    	let { onInput = () => {
    		
    	} } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (color === undefined && !('color' in $$props || $$self.$$.bound[$$self.$$.props['color']])) {
    			console.warn("<ColorPicker> was created without expected prop 'color'");
    		}
    	});

    	const writable_props = ['color', 'isOpen', 'showAlphaSlider', 'onInput'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ColorPicker> was created with unknown prop '${key}'`);
    	});

    	function touchstart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function colorarea_color_binding(value) {
    		color = value;
    		$$invalidate(0, color);
    	}

    	function hueslider_color_binding(value) {
    		color = value;
    		$$invalidate(0, color);
    	}

    	function alphaslider_color_binding(value) {
    		color = value;
    		$$invalidate(0, color);
    	}

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('isOpen' in $$props) $$invalidate(1, isOpen = $$props.isOpen);
    		if ('showAlphaSlider' in $$props) $$invalidate(2, showAlphaSlider = $$props.showAlphaSlider);
    		if ('onInput' in $$props) $$invalidate(3, onInput = $$props.onInput);
    	};

    	$$self.$capture_state = () => ({
    		ColorArea,
    		HueSlider,
    		AlphaSlider,
    		color,
    		isOpen,
    		showAlphaSlider,
    		onInput
    	});

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('isOpen' in $$props) $$invalidate(1, isOpen = $$props.isOpen);
    		if ('showAlphaSlider' in $$props) $$invalidate(2, showAlphaSlider = $$props.showAlphaSlider);
    		if ('onInput' in $$props) $$invalidate(3, onInput = $$props.onInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color, onInput*/ 9) {
    			(onInput());
    		}
    	};

    	return [
    		color,
    		isOpen,
    		showAlphaSlider,
    		onInput,
    		touchstart_handler,
    		colorarea_color_binding,
    		hueslider_color_binding,
    		alphaslider_color_binding
    	];
    }

    class ColorPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			color: 0,
    			isOpen: 1,
    			showAlphaSlider: 2,
    			onInput: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorPicker",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get color() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showAlphaSlider() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showAlphaSlider(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onInput() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onInput(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\color-picker-svelte\ColorInput.svelte generated by Svelte v3.57.0 */
    const file$2 = "node_modules\\color-picker-svelte\\ColorInput.svelte";
    const get_default_slot_changes = dirty => ({ isOpen: dirty & /*isOpen*/ 2 });
    const get_default_slot_context = ctx => ({ isOpen: /*isOpen*/ ctx[1] });

    // (93:17)      
    function fallback_block(ctx) {
    	let colorpicker;
    	let updating_color;
    	let current;

    	function colorpicker_color_binding(value) {
    		/*colorpicker_color_binding*/ ctx[19](value);
    	}

    	let colorpicker_props = {
    		onInput: /*onInput*/ ctx[5],
    		isOpen: /*isOpen*/ ctx[1],
    		showAlphaSlider: /*showAlphaSlider*/ ctx[3]
    	};

    	if (/*color*/ ctx[0] !== void 0) {
    		colorpicker_props.color = /*color*/ ctx[0];
    	}

    	colorpicker = new ColorPicker({ props: colorpicker_props, $$inline: true });
    	binding_callbacks.push(() => bind(colorpicker, 'color', colorpicker_color_binding));

    	const block = {
    		c: function create() {
    			create_component(colorpicker.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(colorpicker, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const colorpicker_changes = {};
    			if (dirty & /*onInput*/ 32) colorpicker_changes.onInput = /*onInput*/ ctx[5];
    			if (dirty & /*isOpen*/ 2) colorpicker_changes.isOpen = /*isOpen*/ ctx[1];
    			if (dirty & /*showAlphaSlider*/ 8) colorpicker_changes.showAlphaSlider = /*showAlphaSlider*/ ctx[3];

    			if (!updating_color && dirty & /*color*/ 1) {
    				updating_color = true;
    				colorpicker_changes.color = /*color*/ ctx[0];
    				add_flush_callback(() => updating_color = false);
    			}

    			colorpicker.$set(colorpicker_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(colorpicker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(colorpicker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(colorpicker, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(93:17)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let t0;
    	let div2;
    	let input;
    	let t1;
    	let span;
    	let t2;
    	let t3;
    	let div3_class_value;
    	let div3_tabindex_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], get_default_slot_context);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			input = element("input");
    			t1 = space();
    			span = element("span");
    			t2 = text(/*title*/ ctx[2]);
    			t3 = space();
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(div0, "class", "color-frame-color svelte-1dmyei5");
    			set_style(div0, "background-color", /*color*/ ctx[0].toHex8String());
    			add_location(div0, file$2, 78, 4, 1954);
    			attr_dev(div1, "class", "color-frame svelte-1dmyei5");
    			add_location(div1, file$2, 77, 2, 1924);
    			attr_dev(input, "type", "text");
    			input.disabled = /*disabled*/ ctx[4];
    			attr_dev(input, "class", "svelte-1dmyei5");
    			toggle_class(input, "show", /*isOpen*/ ctx[1]);
    			add_location(input, file$2, 81, 4, 2068);
    			attr_dev(span, "class", "title svelte-1dmyei5");
    			toggle_class(span, "show", !/*isOpen*/ ctx[1]);
    			add_location(span, file$2, 90, 4, 2258);
    			attr_dev(div2, "class", "text svelte-1dmyei5");
    			add_location(div2, file$2, 80, 2, 2045);
    			attr_dev(div3, "class", div3_class_value = "input " + /*classes*/ ctx[6] + " svelte-1dmyei5");
    			attr_dev(div3, "tabindex", div3_tabindex_value = /*disabled*/ ctx[4] ? null : -1);
    			attr_dev(div3, "role", "button");
    			attr_dev(div3, "aria-label", "Open color picker");
    			toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			add_location(div3, file$2, 66, 0, 1681);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, input);
    			/*input_binding*/ ctx[17](input);
    			set_input_value(input, /*text*/ ctx[7]);
    			append_dev(div2, t1);
    			append_dev(div2, span);
    			append_dev(span, t2);
    			append_dev(div3, t3);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div3, null);
    			}

    			/*div3_binding*/ ctx[20](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[18]),
    					listen_dev(input, "input", /*textInputHandler*/ ctx[10], false, false, false, false),
    					listen_dev(input, "focus", /*open*/ ctx[13], false, false, false, false),
    					listen_dev(div3, "mousedown", /*openAndPreventDefault*/ ctx[14], false, false, false, false),
    					listen_dev(div3, "keydown", /*keydown*/ ctx[12], false, false, false, false),
    					listen_dev(div3, "focusout", /*focusout*/ ctx[11], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 1) {
    				set_style(div0, "background-color", /*color*/ ctx[0].toHex8String());
    			}

    			if (!current || dirty & /*disabled*/ 16) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[4]);
    			}

    			if (dirty & /*text*/ 128 && input.value !== /*text*/ ctx[7]) {
    				set_input_value(input, /*text*/ ctx[7]);
    			}

    			if (!current || dirty & /*isOpen*/ 2) {
    				toggle_class(input, "show", /*isOpen*/ ctx[1]);
    			}

    			if (!current || dirty & /*title*/ 4) set_data_dev(t2, /*title*/ ctx[2]);

    			if (!current || dirty & /*isOpen*/ 2) {
    				toggle_class(span, "show", !/*isOpen*/ ctx[1]);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, isOpen*/ 32770)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*onInput, isOpen, showAlphaSlider, color*/ 43)) {
    					default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (!current || dirty & /*classes*/ 64 && div3_class_value !== (div3_class_value = "input " + /*classes*/ ctx[6] + " svelte-1dmyei5")) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*disabled*/ 16 && div3_tabindex_value !== (div3_tabindex_value = /*disabled*/ ctx[4] ? null : -1)) {
    				attr_dev(div3, "tabindex", div3_tabindex_value);
    			}

    			if (!current || dirty & /*classes, disabled*/ 80) {
    				toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*input_binding*/ ctx[17](null);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			/*div3_binding*/ ctx[20](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ColorInput', slots, ['default']);
    	let { color } = $$props;
    	let { title = "Color" } = $$props;
    	let { isOpen = false } = $$props;
    	let { showAlphaSlider = false } = $$props;
    	let { disabled = false } = $$props;

    	let { onInput = () => {
    		
    	} } = $$props;

    	let { class: classes = "" } = $$props;

    	function update(color2) {
    		if (color2.h !== lastColor.h || color2.s !== lastColor.s || color2.v !== lastColor.v || color2.a !== lastColor.a) {
    			$$invalidate(7, text = color2.a === 1
    			? color2.toHexString()
    			: color2.toHex8String());

    			lastColor = new Color(color2);
    		}
    	}

    	let text = color.a === 1
    	? color.toHexString()
    	: color.toHex8String();

    	let lastColor = new Color(color);

    	function textInputHandler() {
    		const tinyColor = new TinyColor(text);

    		if (tinyColor.isValid) {
    			$$invalidate(0, color = new Color(tinyColor.toHsv()));
    			lastColor = color;
    		}

    		onInput();
    	}

    	let parent;

    	function focusout(e) {
    		if (e.relatedTarget === null) {
    			$$invalidate(1, isOpen = false);
    		} else if (e.relatedTarget instanceof HTMLElement) {
    			const stayingInParent = parent.contains(e.relatedTarget);

    			if (!stayingInParent) {
    				$$invalidate(1, isOpen = false);
    			}
    		}
    	}

    	function keydown(e) {
    		if (checkShortcut(e, "Escape")) {
    			$$invalidate(1, isOpen = false);
    		} else if (checkShortcut(e, "Enter")) {
    			open();
    		}
    	}

    	let inputElement;

    	function open() {
    		if (!isOpen && !disabled) {
    			$$invalidate(1, isOpen = true);
    			inputElement.focus();
    			inputElement.select();
    			return true;
    		}
    	}

    	function openAndPreventDefault(e) {
    		if (open()) {
    			e.preventDefault();
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (color === undefined && !('color' in $$props || $$self.$$.bound[$$self.$$.props['color']])) {
    			console.warn("<ColorInput> was created without expected prop 'color'");
    		}
    	});

    	const writable_props = ['color', 'title', 'isOpen', 'showAlphaSlider', 'disabled', 'onInput', 'class'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ColorInput> was created with unknown prop '${key}'`);
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputElement = $$value;
    			$$invalidate(9, inputElement);
    		});
    	}

    	function input_input_handler() {
    		text = this.value;
    		$$invalidate(7, text);
    	}

    	function colorpicker_color_binding(value) {
    		color = value;
    		$$invalidate(0, color);
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			parent = $$value;
    			$$invalidate(8, parent);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    		if ('isOpen' in $$props) $$invalidate(1, isOpen = $$props.isOpen);
    		if ('showAlphaSlider' in $$props) $$invalidate(3, showAlphaSlider = $$props.showAlphaSlider);
    		if ('disabled' in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ('onInput' in $$props) $$invalidate(5, onInput = $$props.onInput);
    		if ('class' in $$props) $$invalidate(6, classes = $$props.class);
    		if ('$$scope' in $$props) $$invalidate(15, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TinyColor,
    		Color,
    		ColorPicker,
    		checkShortcut,
    		color,
    		title,
    		isOpen,
    		showAlphaSlider,
    		disabled,
    		onInput,
    		classes,
    		update,
    		text,
    		lastColor,
    		textInputHandler,
    		parent,
    		focusout,
    		keydown,
    		inputElement,
    		open,
    		openAndPreventDefault
    	});

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    		if ('isOpen' in $$props) $$invalidate(1, isOpen = $$props.isOpen);
    		if ('showAlphaSlider' in $$props) $$invalidate(3, showAlphaSlider = $$props.showAlphaSlider);
    		if ('disabled' in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ('onInput' in $$props) $$invalidate(5, onInput = $$props.onInput);
    		if ('classes' in $$props) $$invalidate(6, classes = $$props.classes);
    		if ('text' in $$props) $$invalidate(7, text = $$props.text);
    		if ('lastColor' in $$props) lastColor = $$props.lastColor;
    		if ('parent' in $$props) $$invalidate(8, parent = $$props.parent);
    		if ('inputElement' in $$props) $$invalidate(9, inputElement = $$props.inputElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 1) {
    			update(color);
    		}
    	};

    	return [
    		color,
    		isOpen,
    		title,
    		showAlphaSlider,
    		disabled,
    		onInput,
    		classes,
    		text,
    		parent,
    		inputElement,
    		textInputHandler,
    		focusout,
    		keydown,
    		open,
    		openAndPreventDefault,
    		$$scope,
    		slots,
    		input_binding,
    		input_input_handler,
    		colorpicker_color_binding,
    		div3_binding
    	];
    }

    class ColorInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			color: 0,
    			title: 2,
    			isOpen: 1,
    			showAlphaSlider: 3,
    			disabled: 4,
    			onInput: 5,
    			class: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorInput",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get color() {
    		throw new Error("<ColorInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ColorInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<ColorInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ColorInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<ColorInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<ColorInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showAlphaSlider() {
    		throw new Error("<ColorInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showAlphaSlider(value) {
    		throw new Error("<ColorInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<ColorInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ColorInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onInput() {
    		throw new Error("<ColorInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onInput(value) {
    		throw new Error("<ColorInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<ColorInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ColorInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Tools.svelte generated by Svelte v3.57.0 */
    const file$1 = "src\\Tools.svelte";

    function create_fragment$1(ctx) {
    	let h30;
    	let t1;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let t7;
    	let h31;
    	let t9;
    	let select1;
    	let option5;
    	let option6;
    	let option7;
    	let option8;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h30 = element("h3");
    			h30.textContent = "Shapes";
    			t1 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Rectangle";
    			option1 = element("option");
    			option1.textContent = "Triangle";
    			option2 = element("option");
    			option2.textContent = "Circle";
    			option3 = element("option");
    			option3.textContent = "Hexagon";
    			option4 = element("option");
    			option4.textContent = "Ellipse";
    			t7 = space();
    			h31 = element("h3");
    			h31.textContent = "Strokes";
    			t9 = space();
    			select1 = element("select");
    			option5 = element("option");
    			option5.textContent = "Pen";
    			option6 = element("option");
    			option6.textContent = "Dashed Line";
    			option7 = element("option");
    			option7.textContent = "Straight Line";
    			option8 = element("option");
    			option8.textContent = "Gradient Line";
    			attr_dev(h30, "class", "svelte-1xggbkh");
    			add_location(h30, file$1, 10, 0, 139);
    			option0.__value = "rectangle";
    			option0.value = option0.__value;
    			attr_dev(option0, "class", "svelte-1xggbkh");
    			add_location(option0, file$1, 22, 2, 356);
    			option1.__value = "triangle";
    			option1.value = option1.__value;
    			attr_dev(option1, "class", "svelte-1xggbkh");
    			add_location(option1, file$1, 23, 2, 404);
    			option2.__value = "circle";
    			option2.value = option2.__value;
    			attr_dev(option2, "class", "svelte-1xggbkh");
    			add_location(option2, file$1, 24, 2, 450);
    			option3.__value = "hexagon";
    			option3.value = option3.__value;
    			attr_dev(option3, "class", "svelte-1xggbkh");
    			add_location(option3, file$1, 25, 2, 492);
    			option4.__value = "ellipse";
    			option4.value = option4.__value;
    			attr_dev(option4, "class", "svelte-1xggbkh");
    			add_location(option4, file$1, 26, 2, 536);
    			attr_dev(select0, "class", "dropdown svelte-1xggbkh");
    			if (/*$selectedShape*/ ctx[1] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[5].call(select0));
    			add_location(select0, file$1, 12, 0, 158);
    			attr_dev(h31, "class", "svelte-1xggbkh");
    			add_location(h31, file$1, 28, 0, 589);
    			option5.__value = "pen";
    			option5.value = option5.__value;
    			attr_dev(option5, "class", "svelte-1xggbkh");
    			add_location(option5, file$1, 39, 2, 807);
    			option6.__value = "dashedLine";
    			option6.value = option6.__value;
    			attr_dev(option6, "class", "svelte-1xggbkh");
    			add_location(option6, file$1, 40, 2, 843);
    			option7.__value = "line";
    			option7.value = option7.__value;
    			attr_dev(option7, "class", "svelte-1xggbkh");
    			add_location(option7, file$1, 41, 2, 894);
    			option8.__value = "gradientLine";
    			option8.value = option8.__value;
    			attr_dev(option8, "class", "svelte-1xggbkh");
    			add_location(option8, file$1, 42, 2, 942);
    			attr_dev(select1, "class", "dropdown svelte-1xggbkh");
    			if (/*$selectedStroke*/ ctx[4] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[7].call(select1));
    			add_location(select1, file$1, 29, 0, 607);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h30, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, select0, anchor);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			append_dev(select0, option3);
    			append_dev(select0, option4);
    			select_option(select0, /*$selectedShape*/ ctx[1], true);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, h31, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, select1, anchor);
    			append_dev(select1, option5);
    			append_dev(select1, option6);
    			append_dev(select1, option7);
    			append_dev(select1, option8);
    			select_option(select1, /*$selectedStroke*/ ctx[4], true);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[5]),
    					listen_dev(select0, "click", /*click_handler*/ ctx[6], false, false, false, false),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[7]),
    					listen_dev(select1, "click", /*click_handler_1*/ ctx[8], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$selectedShape*/ 2) {
    				select_option(select0, /*$selectedShape*/ ctx[1]);
    			}

    			if (dirty & /*$selectedStroke*/ 16) {
    				select_option(select1, /*$selectedStroke*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(select0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(select1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $isErasing;
    	let $selectedShape;
    	let $stroke;
    	let $shape;
    	let $selectedStroke;
    	validate_store(isErasing, 'isErasing');
    	component_subscribe($$self, isErasing, $$value => $$invalidate(0, $isErasing = $$value));
    	validate_store(selectedShape, 'selectedShape');
    	component_subscribe($$self, selectedShape, $$value => $$invalidate(1, $selectedShape = $$value));
    	validate_store(stroke, 'stroke');
    	component_subscribe($$self, stroke, $$value => $$invalidate(2, $stroke = $$value));
    	validate_store(shape, 'shape');
    	component_subscribe($$self, shape, $$value => $$invalidate(3, $shape = $$value));
    	validate_store(selectedStroke, 'selectedStroke');
    	component_subscribe($$self, selectedStroke, $$value => $$invalidate(4, $selectedStroke = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tools', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tools> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		$selectedShape = select_value(this);
    		selectedShape.set($selectedShape);
    	}

    	const click_handler = e => {
    		set_store_value(isErasing, $isErasing = false, $isErasing);
    		set_store_value(selectedShape, $selectedShape = e.target.value, $selectedShape);
    		set_store_value(stroke, $stroke = false, $stroke);
    		set_store_value(shape, $shape = true, $shape);
    	};

    	function select1_change_handler() {
    		$selectedStroke = select_value(this);
    		selectedStroke.set($selectedStroke);
    	}

    	const click_handler_1 = e => {
    		set_store_value(isErasing, $isErasing = false, $isErasing);
    		set_store_value(selectedStroke, $selectedStroke = e.target.value, $selectedStroke);
    		set_store_value(stroke, $stroke = true, $stroke);
    		set_store_value(shape, $shape = false, $shape);
    	};

    	$$self.$capture_state = () => ({
    		selectedShape,
    		selectedStroke,
    		shape,
    		stroke,
    		isErasing,
    		$isErasing,
    		$selectedShape,
    		$stroke,
    		$shape,
    		$selectedStroke
    	});

    	return [
    		$isErasing,
    		$selectedShape,
    		$stroke,
    		$shape,
    		$selectedStroke,
    		select0_change_handler,
    		click_handler,
    		select1_change_handler,
    		click_handler_1
    	];
    }

    class Tools extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tools",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.57.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let body;
    	let div4;
    	let section0;
    	let canvas;
    	let updating_handleClear;
    	let updating_handleSave;
    	let updating_handleShare;
    	let updating_handleZoomIn;
    	let updating_handleZoomOut;
    	let updating_handleRedo;
    	let updating_handleUndo;
    	let updating_handleErase;
    	let t0;
    	let section1;
    	let button0;
    	let span0;
    	let t2;
    	let section2;
    	let button1;
    	let span1;
    	let t4;
    	let section3;
    	let h2;
    	let t6;
    	let div0;
    	let button2;
    	let span2;
    	let t8;
    	let button3;
    	let span3;
    	let t10;
    	let button4;
    	let span4;
    	let t12;
    	let button5;
    	let span5;
    	let t14;
    	let div1;
    	let button6;
    	let span6;
    	let t16;
    	let button7;
    	let span7;
    	let t18;
    	let button8;
    	let span8;
    	let t20;
    	let button9;
    	let span9;
    	let t22;
    	let div2;
    	let tools;
    	let t23;
    	let div3;
    	let colorinput;
    	let updating_color;
    	let t24;
    	let input;
    	let current;
    	let mounted;
    	let dispose;

    	function canvas_handleClear_binding(value) {
    		/*canvas_handleClear_binding*/ ctx[12](value);
    	}

    	function canvas_handleSave_binding(value) {
    		/*canvas_handleSave_binding*/ ctx[13](value);
    	}

    	function canvas_handleShare_binding(value) {
    		/*canvas_handleShare_binding*/ ctx[14](value);
    	}

    	function canvas_handleZoomIn_binding(value) {
    		/*canvas_handleZoomIn_binding*/ ctx[15](value);
    	}

    	function canvas_handleZoomOut_binding(value) {
    		/*canvas_handleZoomOut_binding*/ ctx[16](value);
    	}

    	function canvas_handleRedo_binding(value) {
    		/*canvas_handleRedo_binding*/ ctx[17](value);
    	}

    	function canvas_handleUndo_binding(value) {
    		/*canvas_handleUndo_binding*/ ctx[18](value);
    	}

    	function canvas_handleErase_binding(value) {
    		/*canvas_handleErase_binding*/ ctx[19](value);
    	}

    	let canvas_props = {
    		color: /*color*/ ctx[0],
    		brushsize: /*brushsize*/ ctx[1]
    	};

    	if (/*handleClear*/ ctx[2] !== void 0) {
    		canvas_props.handleClear = /*handleClear*/ ctx[2];
    	}

    	if (/*handleSave*/ ctx[3] !== void 0) {
    		canvas_props.handleSave = /*handleSave*/ ctx[3];
    	}

    	if (/*handleShare*/ ctx[4] !== void 0) {
    		canvas_props.handleShare = /*handleShare*/ ctx[4];
    	}

    	if (/*handleZoomIn*/ ctx[5] !== void 0) {
    		canvas_props.handleZoomIn = /*handleZoomIn*/ ctx[5];
    	}

    	if (/*handleZoomOut*/ ctx[6] !== void 0) {
    		canvas_props.handleZoomOut = /*handleZoomOut*/ ctx[6];
    	}

    	if (/*handleRedo*/ ctx[8] !== void 0) {
    		canvas_props.handleRedo = /*handleRedo*/ ctx[8];
    	}

    	if (/*handleUndo*/ ctx[7] !== void 0) {
    		canvas_props.handleUndo = /*handleUndo*/ ctx[7];
    	}

    	if (/*handleErase*/ ctx[9] !== void 0) {
    		canvas_props.handleErase = /*handleErase*/ ctx[9];
    	}

    	canvas = new Canvas({ props: canvas_props, $$inline: true });
    	binding_callbacks.push(() => bind(canvas, 'handleClear', canvas_handleClear_binding));
    	binding_callbacks.push(() => bind(canvas, 'handleSave', canvas_handleSave_binding));
    	binding_callbacks.push(() => bind(canvas, 'handleShare', canvas_handleShare_binding));
    	binding_callbacks.push(() => bind(canvas, 'handleZoomIn', canvas_handleZoomIn_binding));
    	binding_callbacks.push(() => bind(canvas, 'handleZoomOut', canvas_handleZoomOut_binding));
    	binding_callbacks.push(() => bind(canvas, 'handleRedo', canvas_handleRedo_binding));
    	binding_callbacks.push(() => bind(canvas, 'handleUndo', canvas_handleUndo_binding));
    	binding_callbacks.push(() => bind(canvas, 'handleErase', canvas_handleErase_binding));
    	tools = new Tools({ $$inline: true });

    	function colorinput_color_binding(value) {
    		/*colorinput_color_binding*/ ctx[20](value);
    	}

    	let colorinput_props = { showAlphaSlider: true };

    	if (/*color*/ ctx[0] !== void 0) {
    		colorinput_props.color = /*color*/ ctx[0];
    	}

    	colorinput = new ColorInput({ props: colorinput_props, $$inline: true });
    	binding_callbacks.push(() => bind(colorinput, 'color', colorinput_color_binding));

    	const block = {
    		c: function create() {
    			body = element("body");
    			div4 = element("div");
    			section0 = element("section");
    			create_component(canvas.$$.fragment);
    			t0 = space();
    			section1 = element("section");
    			button0 = element("button");
    			span0 = element("span");
    			span0.textContent = "arrow_forward";
    			t2 = space();
    			section2 = element("section");
    			button1 = element("button");
    			span1 = element("span");
    			span1.textContent = "arrow_back";
    			t4 = space();
    			section3 = element("section");
    			h2 = element("h2");
    			h2.textContent = "Artify";
    			t6 = space();
    			div0 = element("div");
    			button2 = element("button");
    			span2 = element("span");
    			span2.textContent = "download";
    			t8 = space();
    			button3 = element("button");
    			span3 = element("span");
    			span3.textContent = "share";
    			t10 = space();
    			button4 = element("button");
    			span4 = element("span");
    			span4.textContent = "zoom_in";
    			t12 = space();
    			button5 = element("button");
    			span5 = element("span");
    			span5.textContent = "zoom_out";
    			t14 = space();
    			div1 = element("div");
    			button6 = element("button");
    			span6 = element("span");
    			span6.textContent = "refresh";
    			t16 = space();
    			button7 = element("button");
    			span7 = element("span");
    			span7.textContent = "auto_fix_normal";
    			t18 = space();
    			button8 = element("button");
    			span8 = element("span");
    			span8.textContent = "undo";
    			t20 = space();
    			button9 = element("button");
    			span9 = element("span");
    			span9.textContent = "redo";
    			t22 = space();
    			div2 = element("div");
    			create_component(tools.$$.fragment);
    			t23 = space();
    			div3 = element("div");
    			create_component(colorinput.$$.fragment);
    			t24 = space();
    			input = element("input");
    			attr_dev(section0, "class", "canvas svelte-vm56s7");
    			add_location(section0, file, 37, 4, 1214);
    			attr_dev(span0, "class", "material-symbols-rounded");
    			add_location(span0, file, 56, 8, 1658);
    			attr_dev(button0, "id", "close-toolbox");
    			attr_dev(button0, "class", "svelte-vm56s7");
    			add_location(button0, file, 55, 6, 1599);
    			attr_dev(section1, "class", "close svelte-vm56s7");
    			add_location(section1, file, 54, 4, 1569);
    			attr_dev(span1, "class", "material-symbols-rounded");
    			add_location(span1, file, 61, 8, 1839);
    			attr_dev(button1, "id", "open-toolbox");
    			attr_dev(button1, "class", "svelte-vm56s7");
    			add_location(button1, file, 60, 6, 1782);
    			attr_dev(section2, "class", "open svelte-vm56s7");
    			add_location(section2, file, 59, 4, 1753);
    			attr_dev(h2, "class", "svelte-vm56s7");
    			add_location(h2, file, 65, 6, 1977);
    			attr_dev(span2, "class", "material-symbols-rounded");
    			add_location(span2, file, 68, 10, 2104);
    			attr_dev(button2, "class", "canvas-tools-buttons svelte-vm56s7");
    			add_location(button2, file, 67, 8, 2034);
    			attr_dev(span3, "class", "material-symbols-rounded");
    			add_location(span3, file, 71, 10, 2257);
    			attr_dev(button3, "class", "canvas-tools-buttons svelte-vm56s7");
    			add_location(button3, file, 70, 8, 2186);
    			attr_dev(span4, "class", "material-symbols-rounded");
    			add_location(span4, file, 74, 10, 2409);
    			attr_dev(button4, "class", "canvas-tools-buttons svelte-vm56s7");
    			add_location(button4, file, 73, 8, 2337);
    			attr_dev(span5, "class", "material-symbols-rounded");
    			add_location(span5, file, 77, 10, 2563);
    			attr_dev(button5, "class", "canvas-tools-buttons svelte-vm56s7");
    			add_location(button5, file, 76, 8, 2490);
    			attr_dev(div0, "class", "canvas-tools svelte-vm56s7");
    			add_location(div0, file, 66, 6, 1999);
    			attr_dev(span6, "class", "material-symbols-rounded");
    			add_location(span6, file, 82, 10, 2763);
    			attr_dev(button6, "class", "canvas-tools-buttons svelte-vm56s7");
    			add_location(button6, file, 81, 8, 2692);
    			attr_dev(span7, "class", "material-symbols-rounded");
    			add_location(span7, file, 85, 10, 2916);
    			attr_dev(button7, "class", "canvas-tools-buttons svelte-vm56s7");
    			add_location(button7, file, 84, 8, 2845);
    			attr_dev(span8, "class", "material-symbols-rounded");
    			add_location(span8, file, 88, 10, 3076);
    			attr_dev(button8, "class", "canvas-tools-buttons svelte-vm56s7");
    			add_location(button8, file, 87, 8, 3006);
    			attr_dev(span9, "class", "material-symbols-rounded");
    			add_location(span9, file, 91, 10, 3225);
    			attr_dev(button9, "class", "canvas-tools-buttons svelte-vm56s7");
    			add_location(button9, file, 90, 8, 3155);
    			attr_dev(div1, "class", "canvas-tools svelte-vm56s7");
    			add_location(div1, file, 80, 6, 2657);
    			attr_dev(div2, "class", "painting-tools svelte-vm56s7");
    			add_location(div2, file, 95, 6, 3316);
    			attr_dev(input, "class", "size-slider svelte-vm56s7");
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "100");
    			add_location(input, file, 102, 8, 3525);
    			attr_dev(div3, "class", "styles-tools svelte-vm56s7");
    			add_location(div3, file, 98, 6, 3382);
    			attr_dev(section3, "id", "tool-box");
    			attr_dev(section3, "class", "toolbox svelte-vm56s7");
    			add_location(section3, file, 64, 4, 1931);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file, 35, 2, 1156);
    			attr_dev(body, "class", "svelte-vm56s7");
    			add_location(body, file, 34, 0, 1147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div4);
    			append_dev(div4, section0);
    			mount_component(canvas, section0, null);
    			append_dev(div4, t0);
    			append_dev(div4, section1);
    			append_dev(section1, button0);
    			append_dev(button0, span0);
    			append_dev(div4, t2);
    			append_dev(div4, section2);
    			append_dev(section2, button1);
    			append_dev(button1, span1);
    			append_dev(div4, t4);
    			append_dev(div4, section3);
    			append_dev(section3, h2);
    			append_dev(section3, t6);
    			append_dev(section3, div0);
    			append_dev(div0, button2);
    			append_dev(button2, span2);
    			append_dev(div0, t8);
    			append_dev(div0, button3);
    			append_dev(button3, span3);
    			append_dev(div0, t10);
    			append_dev(div0, button4);
    			append_dev(button4, span4);
    			append_dev(div0, t12);
    			append_dev(div0, button5);
    			append_dev(button5, span5);
    			append_dev(section3, t14);
    			append_dev(section3, div1);
    			append_dev(div1, button6);
    			append_dev(button6, span6);
    			append_dev(div1, t16);
    			append_dev(div1, button7);
    			append_dev(button7, span7);
    			append_dev(div1, t18);
    			append_dev(div1, button8);
    			append_dev(button8, span8);
    			append_dev(div1, t20);
    			append_dev(div1, button9);
    			append_dev(button9, span9);
    			append_dev(section3, t22);
    			append_dev(section3, div2);
    			mount_component(tools, div2, null);
    			append_dev(section3, t23);
    			append_dev(section3, div3);
    			mount_component(colorinput, div3, null);
    			append_dev(div3, t24);
    			append_dev(div3, input);
    			set_input_value(input, /*brushsize*/ ctx[1]);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleClose*/ ctx[10], false, false, false, false),
    					listen_dev(button1, "click", /*handleOpen*/ ctx[11], false, false, false, false),
    					listen_dev(
    						button2,
    						"click",
    						function () {
    							if (is_function(/*handleSave*/ ctx[3])) /*handleSave*/ ctx[3].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button3,
    						"click",
    						function () {
    							if (is_function(/*handleShare*/ ctx[4])) /*handleShare*/ ctx[4].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button4,
    						"click",
    						function () {
    							if (is_function(/*handleZoomIn*/ ctx[5])) /*handleZoomIn*/ ctx[5].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button5,
    						"click",
    						function () {
    							if (is_function(/*handleZoomOut*/ ctx[6])) /*handleZoomOut*/ ctx[6].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button6,
    						"click",
    						function () {
    							if (is_function(/*handleClear*/ ctx[2])) /*handleClear*/ ctx[2].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button7,
    						"click",
    						function () {
    							if (is_function(/*handleErase*/ ctx[9])) /*handleErase*/ ctx[9].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button8,
    						"click",
    						function () {
    							if (is_function(/*handleUndo*/ ctx[7])) /*handleUndo*/ ctx[7].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button9,
    						"click",
    						function () {
    							if (is_function(/*handleRedo*/ ctx[8])) /*handleRedo*/ ctx[8].apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[21]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[21])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const canvas_changes = {};
    			if (dirty & /*color*/ 1) canvas_changes.color = /*color*/ ctx[0];
    			if (dirty & /*brushsize*/ 2) canvas_changes.brushsize = /*brushsize*/ ctx[1];

    			if (!updating_handleClear && dirty & /*handleClear*/ 4) {
    				updating_handleClear = true;
    				canvas_changes.handleClear = /*handleClear*/ ctx[2];
    				add_flush_callback(() => updating_handleClear = false);
    			}

    			if (!updating_handleSave && dirty & /*handleSave*/ 8) {
    				updating_handleSave = true;
    				canvas_changes.handleSave = /*handleSave*/ ctx[3];
    				add_flush_callback(() => updating_handleSave = false);
    			}

    			if (!updating_handleShare && dirty & /*handleShare*/ 16) {
    				updating_handleShare = true;
    				canvas_changes.handleShare = /*handleShare*/ ctx[4];
    				add_flush_callback(() => updating_handleShare = false);
    			}

    			if (!updating_handleZoomIn && dirty & /*handleZoomIn*/ 32) {
    				updating_handleZoomIn = true;
    				canvas_changes.handleZoomIn = /*handleZoomIn*/ ctx[5];
    				add_flush_callback(() => updating_handleZoomIn = false);
    			}

    			if (!updating_handleZoomOut && dirty & /*handleZoomOut*/ 64) {
    				updating_handleZoomOut = true;
    				canvas_changes.handleZoomOut = /*handleZoomOut*/ ctx[6];
    				add_flush_callback(() => updating_handleZoomOut = false);
    			}

    			if (!updating_handleRedo && dirty & /*handleRedo*/ 256) {
    				updating_handleRedo = true;
    				canvas_changes.handleRedo = /*handleRedo*/ ctx[8];
    				add_flush_callback(() => updating_handleRedo = false);
    			}

    			if (!updating_handleUndo && dirty & /*handleUndo*/ 128) {
    				updating_handleUndo = true;
    				canvas_changes.handleUndo = /*handleUndo*/ ctx[7];
    				add_flush_callback(() => updating_handleUndo = false);
    			}

    			if (!updating_handleErase && dirty & /*handleErase*/ 512) {
    				updating_handleErase = true;
    				canvas_changes.handleErase = /*handleErase*/ ctx[9];
    				add_flush_callback(() => updating_handleErase = false);
    			}

    			canvas.$set(canvas_changes);
    			const colorinput_changes = {};

    			if (!updating_color && dirty & /*color*/ 1) {
    				updating_color = true;
    				colorinput_changes.color = /*color*/ ctx[0];
    				add_flush_callback(() => updating_color = false);
    			}

    			colorinput.$set(colorinput_changes);

    			if (dirty & /*brushsize*/ 2) {
    				set_input_value(input, /*brushsize*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(canvas.$$.fragment, local);
    			transition_in(tools.$$.fragment, local);
    			transition_in(colorinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(canvas.$$.fragment, local);
    			transition_out(tools.$$.fragment, local);
    			transition_out(colorinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(canvas);
    			destroy_component(tools);
    			destroy_component(colorinput);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let color = new Color("#ff3d91"); //creating a color object
    	let brushsize = 1; //size of brush
    	let handleClear; //to clear canvas
    	let handleSave; //to save the canvas as image
    	let handleShare;
    	let handleZoomIn; //to zoom in
    	let handleZoomOut; //to zoom out
    	let handleUndo; //to undo
    	let handleRedo; //to redo
    	let handleErase; //to erase

    	//Close toolbox
    	const handleClose = () => {
    		if (document.getElementById("tool-box").style.display = "flex") {
    			document.getElementById("tool-box").style.display = "none";
    			document.getElementById("close-toolbox").style.display = "none";
    			document.getElementById("open-toolbox").style.display = "block";
    		}
    	};

    	//open toolbox
    	const handleOpen = () => {
    		document.getElementById("tool-box").style.display = "flex";
    		document.getElementById("close-toolbox").style.display = "block";
    		document.getElementById("open-toolbox").style.display = "none";
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function canvas_handleClear_binding(value) {
    		handleClear = value;
    		$$invalidate(2, handleClear);
    	}

    	function canvas_handleSave_binding(value) {
    		handleSave = value;
    		$$invalidate(3, handleSave);
    	}

    	function canvas_handleShare_binding(value) {
    		handleShare = value;
    		$$invalidate(4, handleShare);
    	}

    	function canvas_handleZoomIn_binding(value) {
    		handleZoomIn = value;
    		$$invalidate(5, handleZoomIn);
    	}

    	function canvas_handleZoomOut_binding(value) {
    		handleZoomOut = value;
    		$$invalidate(6, handleZoomOut);
    	}

    	function canvas_handleRedo_binding(value) {
    		handleRedo = value;
    		$$invalidate(8, handleRedo);
    	}

    	function canvas_handleUndo_binding(value) {
    		handleUndo = value;
    		$$invalidate(7, handleUndo);
    	}

    	function canvas_handleErase_binding(value) {
    		handleErase = value;
    		$$invalidate(9, handleErase);
    	}

    	function colorinput_color_binding(value) {
    		color = value;
    		$$invalidate(0, color);
    	}

    	function input_change_input_handler() {
    		brushsize = to_number(this.value);
    		$$invalidate(1, brushsize);
    	}

    	$$self.$capture_state = () => ({
    		Canvas,
    		Color,
    		ColorInput,
    		Tools,
    		color,
    		brushsize,
    		handleClear,
    		handleSave,
    		handleShare,
    		handleZoomIn,
    		handleZoomOut,
    		handleUndo,
    		handleRedo,
    		handleErase,
    		handleClose,
    		handleOpen
    	});

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('brushsize' in $$props) $$invalidate(1, brushsize = $$props.brushsize);
    		if ('handleClear' in $$props) $$invalidate(2, handleClear = $$props.handleClear);
    		if ('handleSave' in $$props) $$invalidate(3, handleSave = $$props.handleSave);
    		if ('handleShare' in $$props) $$invalidate(4, handleShare = $$props.handleShare);
    		if ('handleZoomIn' in $$props) $$invalidate(5, handleZoomIn = $$props.handleZoomIn);
    		if ('handleZoomOut' in $$props) $$invalidate(6, handleZoomOut = $$props.handleZoomOut);
    		if ('handleUndo' in $$props) $$invalidate(7, handleUndo = $$props.handleUndo);
    		if ('handleRedo' in $$props) $$invalidate(8, handleRedo = $$props.handleRedo);
    		if ('handleErase' in $$props) $$invalidate(9, handleErase = $$props.handleErase);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		color,
    		brushsize,
    		handleClear,
    		handleSave,
    		handleShare,
    		handleZoomIn,
    		handleZoomOut,
    		handleUndo,
    		handleRedo,
    		handleErase,
    		handleClose,
    		handleOpen,
    		canvas_handleClear_binding,
    		canvas_handleSave_binding,
    		canvas_handleShare_binding,
    		canvas_handleZoomIn_binding,
    		canvas_handleZoomOut_binding,
    		canvas_handleRedo_binding,
    		canvas_handleUndo_binding,
    		canvas_handleErase_binding,
    		colorinput_color_binding,
    		input_change_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
