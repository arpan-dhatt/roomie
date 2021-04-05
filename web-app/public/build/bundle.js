
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function get_binding_group_value(group, __value, checked) {
        const value = new Set();
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.add(group[i].__value);
        }
        if (!checked) {
            value.delete(__value);
        }
        return Array.from(value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
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
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    /* src/DataForm.svelte generated by Svelte v3.35.0 */

    const file$5 = "src/DataForm.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let div33;
    	let div0;
    	let h1;
    	let t1;
    	let div1;
    	let p0;
    	let t3;
    	let div32;
    	let div31;
    	let div4;
    	let div2;
    	let label0;
    	let t5;
    	let input0;
    	let t6;
    	let div3;
    	let label1;
    	let t8;
    	let input1;
    	let t9;
    	let div6;
    	let div5;
    	let label2;
    	let t11;
    	let input2;
    	let t12;
    	let p1;
    	let t14;
    	let div17;
    	let div7;
    	let h30;
    	let t16;
    	let div8;
    	let p2;
    	let t18;
    	let div9;
    	let label3;
    	let t20;
    	let input3;
    	let t21;
    	let div10;
    	let label4;
    	let t23;
    	let input4;
    	let t24;
    	let div11;
    	let label5;
    	let t26;
    	let input5;
    	let t27;
    	let div12;
    	let label6;
    	let t29;
    	let input6;
    	let t30;
    	let div13;
    	let label7;
    	let t32;
    	let input7;
    	let t33;
    	let div14;
    	let label8;
    	let t35;
    	let input8;
    	let t36;
    	let div15;
    	let label9;
    	let t38;
    	let input9;
    	let t39;
    	let div16;
    	let label10;
    	let t41;
    	let input10;
    	let t42;
    	let div23;
    	let div18;
    	let h31;
    	let t44;
    	let div19;
    	let p3;
    	let t46;
    	let div20;
    	let h50;
    	let t48;
    	let label11;
    	let input11;
    	let t49;
    	let i0;
    	let t50;
    	let t51;
    	let label12;
    	let input12;
    	let t52;
    	let i1;
    	let t53;
    	let t54;
    	let label13;
    	let input13;
    	let t55;
    	let i2;
    	let t56;
    	let t57;
    	let div21;
    	let h51;
    	let t59;
    	let label14;
    	let input14;
    	let t60;
    	let i3;
    	let t61;
    	let t62;
    	let label15;
    	let input15;
    	let t63;
    	let i4;
    	let t64;
    	let t65;
    	let label16;
    	let input16;
    	let t66;
    	let i5;
    	let t67;
    	let t68;
    	let div22;
    	let h52;
    	let t70;
    	let label17;
    	let input17;
    	let t71;
    	let i6;
    	let t72;
    	let t73;
    	let label18;
    	let input18;
    	let t74;
    	let i7;
    	let t75;
    	let t76;
    	let label19;
    	let input19;
    	let t77;
    	let i8;
    	let t78;
    	let t79;
    	let label20;
    	let input20;
    	let t80;
    	let i9;
    	let t81;
    	let t82;
    	let label21;
    	let input21;
    	let t83;
    	let i10;
    	let t84;
    	let t85;
    	let div28;
    	let div24;
    	let h32;
    	let t87;
    	let div25;
    	let p4;
    	let t89;
    	let div27;
    	let div26;
    	let textarea;
    	let t90;
    	let div30;
    	let div29;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div33 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Edit Your Profile";
    			t1 = space();
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "This is where you build the profile other students will see\n                after they sign in. You can modify it later by pressing the\n                \"Profile\" button that will appear on the top right of the page\n                when you're done. However, it's best to put in the correct\n                information as soon as you can.";
    			t3 = space();
    			div32 = element("div");
    			div31 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			label0 = element("label");
    			label0.textContent = "Enter Your Preferred First Name";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Enter Your Last Name";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			div6 = element("div");
    			div5 = element("div");
    			label2 = element("label");
    			label2.textContent = "College Name";
    			t11 = space();
    			input2 = element("input");
    			t12 = space();
    			p1 = element("p");
    			p1.textContent = "Add multiple, comma-separated names for easy\n                            searchability since I'm too lazy to add an index of\n                            colleges and stuff.";
    			t14 = space();
    			div17 = element("div");
    			div7 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Contact Information";
    			t16 = space();
    			div8 = element("div");
    			p2 = element("p");
    			p2.textContent = "Enter in contact information below. Remember, this\n                            will be public available to everyone who signs into\n                            the service, so make sure you're comfortable with\n                            what you enter. Feel free to leave any, or all of\n                            these blank, but having something is better than\n                            nothing.";
    			t18 = space();
    			div9 = element("div");
    			label3 = element("label");
    			label3.textContent = "Discord Tag";
    			t20 = space();
    			input3 = element("input");
    			t21 = space();
    			div10 = element("div");
    			label4 = element("label");
    			label4.textContent = "LinkedIn Profile";
    			t23 = space();
    			input4 = element("input");
    			t24 = space();
    			div11 = element("div");
    			label5 = element("label");
    			label5.textContent = "Snapchat";
    			t26 = space();
    			input5 = element("input");
    			t27 = space();
    			div12 = element("div");
    			label6 = element("label");
    			label6.textContent = "Instagram Profile";
    			t29 = space();
    			input6 = element("input");
    			t30 = space();
    			div13 = element("div");
    			label7 = element("label");
    			label7.textContent = "Facebook Profile";
    			t32 = space();
    			input7 = element("input");
    			t33 = space();
    			div14 = element("div");
    			label8 = element("label");
    			label8.textContent = "Twitter Profile";
    			t35 = space();
    			input8 = element("input");
    			t36 = space();
    			div15 = element("div");
    			label9 = element("label");
    			label9.textContent = "Email";
    			t38 = space();
    			input9 = element("input");
    			t39 = space();
    			div16 = element("div");
    			label10 = element("label");
    			label10.textContent = "Phone Number";
    			t41 = space();
    			input10 = element("input");
    			t42 = space();
    			div23 = element("div");
    			div18 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Room Information";
    			t44 = space();
    			div19 = element("div");
    			p3 = element("p");
    			p3.textContent = "Select all options you are comfortable with and have\n                            available to you. This doesn't mean you have the\n                            actual room already. This is just to tell others\n                            what you are okay living in and can live in. If you\n                            change your mind about anything later, you can edit\n                            it here. If you have specific preferences, such as\n                            1st choice, 2nd choice, you can add them in the\n                            additional details section later.";
    			t46 = space();
    			div20 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Honors Housing";
    			t48 = space();
    			label11 = element("label");
    			input11 = element("input");
    			t49 = space();
    			i0 = element("i");
    			t50 = text(" Honors");
    			t51 = space();
    			label12 = element("label");
    			input12 = element("input");
    			t52 = space();
    			i1 = element("i");
    			t53 = text(" Non-Honors");
    			t54 = space();
    			label13 = element("label");
    			input13 = element("input");
    			t55 = space();
    			i2 = element("i");
    			t56 = text(" Not Applicable");
    			t57 = space();
    			div21 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Location";
    			t59 = space();
    			label14 = element("label");
    			input14 = element("input");
    			t60 = space();
    			i3 = element("i");
    			t61 = text(" On-Campus");
    			t62 = space();
    			label15 = element("label");
    			input15 = element("input");
    			t63 = space();
    			i4 = element("i");
    			t64 = text(" Off-Campus");
    			t65 = space();
    			label16 = element("label");
    			input16 = element("input");
    			t66 = space();
    			i5 = element("i");
    			t67 = text(" Not Applicable");
    			t68 = space();
    			div22 = element("div");
    			h52 = element("h5");
    			h52.textContent = "Room Floorplan";
    			t70 = space();
    			label17 = element("label");
    			input17 = element("input");
    			t71 = space();
    			i6 = element("i");
    			t72 = text(" Shared Room and Bathroom");
    			t73 = space();
    			label18 = element("label");
    			input18 = element("input");
    			t74 = space();
    			i7 = element("i");
    			t75 = text(" Connected Bathroom");
    			t76 = space();
    			label19 = element("label");
    			input19 = element("input");
    			t77 = space();
    			i8 = element("i");
    			t78 = text(" Communal Bathroom");
    			t79 = space();
    			label20 = element("label");
    			input20 = element("input");
    			t80 = space();
    			i9 = element("i");
    			t81 = text(" Private Bathrooms");
    			t82 = space();
    			label21 = element("label");
    			input21 = element("input");
    			t83 = space();
    			i10 = element("i");
    			t84 = text(" Not Applicable");
    			t85 = space();
    			div28 = element("div");
    			div24 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Additional Information";
    			t87 = space();
    			div25 = element("div");
    			p4 = element("p");
    			p4.textContent = "This is where you can add things like preferences or\n                            other details that can't be added to the form. Add\n                            as much detail as you want since this will also be\n                            added to the search system and will help you find a\n                            good roommate. If you have buildings you prefer, or\n                            floorplans you'd like instead, make sure to add that\n                            here, too!";
    			t89 = space();
    			div27 = element("div");
    			div26 = element("div");
    			textarea = element("textarea");
    			t90 = space();
    			div30 = element("div");
    			div29 = element("div");
    			button = element("button");
    			button.textContent = "Save";
    			add_location(h1, file$5, 9, 12, 204);
    			attr_dev(div0, "class", "column col-8 col-md-12 col-mx-auto");
    			add_location(div0, file$5, 8, 8, 143);
    			add_location(p0, file$5, 12, 12, 315);
    			attr_dev(div1, "class", "column col-8 col-md-12 col-mx-auto");
    			add_location(div1, file$5, 11, 8, 254);
    			attr_dev(label0, "class", "form-label");
    			attr_dev(label0, "for", "first-name");
    			add_location(label0, file$5, 24, 24, 918);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-input");
    			attr_dev(input0, "id", "first-name");
    			add_location(input0, file$5, 27, 24, 1079);
    			attr_dev(div2, "class", "column col-6 col-md-12");
    			add_location(div2, file$5, 23, 20, 857);
    			attr_dev(label1, "class", "form-label");
    			attr_dev(label1, "for", "last-name");
    			add_location(label1, file$5, 35, 24, 1416);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-input");
    			attr_dev(input1, "id", "last-name");
    			add_location(input1, file$5, 38, 24, 1565);
    			attr_dev(div3, "class", "column col-6 col-md-12");
    			add_location(div3, file$5, 34, 20, 1355);
    			attr_dev(div4, "class", "columns");
    			add_location(div4, file$5, 22, 16, 815);
    			attr_dev(label2, "class", "form-label");
    			attr_dev(label2, "for", "college-name");
    			add_location(label2, file$5, 48, 24, 1978);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "form-input");
    			attr_dev(input2, "id", "college-name");
    			attr_dev(input2, "placeholder", "UT Austin, University of Texas Austin, etc.");
    			add_location(input2, file$5, 51, 24, 2122);
    			add_location(p1, file$5, 58, 24, 2465);
    			attr_dev(div5, "class", "column col-12");
    			add_location(div5, file$5, 47, 20, 1926);
    			attr_dev(div6, "class", "columns");
    			set_style(div6, "margin-top", "20px");
    			add_location(div6, file$5, 46, 16, 1858);
    			add_location(h30, file$5, 67, 24, 2877);
    			attr_dev(div7, "class", "col-12");
    			add_location(div7, file$5, 66, 20, 2832);
    			add_location(p2, file$5, 70, 24, 2998);
    			attr_dev(div8, "class", "col-12");
    			add_location(div8, file$5, 69, 20, 2953);
    			attr_dev(label3, "class", "form-label");
    			attr_dev(label3, "for", "discord-contact");
    			add_location(label3, file$5, 80, 24, 3568);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", "form-input");
    			attr_dev(input3, "id", "first-name");
    			attr_dev(input3, "placeholder", "Username#0000");
    			add_location(input3, file$5, 83, 24, 3714);
    			attr_dev(div9, "class", "column col-6 col-md-12");
    			add_location(div9, file$5, 79, 20, 3507);
    			attr_dev(label4, "class", "form-label");
    			attr_dev(label4, "for", "linkedin-contact");
    			add_location(label4, file$5, 92, 24, 4104);
    			attr_dev(input4, "type", "url");
    			attr_dev(input4, "class", "form-input");
    			attr_dev(input4, "id", "linkedin-contact");
    			attr_dev(input4, "placeholder", "https://www.linkedin.com/in/profile/");
    			add_location(input4, file$5, 95, 24, 4256);
    			attr_dev(div10, "class", "column col-6 col-md-12");
    			add_location(div10, file$5, 91, 20, 4043);
    			attr_dev(label5, "class", "form-label");
    			attr_dev(label5, "for", "snapchat-contact");
    			add_location(label5, file$5, 104, 24, 4675);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "class", "form-input");
    			attr_dev(input5, "id", "snapchat-contact");
    			attr_dev(input5, "placeholder", "something");
    			add_location(input5, file$5, 107, 24, 4819);
    			attr_dev(div11, "class", "column col-6 col-md-12");
    			add_location(div11, file$5, 103, 20, 4614);
    			attr_dev(label6, "class", "form-label");
    			attr_dev(label6, "for", "insta-contact");
    			add_location(label6, file$5, 116, 24, 5212);
    			attr_dev(input6, "type", "url");
    			attr_dev(input6, "class", "form-input");
    			attr_dev(input6, "id", "insta-contact");
    			attr_dev(input6, "placeholder", "https://www.instagram.com/elonmusk/");
    			add_location(input6, file$5, 119, 24, 5362);
    			attr_dev(div12, "class", "column col-6 col-md-12");
    			add_location(div12, file$5, 115, 20, 5151);
    			attr_dev(label7, "class", "form-label");
    			attr_dev(label7, "for", "facebook-contact");
    			add_location(label7, file$5, 128, 24, 5778);
    			attr_dev(input7, "type", "url");
    			attr_dev(input7, "class", "form-input");
    			attr_dev(input7, "id", "facebook-contact");
    			attr_dev(input7, "placeholder", "https://www.facebook.com/zuck");
    			add_location(input7, file$5, 131, 24, 5930);
    			attr_dev(div13, "class", "column col-6 col-md-12");
    			add_location(div13, file$5, 127, 20, 5717);
    			attr_dev(label8, "class", "form-label");
    			attr_dev(label8, "for", "twitter-contact");
    			add_location(label8, file$5, 140, 24, 6342);
    			attr_dev(input8, "type", "url");
    			attr_dev(input8, "class", "form-input");
    			attr_dev(input8, "id", "twitter-contact");
    			attr_dev(input8, "placeholder", "https://twitter.com/elonmusk");
    			add_location(input8, file$5, 143, 24, 6492);
    			attr_dev(div14, "class", "column col-6 col-md-12");
    			add_location(div14, file$5, 139, 20, 6281);
    			attr_dev(label9, "class", "form-label");
    			attr_dev(label9, "for", "email-contact");
    			add_location(label9, file$5, 152, 24, 6901);
    			attr_dev(input9, "type", "email");
    			attr_dev(input9, "class", "form-input");
    			attr_dev(input9, "id", "email-contact");
    			attr_dev(input9, "placeholder", "john.doe@gmail.com");
    			add_location(input9, file$5, 155, 24, 7039);
    			attr_dev(div15, "class", "column col-6 col-md-12");
    			add_location(div15, file$5, 151, 20, 6840);
    			attr_dev(label10, "class", "form-label");
    			attr_dev(label10, "for", "phone-contact");
    			add_location(label10, file$5, 164, 24, 7436);
    			attr_dev(input10, "type", "tel");
    			attr_dev(input10, "class", "form-input");
    			attr_dev(input10, "id", "phone-contact");
    			attr_dev(input10, "placeholder", "5555555555");
    			add_location(input10, file$5, 167, 24, 7581);
    			attr_dev(div16, "class", "column col-6 col-md-12");
    			add_location(div16, file$5, 163, 20, 7375);
    			attr_dev(div17, "class", "columns");
    			set_style(div17, "margin-top", "20px");
    			add_location(div17, file$5, 65, 16, 2765);
    			add_location(h31, file$5, 178, 24, 8046);
    			attr_dev(div18, "class", "column col-12");
    			add_location(div18, file$5, 177, 20, 7994);
    			add_location(p3, file$5, 181, 24, 8171);
    			attr_dev(div19, "class", "column col-12");
    			add_location(div19, file$5, 180, 20, 8119);
    			add_location(h50, file$5, 193, 24, 8934);
    			attr_dev(input11, "type", "checkbox");
    			attr_dev(input11, "name", "honors");
    			input11.__value = "Honors";
    			input11.value = input11.__value;
    			/*$$binding_groups*/ ctx[15][2].push(input11);
    			add_location(input11, file$5, 195, 28, 9040);
    			attr_dev(i0, "class", "form-icon");
    			add_location(i0, file$5, 201, 28, 9313);
    			attr_dev(label11, "class", "form-checkbox");
    			add_location(label11, file$5, 194, 24, 8982);
    			attr_dev(input12, "type", "checkbox");
    			attr_dev(input12, "name", "honors");
    			input12.__value = "Non-Honors";
    			input12.value = input12.__value;
    			/*$$binding_groups*/ ctx[15][2].push(input12);
    			add_location(input12, file$5, 204, 28, 9459);
    			attr_dev(i1, "class", "form-icon");
    			add_location(i1, file$5, 210, 28, 9736);
    			attr_dev(label12, "class", "form-checkbox");
    			add_location(label12, file$5, 203, 24, 9401);
    			attr_dev(input13, "type", "checkbox");
    			attr_dev(input13, "name", "honors");
    			input13.__value = "Not Applicable";
    			input13.value = input13.__value;
    			/*$$binding_groups*/ ctx[15][2].push(input13);
    			add_location(input13, file$5, 213, 28, 9886);
    			attr_dev(i2, "class", "form-icon");
    			add_location(i2, file$5, 219, 28, 10167);
    			attr_dev(label13, "class", "form-checkbox");
    			add_location(label13, file$5, 212, 24, 9828);
    			attr_dev(div20, "class", "column col-4 col-md-12 text-left");
    			add_location(div20, file$5, 192, 20, 8863);
    			add_location(h51, file$5, 223, 24, 10357);
    			attr_dev(input14, "type", "checkbox");
    			attr_dev(input14, "name", "location");
    			input14.__value = "On-Campus";
    			input14.value = input14.__value;
    			/*$$binding_groups*/ ctx[15][1].push(input14);
    			add_location(input14, file$5, 225, 28, 10457);
    			attr_dev(i3, "class", "form-icon");
    			add_location(i3, file$5, 231, 28, 10737);
    			attr_dev(label14, "class", "form-checkbox");
    			add_location(label14, file$5, 224, 24, 10399);
    			attr_dev(input15, "type", "checkbox");
    			attr_dev(input15, "name", "location");
    			input15.__value = "Off-Campus";
    			input15.value = input15.__value;
    			/*$$binding_groups*/ ctx[15][1].push(input15);
    			add_location(input15, file$5, 234, 28, 10886);
    			attr_dev(i4, "class", "form-icon");
    			add_location(i4, file$5, 240, 28, 11167);
    			attr_dev(label15, "class", "form-checkbox");
    			add_location(label15, file$5, 233, 24, 10828);
    			attr_dev(input16, "type", "checkbox");
    			attr_dev(input16, "name", "location");
    			input16.__value = "Not Applicable";
    			input16.value = input16.__value;
    			/*$$binding_groups*/ ctx[15][1].push(input16);
    			add_location(input16, file$5, 243, 28, 11317);
    			attr_dev(i5, "class", "form-icon");
    			add_location(i5, file$5, 249, 28, 11602);
    			attr_dev(label16, "class", "form-checkbox");
    			add_location(label16, file$5, 242, 24, 11259);
    			attr_dev(div21, "class", "column col-4 col-md-12 text-left");
    			add_location(div21, file$5, 222, 20, 10286);
    			add_location(h52, file$5, 253, 24, 11792);
    			attr_dev(input17, "type", "checkbox");
    			attr_dev(input17, "name", "floorplan");
    			input17.__value = "Shared Room and Bathroom";
    			input17.value = input17.__value;
    			/*$$binding_groups*/ ctx[15][0].push(input17);
    			add_location(input17, file$5, 255, 28, 11898);
    			attr_dev(i6, "class", "form-icon");
    			add_location(i6, file$5, 261, 28, 12195);
    			attr_dev(label17, "class", "form-checkbox");
    			add_location(label17, file$5, 254, 24, 11840);
    			attr_dev(input18, "type", "checkbox");
    			attr_dev(input18, "name", "floorplan");
    			input18.__value = "Connected Bathroom";
    			input18.value = input18.__value;
    			/*$$binding_groups*/ ctx[15][0].push(input18);
    			add_location(input18, file$5, 264, 28, 12359);
    			attr_dev(i7, "class", "form-icon");
    			add_location(i7, file$5, 270, 28, 12650);
    			attr_dev(label18, "class", "form-checkbox");
    			add_location(label18, file$5, 263, 24, 12301);
    			attr_dev(input19, "type", "checkbox");
    			attr_dev(input19, "name", "floorplan");
    			input19.__value = "Communal Bathroom";
    			input19.value = input19.__value;
    			/*$$binding_groups*/ ctx[15][0].push(input19);
    			add_location(input19, file$5, 273, 28, 12808);
    			attr_dev(i8, "class", "form-icon");
    			add_location(i8, file$5, 279, 28, 13098);
    			attr_dev(label19, "class", "form-checkbox");
    			add_location(label19, file$5, 272, 24, 12750);
    			attr_dev(input20, "type", "checkbox");
    			attr_dev(input20, "name", "floorplan");
    			input20.__value = "Private Bathrooms";
    			input20.value = input20.__value;
    			/*$$binding_groups*/ ctx[15][0].push(input20);
    			add_location(input20, file$5, 282, 28, 13255);
    			attr_dev(i9, "class", "form-icon");
    			add_location(i9, file$5, 288, 28, 13545);
    			attr_dev(label20, "class", "form-checkbox");
    			add_location(label20, file$5, 281, 24, 13197);
    			attr_dev(input21, "type", "checkbox");
    			attr_dev(input21, "name", "floorplan");
    			input21.__value = "Not Applicable";
    			input21.value = input21.__value;
    			/*$$binding_groups*/ ctx[15][0].push(input21);
    			add_location(input21, file$5, 291, 28, 13702);
    			attr_dev(i10, "class", "form-icon");
    			add_location(i10, file$5, 297, 28, 13989);
    			attr_dev(label21, "class", "form-checkbox");
    			add_location(label21, file$5, 290, 24, 13644);
    			attr_dev(div22, "class", "column col-4 col-md-12 text-left");
    			add_location(div22, file$5, 252, 20, 11721);
    			attr_dev(div23, "class", "columns");
    			set_style(div23, "margin-top", "20px");
    			add_location(div23, file$5, 176, 16, 7926);
    			add_location(h32, file$5, 304, 24, 14241);
    			attr_dev(div24, "class", "col-12");
    			add_location(div24, file$5, 303, 20, 14196);
    			add_location(p4, file$5, 307, 24, 14365);
    			attr_dev(div25, "class", "col-12");
    			add_location(div25, file$5, 306, 20, 14320);
    			attr_dev(textarea, "class", "form-input");
    			attr_dev(textarea, "id", "input-example-3");
    			attr_dev(textarea, "placeholder", "Details...");
    			attr_dev(textarea, "rows", "6");
    			add_location(textarea, file$5, 319, 28, 15072);
    			attr_dev(div26, "class", "form-group");
    			add_location(div26, file$5, 318, 24, 15019);
    			attr_dev(div27, "class", "col-12 text-left");
    			add_location(div27, file$5, 317, 20, 14964);
    			attr_dev(div28, "class", "columns");
    			set_style(div28, "margin-top", "20px");
    			add_location(div28, file$5, 302, 16, 14128);
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$5, 331, 24, 15599);
    			attr_dev(div29, "class", "column col-12");
    			add_location(div29, file$5, 330, 20, 15547);
    			attr_dev(div30, "class", "columns");
    			set_style(div30, "margin-top", "20px");
    			add_location(div30, file$5, 329, 16, 15480);
    			attr_dev(div31, "class", "form-group");
    			add_location(div31, file$5, 21, 12, 774);
    			attr_dev(div32, "class", "column col-8 col-md-12 col-mx-auto");
    			add_location(div32, file$5, 20, 8, 713);
    			attr_dev(div33, "class", "columns");
    			add_location(div33, file$5, 7, 4, 113);
    			add_location(main, file$5, 6, 0, 102);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div33);
    			append_dev(div33, div0);
    			append_dev(div0, h1);
    			append_dev(div33, t1);
    			append_dev(div33, div1);
    			append_dev(div1, p0);
    			append_dev(div33, t3);
    			append_dev(div33, div32);
    			append_dev(div32, div31);
    			append_dev(div31, div4);
    			append_dev(div4, div2);
    			append_dev(div2, label0);
    			append_dev(div2, t5);
    			append_dev(div2, input0);
    			set_input_value(input0, /*profileData*/ ctx[0].first_name);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t8);
    			append_dev(div3, input1);
    			set_input_value(input1, /*profileData*/ ctx[0].last_name);
    			append_dev(div31, t9);
    			append_dev(div31, div6);
    			append_dev(div6, div5);
    			append_dev(div5, label2);
    			append_dev(div5, t11);
    			append_dev(div5, input2);
    			set_input_value(input2, /*profileData*/ ctx[0].college_name);
    			append_dev(div5, t12);
    			append_dev(div5, p1);
    			append_dev(div31, t14);
    			append_dev(div31, div17);
    			append_dev(div17, div7);
    			append_dev(div7, h30);
    			append_dev(div17, t16);
    			append_dev(div17, div8);
    			append_dev(div8, p2);
    			append_dev(div17, t18);
    			append_dev(div17, div9);
    			append_dev(div9, label3);
    			append_dev(div9, t20);
    			append_dev(div9, input3);
    			set_input_value(input3, /*profileData*/ ctx[0].discord);
    			append_dev(div17, t21);
    			append_dev(div17, div10);
    			append_dev(div10, label4);
    			append_dev(div10, t23);
    			append_dev(div10, input4);
    			set_input_value(input4, /*profileData*/ ctx[0].linkedin);
    			append_dev(div17, t24);
    			append_dev(div17, div11);
    			append_dev(div11, label5);
    			append_dev(div11, t26);
    			append_dev(div11, input5);
    			set_input_value(input5, /*profileData*/ ctx[0].snapchat);
    			append_dev(div17, t27);
    			append_dev(div17, div12);
    			append_dev(div12, label6);
    			append_dev(div12, t29);
    			append_dev(div12, input6);
    			set_input_value(input6, /*profileData*/ ctx[0].instagram);
    			append_dev(div17, t30);
    			append_dev(div17, div13);
    			append_dev(div13, label7);
    			append_dev(div13, t32);
    			append_dev(div13, input7);
    			set_input_value(input7, /*profileData*/ ctx[0].facebook);
    			append_dev(div17, t33);
    			append_dev(div17, div14);
    			append_dev(div14, label8);
    			append_dev(div14, t35);
    			append_dev(div14, input8);
    			set_input_value(input8, /*profileData*/ ctx[0].twitter);
    			append_dev(div17, t36);
    			append_dev(div17, div15);
    			append_dev(div15, label9);
    			append_dev(div15, t38);
    			append_dev(div15, input9);
    			set_input_value(input9, /*profileData*/ ctx[0].email);
    			append_dev(div17, t39);
    			append_dev(div17, div16);
    			append_dev(div16, label10);
    			append_dev(div16, t41);
    			append_dev(div16, input10);
    			set_input_value(input10, /*profileData*/ ctx[0].phone);
    			append_dev(div31, t42);
    			append_dev(div31, div23);
    			append_dev(div23, div18);
    			append_dev(div18, h31);
    			append_dev(div23, t44);
    			append_dev(div23, div19);
    			append_dev(div19, p3);
    			append_dev(div23, t46);
    			append_dev(div23, div20);
    			append_dev(div20, h50);
    			append_dev(div20, t48);
    			append_dev(div20, label11);
    			append_dev(label11, input11);
    			input11.checked = ~/*profileData*/ ctx[0].honors.indexOf(input11.__value);
    			append_dev(label11, t49);
    			append_dev(label11, i0);
    			append_dev(label11, t50);
    			append_dev(div20, t51);
    			append_dev(div20, label12);
    			append_dev(label12, input12);
    			input12.checked = ~/*profileData*/ ctx[0].honors.indexOf(input12.__value);
    			append_dev(label12, t52);
    			append_dev(label12, i1);
    			append_dev(label12, t53);
    			append_dev(div20, t54);
    			append_dev(div20, label13);
    			append_dev(label13, input13);
    			input13.checked = ~/*profileData*/ ctx[0].honors.indexOf(input13.__value);
    			append_dev(label13, t55);
    			append_dev(label13, i2);
    			append_dev(label13, t56);
    			append_dev(div23, t57);
    			append_dev(div23, div21);
    			append_dev(div21, h51);
    			append_dev(div21, t59);
    			append_dev(div21, label14);
    			append_dev(label14, input14);
    			input14.checked = ~/*profileData*/ ctx[0].location.indexOf(input14.__value);
    			append_dev(label14, t60);
    			append_dev(label14, i3);
    			append_dev(label14, t61);
    			append_dev(div21, t62);
    			append_dev(div21, label15);
    			append_dev(label15, input15);
    			input15.checked = ~/*profileData*/ ctx[0].location.indexOf(input15.__value);
    			append_dev(label15, t63);
    			append_dev(label15, i4);
    			append_dev(label15, t64);
    			append_dev(div21, t65);
    			append_dev(div21, label16);
    			append_dev(label16, input16);
    			input16.checked = ~/*profileData*/ ctx[0].location.indexOf(input16.__value);
    			append_dev(label16, t66);
    			append_dev(label16, i5);
    			append_dev(label16, t67);
    			append_dev(div23, t68);
    			append_dev(div23, div22);
    			append_dev(div22, h52);
    			append_dev(div22, t70);
    			append_dev(div22, label17);
    			append_dev(label17, input17);
    			input17.checked = ~/*profileData*/ ctx[0].floorplan.indexOf(input17.__value);
    			append_dev(label17, t71);
    			append_dev(label17, i6);
    			append_dev(label17, t72);
    			append_dev(div22, t73);
    			append_dev(div22, label18);
    			append_dev(label18, input18);
    			input18.checked = ~/*profileData*/ ctx[0].floorplan.indexOf(input18.__value);
    			append_dev(label18, t74);
    			append_dev(label18, i7);
    			append_dev(label18, t75);
    			append_dev(div22, t76);
    			append_dev(div22, label19);
    			append_dev(label19, input19);
    			input19.checked = ~/*profileData*/ ctx[0].floorplan.indexOf(input19.__value);
    			append_dev(label19, t77);
    			append_dev(label19, i8);
    			append_dev(label19, t78);
    			append_dev(div22, t79);
    			append_dev(div22, label20);
    			append_dev(label20, input20);
    			input20.checked = ~/*profileData*/ ctx[0].floorplan.indexOf(input20.__value);
    			append_dev(label20, t80);
    			append_dev(label20, i9);
    			append_dev(label20, t81);
    			append_dev(div22, t82);
    			append_dev(div22, label21);
    			append_dev(label21, input21);
    			input21.checked = ~/*profileData*/ ctx[0].floorplan.indexOf(input21.__value);
    			append_dev(label21, t83);
    			append_dev(label21, i10);
    			append_dev(label21, t84);
    			append_dev(div31, t85);
    			append_dev(div31, div28);
    			append_dev(div28, div24);
    			append_dev(div24, h32);
    			append_dev(div28, t87);
    			append_dev(div28, div25);
    			append_dev(div25, p4);
    			append_dev(div28, t89);
    			append_dev(div28, div27);
    			append_dev(div27, div26);
    			append_dev(div26, textarea);
    			set_input_value(textarea, /*profileData*/ ctx[0].additional);
    			append_dev(div31, t90);
    			append_dev(div31, div30);
    			append_dev(div30, div29);
    			append_dev(div29, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[5]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[6]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[7]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[8]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[9]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[10]),
    					listen_dev(input8, "input", /*input8_input_handler*/ ctx[11]),
    					listen_dev(input9, "input", /*input9_input_handler*/ ctx[12]),
    					listen_dev(input10, "input", /*input10_input_handler*/ ctx[13]),
    					listen_dev(input11, "change", /*input11_change_handler*/ ctx[14]),
    					listen_dev(input12, "change", /*input12_change_handler*/ ctx[16]),
    					listen_dev(input13, "change", /*input13_change_handler*/ ctx[17]),
    					listen_dev(input14, "change", /*input14_change_handler*/ ctx[18]),
    					listen_dev(input15, "change", /*input15_change_handler*/ ctx[19]),
    					listen_dev(input16, "change", /*input16_change_handler*/ ctx[20]),
    					listen_dev(input17, "change", /*input17_change_handler*/ ctx[21]),
    					listen_dev(input18, "change", /*input18_change_handler*/ ctx[22]),
    					listen_dev(input19, "change", /*input19_change_handler*/ ctx[23]),
    					listen_dev(input20, "change", /*input20_change_handler*/ ctx[24]),
    					listen_dev(input21, "change", /*input21_change_handler*/ ctx[25]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[26]),
    					listen_dev(button, "click", /*click_handler*/ ctx[27], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*profileData*/ 1 && input0.value !== /*profileData*/ ctx[0].first_name) {
    				set_input_value(input0, /*profileData*/ ctx[0].first_name);
    			}

    			if (dirty & /*profileData*/ 1 && input1.value !== /*profileData*/ ctx[0].last_name) {
    				set_input_value(input1, /*profileData*/ ctx[0].last_name);
    			}

    			if (dirty & /*profileData*/ 1 && input2.value !== /*profileData*/ ctx[0].college_name) {
    				set_input_value(input2, /*profileData*/ ctx[0].college_name);
    			}

    			if (dirty & /*profileData*/ 1 && input3.value !== /*profileData*/ ctx[0].discord) {
    				set_input_value(input3, /*profileData*/ ctx[0].discord);
    			}

    			if (dirty & /*profileData*/ 1) {
    				set_input_value(input4, /*profileData*/ ctx[0].linkedin);
    			}

    			if (dirty & /*profileData*/ 1 && input5.value !== /*profileData*/ ctx[0].snapchat) {
    				set_input_value(input5, /*profileData*/ ctx[0].snapchat);
    			}

    			if (dirty & /*profileData*/ 1) {
    				set_input_value(input6, /*profileData*/ ctx[0].instagram);
    			}

    			if (dirty & /*profileData*/ 1) {
    				set_input_value(input7, /*profileData*/ ctx[0].facebook);
    			}

    			if (dirty & /*profileData*/ 1) {
    				set_input_value(input8, /*profileData*/ ctx[0].twitter);
    			}

    			if (dirty & /*profileData*/ 1 && input9.value !== /*profileData*/ ctx[0].email) {
    				set_input_value(input9, /*profileData*/ ctx[0].email);
    			}

    			if (dirty & /*profileData*/ 1) {
    				set_input_value(input10, /*profileData*/ ctx[0].phone);
    			}

    			if (dirty & /*profileData*/ 1) {
    				input11.checked = ~/*profileData*/ ctx[0].honors.indexOf(input11.__value);
    			}

    			if (dirty & /*profileData*/ 1) {
    				input12.checked = ~/*profileData*/ ctx[0].honors.indexOf(input12.__value);
    			}

    			if (dirty & /*profileData*/ 1) {
    				input13.checked = ~/*profileData*/ ctx[0].honors.indexOf(input13.__value);
    			}

    			if (dirty & /*profileData*/ 1) {
    				input14.checked = ~/*profileData*/ ctx[0].location.indexOf(input14.__value);
    			}

    			if (dirty & /*profileData*/ 1) {
    				input15.checked = ~/*profileData*/ ctx[0].location.indexOf(input15.__value);
    			}

    			if (dirty & /*profileData*/ 1) {
    				input16.checked = ~/*profileData*/ ctx[0].location.indexOf(input16.__value);
    			}

    			if (dirty & /*profileData*/ 1) {
    				input17.checked = ~/*profileData*/ ctx[0].floorplan.indexOf(input17.__value);
    			}

    			if (dirty & /*profileData*/ 1) {
    				input18.checked = ~/*profileData*/ ctx[0].floorplan.indexOf(input18.__value);
    			}

    			if (dirty & /*profileData*/ 1) {
    				input19.checked = ~/*profileData*/ ctx[0].floorplan.indexOf(input19.__value);
    			}

    			if (dirty & /*profileData*/ 1) {
    				input20.checked = ~/*profileData*/ ctx[0].floorplan.indexOf(input20.__value);
    			}

    			if (dirty & /*profileData*/ 1) {
    				input21.checked = ~/*profileData*/ ctx[0].floorplan.indexOf(input21.__value);
    			}

    			if (dirty & /*profileData*/ 1) {
    				set_input_value(textarea, /*profileData*/ ctx[0].additional);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*$$binding_groups*/ ctx[15][2].splice(/*$$binding_groups*/ ctx[15][2].indexOf(input11), 1);
    			/*$$binding_groups*/ ctx[15][2].splice(/*$$binding_groups*/ ctx[15][2].indexOf(input12), 1);
    			/*$$binding_groups*/ ctx[15][2].splice(/*$$binding_groups*/ ctx[15][2].indexOf(input13), 1);
    			/*$$binding_groups*/ ctx[15][1].splice(/*$$binding_groups*/ ctx[15][1].indexOf(input14), 1);
    			/*$$binding_groups*/ ctx[15][1].splice(/*$$binding_groups*/ ctx[15][1].indexOf(input15), 1);
    			/*$$binding_groups*/ ctx[15][1].splice(/*$$binding_groups*/ ctx[15][1].indexOf(input16), 1);
    			/*$$binding_groups*/ ctx[15][0].splice(/*$$binding_groups*/ ctx[15][0].indexOf(input17), 1);
    			/*$$binding_groups*/ ctx[15][0].splice(/*$$binding_groups*/ ctx[15][0].indexOf(input18), 1);
    			/*$$binding_groups*/ ctx[15][0].splice(/*$$binding_groups*/ ctx[15][0].indexOf(input19), 1);
    			/*$$binding_groups*/ ctx[15][0].splice(/*$$binding_groups*/ ctx[15][0].indexOf(input20), 1);
    			/*$$binding_groups*/ ctx[15][0].splice(/*$$binding_groups*/ ctx[15][0].indexOf(input21), 1);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("DataForm", slots, []);
    	var { profileData } = $$props;
    	var { whenDone } = $$props;
    	var { sessionToken } = $$props;
    	const writable_props = ["profileData", "whenDone", "sessionToken"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DataForm> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[], [], []];

    	function input0_input_handler() {
    		profileData.first_name = this.value;
    		$$invalidate(0, profileData);
    	}

    	function input1_input_handler() {
    		profileData.last_name = this.value;
    		$$invalidate(0, profileData);
    	}

    	function input2_input_handler() {
    		profileData.college_name = this.value;
    		$$invalidate(0, profileData);
    	}

    	function input3_input_handler() {
    		profileData.discord = this.value;
    		$$invalidate(0, profileData);
    	}

    	function input4_input_handler() {
    		profileData.linkedin = this.value;
    		$$invalidate(0, profileData);
    	}

    	function input5_input_handler() {
    		profileData.snapchat = this.value;
    		$$invalidate(0, profileData);
    	}

    	function input6_input_handler() {
    		profileData.instagram = this.value;
    		$$invalidate(0, profileData);
    	}

    	function input7_input_handler() {
    		profileData.facebook = this.value;
    		$$invalidate(0, profileData);
    	}

    	function input8_input_handler() {
    		profileData.twitter = this.value;
    		$$invalidate(0, profileData);
    	}

    	function input9_input_handler() {
    		profileData.email = this.value;
    		$$invalidate(0, profileData);
    	}

    	function input10_input_handler() {
    		profileData.phone = this.value;
    		$$invalidate(0, profileData);
    	}

    	function input11_change_handler() {
    		profileData.honors = get_binding_group_value($$binding_groups[2], this.__value, this.checked);
    		$$invalidate(0, profileData);
    	}

    	function input12_change_handler() {
    		profileData.honors = get_binding_group_value($$binding_groups[2], this.__value, this.checked);
    		$$invalidate(0, profileData);
    	}

    	function input13_change_handler() {
    		profileData.honors = get_binding_group_value($$binding_groups[2], this.__value, this.checked);
    		$$invalidate(0, profileData);
    	}

    	function input14_change_handler() {
    		profileData.location = get_binding_group_value($$binding_groups[1], this.__value, this.checked);
    		$$invalidate(0, profileData);
    	}

    	function input15_change_handler() {
    		profileData.location = get_binding_group_value($$binding_groups[1], this.__value, this.checked);
    		$$invalidate(0, profileData);
    	}

    	function input16_change_handler() {
    		profileData.location = get_binding_group_value($$binding_groups[1], this.__value, this.checked);
    		$$invalidate(0, profileData);
    	}

    	function input17_change_handler() {
    		profileData.floorplan = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(0, profileData);
    	}

    	function input18_change_handler() {
    		profileData.floorplan = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(0, profileData);
    	}

    	function input19_change_handler() {
    		profileData.floorplan = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(0, profileData);
    	}

    	function input20_change_handler() {
    		profileData.floorplan = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(0, profileData);
    	}

    	function input21_change_handler() {
    		profileData.floorplan = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(0, profileData);
    	}

    	function textarea_input_handler() {
    		profileData.additional = this.value;
    		$$invalidate(0, profileData);
    	}

    	const click_handler = () => {
    		whenDone(sessionToken, profileData);
    	};

    	$$self.$$set = $$props => {
    		if ("profileData" in $$props) $$invalidate(0, profileData = $$props.profileData);
    		if ("whenDone" in $$props) $$invalidate(1, whenDone = $$props.whenDone);
    		if ("sessionToken" in $$props) $$invalidate(2, sessionToken = $$props.sessionToken);
    	};

    	$$self.$capture_state = () => ({ profileData, whenDone, sessionToken });

    	$$self.$inject_state = $$props => {
    		if ("profileData" in $$props) $$invalidate(0, profileData = $$props.profileData);
    		if ("whenDone" in $$props) $$invalidate(1, whenDone = $$props.whenDone);
    		if ("sessionToken" in $$props) $$invalidate(2, sessionToken = $$props.sessionToken);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		profileData,
    		whenDone,
    		sessionToken,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		input9_input_handler,
    		input10_input_handler,
    		input11_change_handler,
    		$$binding_groups,
    		input12_change_handler,
    		input13_change_handler,
    		input14_change_handler,
    		input15_change_handler,
    		input16_change_handler,
    		input17_change_handler,
    		input18_change_handler,
    		input19_change_handler,
    		input20_change_handler,
    		input21_change_handler,
    		textarea_input_handler,
    		click_handler
    	];
    }

    class DataForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			profileData: 0,
    			whenDone: 1,
    			sessionToken: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DataForm",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*profileData*/ ctx[0] === undefined && !("profileData" in props)) {
    			console.warn("<DataForm> was created without expected prop 'profileData'");
    		}

    		if (/*whenDone*/ ctx[1] === undefined && !("whenDone" in props)) {
    			console.warn("<DataForm> was created without expected prop 'whenDone'");
    		}

    		if (/*sessionToken*/ ctx[2] === undefined && !("sessionToken" in props)) {
    			console.warn("<DataForm> was created without expected prop 'sessionToken'");
    		}
    	}

    	get profileData() {
    		throw new Error("<DataForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set profileData(value) {
    		throw new Error("<DataForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get whenDone() {
    		throw new Error("<DataForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set whenDone(value) {
    		throw new Error("<DataForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sessionToken() {
    		throw new Error("<DataForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sessionToken(value) {
    		throw new Error("<DataForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Login.svelte generated by Svelte v3.35.0 */

    const file$4 = "src/Login.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let h3;
    	let t1;
    	let div2;
    	let p0;
    	let t3;
    	let div3;
    	let p1;
    	let t5;
    	let div5;
    	let div4;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "A place to find a roommate for college!";
    			t1 = space();
    			div2 = element("div");
    			p0 = element("p");
    			p0.textContent = "This is a digital service where you can find other students going to\n            the same college and looking for roommates. After signing in and\n            entering your information (you can edit it later), you can look at\n            profiles of other students and get in contact with them.";
    			t3 = space();
    			div3 = element("div");
    			p1 = element("p");
    			p1.textContent = "You can get started by signing in with Google! You don't need a school account to enter.";
    			t5 = space();
    			div5 = element("div");
    			div4 = element("div");
    			add_location(h3, file$4, 7, 12, 147);
    			attr_dev(div0, "class", "column col-8 col-md-12 col-mx-auto");
    			add_location(div0, file$4, 6, 8, 86);
    			attr_dev(div1, "class", "columns");
    			add_location(div1, file$4, 5, 4, 56);
    			attr_dev(p0, "class", "column col-8 col-mx-auto");
    			add_location(p0, file$4, 11, 8, 256);
    			attr_dev(div2, "class", "columns");
    			add_location(div2, file$4, 10, 4, 226);
    			attr_dev(p1, "class", "column col-8 col-md-12 col-mx-auto");
    			add_location(p1, file$4, 19, 8, 657);
    			attr_dev(div3, "class", "columns");
    			add_location(div3, file$4, 18, 4, 627);
    			set_style(div4, "display", "flex");
    			set_style(div4, "justify-content", "center");
    			attr_dev(div4, "class", "column col-8 col-mx-auto g-signin2");
    			attr_dev(div4, "data-onsuccess", "onSignIn");
    			add_location(div4, file$4, 24, 8, 863);
    			attr_dev(div5, "class", "columns");
    			add_location(div5, file$4, 23, 4, 833);
    			add_location(main, file$4, 4, 0, 45);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, p0);
    			append_dev(main, t3);
    			append_dev(main, div3);
    			append_dev(div3, p1);
    			append_dev(main, t5);
    			append_dev(main, div5);
    			append_dev(div5, div4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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
    	validate_slots("Login", slots, []);
    	var { signedIn } = $$props;
    	const writable_props = ["signedIn"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("signedIn" in $$props) $$invalidate(0, signedIn = $$props.signedIn);
    	};

    	$$self.$capture_state = () => ({ signedIn });

    	$$self.$inject_state = $$props => {
    		if ("signedIn" in $$props) $$invalidate(0, signedIn = $$props.signedIn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [signedIn];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { signedIn: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*signedIn*/ ctx[0] === undefined && !("signedIn" in props)) {
    			console.warn("<Login> was created without expected prop 'signedIn'");
    		}
    	}

    	get signedIn() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set signedIn(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/SignOut.svelte generated by Svelte v3.35.0 */

    const { console: console_1$1 } = globals;
    const file$3 = "src/SignOut.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let div;
    	let button0;
    	let t0_value = (/*page*/ ctx[0] == "profile" ? "Search" : "Profile") + "";
    	let t0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			button0 = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Sign Out";
    			attr_dev(button0, "class", "btn");
    			add_location(button0, file$3, 25, 8, 510);
    			attr_dev(button1, "class", "btn");
    			add_location(button1, file$3, 26, 8, 662);
    			attr_dev(div, "class", "topright svelte-1hnft6h");
    			add_location(div, file$3, 24, 4, 479);
    			add_location(main, file$3, 23, 0, 468);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, button0);
    			append_dev(button0, t0);
    			append_dev(div, t1);
    			append_dev(div, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*signOut*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*page*/ 1 && t0_value !== (t0_value = (/*page*/ ctx[0] == "profile" ? "Search" : "Profile") + "")) set_data_dev(t0, t0_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("SignOut", slots, []);
    	var { page } = $$props;
    	var { signedIn } = $$props;

    	function signOutRequest() {
    		var auth2 = gapi.auth2.getAuthInstance();

    		auth2.signOut().then(function () {
    			console.log("User signed out.");
    			$$invalidate(3, signedIn = false);
    			location.reload();
    		});
    	}

    	function signOut() {
    		switchToPage("signin");
    		signOutRequest();
    	}

    	function switchToPage(string) {
    		$$invalidate(0, page = string);
    	}

    	const writable_props = ["page", "signedIn"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<SignOut> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => switchToPage(page == "profile" ? "search" : "profile");

    	$$self.$$set = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("signedIn" in $$props) $$invalidate(3, signedIn = $$props.signedIn);
    	};

    	$$self.$capture_state = () => ({
    		page,
    		signedIn,
    		signOutRequest,
    		signOut,
    		switchToPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("signedIn" in $$props) $$invalidate(3, signedIn = $$props.signedIn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, signOut, switchToPage, signedIn, click_handler];
    }

    class SignOut extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { page: 0, signedIn: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SignOut",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*page*/ ctx[0] === undefined && !("page" in props)) {
    			console_1$1.warn("<SignOut> was created without expected prop 'page'");
    		}

    		if (/*signedIn*/ ctx[3] === undefined && !("signedIn" in props)) {
    			console_1$1.warn("<SignOut> was created without expected prop 'signedIn'");
    		}
    	}

    	get page() {
    		throw new Error("<SignOut>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<SignOut>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get signedIn() {
    		throw new Error("<SignOut>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set signedIn(value) {
    		throw new Error("<SignOut>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/MoreInfoModal.svelte generated by Svelte v3.35.0 */

    const file$2 = "src/MoreInfoModal.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (33:20) {#if modalData}
    function create_if_block$2(ctx) {
    	let h60;
    	let t0_value = /*modalData*/ ctx[1].college_name + "";
    	let t0;
    	let t1;
    	let h5;
    	let t3;
    	let ul;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let h40;
    	let t13;
    	let div4;
    	let div3;
    	let div0;
    	let h61;
    	let t15;
    	let t16;
    	let div1;
    	let h62;
    	let t18;
    	let t19;
    	let div2;
    	let h63;
    	let t21;
    	let t22;
    	let h41;
    	let t24;
    	let p;
    	let t25_value = /*modalData*/ ctx[1].additional + "";
    	let t25;
    	let if_block0 = /*modalData*/ ctx[1].discord != undefined && create_if_block_8(ctx);
    	let if_block1 = /*modalData*/ ctx[1].linkedin != undefined && create_if_block_7(ctx);
    	let if_block2 = /*modalData*/ ctx[1].snapchat != undefined && create_if_block_6(ctx);
    	let if_block3 = /*modalData*/ ctx[1].instagram != undefined && create_if_block_5(ctx);
    	let if_block4 = /*modalData*/ ctx[1].facebook != undefined && create_if_block_4(ctx);
    	let if_block5 = /*modalData*/ ctx[1].twitter != undefined && create_if_block_3$1(ctx);
    	let if_block6 = /*modalData*/ ctx[1].email != undefined && create_if_block_2$1(ctx);
    	let if_block7 = /*modalData*/ ctx[1].phone != undefined && create_if_block_1$1(ctx);

    	let each_value_2 = /*modalData*/ ctx[1].honors
    	? /*modalData*/ ctx[1].honors
    	: [];

    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*modalData*/ ctx[1].location
    	? /*modalData*/ ctx[1].location
    	: [];

    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*modalData*/ ctx[1].floorplan
    	? /*modalData*/ ctx[1].floorplan
    	: [];

    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h60 = element("h6");
    			t0 = text(t0_value);
    			t1 = space();
    			h5 = element("h5");
    			h5.textContent = "Contact Information";
    			t3 = space();
    			ul = element("ul");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			if (if_block2) if_block2.c();
    			t6 = space();
    			if (if_block3) if_block3.c();
    			t7 = space();
    			if (if_block4) if_block4.c();
    			t8 = space();
    			if (if_block5) if_block5.c();
    			t9 = space();
    			if (if_block6) if_block6.c();
    			t10 = space();
    			if (if_block7) if_block7.c();
    			t11 = space();
    			h40 = element("h4");
    			h40.textContent = "Room Information";
    			t13 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h61 = element("h6");
    			h61.textContent = "Honors";
    			t15 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t16 = space();
    			div1 = element("div");
    			h62 = element("h6");
    			h62.textContent = "Locations";
    			t18 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t19 = space();
    			div2 = element("div");
    			h63 = element("h6");
    			h63.textContent = "Floorplans";
    			t21 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t22 = space();
    			h41 = element("h4");
    			h41.textContent = "Additional Information";
    			t24 = space();
    			p = element("p");
    			t25 = text(t25_value);
    			add_location(h60, file$2, 33, 24, 1006);
    			add_location(h5, file$2, 34, 24, 1064);
    			add_location(ul, file$2, 35, 24, 1117);
    			add_location(h40, file$2, 45, 24, 2083);
    			add_location(h61, file$2, 49, 36, 2302);
    			attr_dev(div0, "class", "column col-3");
    			add_location(div0, file$2, 48, 32, 2239);
    			add_location(h62, file$2, 57, 36, 2771);
    			attr_dev(div1, "class", "column col-3");
    			add_location(div1, file$2, 56, 32, 2708);
    			add_location(h63, file$2, 65, 36, 3247);
    			attr_dev(div2, "class", "column col-3");
    			add_location(div2, file$2, 64, 32, 3184);
    			attr_dev(div3, "class", "columns");
    			add_location(div3, file$2, 47, 28, 2185);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$2, 46, 24, 2133);
    			add_location(h41, file$2, 74, 24, 3721);
    			set_style(p, "border", "1px solid gray");
    			set_style(p, "border-radius", "15px");
    			set_style(p, "padding", "10px");
    			add_location(p, file$2, 75, 24, 3777);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h60, anchor);
    			append_dev(h60, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, ul, anchor);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t4);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(ul, t5);
    			if (if_block2) if_block2.m(ul, null);
    			append_dev(ul, t6);
    			if (if_block3) if_block3.m(ul, null);
    			append_dev(ul, t7);
    			if (if_block4) if_block4.m(ul, null);
    			append_dev(ul, t8);
    			if (if_block5) if_block5.m(ul, null);
    			append_dev(ul, t9);
    			if (if_block6) if_block6.m(ul, null);
    			append_dev(ul, t10);
    			if (if_block7) if_block7.m(ul, null);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, h40, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h61);
    			append_dev(div0, t15);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div3, t16);
    			append_dev(div3, div1);
    			append_dev(div1, h62);
    			append_dev(div1, t18);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div3, t19);
    			append_dev(div3, div2);
    			append_dev(div2, h63);
    			append_dev(div2, t21);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			insert_dev(target, t22, anchor);
    			insert_dev(target, h41, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t25);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t0_value !== (t0_value = /*modalData*/ ctx[1].college_name + "")) set_data_dev(t0, t0_value);

    			if (/*modalData*/ ctx[1].discord != undefined) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					if_block0.m(ul, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*modalData*/ ctx[1].linkedin != undefined) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_7(ctx);
    					if_block1.c();
    					if_block1.m(ul, t5);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*modalData*/ ctx[1].snapchat != undefined) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_6(ctx);
    					if_block2.c();
    					if_block2.m(ul, t6);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*modalData*/ ctx[1].instagram != undefined) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_5(ctx);
    					if_block3.c();
    					if_block3.m(ul, t7);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*modalData*/ ctx[1].facebook != undefined) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_4(ctx);
    					if_block4.c();
    					if_block4.m(ul, t8);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*modalData*/ ctx[1].twitter != undefined) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_3$1(ctx);
    					if_block5.c();
    					if_block5.m(ul, t9);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*modalData*/ ctx[1].email != undefined) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_2$1(ctx);
    					if_block6.c();
    					if_block6.m(ul, t10);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*modalData*/ ctx[1].phone != undefined) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_1$1(ctx);
    					if_block7.c();
    					if_block7.m(ul, null);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (dirty & /*colorMap, modalData*/ 6) {
    				each_value_2 = /*modalData*/ ctx[1].honors
    				? /*modalData*/ ctx[1].honors
    				: [];

    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*colorMap, modalData*/ 6) {
    				each_value_1 = /*modalData*/ ctx[1].location
    				? /*modalData*/ ctx[1].location
    				: [];

    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*colorMap, modalData*/ 6) {
    				each_value = /*modalData*/ ctx[1].floorplan
    				? /*modalData*/ ctx[1].floorplan
    				: [];

    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*modalData*/ 2 && t25_value !== (t25_value = /*modalData*/ ctx[1].additional + "")) set_data_dev(t25, t25_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h60);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(ul);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(h40);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(h41);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(33:20) {#if modalData}",
    		ctx
    	});

    	return block;
    }

    // (37:28) {#if modalData.discord != undefined }
    function create_if_block_8(ctx) {
    	let li;
    	let t_value = "Discord: " + /*modalData*/ ctx[1].discord + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$2, 36, 65, 1187);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t_value !== (t_value = "Discord: " + /*modalData*/ ctx[1].discord + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(37:28) {#if modalData.discord != undefined }",
    		ctx
    	});

    	return block;
    }

    // (38:28) {#if modalData.linkedin != undefined }
    function create_if_block_7(ctx) {
    	let li;
    	let t_value = "LinkedIn: " + /*modalData*/ ctx[1].linkedin + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$2, 37, 66, 1301);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t_value !== (t_value = "LinkedIn: " + /*modalData*/ ctx[1].linkedin + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(38:28) {#if modalData.linkedin != undefined }",
    		ctx
    	});

    	return block;
    }

    // (39:28) {#if modalData.snapchat != undefined }
    function create_if_block_6(ctx) {
    	let li;
    	let t_value = "SnapChat: " + /*modalData*/ ctx[1].snapchat + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$2, 38, 66, 1417);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t_value !== (t_value = "SnapChat: " + /*modalData*/ ctx[1].snapchat + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(39:28) {#if modalData.snapchat != undefined }",
    		ctx
    	});

    	return block;
    }

    // (40:28) {#if modalData.instagram != undefined }
    function create_if_block_5(ctx) {
    	let li;
    	let t_value = "Instagram: " + /*modalData*/ ctx[1].instagram + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$2, 39, 67, 1534);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t_value !== (t_value = "Instagram: " + /*modalData*/ ctx[1].instagram + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(40:28) {#if modalData.instagram != undefined }",
    		ctx
    	});

    	return block;
    }

    // (41:28) {#if modalData.facebook != undefined }
    function create_if_block_4(ctx) {
    	let li;
    	let t_value = "Facebook: " + /*modalData*/ ctx[1].facebook + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$2, 40, 66, 1652);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t_value !== (t_value = "Facebook: " + /*modalData*/ ctx[1].facebook + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(41:28) {#if modalData.facebook != undefined }",
    		ctx
    	});

    	return block;
    }

    // (42:28) {#if modalData.twitter != undefined }
    function create_if_block_3$1(ctx) {
    	let li;
    	let t_value = "Twitter: " + /*modalData*/ ctx[1].twitter + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$2, 41, 65, 1767);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t_value !== (t_value = "Twitter: " + /*modalData*/ ctx[1].twitter + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(42:28) {#if modalData.twitter != undefined }",
    		ctx
    	});

    	return block;
    }

    // (43:28) {#if modalData.email != undefined }
    function create_if_block_2$1(ctx) {
    	let li;
    	let t_value = "Email: " + /*modalData*/ ctx[1].email + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$2, 42, 63, 1878);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t_value !== (t_value = "Email: " + /*modalData*/ ctx[1].email + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(43:28) {#if modalData.email != undefined }",
    		ctx
    	});

    	return block;
    }

    // (44:28) {#if modalData.phone != undefined }
    function create_if_block_1$1(ctx) {
    	let li;
    	let t_value = "Phone: " + /*modalData*/ ctx[1].phone + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$2, 43, 63, 1985);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t_value !== (t_value = "Phone: " + /*modalData*/ ctx[1].phone + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(44:28) {#if modalData.phone != undefined }",
    		ctx
    	});

    	return block;
    }

    // (51:36) {#each modalData.honors ? modalData.honors : [] as honor}
    function create_each_block_2$1(ctx) {
    	let span;
    	let t_value = /*honor*/ ctx[5] + "";
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty("chip " + /*colorMap*/ ctx[2][/*honor*/ ctx[5]]) + " svelte-1ealj29"));
    			add_location(span, file$2, 51, 40, 2452);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t_value !== (t_value = /*honor*/ ctx[5] + "")) set_data_dev(t, t_value);

    			if (dirty & /*colorMap, modalData*/ 6 && span_class_value !== (span_class_value = "" + (null_to_empty("chip " + /*colorMap*/ ctx[2][/*honor*/ ctx[5]]) + " svelte-1ealj29"))) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(51:36) {#each modalData.honors ? modalData.honors : [] as honor}",
    		ctx
    	});

    	return block;
    }

    // (59:36) {#each modalData.location ? modalData.location : [] as honor}
    function create_each_block_1$1(ctx) {
    	let span;
    	let t_value = /*honor*/ ctx[5] + "";
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty("chip " + /*colorMap*/ ctx[2][/*honor*/ ctx[5]]) + " svelte-1ealj29"));
    			add_location(span, file$2, 59, 40, 2928);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t_value !== (t_value = /*honor*/ ctx[5] + "")) set_data_dev(t, t_value);

    			if (dirty & /*colorMap, modalData*/ 6 && span_class_value !== (span_class_value = "" + (null_to_empty("chip " + /*colorMap*/ ctx[2][/*honor*/ ctx[5]]) + " svelte-1ealj29"))) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(59:36) {#each modalData.location ? modalData.location : [] as honor}",
    		ctx
    	});

    	return block;
    }

    // (67:36) {#each modalData.floorplan ? modalData.floorplan : [] as honor}
    function create_each_block$1(ctx) {
    	let span;
    	let t_value = /*honor*/ ctx[5] + "";
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty("chip " + /*colorMap*/ ctx[2][/*honor*/ ctx[5]]) + " svelte-1ealj29"));
    			add_location(span, file$2, 67, 40, 3407);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t_value !== (t_value = /*honor*/ ctx[5] + "")) set_data_dev(t, t_value);

    			if (dirty & /*colorMap, modalData*/ 6 && span_class_value !== (span_class_value = "" + (null_to_empty("chip " + /*colorMap*/ ctx[2][/*honor*/ ctx[5]]) + " svelte-1ealj29"))) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(67:36) {#each modalData.floorplan ? modalData.floorplan : [] as honor}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let div7;
    	let div0;
    	let t0;
    	let div6;
    	let div3;
    	let div1;
    	let t1;
    	let div2;

    	let t2_value = (/*modalData*/ ctx[1]
    	? /*modalData*/ ctx[1].first_name + " " + /*modalData*/ ctx[1].last_name
    	: "") + "";

    	let t2;
    	let t3;
    	let div5;
    	let div4;
    	let div7_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*modalData*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div7 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div6 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div5 = element("div");
    			div4 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "modal-overlay");
    			attr_dev(div0, "aria-label", "Close");
    			add_location(div0, file$2, 8, 8, 173);
    			attr_dev(div1, "class", "btn btn-clear float-right");
    			attr_dev(div1, "aria-label", "Close");
    			add_location(div1, file$2, 17, 16, 422);
    			attr_dev(div2, "class", "modal-title h5");
    			add_location(div2, file$2, 24, 16, 654);
    			attr_dev(div3, "class", "modal-header");
    			add_location(div3, file$2, 16, 12, 379);
    			attr_dev(div4, "class", "content text-left");
    			add_location(div4, file$2, 31, 16, 914);
    			attr_dev(div5, "class", "modal-body");
    			add_location(div5, file$2, 30, 12, 873);
    			attr_dev(div6, "class", "modal-container");
    			add_location(div6, file$2, 15, 8, 337);
    			attr_dev(div7, "class", div7_class_value = "" + (null_to_empty("modal " + (/*open*/ ctx[0] ? "active" : "")) + " svelte-1ealj29"));
    			attr_dev(div7, "id", "modal-id");
    			add_location(div7, file$2, 7, 4, 103);
    			add_location(main, file$2, 6, 0, 92);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div7);
    			append_dev(div7, div0);
    			append_dev(div7, t0);
    			append_dev(div7, div6);
    			append_dev(div6, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, t2);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			if (if_block) if_block.m(div4, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*modalData*/ 2 && t2_value !== (t2_value = (/*modalData*/ ctx[1]
    			? /*modalData*/ ctx[1].first_name + " " + /*modalData*/ ctx[1].last_name
    			: "") + "")) set_data_dev(t2, t2_value);

    			if (/*modalData*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*open*/ 1 && div7_class_value !== (div7_class_value = "" + (null_to_empty("modal " + (/*open*/ ctx[0] ? "active" : "")) + " svelte-1ealj29"))) {
    				attr_dev(div7, "class", div7_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
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
    	validate_slots("MoreInfoModal", slots, []);
    	var { open } = $$props;
    	var { modalData } = $$props;
    	var { colorMap } = $$props;
    	const writable_props = ["open", "modalData", "colorMap"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MoreInfoModal> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, open = false);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, open = false);
    	};

    	$$self.$$set = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("modalData" in $$props) $$invalidate(1, modalData = $$props.modalData);
    		if ("colorMap" in $$props) $$invalidate(2, colorMap = $$props.colorMap);
    	};

    	$$self.$capture_state = () => ({ open, modalData, colorMap });

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("modalData" in $$props) $$invalidate(1, modalData = $$props.modalData);
    		if ("colorMap" in $$props) $$invalidate(2, colorMap = $$props.colorMap);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [open, modalData, colorMap, click_handler, click_handler_1];
    }

    class MoreInfoModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { open: 0, modalData: 1, colorMap: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MoreInfoModal",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*open*/ ctx[0] === undefined && !("open" in props)) {
    			console.warn("<MoreInfoModal> was created without expected prop 'open'");
    		}

    		if (/*modalData*/ ctx[1] === undefined && !("modalData" in props)) {
    			console.warn("<MoreInfoModal> was created without expected prop 'modalData'");
    		}

    		if (/*colorMap*/ ctx[2] === undefined && !("colorMap" in props)) {
    			console.warn("<MoreInfoModal> was created without expected prop 'colorMap'");
    		}
    	}

    	get open() {
    		throw new Error("<MoreInfoModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<MoreInfoModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalData() {
    		throw new Error("<MoreInfoModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalData(value) {
    		throw new Error("<MoreInfoModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colorMap() {
    		throw new Error("<MoreInfoModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colorMap(value) {
    		throw new Error("<MoreInfoModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TableView.svelte generated by Svelte v3.35.0 */
    const file$1 = "src/TableView.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (36:16) {#if studentData != null}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*studentData*/ ctx[0].students;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData, studentData, modalOpen, colorMap*/ 15) {
    				each_value = /*studentData*/ ctx[0].students;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(36:16) {#if studentData != null}",
    		ctx
    	});

    	return block;
    }

    // (62:32) {#each student.honors as honor}
    function create_each_block_3(ctx) {
    	let span;
    	let t_value = /*honor*/ ctx[15] + "";
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty("chip " + /*colorMap*/ ctx[3][/*honor*/ ctx[15]]) + " svelte-1ealj29"));
    			add_location(span, file$1, 62, 36, 2466);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*studentData*/ 1 && t_value !== (t_value = /*honor*/ ctx[15] + "")) set_data_dev(t, t_value);

    			if (dirty & /*studentData*/ 1 && span_class_value !== (span_class_value = "" + (null_to_empty("chip " + /*colorMap*/ ctx[3][/*honor*/ ctx[15]]) + " svelte-1ealj29"))) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(62:32) {#each student.honors as honor}",
    		ctx
    	});

    	return block;
    }

    // (69:32) {#each student.location as location}
    function create_each_block_2(ctx) {
    	let span;
    	let t_value = /*location*/ ctx[12] + "";
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty("chip " + /*colorMap*/ ctx[3][/*location*/ ctx[12]]) + " svelte-1ealj29"));
    			add_location(span, file$1, 69, 36, 2811);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*studentData*/ 1 && t_value !== (t_value = /*location*/ ctx[12] + "")) set_data_dev(t, t_value);

    			if (dirty & /*studentData*/ 1 && span_class_value !== (span_class_value = "" + (null_to_empty("chip " + /*colorMap*/ ctx[3][/*location*/ ctx[12]]) + " svelte-1ealj29"))) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(69:32) {#each student.location as location}",
    		ctx
    	});

    	return block;
    }

    // (76:32) {#each student.floorplan as floorplan}
    function create_each_block_1(ctx) {
    	let span;
    	let t_value = /*floorplan*/ ctx[9] + "";
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty("chip " + /*colorMap*/ ctx[3][/*floorplan*/ ctx[9]]) + " svelte-1ealj29"));
    			add_location(span, file$1, 76, 36, 3164);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*studentData*/ 1 && t_value !== (t_value = /*floorplan*/ ctx[9] + "")) set_data_dev(t, t_value);

    			if (dirty & /*studentData*/ 1 && span_class_value !== (span_class_value = "" + (null_to_empty("chip " + /*colorMap*/ ctx[3][/*floorplan*/ ctx[9]]) + " svelte-1ealj29"))) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(76:32) {#each student.floorplan as floorplan}",
    		ctx
    	});

    	return block;
    }

    // (37:20) {#each studentData.students as student}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*student*/ ctx[6].first_name.slice(0, 27) + (/*student*/ ctx[6].first_name.length > 27 ? "... " : " ") + /*student*/ ctx[6].last_name.slice(0, 27) + (/*student*/ ctx[6].last_name.length > 27 ? "... " : " ") + "";
    	let t0;
    	let td0_data_tooltip_value;
    	let t1;
    	let td1;
    	let t2_value = /*student*/ ctx[6].college_name.slice(0, 27) + (/*student*/ ctx[6].college_name.length > 27 ? "..." : "") + "";
    	let t2;
    	let td1_data_tooltip_value;
    	let t3;
    	let td2;
    	let t4;
    	let td3;
    	let t5;
    	let td4;
    	let t6;
    	let td5;
    	let button;
    	let i;
    	let t7;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*student*/ ctx[6].honors;
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*student*/ ctx[6].location;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*student*/ ctx[6].floorplan;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[5](/*student*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t4 = space();
    			td3 = element("td");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t5 = space();
    			td4 = element("td");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			td5 = element("td");
    			button = element("button");
    			i = element("i");
    			t7 = space();
    			attr_dev(td0, "class", "tooltip");
    			attr_dev(td0, "data-tooltip", td0_data_tooltip_value = /*student*/ ctx[6].first_name + " " + /*student*/ ctx[6].last_name);
    			add_location(td0, file$1, 38, 28, 1199);
    			attr_dev(td1, "class", "tooltip");
    			attr_dev(td1, "data-tooltip", td1_data_tooltip_value = /*student*/ ctx[6].college_name);
    			add_location(td1, file$1, 52, 28, 1944);
    			add_location(td2, file$1, 60, 28, 2361);
    			add_location(td3, file$1, 67, 28, 2701);
    			add_location(td4, file$1, 74, 28, 3052);
    			attr_dev(i, "class", "icon icon-more-horiz");
    			add_location(i, file$1, 88, 37, 3770);
    			attr_dev(button, "class", "btn btn-primary s-circle");
    			add_location(button, file$1, 82, 32, 3444);
    			add_location(td5, file$1, 81, 28, 3407);
    			add_location(tr, file$1, 37, 24, 1166);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(td2, null);
    			}

    			append_dev(tr, t4);
    			append_dev(tr, td3);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(td3, null);
    			}

    			append_dev(tr, t5);
    			append_dev(tr, td4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td4, null);
    			}

    			append_dev(tr, t6);
    			append_dev(tr, td5);
    			append_dev(td5, button);
    			append_dev(button, i);
    			append_dev(tr, t7);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*studentData*/ 1 && t0_value !== (t0_value = /*student*/ ctx[6].first_name.slice(0, 27) + (/*student*/ ctx[6].first_name.length > 27 ? "... " : " ") + /*student*/ ctx[6].last_name.slice(0, 27) + (/*student*/ ctx[6].last_name.length > 27 ? "... " : " ") + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*studentData*/ 1 && td0_data_tooltip_value !== (td0_data_tooltip_value = /*student*/ ctx[6].first_name + " " + /*student*/ ctx[6].last_name)) {
    				attr_dev(td0, "data-tooltip", td0_data_tooltip_value);
    			}

    			if (dirty & /*studentData*/ 1 && t2_value !== (t2_value = /*student*/ ctx[6].college_name.slice(0, 27) + (/*student*/ ctx[6].college_name.length > 27 ? "..." : "") + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*studentData*/ 1 && td1_data_tooltip_value !== (td1_data_tooltip_value = /*student*/ ctx[6].college_name)) {
    				attr_dev(td1, "data-tooltip", td1_data_tooltip_value);
    			}

    			if (dirty & /*colorMap, studentData*/ 9) {
    				each_value_3 = /*student*/ ctx[6].honors;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(td2, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_3.length;
    			}

    			if (dirty & /*colorMap, studentData*/ 9) {
    				each_value_2 = /*student*/ ctx[6].location;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(td3, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*colorMap, studentData*/ 9) {
    				each_value_1 = /*student*/ ctx[6].floorplan;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(td4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(37:20) {#each studentData.students as student}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let moreinfomodal;
    	let updating_open;
    	let t0;
    	let div;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t2;
    	let th1;
    	let t4;
    	let th2;
    	let t6;
    	let th3;
    	let t8;
    	let th4;
    	let t10;
    	let th5;
    	let t12;
    	let tbody;
    	let current;

    	function moreinfomodal_open_binding(value) {
    		/*moreinfomodal_open_binding*/ ctx[4](value);
    	}

    	let moreinfomodal_props = {
    		modalData: /*modalData*/ ctx[2],
    		colorMap: /*colorMap*/ ctx[3]
    	};

    	if (/*modalOpen*/ ctx[1] !== void 0) {
    		moreinfomodal_props.open = /*modalOpen*/ ctx[1];
    	}

    	moreinfomodal = new MoreInfoModal({
    			props: moreinfomodal_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(moreinfomodal, "open", moreinfomodal_open_binding));
    	let if_block = /*studentData*/ ctx[0] != null && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(moreinfomodal.$$.fragment);
    			t0 = space();
    			div = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Name";
    			t2 = space();
    			th1 = element("th");
    			th1.textContent = "College Name";
    			t4 = space();
    			th2 = element("th");
    			th2.textContent = "Honors Housing";
    			t6 = space();
    			th3 = element("th");
    			th3.textContent = "Preferred Locations";
    			t8 = space();
    			th4 = element("th");
    			th4.textContent = "Preferred Room Floorplans";
    			t10 = space();
    			th5 = element("th");
    			th5.textContent = "More";
    			t12 = space();
    			tbody = element("tbody");
    			if (if_block) if_block.c();
    			add_location(th0, file$1, 26, 20, 739);
    			add_location(th1, file$1, 27, 20, 773);
    			add_location(th2, file$1, 28, 20, 815);
    			add_location(th3, file$1, 29, 20, 859);
    			add_location(th4, file$1, 30, 20, 908);
    			add_location(th5, file$1, 31, 20, 963);
    			add_location(tr, file$1, 25, 16, 714);
    			add_location(thead, file$1, 24, 12, 690);
    			add_location(tbody, file$1, 34, 12, 1032);
    			attr_dev(table, "class", "table table-striped");
    			add_location(table, file$1, 23, 8, 642);
    			attr_dev(div, "class", "column col-12 col-mx-auto");
    			add_location(div, file$1, 22, 4, 594);
    			add_location(main, file$1, 20, 0, 516);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(moreinfomodal, main, null);
    			append_dev(main, t0);
    			append_dev(main, div);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t2);
    			append_dev(tr, th1);
    			append_dev(tr, t4);
    			append_dev(tr, th2);
    			append_dev(tr, t6);
    			append_dev(tr, th3);
    			append_dev(tr, t8);
    			append_dev(tr, th4);
    			append_dev(tr, t10);
    			append_dev(tr, th5);
    			append_dev(table, t12);
    			append_dev(table, tbody);
    			if (if_block) if_block.m(tbody, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const moreinfomodal_changes = {};
    			if (dirty & /*modalData*/ 4) moreinfomodal_changes.modalData = /*modalData*/ ctx[2];

    			if (!updating_open && dirty & /*modalOpen*/ 2) {
    				updating_open = true;
    				moreinfomodal_changes.open = /*modalOpen*/ ctx[1];
    				add_flush_callback(() => updating_open = false);
    			}

    			moreinfomodal.$set(moreinfomodal_changes);

    			if (/*studentData*/ ctx[0] != null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(tbody, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(moreinfomodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(moreinfomodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(moreinfomodal);
    			if (if_block) if_block.d();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TableView", slots, []);
    	var { studentData } = $$props;

    	const colorMap = {
    		Honors: "green",
    		"Non-Honors": "blue",
    		"Not Applicable": "red",
    		"On-Campus": "purple",
    		"Off-Campus": "pink",
    		"Shared Room and Bathroom": "green",
    		"Connected Bathroom": "blue",
    		"Communal Bathroom": "pink",
    		"Private Bathrooms": "purple",
    		Other: "red"
    	};

    	var modalOpen = false;
    	var modalData = {};
    	const writable_props = ["studentData"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TableView> was created with unknown prop '${key}'`);
    	});

    	function moreinfomodal_open_binding(value) {
    		modalOpen = value;
    		$$invalidate(1, modalOpen);
    	}

    	const click_handler = student => {
    		$$invalidate(2, modalData = student);
    		$$invalidate(1, modalOpen = true);
    	};

    	$$self.$$set = $$props => {
    		if ("studentData" in $$props) $$invalidate(0, studentData = $$props.studentData);
    	};

    	$$self.$capture_state = () => ({
    		MoreInfoModal,
    		studentData,
    		colorMap,
    		modalOpen,
    		modalData
    	});

    	$$self.$inject_state = $$props => {
    		if ("studentData" in $$props) $$invalidate(0, studentData = $$props.studentData);
    		if ("modalOpen" in $$props) $$invalidate(1, modalOpen = $$props.modalOpen);
    		if ("modalData" in $$props) $$invalidate(2, modalData = $$props.modalData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		studentData,
    		modalOpen,
    		modalData,
    		colorMap,
    		moreinfomodal_open_binding,
    		click_handler
    	];
    }

    class TableView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { studentData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableView",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*studentData*/ ctx[0] === undefined && !("studentData" in props)) {
    			console.warn("<TableView> was created without expected prop 'studentData'");
    		}
    	}

    	get studentData() {
    		throw new Error("<TableView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set studentData(value) {
    		throw new Error("<TableView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.35.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (131:2) {#if page == "signin"}
    function create_if_block_3(ctx) {
    	let login;
    	let updating_signedIn;
    	let current;

    	function login_signedIn_binding(value) {
    		/*login_signedIn_binding*/ ctx[5](value);
    	}

    	let login_props = {};

    	if (/*signedIn*/ ctx[1] !== void 0) {
    		login_props.signedIn = /*signedIn*/ ctx[1];
    	}

    	login = new Login({ props: login_props, $$inline: true });
    	binding_callbacks.push(() => bind(login, "signedIn", login_signedIn_binding));

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const login_changes = {};

    			if (!updating_signedIn && dirty & /*signedIn*/ 2) {
    				updating_signedIn = true;
    				login_changes.signedIn = /*signedIn*/ ctx[1];
    				add_flush_callback(() => updating_signedIn = false);
    			}

    			login.$set(login_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(131:2) {#if page == \\\"signin\\\"}",
    		ctx
    	});

    	return block;
    }

    // (134:2) {#if page == "profile"}
    function create_if_block_2(ctx) {
    	let dataform;
    	let updating_profileData;
    	let current;

    	function dataform_profileData_binding(value) {
    		/*dataform_profileData_binding*/ ctx[6](value);
    	}

    	let dataform_props = {
    		whenDone: updateProfileData,
    		sessionToken: /*sessionToken*/ ctx[2]
    	};

    	if (/*profileData*/ ctx[3] !== void 0) {
    		dataform_props.profileData = /*profileData*/ ctx[3];
    	}

    	dataform = new DataForm({ props: dataform_props, $$inline: true });
    	binding_callbacks.push(() => bind(dataform, "profileData", dataform_profileData_binding));

    	const block = {
    		c: function create() {
    			create_component(dataform.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dataform, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dataform_changes = {};
    			if (dirty & /*sessionToken*/ 4) dataform_changes.sessionToken = /*sessionToken*/ ctx[2];

    			if (!updating_profileData && dirty & /*profileData*/ 8) {
    				updating_profileData = true;
    				dataform_changes.profileData = /*profileData*/ ctx[3];
    				add_flush_callback(() => updating_profileData = false);
    			}

    			dataform.$set(dataform_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dataform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dataform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dataform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(134:2) {#if page == \\\"profile\\\"}",
    		ctx
    	});

    	return block;
    }

    // (141:2) {#if page == "search"}
    function create_if_block_1(ctx) {
    	let tableview;
    	let current;

    	tableview = new TableView({
    			props: { studentData: /*studentData*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tableview.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tableview, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableview_changes = {};
    			if (dirty & /*studentData*/ 16) tableview_changes.studentData = /*studentData*/ ctx[4];
    			tableview.$set(tableview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tableview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tableview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tableview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(141:2) {#if page == \\\"search\\\"}",
    		ctx
    	});

    	return block;
    }

    // (144:2) {#if page != "signin"}
    function create_if_block(ctx) {
    	let signout;
    	let updating_signedIn;
    	let updating_page;
    	let current;

    	function signout_signedIn_binding(value) {
    		/*signout_signedIn_binding*/ ctx[7](value);
    	}

    	function signout_page_binding(value) {
    		/*signout_page_binding*/ ctx[8](value);
    	}

    	let signout_props = {};

    	if (/*signedIn*/ ctx[1] !== void 0) {
    		signout_props.signedIn = /*signedIn*/ ctx[1];
    	}

    	if (/*page*/ ctx[0] !== void 0) {
    		signout_props.page = /*page*/ ctx[0];
    	}

    	signout = new SignOut({ props: signout_props, $$inline: true });
    	binding_callbacks.push(() => bind(signout, "signedIn", signout_signedIn_binding));
    	binding_callbacks.push(() => bind(signout, "page", signout_page_binding));

    	const block = {
    		c: function create() {
    			create_component(signout.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(signout, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const signout_changes = {};

    			if (!updating_signedIn && dirty & /*signedIn*/ 2) {
    				updating_signedIn = true;
    				signout_changes.signedIn = /*signedIn*/ ctx[1];
    				add_flush_callback(() => updating_signedIn = false);
    			}

    			if (!updating_page && dirty & /*page*/ 1) {
    				updating_page = true;
    				signout_changes.page = /*page*/ ctx[0];
    				add_flush_callback(() => updating_page = false);
    			}

    			signout.$set(signout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(signout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(signout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(signout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(144:2) {#if page != \\\"signin\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;
    	let if_block0 = /*page*/ ctx[0] == "signin" && create_if_block_3(ctx);
    	let if_block1 = /*page*/ ctx[0] == "profile" && create_if_block_2(ctx);
    	let if_block2 = /*page*/ ctx[0] == "search" && create_if_block_1(ctx);
    	let if_block3 = /*page*/ ctx[0] != "signin" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Roomie";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(h1, "class", "column svelte-1elvtut");
    			add_location(h1, file, 128, 3, 2979);
    			attr_dev(div0, "class", "columns");
    			add_location(div0, file, 127, 2, 2954);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file, 126, 1, 2928);
    			attr_dev(main, "class", "svelte-1elvtut");
    			add_location(main, file, 125, 0, 2920);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div1, t1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t2);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t3);
    			if (if_block2) if_block2.m(div1, null);
    			append_dev(div1, t4);
    			if (if_block3) if_block3.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*page*/ ctx[0] == "signin") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*page*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*page*/ ctx[0] == "profile") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*page*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*page*/ ctx[0] == "search") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*page*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div1, t4);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*page*/ ctx[0] != "signin") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*page*/ 1) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div1, null);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
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

    function updateProfileData(sessionToken, profileData) {
    	console.log("sending updated data");

    	fetch("./student?token=" + sessionToken, {
    		method: "POST",
    		headers: { "Content-Type": "application/json" },
    		body: JSON.stringify(profileData)
    	}).then(response => response.json()).then(data => console.log(data));
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let signedIn = null;
    	let sessionToken = "";
    	let page = "signin";

    	var template = {
    		first_name: "",
    		last_name: "",
    		college_name: "",
    		discord: "",
    		linkedin: "",
    		snapchat: "",
    		instagram: "",
    		facebook: "",
    		twitter: "",
    		email: "",
    		phone: "",
    		honors: [],
    		location: [],
    		floorplan: [],
    		additional: ""
    	};

    	var profileData = template;

    	var studentData = {
    		students: [
    			{
    				first_name: "Barack",
    				last_name: "Obama",
    				college_name: "UT Austin, University of Texas Austin, University of Texas at Austin",
    				honors: ["Honors", "Non-Honors"],
    				location: ["On-Campus"],
    				floorplan: [
    					"Shared Room and Bathroom",
    					"Connected Bathroom",
    					"Private Bathrooms",
    					"Communal Bathroom"
    				]
    			},
    			{
    				first_name: "Donaldino",
    				last_name: "Trumperino",
    				college_name: "A&M",
    				honors: ["Honors", "Non-Honors"],
    				location: ["On-Campus"],
    				floorplan: ["Shared Room and Bathroom", "Connected Bathroom", "Private Bathrooms"]
    			}
    		]
    	};

    	window.onSignIn = googleUser => {
    		const profile = googleUser.getBasicProfile();
    		console.log("ID: " + profile.getId());
    		console.log("Image URL: " + profile.getImageUrl());
    		console.log("Email: " + profile.getEmail());
    		console.log("ID Token: " + googleUser.getAuthResponse().id_token);
    		$$invalidate(1, signedIn = true);

    		$$invalidate(0, page = localStorage.getItem("page")
    		? localStorage.getItem("page")
    		: "profile");

    		fetch("./auth", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				oauth_token_id: googleUser.getAuthResponse().id_token
    			})
    		}).then(response => response.json()).then(data => {
    			$$invalidate(2, sessionToken = data.jwt_token);
    			console.log(data);
    			window.getStudentData(sessionToken);
    		});
    	};

    	window.signOut = () => {
    		var auth2 = gapi.auth2.getAuthInstance();

    		auth2.signOut().then(function () {
    			console.log("User signed out.");
    			$$invalidate(1, signedIn = false);
    			$$invalidate(0, page = "signin");
    		});
    	};

    	window.getStudentData = session_token => {
    		console.log(session_token);

    		fetch("./student?token=" + session_token).then(response => response.json()).then(data => {
    			if (data != null) {
    				console.log(data);
    				$$invalidate(4, studentData = data);
    				$$invalidate(3, profileData = data.current_student);
    			}
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function login_signedIn_binding(value) {
    		signedIn = value;
    		$$invalidate(1, signedIn);
    	}

    	function dataform_profileData_binding(value) {
    		profileData = value;
    		$$invalidate(3, profileData);
    	}

    	function signout_signedIn_binding(value) {
    		signedIn = value;
    		$$invalidate(1, signedIn);
    	}

    	function signout_page_binding(value) {
    		page = value;
    		$$invalidate(0, page);
    	}

    	$$self.$capture_state = () => ({
    		DataForm,
    		Login,
    		SignOut,
    		TableView,
    		signedIn,
    		sessionToken,
    		page,
    		template,
    		profileData,
    		studentData,
    		updateProfileData
    	});

    	$$self.$inject_state = $$props => {
    		if ("signedIn" in $$props) $$invalidate(1, signedIn = $$props.signedIn);
    		if ("sessionToken" in $$props) $$invalidate(2, sessionToken = $$props.sessionToken);
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("template" in $$props) template = $$props.template;
    		if ("profileData" in $$props) $$invalidate(3, profileData = $$props.profileData);
    		if ("studentData" in $$props) $$invalidate(4, studentData = $$props.studentData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*page*/ 1) {
    			{
    				if (page != "signin") {
    					localStorage.setItem("page", page);
    				}
    			}
    		}
    	};

    	return [
    		page,
    		signedIn,
    		sessionToken,
    		profileData,
    		studentData,
    		login_signedIn_binding,
    		dataform_profileData_binding,
    		signout_signedIn_binding,
    		signout_page_binding
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

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
