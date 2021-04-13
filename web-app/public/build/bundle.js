
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
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

    /* src/ProfileImageSelector.svelte generated by Svelte v3.37.0 */

    const { console: console_1$4 } = globals;
    const file$7 = "src/ProfileImageSelector.svelte";

    // (112:8) {#if changed}
    function create_if_block_1$3(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Save";
    			attr_dev(button, "class", "btn button-secondary");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$7, 112, 12, 3462);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(112:8) {#if changed}",
    		ctx
    	});

    	return block;
    }

    // (115:8) {#if showSaved}
    function create_if_block$4(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Saved";
    			attr_dev(span, "class", "text-gray");
    			add_location(span, file$7, 115, 12, 3577);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(115:8) {#if showSaved}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let main;
    	let form_1;
    	let label;
    	let canvas;
    	let t1;
    	let input;
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;
    	let if_block0 = /*changed*/ ctx[0] && create_if_block_1$3(ctx);
    	let if_block1 = /*showSaved*/ ctx[1] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			form_1 = element("form");
    			label = element("label");
    			canvas = element("canvas");
    			canvas.textContent = "...";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(canvas, "id", "canvas");
    			attr_dev(canvas, "width", "256");
    			attr_dev(canvas, "height", "256");
    			attr_dev(canvas, "class", "svelte-ug54ud");
    			add_location(canvas, file$7, 98, 13, 3098);
    			attr_dev(label, "for", "image");
    			add_location(label, file$7, 97, 8, 3066);
    			set_style(input, "display", "none");
    			attr_dev(input, "id", "image");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "name", "file");
    			attr_dev(input, "accept", "image/*");
    			add_location(input, file$7, 103, 8, 3235);
    			attr_dev(form_1, "class", "col-12 col-mx-auto");
    			attr_dev(form_1, "id", "pfp");
    			attr_dev(form_1, "target", "/");
    			attr_dev(form_1, "method", "post");
    			attr_dev(form_1, "enctype", "multipart/form-data");
    			add_location(form_1, file$7, 89, 4, 2884);
    			add_location(main, file$7, 88, 0, 2873);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, form_1);
    			append_dev(form_1, label);
    			append_dev(label, canvas);
    			append_dev(form_1, t1);
    			append_dev(form_1, input);
    			append_dev(form_1, t2);
    			if (if_block0) if_block0.m(form_1, null);
    			append_dev(form_1, t3);
    			if (if_block1) if_block1.m(form_1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(canvas, "show", /*canvasLoaded*/ ctx[2], false, false, false),
    					listen_dev(input, "change", /*imageUploadChange*/ ctx[3], false, false, false),
    					listen_dev(form_1, "submit", /*formSubmit*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*changed*/ ctx[0]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(form_1, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*showSaved*/ ctx[1]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					if_block1.m(form_1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
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

    function getRandomInt$1(max) {
    	return Math.floor(Math.random() * max);
    }

    function draw() {
    	var canvas = document.getElementById("canvas");
    	var ctx = canvas.getContext("2d");

    	let new_width = this.height >= this.width
    	? canvas.width
    	: this.width / this.height * canvas.width;

    	let new_height = this.width >= this.height
    	? canvas.height
    	: this.height / this.width * canvas.height;

    	let x_offset = this.height >= this.width
    	? 0
    	: -0.5 * (new_width - new_height);

    	let y_offset = this.width >= this.height
    	? 0
    	: -0.5 * (new_height - new_width);

    	ctx.drawImage(this, x_offset, y_offset, new_width, new_height);
    }

    function failed(e) {
    	console.error("The provided file couldn't be loaded as an Image media");
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProfileImageSelector", slots, []);
    	var { sessionToken } = $$props;
    	var { profileData } = $$props;
    	let changed = false;
    	let showSaved = false;
    	let form = document.getElementById("pfp");

    	function canvasLoaded() {
    		var img = new Image();
    		img.onload = draw;
    		img.onerror = failed;

    		if (profileData.sub == "") {
    			setTimeout(
    				() => {
    					img.src = "./images/" + profileData.sub + ".jpeg?v=" + getRandomInt$1(10000);
    				},
    				500
    			);
    		} else {
    			img.src = "./images/" + profileData.sub + ".jpeg?v=" + getRandomInt$1(10000);
    		}
    	}

    	onMount(canvasLoaded);

    	function imageUploadChange(e) {
    		var img = new Image();
    		img.onload = draw;
    		img.onerror = e => failed();
    		img.src = URL.createObjectURL(this.files[0]);
    		$$invalidate(0, changed = true);
    	}

    	function sendImage(token) {
    		return function (blob) {
    			let formData = new FormData();
    			formData.append("file", blob);

    			fetch("./profile_image?token=" + token, { method: "POST", body: formData }).then(response => response.text()).then(data => {
    				console.log(data);
    				$$invalidate(1, showSaved = true);
    				console.log(showSaved);
    				setTimeout(() => $$invalidate(1, showSaved = false), 3000);
    			});
    		};
    	}

    	function formSubmit(event) {
    		event.preventDefault();

    		if (changed) {
    			$$invalidate(0, changed = false);
    			let canvas = document.getElementById("canvas");
    			canvas.getContext("2d");
    			console.log("evecat");
    			canvas.toBlob(sendImage(sessionToken), "image/jpeg", 0.8);
    		}
    	}

    	const writable_props = ["sessionToken", "profileData"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<ProfileImageSelector> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("sessionToken" in $$props) $$invalidate(5, sessionToken = $$props.sessionToken);
    		if ("profileData" in $$props) $$invalidate(6, profileData = $$props.profileData);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		sessionToken,
    		profileData,
    		changed,
    		showSaved,
    		getRandomInt: getRandomInt$1,
    		form,
    		canvasLoaded,
    		imageUploadChange,
    		draw,
    		failed,
    		sendImage,
    		formSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ("sessionToken" in $$props) $$invalidate(5, sessionToken = $$props.sessionToken);
    		if ("profileData" in $$props) $$invalidate(6, profileData = $$props.profileData);
    		if ("changed" in $$props) $$invalidate(0, changed = $$props.changed);
    		if ("showSaved" in $$props) $$invalidate(1, showSaved = $$props.showSaved);
    		if ("form" in $$props) form = $$props.form;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		changed,
    		showSaved,
    		canvasLoaded,
    		imageUploadChange,
    		formSubmit,
    		sessionToken,
    		profileData
    	];
    }

    class ProfileImageSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { sessionToken: 5, profileData: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProfileImageSelector",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*sessionToken*/ ctx[5] === undefined && !("sessionToken" in props)) {
    			console_1$4.warn("<ProfileImageSelector> was created without expected prop 'sessionToken'");
    		}

    		if (/*profileData*/ ctx[6] === undefined && !("profileData" in props)) {
    			console_1$4.warn("<ProfileImageSelector> was created without expected prop 'profileData'");
    		}
    	}

    	get sessionToken() {
    		throw new Error("<ProfileImageSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sessionToken(value) {
    		throw new Error("<ProfileImageSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get profileData() {
    		throw new Error("<ProfileImageSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set profileData(value) {
    		throw new Error("<ProfileImageSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/DataForm.svelte generated by Svelte v3.37.0 */
    const file$6 = "src/DataForm.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	return child_ctx;
    }

    // (96:28) {#each genderOptions as genderOption}
    function create_each_block_3(ctx) {
    	let option;
    	let t_value = /*genderOption*/ ctx[35] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*genderOption*/ ctx[35];
    			option.value = option.__value;
    			add_location(option, file$6, 96, 32, 3636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(96:28) {#each genderOptions as genderOption}",
    		ctx
    	});

    	return block;
    }

    // (112:28) {#each classYearOptions as classYearOption}
    function create_each_block_2(ctx) {
    	let option;
    	let t_value = /*classYearOption*/ ctx[32] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*classYearOption*/ ctx[32];
    			option.value = option.__value;
    			add_location(option, file$6, 112, 32, 4366);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(112:28) {#each classYearOptions as classYearOption}",
    		ctx
    	});

    	return block;
    }

    // (128:28) {#each collegeOptions as collegeOption}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*collegeOption*/ ctx[29] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*collegeOption*/ ctx[29];
    			option.value = option.__value;
    			add_location(option, file$6, 128, 32, 5123);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(128:28) {#each collegeOptions as collegeOption}",
    		ctx
    	});

    	return block;
    }

    // (295:28) {#each locationOptions as locationOption}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*locationOption*/ ctx[26] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*locationOption*/ ctx[26];
    			option.value = option.__value;
    			add_location(option, file$6, 295, 32, 12852);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(295:28) {#each locationOptions as locationOption}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let profileimageselector;
    	let t2;
    	let div37;
    	let div2;
    	let p0;
    	let t4;
    	let div36;
    	let div35;
    	let div5;
    	let div3;
    	let label0;
    	let t6;
    	let input0;
    	let t7;
    	let div4;
    	let label1;
    	let t9;
    	let input1;
    	let t10;
    	let div8;
    	let div6;
    	let label2;
    	let t12;
    	let select0;
    	let t13;
    	let div7;
    	let label3;
    	let t15;
    	let select1;
    	let t16;
    	let div11;
    	let div9;
    	let label4;
    	let t18;
    	let select2;
    	let t19;
    	let div10;
    	let label5;
    	let t21;
    	let input2;
    	let t22;
    	let div16;
    	let div12;
    	let h30;
    	let t24;
    	let div13;
    	let p1;
    	let t26;
    	let div15;
    	let div14;
    	let textarea;
    	let t27;
    	let div27;
    	let div17;
    	let h31;
    	let t29;
    	let div18;
    	let p2;
    	let t31;
    	let div19;
    	let label6;
    	let t33;
    	let input3;
    	let t34;
    	let div20;
    	let label7;
    	let t36;
    	let input4;
    	let t37;
    	let div21;
    	let label8;
    	let t39;
    	let input5;
    	let t40;
    	let div22;
    	let label9;
    	let t42;
    	let input6;
    	let t43;
    	let div23;
    	let label10;
    	let t45;
    	let input7;
    	let t46;
    	let div24;
    	let label11;
    	let t48;
    	let input8;
    	let t49;
    	let div25;
    	let label12;
    	let t51;
    	let input9;
    	let t52;
    	let div26;
    	let label13;
    	let t54;
    	let input10;
    	let t55;
    	let div30;
    	let div28;
    	let h32;
    	let t57;
    	let div29;
    	let label14;
    	let t59;
    	let select3;
    	let t60;
    	let div32;
    	let div31;
    	let label15;
    	let t62;
    	let input11;
    	let t63;
    	let div34;
    	let div33;
    	let button;
    	let t64_value = (/*showSaved*/ ctx[3] ? "Saved" : "Save") + "";
    	let t64;
    	let current;
    	let mounted;
    	let dispose;

    	profileimageselector = new ProfileImageSelector({
    			props: {
    				sessionToken: /*sessionToken*/ ctx[2],
    				profileData: /*profileData*/ ctx[0]
    			},
    			$$inline: true
    		});

    	let each_value_3 = /*genderOptions*/ ctx[4];
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*classYearOptions*/ ctx[6];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*collegeOptions*/ ctx[5];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*locationOptions*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Edit Your Profile";
    			t1 = space();
    			create_component(profileimageselector.$$.fragment);
    			t2 = space();
    			div37 = element("div");
    			div2 = element("div");
    			p0 = element("p");
    			p0.textContent = "This is where you build the profile other students will see\n                after they sign in. You can modify it later by pressing the\n                \"Profile\" button that will appear on the top right of the page\n                when you're done. However, it's best to put in the correct\n                information as soon as you can.";
    			t4 = space();
    			div36 = element("div");
    			div35 = element("div");
    			div5 = element("div");
    			div3 = element("div");
    			label0 = element("label");
    			label0.textContent = "Preferred First Name";
    			t6 = space();
    			input0 = element("input");
    			t7 = space();
    			div4 = element("div");
    			label1 = element("label");
    			label1.textContent = "Last Name";
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			div8 = element("div");
    			div6 = element("div");
    			label2 = element("label");
    			label2.textContent = "Gender";
    			t12 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t13 = space();
    			div7 = element("div");
    			label3 = element("label");
    			label3.textContent = "Class Year";
    			t15 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t16 = space();
    			div11 = element("div");
    			div9 = element("div");
    			label4 = element("label");
    			label4.textContent = "College";
    			t18 = space();
    			select2 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t19 = space();
    			div10 = element("div");
    			label5 = element("label");
    			label5.textContent = "Major";
    			t21 = space();
    			input2 = element("input");
    			t22 = space();
    			div16 = element("div");
    			div12 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Bio";
    			t24 = space();
    			div13 = element("div");
    			p1 = element("p");
    			p1.textContent = "What do you like to do in your free time? What\n                            organizations do you want to be a part of at UT? Any\n                            Clubs? Greek Life? Video Games? Sports? What time do\n                            you like going to sleep? Anything you think a future\n                            roommate at UT would want to know, write it here!\n                            Write as much as you can so the search engine can\n                            pick it up!";
    			t26 = space();
    			div15 = element("div");
    			div14 = element("div");
    			textarea = element("textarea");
    			t27 = space();
    			div27 = element("div");
    			div17 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Contact Information";
    			t29 = space();
    			div18 = element("div");
    			p2 = element("p");
    			p2.textContent = "Enter in contact information below. Remember, this\n                            will be public available to everyone who signs into\n                            the service, so make sure you're comfortable with\n                            what you enter. Feel free to leave any of these\n                            blank, but you should have at least one way for a\n                            prospective roommate to contact you!";
    			t31 = space();
    			div19 = element("div");
    			label6 = element("label");
    			label6.textContent = "Discord Tag";
    			t33 = space();
    			input3 = element("input");
    			t34 = space();
    			div20 = element("div");
    			label7 = element("label");
    			label7.textContent = "LinkedIn Profile";
    			t36 = space();
    			input4 = element("input");
    			t37 = space();
    			div21 = element("div");
    			label8 = element("label");
    			label8.textContent = "Snapchat";
    			t39 = space();
    			input5 = element("input");
    			t40 = space();
    			div22 = element("div");
    			label9 = element("label");
    			label9.textContent = "Instagram Profile";
    			t42 = space();
    			input6 = element("input");
    			t43 = space();
    			div23 = element("div");
    			label10 = element("label");
    			label10.textContent = "Facebook Profile";
    			t45 = space();
    			input7 = element("input");
    			t46 = space();
    			div24 = element("div");
    			label11 = element("label");
    			label11.textContent = "Twitter Profile";
    			t48 = space();
    			input8 = element("input");
    			t49 = space();
    			div25 = element("div");
    			label12 = element("label");
    			label12.textContent = "Email";
    			t51 = space();
    			input9 = element("input");
    			t52 = space();
    			div26 = element("div");
    			label13 = element("label");
    			label13.textContent = "Phone Number";
    			t54 = space();
    			input10 = element("input");
    			t55 = space();
    			div30 = element("div");
    			div28 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Housing Information";
    			t57 = space();
    			div29 = element("div");
    			label14 = element("label");
    			label14.textContent = "Location";
    			t59 = space();
    			select3 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t60 = space();
    			div32 = element("div");
    			div31 = element("div");
    			label15 = element("label");
    			label15.textContent = "Prefers to...";
    			t62 = space();
    			input11 = element("input");
    			t63 = space();
    			div34 = element("div");
    			div33 = element("div");
    			button = element("button");
    			t64 = text(t64_value);
    			add_location(h1, file$6, 41, 12, 1186);
    			attr_dev(div0, "class", "column col-8 col-md-12 col-mx-auto");
    			add_location(div0, file$6, 40, 8, 1125);
    			attr_dev(div1, "class", "columns");
    			add_location(div1, file$6, 39, 4, 1095);
    			add_location(p0, file$6, 47, 12, 1392);
    			attr_dev(div2, "class", "column col-8 col-md-12 col-mx-auto");
    			add_location(div2, file$6, 46, 8, 1331);
    			attr_dev(label0, "class", "form-label");
    			attr_dev(label0, "for", "first-name");
    			add_location(label0, file$6, 59, 24, 1995);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-input");
    			attr_dev(input0, "id", "first-name");
    			add_location(input0, file$6, 62, 24, 2145);
    			attr_dev(div3, "class", "column col-6 col-sm-12");
    			add_location(div3, file$6, 58, 20, 1934);
    			attr_dev(label1, "class", "form-label");
    			attr_dev(label1, "for", "last-name");
    			add_location(label1, file$6, 70, 24, 2482);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-input");
    			attr_dev(input1, "id", "last-name");
    			add_location(input1, file$6, 73, 24, 2620);
    			attr_dev(div4, "class", "column col-6 col-sm-12");
    			add_location(div4, file$6, 69, 20, 2421);
    			attr_dev(div5, "class", "columns");
    			add_location(div5, file$6, 57, 16, 1892);
    			attr_dev(label2, "class", "form-label");
    			attr_dev(label2, "for", "gender");
    			add_location(label2, file$6, 83, 24, 3016);
    			attr_dev(select0, "class", "form-select");
    			attr_dev(select0, "id", "gender");
    			if (/*profileData*/ ctx[0].gender === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[10].call(select0));
    			add_location(select0, file$6, 90, 24, 3356);
    			attr_dev(div6, "class", "column col-6 col-sm-12");
    			add_location(div6, file$6, 82, 20, 2955);
    			attr_dev(label3, "class", "form-label");
    			attr_dev(label3, "for", "class-year");
    			add_location(label3, file$6, 103, 24, 3937);
    			attr_dev(select1, "class", "form-select");
    			attr_dev(select1, "id", "class-year");
    			if (/*profileData*/ ctx[0].class === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[11].call(select1));
    			add_location(select1, file$6, 106, 24, 4077);
    			attr_dev(div7, "class", "column col-6 col-sm-12");
    			add_location(div7, file$6, 102, 20, 3876);
    			attr_dev(div8, "class", "columns");
    			add_location(div8, file$6, 81, 16, 2913);
    			attr_dev(label4, "class", "form-label");
    			attr_dev(label4, "for", "college");
    			add_location(label4, file$6, 121, 24, 4759);
    			attr_dev(select2, "class", "form-select");
    			attr_dev(select2, "id", "college");
    			if (/*profileData*/ ctx[0].college === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[12].call(select2));
    			add_location(select2, file$6, 122, 24, 4839);
    			attr_dev(div9, "class", "column col-6 col-sm-12");
    			add_location(div9, file$6, 120, 20, 4698);
    			attr_dev(label5, "class", "form-label");
    			attr_dev(label5, "for", "Major");
    			add_location(label5, file$6, 135, 24, 5426);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "form-input");
    			attr_dev(input2, "id", "major");
    			add_location(input2, file$6, 136, 24, 5502);
    			attr_dev(div10, "class", "column col-6 col-sm-12");
    			add_location(div10, file$6, 134, 20, 5365);
    			attr_dev(div11, "class", "columns");
    			set_style(div11, "margin-top", "20px");
    			add_location(div11, file$6, 119, 16, 4631);
    			add_location(h30, file$6, 146, 24, 5900);
    			attr_dev(div12, "class", "col-12");
    			add_location(div12, file$6, 145, 20, 5855);
    			add_location(p1, file$6, 149, 24, 6005);
    			attr_dev(div13, "class", "col-12");
    			add_location(div13, file$6, 148, 20, 5960);
    			attr_dev(textarea, "class", "form-input");
    			attr_dev(textarea, "id", "bio");
    			attr_dev(textarea, "placeholder", "Bio here...");
    			attr_dev(textarea, "rows", "6");
    			add_location(textarea, file$6, 161, 28, 6707);
    			attr_dev(div14, "class", "form-group");
    			add_location(div14, file$6, 160, 24, 6654);
    			attr_dev(div15, "class", "col-12 text-left");
    			add_location(div15, file$6, 159, 20, 6599);
    			attr_dev(div16, "class", "columns");
    			set_style(div16, "margin-top", "20px");
    			add_location(div16, file$6, 144, 16, 5787);
    			add_location(h31, file$6, 173, 24, 7209);
    			attr_dev(div17, "class", "col-12");
    			add_location(div17, file$6, 172, 20, 7164);
    			add_location(p2, file$6, 176, 24, 7330);
    			attr_dev(div18, "class", "col-12");
    			add_location(div18, file$6, 175, 20, 7285);
    			attr_dev(label6, "class", "form-label");
    			attr_dev(label6, "for", "discord-contact");
    			add_location(label6, file$6, 186, 24, 7927);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", "form-input");
    			attr_dev(input3, "id", "first-name");
    			attr_dev(input3, "placeholder", "Username#0000");
    			add_location(input3, file$6, 189, 24, 8073);
    			attr_dev(div19, "class", "column col-6 col-sm-12");
    			add_location(div19, file$6, 185, 20, 7866);
    			attr_dev(label7, "class", "form-label");
    			attr_dev(label7, "for", "linkedin-contact");
    			add_location(label7, file$6, 198, 24, 8463);
    			attr_dev(input4, "type", "url");
    			attr_dev(input4, "class", "form-input");
    			attr_dev(input4, "id", "linkedin-contact");
    			attr_dev(input4, "placeholder", "https://www.linkedin.com/in/profile/");
    			add_location(input4, file$6, 201, 24, 8615);
    			attr_dev(div20, "class", "column col-6 col-sm-12");
    			add_location(div20, file$6, 197, 20, 8402);
    			attr_dev(label8, "class", "form-label");
    			attr_dev(label8, "for", "snapchat-contact");
    			add_location(label8, file$6, 210, 24, 9034);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "class", "form-input");
    			attr_dev(input5, "id", "snapchat-contact");
    			attr_dev(input5, "placeholder", "something");
    			add_location(input5, file$6, 213, 24, 9178);
    			attr_dev(div21, "class", "column col-6 col-sm-12");
    			add_location(div21, file$6, 209, 20, 8973);
    			attr_dev(label9, "class", "form-label");
    			attr_dev(label9, "for", "insta-contact");
    			add_location(label9, file$6, 222, 24, 9571);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "class", "form-input");
    			attr_dev(input6, "id", "insta-contact");
    			attr_dev(input6, "placeholder", "elonmusk");
    			add_location(input6, file$6, 225, 24, 9721);
    			attr_dev(div22, "class", "column col-6 col-sm-12");
    			add_location(div22, file$6, 221, 20, 9510);
    			attr_dev(label10, "class", "form-label");
    			attr_dev(label10, "for", "facebook-contact");
    			add_location(label10, file$6, 234, 24, 10111);
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "class", "form-input");
    			attr_dev(input7, "id", "facebook-contact");
    			attr_dev(input7, "placeholder", "zuck");
    			add_location(input7, file$6, 237, 24, 10263);
    			attr_dev(div23, "class", "column col-6 col-sm-12");
    			add_location(div23, file$6, 233, 20, 10050);
    			attr_dev(label11, "class", "form-label");
    			attr_dev(label11, "for", "twitter-contact");
    			add_location(label11, file$6, 246, 24, 10651);
    			attr_dev(input8, "type", "text");
    			attr_dev(input8, "class", "form-input");
    			attr_dev(input8, "id", "twitter-contact");
    			attr_dev(input8, "placeholder", "elonmusk");
    			add_location(input8, file$6, 249, 24, 10801);
    			attr_dev(div24, "class", "column col-6 col-sm-12");
    			add_location(div24, file$6, 245, 20, 10590);
    			attr_dev(label12, "class", "form-label");
    			attr_dev(label12, "for", "email-contact");
    			add_location(label12, file$6, 258, 24, 11191);
    			attr_dev(input9, "type", "email");
    			attr_dev(input9, "class", "form-input");
    			attr_dev(input9, "id", "email-contact");
    			attr_dev(input9, "placeholder", "john.doe@gmail.com");
    			add_location(input9, file$6, 261, 24, 11329);
    			attr_dev(div25, "class", "column col-6 col-sm-12");
    			add_location(div25, file$6, 257, 20, 11130);
    			attr_dev(label13, "class", "form-label");
    			attr_dev(label13, "for", "phone-contact");
    			add_location(label13, file$6, 270, 24, 11726);
    			attr_dev(input10, "type", "tel");
    			attr_dev(input10, "class", "form-input");
    			attr_dev(input10, "id", "phone-contact");
    			attr_dev(input10, "placeholder", "5555555555");
    			add_location(input10, file$6, 273, 24, 11871);
    			attr_dev(div26, "class", "column col-6 col-sm-12");
    			add_location(div26, file$6, 269, 20, 11665);
    			attr_dev(div27, "class", "columns");
    			set_style(div27, "margin-top", "20px");
    			add_location(div27, file$6, 171, 16, 7097);
    			add_location(h32, file$6, 284, 24, 12329);
    			attr_dev(div28, "class", "col-12");
    			add_location(div28, file$6, 283, 20, 12284);
    			attr_dev(label14, "class", "form-label");
    			attr_dev(label14, "for", "location");
    			add_location(label14, file$6, 287, 24, 12457);
    			attr_dev(select3, "class", "form-select");
    			attr_dev(select3, "id", "location");
    			if (/*profileData*/ ctx[0].location === void 0) add_render_callback(() => /*select3_change_handler*/ ctx[23].call(select3));
    			add_location(select3, file$6, 289, 24, 12564);
    			attr_dev(div29, "class", "column col-12");
    			add_location(div29, file$6, 286, 20, 12405);
    			attr_dev(div30, "class", "columns");
    			set_style(div30, "margin-top", "20px");
    			add_location(div30, file$6, 282, 16, 12216);
    			attr_dev(label15, "for", "building-preferences");
    			add_location(label15, file$6, 304, 24, 13227);
    			attr_dev(input11, "type", "text");
    			attr_dev(input11, "class", "form-input");
    			attr_dev(input11, "placeholder", "live in north campus...");
    			add_location(input11, file$6, 305, 24, 13307);
    			attr_dev(div31, "class", "col-12");
    			add_location(div31, file$6, 303, 20, 13182);
    			attr_dev(div32, "class", "columns");
    			set_style(div32, "margin-top", "20px");
    			add_location(div32, file$6, 302, 16, 13115);
    			attr_dev(button, "class", "btn btn-primary");
    			set_style(button, "width", "100%");
    			add_location(button, file$6, 318, 24, 13833);
    			attr_dev(div33, "class", "column col-12");
    			add_location(div33, file$6, 317, 20, 13781);
    			attr_dev(div34, "class", "columns");
    			set_style(div34, "margin-top", "20px");
    			set_style(div34, "margin-bottom", "250px");
    			add_location(div34, file$6, 313, 16, 13634);
    			attr_dev(div35, "class", "form-group");
    			add_location(div35, file$6, 56, 12, 1851);
    			attr_dev(div36, "class", "column col-8 col-md-12 col-mx-auto");
    			add_location(div36, file$6, 55, 8, 1790);
    			attr_dev(div37, "class", "columns");
    			add_location(div37, file$6, 45, 4, 1301);
    			add_location(main, file$6, 38, 0, 1084);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(main, t1);
    			mount_component(profileimageselector, main, null);
    			append_dev(main, t2);
    			append_dev(main, div37);
    			append_dev(div37, div2);
    			append_dev(div2, p0);
    			append_dev(div37, t4);
    			append_dev(div37, div36);
    			append_dev(div36, div35);
    			append_dev(div35, div5);
    			append_dev(div5, div3);
    			append_dev(div3, label0);
    			append_dev(div3, t6);
    			append_dev(div3, input0);
    			set_input_value(input0, /*profileData*/ ctx[0].first_name);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, label1);
    			append_dev(div4, t9);
    			append_dev(div4, input1);
    			set_input_value(input1, /*profileData*/ ctx[0].last_name);
    			append_dev(div35, t10);
    			append_dev(div35, div8);
    			append_dev(div8, div6);
    			append_dev(div6, label2);
    			append_dev(div6, t12);
    			append_dev(div6, select0);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(select0, null);
    			}

    			select_option(select0, /*profileData*/ ctx[0].gender);
    			append_dev(div8, t13);
    			append_dev(div8, div7);
    			append_dev(div7, label3);
    			append_dev(div7, t15);
    			append_dev(div7, select1);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(select1, null);
    			}

    			select_option(select1, /*profileData*/ ctx[0].class);
    			append_dev(div35, t16);
    			append_dev(div35, div11);
    			append_dev(div11, div9);
    			append_dev(div9, label4);
    			append_dev(div9, t18);
    			append_dev(div9, select2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select2, null);
    			}

    			select_option(select2, /*profileData*/ ctx[0].college);
    			append_dev(div11, t19);
    			append_dev(div11, div10);
    			append_dev(div10, label5);
    			append_dev(div10, t21);
    			append_dev(div10, input2);
    			set_input_value(input2, /*profileData*/ ctx[0].major);
    			append_dev(div35, t22);
    			append_dev(div35, div16);
    			append_dev(div16, div12);
    			append_dev(div12, h30);
    			append_dev(div16, t24);
    			append_dev(div16, div13);
    			append_dev(div13, p1);
    			append_dev(div16, t26);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div14, textarea);
    			set_input_value(textarea, /*profileData*/ ctx[0].bio);
    			append_dev(div35, t27);
    			append_dev(div35, div27);
    			append_dev(div27, div17);
    			append_dev(div17, h31);
    			append_dev(div27, t29);
    			append_dev(div27, div18);
    			append_dev(div18, p2);
    			append_dev(div27, t31);
    			append_dev(div27, div19);
    			append_dev(div19, label6);
    			append_dev(div19, t33);
    			append_dev(div19, input3);
    			set_input_value(input3, /*profileData*/ ctx[0].discord);
    			append_dev(div27, t34);
    			append_dev(div27, div20);
    			append_dev(div20, label7);
    			append_dev(div20, t36);
    			append_dev(div20, input4);
    			set_input_value(input4, /*profileData*/ ctx[0].linkedin);
    			append_dev(div27, t37);
    			append_dev(div27, div21);
    			append_dev(div21, label8);
    			append_dev(div21, t39);
    			append_dev(div21, input5);
    			set_input_value(input5, /*profileData*/ ctx[0].snapchat);
    			append_dev(div27, t40);
    			append_dev(div27, div22);
    			append_dev(div22, label9);
    			append_dev(div22, t42);
    			append_dev(div22, input6);
    			set_input_value(input6, /*profileData*/ ctx[0].instagram);
    			append_dev(div27, t43);
    			append_dev(div27, div23);
    			append_dev(div23, label10);
    			append_dev(div23, t45);
    			append_dev(div23, input7);
    			set_input_value(input7, /*profileData*/ ctx[0].facebook);
    			append_dev(div27, t46);
    			append_dev(div27, div24);
    			append_dev(div24, label11);
    			append_dev(div24, t48);
    			append_dev(div24, input8);
    			set_input_value(input8, /*profileData*/ ctx[0].twitter);
    			append_dev(div27, t49);
    			append_dev(div27, div25);
    			append_dev(div25, label12);
    			append_dev(div25, t51);
    			append_dev(div25, input9);
    			set_input_value(input9, /*profileData*/ ctx[0].email);
    			append_dev(div27, t52);
    			append_dev(div27, div26);
    			append_dev(div26, label13);
    			append_dev(div26, t54);
    			append_dev(div26, input10);
    			set_input_value(input10, /*profileData*/ ctx[0].phone);
    			append_dev(div35, t55);
    			append_dev(div35, div30);
    			append_dev(div30, div28);
    			append_dev(div28, h32);
    			append_dev(div30, t57);
    			append_dev(div30, div29);
    			append_dev(div29, label14);
    			append_dev(div29, t59);
    			append_dev(div29, select3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select3, null);
    			}

    			select_option(select3, /*profileData*/ ctx[0].location);
    			append_dev(div35, t60);
    			append_dev(div35, div32);
    			append_dev(div32, div31);
    			append_dev(div31, label15);
    			append_dev(div31, t62);
    			append_dev(div31, input11);
    			set_input_value(input11, /*profileData*/ ctx[0].building_preferences);
    			append_dev(div35, t63);
    			append_dev(div35, div34);
    			append_dev(div34, div33);
    			append_dev(div33, button);
    			append_dev(button, t64);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[10]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[11]),
    					listen_dev(select2, "change", /*select2_change_handler*/ ctx[12]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[13]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[14]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[15]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[16]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[17]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[18]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[19]),
    					listen_dev(input8, "input", /*input8_input_handler*/ ctx[20]),
    					listen_dev(input9, "input", /*input9_input_handler*/ ctx[21]),
    					listen_dev(input10, "input", /*input10_input_handler*/ ctx[22]),
    					listen_dev(select3, "change", /*select3_change_handler*/ ctx[23]),
    					listen_dev(input11, "input", /*input11_input_handler*/ ctx[24]),
    					listen_dev(button, "click", /*click_handler*/ ctx[25], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const profileimageselector_changes = {};
    			if (dirty[0] & /*sessionToken*/ 4) profileimageselector_changes.sessionToken = /*sessionToken*/ ctx[2];
    			if (dirty[0] & /*profileData*/ 1) profileimageselector_changes.profileData = /*profileData*/ ctx[0];
    			profileimageselector.$set(profileimageselector_changes);

    			if (dirty[0] & /*profileData, genderOptions*/ 17 && input0.value !== /*profileData*/ ctx[0].first_name) {
    				set_input_value(input0, /*profileData*/ ctx[0].first_name);
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17 && input1.value !== /*profileData*/ ctx[0].last_name) {
    				set_input_value(input1, /*profileData*/ ctx[0].last_name);
    			}

    			if (dirty[0] & /*genderOptions*/ 16) {
    				each_value_3 = /*genderOptions*/ ctx[4];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_3(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_3.length;
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17) {
    				select_option(select0, /*profileData*/ ctx[0].gender);
    			}

    			if (dirty[0] & /*classYearOptions*/ 64) {
    				each_value_2 = /*classYearOptions*/ ctx[6];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17) {
    				select_option(select1, /*profileData*/ ctx[0].class);
    			}

    			if (dirty[0] & /*collegeOptions*/ 32) {
    				each_value_1 = /*collegeOptions*/ ctx[5];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17) {
    				select_option(select2, /*profileData*/ ctx[0].college);
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17 && input2.value !== /*profileData*/ ctx[0].major) {
    				set_input_value(input2, /*profileData*/ ctx[0].major);
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17) {
    				set_input_value(textarea, /*profileData*/ ctx[0].bio);
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17 && input3.value !== /*profileData*/ ctx[0].discord) {
    				set_input_value(input3, /*profileData*/ ctx[0].discord);
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17) {
    				set_input_value(input4, /*profileData*/ ctx[0].linkedin);
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17 && input5.value !== /*profileData*/ ctx[0].snapchat) {
    				set_input_value(input5, /*profileData*/ ctx[0].snapchat);
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17 && input6.value !== /*profileData*/ ctx[0].instagram) {
    				set_input_value(input6, /*profileData*/ ctx[0].instagram);
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17 && input7.value !== /*profileData*/ ctx[0].facebook) {
    				set_input_value(input7, /*profileData*/ ctx[0].facebook);
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17 && input8.value !== /*profileData*/ ctx[0].twitter) {
    				set_input_value(input8, /*profileData*/ ctx[0].twitter);
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17 && input9.value !== /*profileData*/ ctx[0].email) {
    				set_input_value(input9, /*profileData*/ ctx[0].email);
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17) {
    				set_input_value(input10, /*profileData*/ ctx[0].phone);
    			}

    			if (dirty[0] & /*locationOptions*/ 128) {
    				each_value = /*locationOptions*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17) {
    				select_option(select3, /*profileData*/ ctx[0].location);
    			}

    			if (dirty[0] & /*profileData, genderOptions*/ 17 && input11.value !== /*profileData*/ ctx[0].building_preferences) {
    				set_input_value(input11, /*profileData*/ ctx[0].building_preferences);
    			}

    			if ((!current || dirty[0] & /*showSaved*/ 8) && t64_value !== (t64_value = (/*showSaved*/ ctx[3] ? "Saved" : "Save") + "")) set_data_dev(t64, t64_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(profileimageselector.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(profileimageselector.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(profileimageselector);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots("DataForm", slots, []);
    	var { profileData } = $$props;
    	var { whenDone } = $$props;
    	var { sessionToken } = $$props;
    	let showSaved = false;

    	let genderOptions = [
    		"Select",
    		"Male",
    		"Female",
    		"Transgender",
    		"Non-Binary",
    		"Other",
    		"Prefer not to respond"
    	];

    	let collegeOptions = [
    		"Select",
    		"School of Architecture",
    		"McCombs School of Business",
    		"Moody College of Communication",
    		"College of Education",
    		"Cockrell School of Engineering",
    		"College of Fine Arts",
    		"Jackson School of Geosciences",
    		"School of Information",
    		"College of Liberal Arts",
    		"College of Natural Science",
    		"School of Nursing",
    		"College of Pharmacy",
    		"Steve Hicks School of Social Work",
    		"School of Undergraduate Studies"
    	];

    	let classYearOptions = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
    	let locationOptions = ["Select", "On-Campus", "Off-Campus"];
    	const writable_props = ["profileData", "whenDone", "sessionToken"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DataForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		profileData.first_name = this.value;
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function input1_input_handler() {
    		profileData.last_name = this.value;
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function select0_change_handler() {
    		profileData.gender = select_value(this);
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function select1_change_handler() {
    		profileData.class = select_value(this);
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function select2_change_handler() {
    		profileData.college = select_value(this);
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function input2_input_handler() {
    		profileData.major = this.value;
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function textarea_input_handler() {
    		profileData.bio = this.value;
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function input3_input_handler() {
    		profileData.discord = this.value;
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function input4_input_handler() {
    		profileData.linkedin = this.value;
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function input5_input_handler() {
    		profileData.snapchat = this.value;
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function input6_input_handler() {
    		profileData.instagram = this.value;
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function input7_input_handler() {
    		profileData.facebook = this.value;
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function input8_input_handler() {
    		profileData.twitter = this.value;
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function input9_input_handler() {
    		profileData.email = this.value;
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function input10_input_handler() {
    		profileData.phone = this.value;
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function select3_change_handler() {
    		profileData.location = select_value(this);
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	function input11_input_handler() {
    		profileData.building_preferences = this.value;
    		$$invalidate(0, profileData);
    		$$invalidate(4, genderOptions);
    	}

    	const click_handler = () => {
    		whenDone(sessionToken, profileData);
    		$$invalidate(3, showSaved = true);
    		setTimeout(() => $$invalidate(3, showSaved = false), 5000);
    	};

    	$$self.$$set = $$props => {
    		if ("profileData" in $$props) $$invalidate(0, profileData = $$props.profileData);
    		if ("whenDone" in $$props) $$invalidate(1, whenDone = $$props.whenDone);
    		if ("sessionToken" in $$props) $$invalidate(2, sessionToken = $$props.sessionToken);
    	};

    	$$self.$capture_state = () => ({
    		ProfileImageSelector,
    		profileData,
    		whenDone,
    		sessionToken,
    		showSaved,
    		genderOptions,
    		collegeOptions,
    		classYearOptions,
    		locationOptions
    	});

    	$$self.$inject_state = $$props => {
    		if ("profileData" in $$props) $$invalidate(0, profileData = $$props.profileData);
    		if ("whenDone" in $$props) $$invalidate(1, whenDone = $$props.whenDone);
    		if ("sessionToken" in $$props) $$invalidate(2, sessionToken = $$props.sessionToken);
    		if ("showSaved" in $$props) $$invalidate(3, showSaved = $$props.showSaved);
    		if ("genderOptions" in $$props) $$invalidate(4, genderOptions = $$props.genderOptions);
    		if ("collegeOptions" in $$props) $$invalidate(5, collegeOptions = $$props.collegeOptions);
    		if ("classYearOptions" in $$props) $$invalidate(6, classYearOptions = $$props.classYearOptions);
    		if ("locationOptions" in $$props) $$invalidate(7, locationOptions = $$props.locationOptions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		profileData,
    		whenDone,
    		sessionToken,
    		showSaved,
    		genderOptions,
    		collegeOptions,
    		classYearOptions,
    		locationOptions,
    		input0_input_handler,
    		input1_input_handler,
    		select0_change_handler,
    		select1_change_handler,
    		select2_change_handler,
    		input2_input_handler,
    		textarea_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		input9_input_handler,
    		input10_input_handler,
    		select3_change_handler,
    		input11_input_handler,
    		click_handler
    	];
    }

    class DataForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{
    				profileData: 0,
    				whenDone: 1,
    				sessionToken: 2
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DataForm",
    			options,
    			id: create_fragment$6.name
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

    /* src/Login.svelte generated by Svelte v3.37.0 */

    const { console: console_1$3 } = globals;
    const file$5 = "src/Login.svelte";

    // (58:8) {#if errorMessage != null}
    function create_if_block$3(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*errorMessage*/ ctx[0]);
    			attr_dev(p, "class", "column col-8 col-mx-auto");
    			set_style(p, "color", "red");
    			add_location(p, file$5, 58, 12, 2148);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMessage*/ 1) set_data_dev(t, /*errorMessage*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(58:8) {#if errorMessage != null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let h3;
    	let t1;
    	let h4;
    	let t2;
    	let a;
    	let t4;
    	let t5;
    	let div3;
    	let t6;
    	let div2;
    	let t7;
    	let div5;
    	let div4;
    	let p0;
    	let t9;
    	let p1;
    	let if_block = /*errorMessage*/ ctx[0] != null && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Welcome Longhorns! Roomie is a roommate finding service made by\n                UT students* for UT students.";
    			t1 = space();
    			h4 = element("h4");
    			t2 = text("Get started by signing in with Google! Make sure to use your\n                utexas.edu email. If you're an incoming freshman, ");
    			a = element("a");
    			a.textContent = "go to the UT website";
    			t4 = text(" to get yours using your UT EID. It's the same ID you used to log\n                into MyStatus!");
    			t5 = space();
    			div3 = element("div");
    			if (if_block) if_block.c();
    			t6 = space();
    			div2 = element("div");
    			t7 = space();
    			div5 = element("div");
    			div4 = element("div");
    			p0 = element("p");
    			p0.textContent = "You can use this platform to find roommates at UT. After signing\n                in, you can make a profile for yourself (editable at any time)\n                and look at the profiles of other students to find the best\n                roommate. Try to use the search feature to narrow down who\n                you're looking for. If you want a roommate in the class of 2025,\n                make sure you add \"2025\" to your search. You can search for\n                students specific colleges, like the College of Natural Science\n                or specific majors, like Neuroscience!";
    			t9 = space();
    			p1 = element("p");
    			p1.textContent = "*I am a UT student but this service is NOT officially endorsed\n                by or supported by the University of Texas";
    			add_location(h3, file$5, 42, 12, 1502);
    			attr_dev(a, "href", "https://get.utmail.utexas.edu/");
    			add_location(a, file$5, 48, 66, 1811);
    			add_location(h4, file$5, 46, 12, 1663);
    			attr_dev(div0, "class", "column col-8 col-md-12 col-mx-auto");
    			add_location(div0, file$5, 41, 8, 1441);
    			attr_dev(div1, "class", "columns");
    			set_style(div1, "margin-bottom", "20px");
    			add_location(div1, file$5, 40, 4, 1382);
    			set_style(div2, "display", "flex");
    			set_style(div2, "justify-content", "center");
    			attr_dev(div2, "class", "column col-8 col-mx-auto g-signin2");
    			attr_dev(div2, "data-onsuccess", "onSignIn");
    			add_location(div2, file$5, 62, 8, 2275);
    			attr_dev(div3, "class", "columns");
    			add_location(div3, file$5, 56, 4, 2079);
    			add_location(p0, file$5, 70, 12, 2565);
    			attr_dev(p1, "class", "text-gray");
    			add_location(p1, file$5, 80, 12, 3201);
    			attr_dev(div4, "class", "column col-8 col-mx-auto");
    			add_location(div4, file$5, 69, 8, 2514);
    			attr_dev(div5, "class", "columns");
    			set_style(div5, "margin-top", "40px");
    			add_location(div5, file$5, 68, 4, 2458);
    			add_location(main, file$5, 39, 0, 1371);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(div0, t1);
    			append_dev(div0, h4);
    			append_dev(h4, t2);
    			append_dev(h4, a);
    			append_dev(h4, t4);
    			append_dev(main, t5);
    			append_dev(main, div3);
    			if (if_block) if_block.m(div3, null);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(main, t7);
    			append_dev(main, div5);
    			append_dev(div5, div4);
    			append_dev(div4, p0);
    			append_dev(div4, t9);
    			append_dev(div4, p1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*errorMessage*/ ctx[0] != null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div3, t6);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
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
    	validate_slots("Login", slots, []);
    	var { signedIn } = $$props;
    	var { page } = $$props;
    	var { sessionToken } = $$props;
    	let errorMessage = null;

    	window.onSignIn = googleUser => {
    		const profile = googleUser.getBasicProfile();
    		console.log("ID: " + profile.getId());
    		console.log("Image URL: " + profile.getImageUrl());
    		console.log("Email: " + profile.getEmail());
    		console.log("ID Token: " + googleUser.getAuthResponse().id_token);

    		fetch("./auth", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				oauth_token_id: googleUser.getAuthResponse().id_token
    			})
    		}).then(response => response.json()).then(data => {
    			console.log(data);

    			if (data.error != null) {
    				$$invalidate(0, errorMessage = data.error);
    				window.signOut();
    			} else {
    				$$invalidate(2, page = localStorage.getItem("page")
    				? localStorage.getItem("page")
    				: "profile");

    				$$invalidate(3, sessionToken = data.jwt_token);
    				$$invalidate(1, signedIn = true);
    				$$invalidate(0, errorMessage = null);
    				window.getStudentData(sessionToken);
    			}
    		});
    	};

    	const writable_props = ["signedIn", "page", "sessionToken"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("signedIn" in $$props) $$invalidate(1, signedIn = $$props.signedIn);
    		if ("page" in $$props) $$invalidate(2, page = $$props.page);
    		if ("sessionToken" in $$props) $$invalidate(3, sessionToken = $$props.sessionToken);
    	};

    	$$self.$capture_state = () => ({
    		signedIn,
    		page,
    		sessionToken,
    		errorMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ("signedIn" in $$props) $$invalidate(1, signedIn = $$props.signedIn);
    		if ("page" in $$props) $$invalidate(2, page = $$props.page);
    		if ("sessionToken" in $$props) $$invalidate(3, sessionToken = $$props.sessionToken);
    		if ("errorMessage" in $$props) $$invalidate(0, errorMessage = $$props.errorMessage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [errorMessage, signedIn, page, sessionToken];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { signedIn: 1, page: 2, sessionToken: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*signedIn*/ ctx[1] === undefined && !("signedIn" in props)) {
    			console_1$3.warn("<Login> was created without expected prop 'signedIn'");
    		}

    		if (/*page*/ ctx[2] === undefined && !("page" in props)) {
    			console_1$3.warn("<Login> was created without expected prop 'page'");
    		}

    		if (/*sessionToken*/ ctx[3] === undefined && !("sessionToken" in props)) {
    			console_1$3.warn("<Login> was created without expected prop 'sessionToken'");
    		}
    	}

    	get signedIn() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set signedIn(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get page() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sessionToken() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sessionToken(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/SignOut.svelte generated by Svelte v3.37.0 */

    const { console: console_1$2 } = globals;
    const file$4 = "src/SignOut.svelte";

    function create_fragment$4(ctx) {
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
    			add_location(button0, file$4, 25, 8, 510);
    			attr_dev(button1, "class", "btn");
    			add_location(button1, file$4, 26, 8, 662);
    			attr_dev(div, "class", "topright svelte-1hnft6h");
    			add_location(div, file$4, 24, 4, 479);
    			add_location(main, file$4, 23, 0, 468);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<SignOut> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { page: 0, signedIn: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SignOut",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*page*/ ctx[0] === undefined && !("page" in props)) {
    			console_1$2.warn("<SignOut> was created without expected prop 'page'");
    		}

    		if (/*signedIn*/ ctx[3] === undefined && !("signedIn" in props)) {
    			console_1$2.warn("<SignOut> was created without expected prop 'signedIn'");
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

    /* src/MoreInfoModal.svelte generated by Svelte v3.37.0 */

    const file$3 = "src/MoreInfoModal.svelte";

    // (28:20) {#if modalData}
    function create_if_block$2(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h2;
    	let t1_value = /*modalData*/ ctx[1].first_name + "";
    	let t1;
    	let t2;
    	let t3_value = /*modalData*/ ctx[1].last_name + "";
    	let t3;
    	let t4;
    	let h6;
    	let t5_value = /*modalData*/ ctx[1].gender + "";
    	let t5;
    	let t6;
    	let t7_value = /*modalData*/ ctx[1].class + "";
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let p;
    	let t13_value = /*modalData*/ ctx[1].bio + "";
    	let t13;
    	let t14;
    	let h5;
    	let t16;
    	let ul;
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let t21;
    	let t22;
    	let t23;
    	let if_block0 = /*modalData*/ ctx[1].college != "Select" && create_if_block_12(ctx);
    	let if_block1 = /*modalData*/ ctx[1].major != "" && create_if_block_11(ctx);
    	let if_block2 = /*modalData*/ ctx[1].location != "Select" && create_if_block_10(ctx);
    	let if_block3 = /*modalData*/ ctx[1].building_preferences != "" && create_if_block_9(ctx);
    	let if_block4 = /*modalData*/ ctx[1].discord != "" && create_if_block_8(ctx);
    	let if_block5 = /*modalData*/ ctx[1].linkedin != "" && create_if_block_7(ctx);
    	let if_block6 = /*modalData*/ ctx[1].snapchat != "" && create_if_block_6(ctx);
    	let if_block7 = /*modalData*/ ctx[1].instagram != "" && create_if_block_5(ctx);
    	let if_block8 = /*modalData*/ ctx[1].facebook != "" && create_if_block_4$1(ctx);
    	let if_block9 = /*modalData*/ ctx[1].twitter != "" && create_if_block_3$2(ctx);
    	let if_block10 = /*modalData*/ ctx[1].email != "" && create_if_block_2$2(ctx);
    	let if_block11 = /*modalData*/ ctx[1].phone != "" && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			h6 = element("h6");
    			t5 = text(t5_value);
    			t6 = text(" | Class of ");
    			t7 = text(t7_value);
    			t8 = space();
    			if (if_block0) if_block0.c();
    			t9 = space();
    			if (if_block1) if_block1.c();
    			t10 = space();
    			if (if_block2) if_block2.c();
    			t11 = space();
    			if (if_block3) if_block3.c();
    			t12 = space();
    			p = element("p");
    			t13 = text(t13_value);
    			t14 = space();
    			h5 = element("h5");
    			h5.textContent = "Contact Information";
    			t16 = space();
    			ul = element("ul");
    			if (if_block4) if_block4.c();
    			t17 = space();
    			if (if_block5) if_block5.c();
    			t18 = space();
    			if (if_block6) if_block6.c();
    			t19 = space();
    			if (if_block7) if_block7.c();
    			t20 = space();
    			if (if_block8) if_block8.c();
    			t21 = space();
    			if (if_block9) if_block9.c();
    			t22 = space();
    			if (if_block10) if_block10.c();
    			t23 = space();
    			if (if_block11) if_block11.c();
    			attr_dev(img, "class", "img-responsive svelte-xxs2mx");
    			if (img.src !== (img_src_value = "./images/" + /*modalData*/ ctx[1].sub + ".jpeg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$3, 30, 32, 950);
    			attr_dev(div0, "class", "column col-4 col-sm-12");
    			add_location(div0, file$3, 29, 28, 881);
    			attr_dev(h2, "class", "first-name svelte-xxs2mx");
    			add_location(h2, file$3, 37, 32, 1304);
    			add_location(h6, file$3, 41, 32, 1515);
    			attr_dev(div1, "class", "column col-8 col-sm-12");
    			add_location(div1, file$3, 36, 28, 1235);
    			attr_dev(div2, "class", "columns");
    			set_style(div2, "margin-bottom", "10px");
    			add_location(div2, file$3, 28, 24, 802);
    			set_style(p, "border", "1px solid gray");
    			set_style(p, "border-radius", "15px");
    			set_style(p, "padding", "10px");
    			add_location(p, file$3, 60, 24, 2547);
    			add_location(h5, file$3, 65, 24, 2769);
    			add_location(ul, file$3, 66, 24, 2822);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(h2, t3);
    			append_dev(div1, t4);
    			append_dev(div1, h6);
    			append_dev(h6, t5);
    			append_dev(h6, t6);
    			append_dev(h6, t7);
    			append_dev(div1, t8);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t9);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t10);
    			if (if_block2) if_block2.m(div1, null);
    			append_dev(div1, t11);
    			if (if_block3) if_block3.m(div1, null);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t13);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, ul, anchor);
    			if (if_block4) if_block4.m(ul, null);
    			append_dev(ul, t17);
    			if (if_block5) if_block5.m(ul, null);
    			append_dev(ul, t18);
    			if (if_block6) if_block6.m(ul, null);
    			append_dev(ul, t19);
    			if (if_block7) if_block7.m(ul, null);
    			append_dev(ul, t20);
    			if (if_block8) if_block8.m(ul, null);
    			append_dev(ul, t21);
    			if (if_block9) if_block9.m(ul, null);
    			append_dev(ul, t22);
    			if (if_block10) if_block10.m(ul, null);
    			append_dev(ul, t23);
    			if (if_block11) if_block11.m(ul, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && img.src !== (img_src_value = "./images/" + /*modalData*/ ctx[1].sub + ".jpeg")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*modalData*/ 2 && t1_value !== (t1_value = /*modalData*/ ctx[1].first_name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*modalData*/ 2 && t3_value !== (t3_value = /*modalData*/ ctx[1].last_name + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*modalData*/ 2 && t5_value !== (t5_value = /*modalData*/ ctx[1].gender + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*modalData*/ 2 && t7_value !== (t7_value = /*modalData*/ ctx[1].class + "")) set_data_dev(t7, t7_value);

    			if (/*modalData*/ ctx[1].college != "Select") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_12(ctx);
    					if_block0.c();
    					if_block0.m(div1, t9);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*modalData*/ ctx[1].major != "") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_11(ctx);
    					if_block1.c();
    					if_block1.m(div1, t10);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*modalData*/ ctx[1].location != "Select") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_10(ctx);
    					if_block2.c();
    					if_block2.m(div1, t11);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*modalData*/ ctx[1].building_preferences != "") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_9(ctx);
    					if_block3.c();
    					if_block3.m(div1, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*modalData*/ 2 && t13_value !== (t13_value = /*modalData*/ ctx[1].bio + "")) set_data_dev(t13, t13_value);

    			if (/*modalData*/ ctx[1].discord != "") {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_8(ctx);
    					if_block4.c();
    					if_block4.m(ul, t17);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*modalData*/ ctx[1].linkedin != "") {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_7(ctx);
    					if_block5.c();
    					if_block5.m(ul, t18);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*modalData*/ ctx[1].snapchat != "") {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_6(ctx);
    					if_block6.c();
    					if_block6.m(ul, t19);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*modalData*/ ctx[1].instagram != "") {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_5(ctx);
    					if_block7.c();
    					if_block7.m(ul, t20);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*modalData*/ ctx[1].facebook != "") {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_4$1(ctx);
    					if_block8.c();
    					if_block8.m(ul, t21);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*modalData*/ ctx[1].twitter != "") {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block_3$2(ctx);
    					if_block9.c();
    					if_block9.m(ul, t22);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (/*modalData*/ ctx[1].email != "") {
    				if (if_block10) {
    					if_block10.p(ctx, dirty);
    				} else {
    					if_block10 = create_if_block_2$2(ctx);
    					if_block10.c();
    					if_block10.m(ul, t23);
    				}
    			} else if (if_block10) {
    				if_block10.d(1);
    				if_block10 = null;
    			}

    			if (/*modalData*/ ctx[1].phone != "") {
    				if (if_block11) {
    					if_block11.p(ctx, dirty);
    				} else {
    					if_block11 = create_if_block_1$2(ctx);
    					if_block11.c();
    					if_block11.m(ul, null);
    				}
    			} else if (if_block11) {
    				if_block11.d(1);
    				if_block11 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(ul);
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    			if (if_block10) if_block10.d();
    			if (if_block11) if_block11.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(28:20) {#if modalData}",
    		ctx
    	});

    	return block;
    }

    // (45:32) {#if modalData.college != "Select"}
    function create_if_block_12(ctx) {
    	let h6;
    	let t0;
    	let t1_value = /*modalData*/ ctx[1].college + "";
    	let t1;

    	const block = {
    		c: function create() {
    			h6 = element("h6");
    			t0 = text("⛪️");
    			t1 = text(t1_value);
    			add_location(h6, file$3, 44, 67, 1709);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h6, anchor);
    			append_dev(h6, t0);
    			append_dev(h6, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t1_value !== (t1_value = /*modalData*/ ctx[1].college + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(45:32) {#if modalData.college != \\\"Select\\\"}",
    		ctx
    	});

    	return block;
    }

    // (48:32) {#if modalData.major != ""}
    function create_if_block_11(ctx) {
    	let h6;
    	let t0;
    	let t1_value = /*modalData*/ ctx[1].major + "";
    	let t1;

    	const block = {
    		c: function create() {
    			h6 = element("h6");
    			t0 = text("📚");
    			t1 = text(t1_value);
    			add_location(h6, file$3, 47, 59, 1882);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h6, anchor);
    			append_dev(h6, t0);
    			append_dev(h6, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t1_value !== (t1_value = /*modalData*/ ctx[1].major + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(48:32) {#if modalData.major != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (51:32) {#if modalData.location != "Select"}
    function create_if_block_10(ctx) {
    	let h6;
    	let t0;
    	let t1_value = /*modalData*/ ctx[1].location + "";
    	let t1;

    	const block = {
    		c: function create() {
    			h6 = element("h6");
    			t0 = text("📍");
    			t1 = text(t1_value);
    			add_location(h6, file$3, 50, 68, 2062);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h6, anchor);
    			append_dev(h6, t0);
    			append_dev(h6, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t1_value !== (t1_value = /*modalData*/ ctx[1].location + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(51:32) {#if modalData.location != \\\"Select\\\"}",
    		ctx
    	});

    	return block;
    }

    // (54:32) {#if modalData.building_preferences != ""}
    function create_if_block_9(ctx) {
    	let h6;
    	let t0;
    	let t1_value = /*modalData*/ ctx[1].building_preferences + "";
    	let t1;

    	const block = {
    		c: function create() {
    			h6 = element("h6");
    			t0 = text("Prefers to ");
    			t1 = text(t1_value);
    			add_location(h6, file$3, 54, 36, 2288);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h6, anchor);
    			append_dev(h6, t0);
    			append_dev(h6, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modalData*/ 2 && t1_value !== (t1_value = /*modalData*/ ctx[1].building_preferences + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(54:32) {#if modalData.building_preferences != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (68:28) {#if modalData.discord != ""}
    function create_if_block_8(ctx) {
    	let li;
    	let t_value = "Discord: " + /*modalData*/ ctx[1].discord + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$3, 67, 57, 2884);
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
    		source: "(68:28) {#if modalData.discord != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (71:28) {#if modalData.linkedin != ""}
    function create_if_block_7(ctx) {
    	let li;
    	let t_value = "LinkedIn: " + /*modalData*/ ctx[1].linkedin + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$3, 70, 58, 3060);
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
    		source: "(71:28) {#if modalData.linkedin != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (74:28) {#if modalData.snapchat != ""}
    function create_if_block_6(ctx) {
    	let li;
    	let t_value = "SnapChat: " + /*modalData*/ ctx[1].snapchat + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$3, 73, 58, 3238);
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
    		source: "(74:28) {#if modalData.snapchat != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (77:28) {#if modalData.instagram != ""}
    function create_if_block_5(ctx) {
    	let li;
    	let t_value = "Instagram: " + /*modalData*/ ctx[1].instagram + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$3, 76, 59, 3417);
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
    		source: "(77:28) {#if modalData.instagram != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (80:28) {#if modalData.facebook != ""}
    function create_if_block_4$1(ctx) {
    	let li;
    	let t_value = "Facebook: " + /*modalData*/ ctx[1].facebook + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$3, 79, 58, 3597);
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
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(80:28) {#if modalData.facebook != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (83:28) {#if modalData.twitter != ""}
    function create_if_block_3$2(ctx) {
    	let li;
    	let t_value = "Twitter: " + /*modalData*/ ctx[1].twitter + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$3, 82, 57, 3774);
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
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(83:28) {#if modalData.twitter != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (86:28) {#if modalData.email != ""}
    function create_if_block_2$2(ctx) {
    	let li;
    	let t_value = "Email: " + /*modalData*/ ctx[1].email + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$3, 85, 55, 3947);
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
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(86:28) {#if modalData.email != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (89:28) {#if modalData.phone != ""}
    function create_if_block_1$2(ctx) {
    	let li;
    	let t_value = "Phone: " + /*modalData*/ ctx[1].phone + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$3, 88, 55, 4116);
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(89:28) {#if modalData.phone != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let div6;
    	let div0;
    	let t0;
    	let div5;
    	let div2;
    	let div1;
    	let t1;
    	let div4;
    	let div3;
    	let div6_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*modalData*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div6 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div5 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "modal-overlay");
    			attr_dev(div0, "aria-label", "Close");
    			add_location(div0, file$3, 8, 8, 173);
    			attr_dev(div1, "class", "btn btn-clear float-right");
    			attr_dev(div1, "aria-label", "Close");
    			add_location(div1, file$3, 17, 16, 422);
    			attr_dev(div2, "class", "modal-header");
    			add_location(div2, file$3, 16, 12, 379);
    			attr_dev(div3, "class", "content text-left");
    			add_location(div3, file$3, 26, 16, 710);
    			attr_dev(div4, "class", "modal-body");
    			add_location(div4, file$3, 25, 12, 669);
    			attr_dev(div5, "class", "modal-container");
    			add_location(div5, file$3, 15, 8, 337);
    			attr_dev(div6, "class", div6_class_value = "" + (null_to_empty("modal " + (/*open*/ ctx[0] ? "active" : "")) + " svelte-xxs2mx"));
    			attr_dev(div6, "id", "modal-id");
    			add_location(div6, file$3, 7, 4, 103);
    			add_location(main, file$3, 6, 0, 92);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div6);
    			append_dev(div6, div0);
    			append_dev(div6, t0);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			append_dev(div2, div1);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			if (if_block) if_block.m(div3, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*modalData*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div3, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*open*/ 1 && div6_class_value !== (div6_class_value = "" + (null_to_empty("modal " + (/*open*/ ctx[0] ? "active" : "")) + " svelte-xxs2mx"))) {
    				attr_dev(div6, "class", div6_class_value);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { open: 0, modalData: 1, colorMap: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MoreInfoModal",
    			options,
    			id: create_fragment$3.name
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

    /* src/SearchBar.svelte generated by Svelte v3.37.0 */

    const file$2 = "src/SearchBar.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let form;
    	let div0;
    	let input;
    	let t0;
    	let div1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			form = element("form");
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Search";
    			attr_dev(input, "placeholder", "Search for anything like gender, class year, major college, interests, etc...");
    			set_style(input, "width", "100%");
    			attr_dev(input, "type", "text");
    			add_location(input, file$2, 24, 16, 649);
    			attr_dev(div0, "class", "column col-10 col-sm-12 svelte-1mtlzjw");
    			add_location(div0, file$2, 23, 12, 595);
    			set_style(button, "width", "100%");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$2, 32, 16, 982);
    			attr_dev(div1, "class", "column col-2 col-sm-12 svelte-1mtlzjw");
    			add_location(div1, file$2, 31, 12, 929);
    			attr_dev(form, "class", "columns col-gapless");
    			add_location(form, file$2, 22, 8, 521);
    			add_location(main, file$2, 21, 0, 506);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, form);
    			append_dev(form, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*text*/ ctx[0]);
    			append_dev(form, t0);
    			append_dev(form, div1);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(form, "submit", /*filterStudents*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1 && input.value !== /*text*/ ctx[0]) {
    				set_input_value(input, /*text*/ ctx[0]);
    			}
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SearchBar", slots, []);
    	var { studentData } = $$props;
    	var { sessionToken } = $$props;
    	var { text } = $$props;

    	function filterStudents(e) {
    		e.preventDefault();
    		let query = "./student?token=" + sessionToken;

    		if (text != "") {
    			query += "&query=" + text;
    		}

    		fetch(query).then(response => response.json()).then(data => {
    			if (data != null) {
    				$$invalidate(2, studentData = data);
    			}
    		});
    	}

    	const writable_props = ["studentData", "sessionToken", "text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SearchBar> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		text = this.value;
    		$$invalidate(0, text);
    	}

    	const click_handler = () => filterStudents();

    	$$self.$$set = $$props => {
    		if ("studentData" in $$props) $$invalidate(2, studentData = $$props.studentData);
    		if ("sessionToken" in $$props) $$invalidate(3, sessionToken = $$props.sessionToken);
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({
    		studentData,
    		sessionToken,
    		text,
    		filterStudents
    	});

    	$$self.$inject_state = $$props => {
    		if ("studentData" in $$props) $$invalidate(2, studentData = $$props.studentData);
    		if ("sessionToken" in $$props) $$invalidate(3, sessionToken = $$props.sessionToken);
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		text,
    		filterStudents,
    		studentData,
    		sessionToken,
    		input_input_handler,
    		click_handler
    	];
    }

    class SearchBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { studentData: 2, sessionToken: 3, text: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SearchBar",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*studentData*/ ctx[2] === undefined && !("studentData" in props)) {
    			console.warn("<SearchBar> was created without expected prop 'studentData'");
    		}

    		if (/*sessionToken*/ ctx[3] === undefined && !("sessionToken" in props)) {
    			console.warn("<SearchBar> was created without expected prop 'sessionToken'");
    		}

    		if (/*text*/ ctx[0] === undefined && !("text" in props)) {
    			console.warn("<SearchBar> was created without expected prop 'text'");
    		}
    	}

    	get studentData() {
    		throw new Error("<SearchBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set studentData(value) {
    		throw new Error("<SearchBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sessionToken() {
    		throw new Error("<SearchBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sessionToken(value) {
    		throw new Error("<SearchBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<SearchBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<SearchBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TableView.svelte generated by Svelte v3.37.0 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/TableView.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (69:24) {#if student.college != "Select"}
    function create_if_block_4(ctx) {
    	let p;
    	let t0;
    	let strong;
    	let t1_value = /*student*/ ctx[12].college + "";
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("🏫");
    			strong = element("strong");
    			t1 = text(t1_value);
    			add_location(strong, file$1, 69, 33, 2620);
    			attr_dev(p, "class", "svelte-1kfkgyr");
    			add_location(p, file$1, 69, 28, 2615);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, strong);
    			append_dev(strong, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*studentData*/ 1 && t1_value !== (t1_value = /*student*/ ctx[12].college + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(69:24) {#if student.college != \\\"Select\\\"}",
    		ctx
    	});

    	return block;
    }

    // (72:24) {#if student.major != ""}
    function create_if_block_3$1(ctx) {
    	let p;
    	let t0;
    	let strong;
    	let t1_value = /*student*/ ctx[12].major + "";
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("📚");
    			strong = element("strong");
    			t1 = text(t1_value);
    			add_location(strong, file$1, 72, 33, 2772);
    			attr_dev(p, "class", "svelte-1kfkgyr");
    			add_location(p, file$1, 72, 28, 2767);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, strong);
    			append_dev(strong, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*studentData*/ 1 && t1_value !== (t1_value = /*student*/ ctx[12].major + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(72:24) {#if student.major != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (75:24) {#if student.location != "Select"}
    function create_if_block_2$1(ctx) {
    	let p;
    	let t0;
    	let strong;
    	let t1_value = /*student*/ ctx[12].location + "";
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("📍");
    			strong = element("strong");
    			t1 = text(t1_value);
    			add_location(strong, file$1, 75, 33, 2931);
    			attr_dev(p, "class", "svelte-1kfkgyr");
    			add_location(p, file$1, 75, 28, 2926);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, strong);
    			append_dev(strong, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*studentData*/ 1 && t1_value !== (t1_value = /*student*/ ctx[12].location + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(75:24) {#if student.location != \\\"Select\\\"}",
    		ctx
    	});

    	return block;
    }

    // (47:8) {#each studentData.students as student}
    function create_each_block(ctx) {
    	let div6;
    	let div5;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div3;
    	let div1;
    	let t1_value = /*student*/ ctx[12].first_name + "";
    	let t1;
    	let t2;
    	let div2;
    	let t3_value = /*student*/ ctx[12].gender + " | Class of " + /*student*/ ctx[12].class + "";
    	let t3;
    	let t4;
    	let div4;
    	let t5;
    	let t6;
    	let t7;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block0 = /*student*/ ctx[12].college != "Select" && create_if_block_4(ctx);
    	let if_block1 = /*student*/ ctx[12].major != "" && create_if_block_3$1(ctx);
    	let if_block2 = /*student*/ ctx[12].location != "Select" && create_if_block_2$1(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[10](/*student*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div4 = element("div");
    			if (if_block0) if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			if (if_block2) if_block2.c();
    			t7 = space();
    			button = element("button");
    			button.textContent = "Profile";
    			attr_dev(img, "class", "img-responsive svelte-1kfkgyr");
    			if (img.src !== (img_src_value = "./images/" + /*student*/ ctx[12].sub + ".jpeg?v=" + getRandomInt(10000))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			set_style(img, "margin", "0 auto");
    			attr_dev(img, "width", "256px");
    			attr_dev(img, "height", "256px");
    			add_location(img, file$1, 50, 24, 1698);
    			attr_dev(div0, "class", "card-image");
    			add_location(div0, file$1, 49, 20, 1649);
    			attr_dev(div1, "class", "card-title h2 first-name svelte-1kfkgyr");
    			add_location(div1, file$1, 60, 24, 2171);
    			attr_dev(div2, "class", "card-title text-gray");
    			add_location(div2, file$1, 63, 24, 2314);
    			attr_dev(div3, "class", "card-header");
    			add_location(div3, file$1, 59, 20, 2121);
    			attr_dev(button, "class", "btn btn-primary");
    			set_style(button, "margin-top", "10px");
    			set_style(button, "width", "100%");
    			add_location(button, file$1, 77, 24, 3025);
    			attr_dev(div4, "class", "card-body");
    			add_location(div4, file$1, 67, 20, 2505);
    			attr_dev(div5, "class", "card");
    			set_style(div5, "padding", "10px");
    			set_style(div5, "margin", "10px");
    			add_location(div5, file$1, 48, 16, 1573);
    			attr_dev(div6, "class", "column col-3 col-sm-12 col-md-6 col-lg-4 col-xl-3");
    			add_location(div6, file$1, 47, 12, 1493);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, img);
    			append_dev(div5, t0);
    			append_dev(div5, div3);
    			append_dev(div3, div1);
    			append_dev(div1, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, t3);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			if (if_block0) if_block0.m(div4, null);
    			append_dev(div4, t5);
    			if (if_block1) if_block1.m(div4, null);
    			append_dev(div4, t6);
    			if (if_block2) if_block2.m(div4, null);
    			append_dev(div4, t7);
    			append_dev(div4, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*studentData*/ 1 && img.src !== (img_src_value = "./images/" + /*student*/ ctx[12].sub + ".jpeg?v=" + getRandomInt(10000))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*studentData*/ 1 && t1_value !== (t1_value = /*student*/ ctx[12].first_name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*studentData*/ 1 && t3_value !== (t3_value = /*student*/ ctx[12].gender + " | Class of " + /*student*/ ctx[12].class + "")) set_data_dev(t3, t3_value);

    			if (/*student*/ ctx[12].college != "Select") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div4, t5);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*student*/ ctx[12].major != "") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$1(ctx);
    					if_block1.c();
    					if_block1.m(div4, t6);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*student*/ ctx[12].location != "Select") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2$1(ctx);
    					if_block2.c();
    					if_block2.m(div4, t7);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(47:8) {#each studentData.students as student}",
    		ctx
    	});

    	return block;
    }

    // (90:8) {#if studentData.students.length == 0}
    function create_if_block_1$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Try being less specific or if you're typing things like \"class\n                year of 2025\", just use \"2025\" instead.";
    			attr_dev(p, "class", "svelte-1kfkgyr");
    			add_location(p, file$1, 90, 12, 3518);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(90:8) {#if studentData.students.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (99:12) {#if studentData.students.length % 12 == 0}
    function create_if_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Load More";
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$1, 99, 12, 3859);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(99:12) {#if studentData.students.length % 12 == 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let moreinfomodal;
    	let updating_open;
    	let t0;
    	let searchbar;
    	let updating_studentData;
    	let updating_text;
    	let t1;
    	let div0;
    	let t2;
    	let t3;
    	let div2;
    	let div1;
    	let current;

    	function moreinfomodal_open_binding(value) {
    		/*moreinfomodal_open_binding*/ ctx[7](value);
    	}

    	let moreinfomodal_props = {
    		modalData: /*modalData*/ ctx[3],
    		colorMap: /*colorMap*/ ctx[5]
    	};

    	if (/*modalOpen*/ ctx[2] !== void 0) {
    		moreinfomodal_props.open = /*modalOpen*/ ctx[2];
    	}

    	moreinfomodal = new MoreInfoModal({
    			props: moreinfomodal_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(moreinfomodal, "open", moreinfomodal_open_binding));

    	function searchbar_studentData_binding(value) {
    		/*searchbar_studentData_binding*/ ctx[8](value);
    	}

    	function searchbar_text_binding(value) {
    		/*searchbar_text_binding*/ ctx[9](value);
    	}

    	let searchbar_props = { sessionToken: /*sessionToken*/ ctx[1] };

    	if (/*studentData*/ ctx[0] !== void 0) {
    		searchbar_props.studentData = /*studentData*/ ctx[0];
    	}

    	if (/*search_text*/ ctx[4] !== void 0) {
    		searchbar_props.text = /*search_text*/ ctx[4];
    	}

    	searchbar = new SearchBar({ props: searchbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(searchbar, "studentData", searchbar_studentData_binding));
    	binding_callbacks.push(() => bind(searchbar, "text", searchbar_text_binding));
    	let each_value = /*studentData*/ ctx[0].students;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block0 = /*studentData*/ ctx[0].students.length == 0 && create_if_block_1$1(ctx);
    	let if_block1 = /*studentData*/ ctx[0].students.length % 12 == 0 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(moreinfomodal.$$.fragment);
    			t0 = space();
    			create_component(searchbar.$$.fragment);
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "columns col-gapless");
    			add_location(div0, file$1, 45, 4, 1399);
    			attr_dev(div1, "class", "column col-12");
    			add_location(div1, file$1, 97, 8, 3763);
    			attr_dev(div2, "class", "columns");
    			set_style(div2, "margin-bottom", "200px");
    			add_location(div2, file$1, 96, 4, 3703);
    			add_location(main, file$1, 42, 0, 1248);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(moreinfomodal, main, null);
    			append_dev(main, t0);
    			mount_component(searchbar, main, null);
    			append_dev(main, t1);
    			append_dev(main, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div0, t2);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(main, t3);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const moreinfomodal_changes = {};
    			if (dirty & /*modalData*/ 8) moreinfomodal_changes.modalData = /*modalData*/ ctx[3];

    			if (!updating_open && dirty & /*modalOpen*/ 4) {
    				updating_open = true;
    				moreinfomodal_changes.open = /*modalOpen*/ ctx[2];
    				add_flush_callback(() => updating_open = false);
    			}

    			moreinfomodal.$set(moreinfomodal_changes);
    			const searchbar_changes = {};
    			if (dirty & /*sessionToken*/ 2) searchbar_changes.sessionToken = /*sessionToken*/ ctx[1];

    			if (!updating_studentData && dirty & /*studentData*/ 1) {
    				updating_studentData = true;
    				searchbar_changes.studentData = /*studentData*/ ctx[0];
    				add_flush_callback(() => updating_studentData = false);
    			}

    			if (!updating_text && dirty & /*search_text*/ 16) {
    				updating_text = true;
    				searchbar_changes.text = /*search_text*/ ctx[4];
    				add_flush_callback(() => updating_text = false);
    			}

    			searchbar.$set(searchbar_changes);

    			if (dirty & /*modalData, studentData, modalOpen, getRandomInt*/ 13) {
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
    						each_blocks[i].m(div0, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*studentData*/ ctx[0].students.length == 0) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*studentData*/ ctx[0].students.length % 12 == 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(moreinfomodal.$$.fragment, local);
    			transition_in(searchbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(moreinfomodal.$$.fragment, local);
    			transition_out(searchbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(moreinfomodal);
    			destroy_component(searchbar);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
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

    function getRandomInt(max) {
    	return Math.floor(Math.random() * max);
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TableView", slots, []);
    	var { studentData } = $$props;
    	var { sessionToken } = $$props;

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

    	function loadMore(text) {
    		let query = "./student?token=" + sessionToken;

    		if (text != "") {
    			query += "&query=" + text;
    		}

    		query += "&offset=" + studentData.students.length;
    		console.log(query);

    		fetch(query).then(response => response.json()).then(data => {
    			console.log(data);

    			if (data != null) {
    				$$invalidate(0, studentData.students = [...studentData.students, ...data.students], studentData);
    			}
    		});
    	}

    	var modalOpen = false;
    	var modalData = {};
    	var search_text = "";
    	const writable_props = ["studentData", "sessionToken"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<TableView> was created with unknown prop '${key}'`);
    	});

    	function moreinfomodal_open_binding(value) {
    		modalOpen = value;
    		$$invalidate(2, modalOpen);
    	}

    	function searchbar_studentData_binding(value) {
    		studentData = value;
    		$$invalidate(0, studentData);
    	}

    	function searchbar_text_binding(value) {
    		search_text = value;
    		$$invalidate(4, search_text);
    	}

    	const click_handler = student => {
    		$$invalidate(3, modalData = student);
    		$$invalidate(2, modalOpen = true);
    	};

    	const click_handler_1 = () => loadMore(search_text);

    	$$self.$$set = $$props => {
    		if ("studentData" in $$props) $$invalidate(0, studentData = $$props.studentData);
    		if ("sessionToken" in $$props) $$invalidate(1, sessionToken = $$props.sessionToken);
    	};

    	$$self.$capture_state = () => ({
    		MoreInfoModal,
    		SearchBar,
    		studentData,
    		sessionToken,
    		getRandomInt,
    		colorMap,
    		loadMore,
    		modalOpen,
    		modalData,
    		search_text
    	});

    	$$self.$inject_state = $$props => {
    		if ("studentData" in $$props) $$invalidate(0, studentData = $$props.studentData);
    		if ("sessionToken" in $$props) $$invalidate(1, sessionToken = $$props.sessionToken);
    		if ("modalOpen" in $$props) $$invalidate(2, modalOpen = $$props.modalOpen);
    		if ("modalData" in $$props) $$invalidate(3, modalData = $$props.modalData);
    		if ("search_text" in $$props) $$invalidate(4, search_text = $$props.search_text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		studentData,
    		sessionToken,
    		modalOpen,
    		modalData,
    		search_text,
    		colorMap,
    		loadMore,
    		moreinfomodal_open_binding,
    		searchbar_studentData_binding,
    		searchbar_text_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class TableView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { studentData: 0, sessionToken: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableView",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*studentData*/ ctx[0] === undefined && !("studentData" in props)) {
    			console_1$1.warn("<TableView> was created without expected prop 'studentData'");
    		}

    		if (/*sessionToken*/ ctx[1] === undefined && !("sessionToken" in props)) {
    			console_1$1.warn("<TableView> was created without expected prop 'sessionToken'");
    		}
    	}

    	get studentData() {
    		throw new Error("<TableView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set studentData(value) {
    		throw new Error("<TableView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sessionToken() {
    		throw new Error("<TableView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sessionToken(value) {
    		throw new Error("<TableView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.37.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (159:2) {#if page == "signin"}
    function create_if_block_3(ctx) {
    	let login;
    	let updating_signedIn;
    	let updating_sessionToken;
    	let updating_page;
    	let current;

    	function login_signedIn_binding(value) {
    		/*login_signedIn_binding*/ ctx[5](value);
    	}

    	function login_sessionToken_binding(value) {
    		/*login_sessionToken_binding*/ ctx[6](value);
    	}

    	function login_page_binding(value) {
    		/*login_page_binding*/ ctx[7](value);
    	}

    	let login_props = {};

    	if (/*signedIn*/ ctx[1] !== void 0) {
    		login_props.signedIn = /*signedIn*/ ctx[1];
    	}

    	if (/*sessionToken*/ ctx[2] !== void 0) {
    		login_props.sessionToken = /*sessionToken*/ ctx[2];
    	}

    	if (/*page*/ ctx[0] !== void 0) {
    		login_props.page = /*page*/ ctx[0];
    	}

    	login = new Login({ props: login_props, $$inline: true });
    	binding_callbacks.push(() => bind(login, "signedIn", login_signedIn_binding));
    	binding_callbacks.push(() => bind(login, "sessionToken", login_sessionToken_binding));
    	binding_callbacks.push(() => bind(login, "page", login_page_binding));

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

    			if (!updating_sessionToken && dirty & /*sessionToken*/ 4) {
    				updating_sessionToken = true;
    				login_changes.sessionToken = /*sessionToken*/ ctx[2];
    				add_flush_callback(() => updating_sessionToken = false);
    			}

    			if (!updating_page && dirty & /*page*/ 1) {
    				updating_page = true;
    				login_changes.page = /*page*/ ctx[0];
    				add_flush_callback(() => updating_page = false);
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
    		source: "(159:2) {#if page == \\\"signin\\\"}",
    		ctx
    	});

    	return block;
    }

    // (162:2) {#if page == "profile"}
    function create_if_block_2(ctx) {
    	let dataform;
    	let updating_profileData;
    	let current;

    	function dataform_profileData_binding(value) {
    		/*dataform_profileData_binding*/ ctx[8](value);
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
    		source: "(162:2) {#if page == \\\"profile\\\"}",
    		ctx
    	});

    	return block;
    }

    // (169:2) {#if page == "search"}
    function create_if_block_1(ctx) {
    	let tableview;
    	let current;

    	tableview = new TableView({
    			props: {
    				studentData: /*studentData*/ ctx[4],
    				sessionToken: /*sessionToken*/ ctx[2]
    			},
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
    			if (dirty & /*sessionToken*/ 4) tableview_changes.sessionToken = /*sessionToken*/ ctx[2];
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
    		source: "(169:2) {#if page == \\\"search\\\"}",
    		ctx
    	});

    	return block;
    }

    // (172:2) {#if page != "signin"}
    function create_if_block(ctx) {
    	let signout;
    	let updating_signedIn;
    	let updating_page;
    	let current;

    	function signout_signedIn_binding(value) {
    		/*signout_signedIn_binding*/ ctx[9](value);
    	}

    	function signout_page_binding(value) {
    		/*signout_page_binding*/ ctx[10](value);
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
    		source: "(172:2) {#if page != \\\"signin\\\"}",
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
    			attr_dev(h1, "class", "column col-12 svelte-v3letq");
    			add_location(h1, file, 156, 3, 3319);
    			attr_dev(div0, "class", "columns");
    			add_location(div0, file, 155, 2, 3294);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file, 154, 1, 3268);
    			attr_dev(main, "class", "svelte-v3letq");
    			add_location(main, file, 153, 0, 3260);
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
    		sub: "",
    		first_name: "",
    		last_name: "",
    		gender: "Select",
    		class: 2025,
    		college: "Select",
    		major: "",
    		bio: "",
    		discord: "",
    		linkedin: "",
    		snapchat: "",
    		instagram: "",
    		facebook: "",
    		twitter: "",
    		email: "",
    		phone: "",
    		location: "Select",
    		building_preferences: ""
    	};

    	var profileData = template;

    	var studentData = {
    		students: [
    			{
    				sub: "100685528597008939195",
    				first_name: "Test First Name",
    				last_name: "Test Last Name",
    				gender: "Select",
    				class: 2025,
    				college: "College of Natural Science",
    				major: "Computer Science",
    				bio: "a bio...",
    				discord: "",
    				linkedin: "",
    				snapchat: "",
    				instagram: "",
    				facebook: "",
    				twitter: "",
    				email: "",
    				phone: "5555555555",
    				location: "On-Campus",
    				building_preferences: "live near the dining hall"
    			},
    			{
    				sub: "100685528597008939195",
    				first_name: "Test First Name",
    				last_name: "Test Last Name",
    				gender: "Select",
    				class: 2025,
    				college: "Select",
    				major: "",
    				bio: "a bio...",
    				discord: "",
    				linkedin: "",
    				snapchat: "",
    				instagram: "",
    				facebook: "",
    				twitter: "",
    				email: "",
    				phone: "",
    				location: "Select",
    				building_preferences: "prefs"
    			},
    			{
    				sub: "100685528597008939195",
    				first_name: "Test First Name",
    				last_name: "Test Last Name",
    				gender: "Select",
    				class: 2025,
    				college: "Select",
    				major: "",
    				bio: "a bio...",
    				discord: "",
    				linkedin: "",
    				snapchat: "",
    				instagram: "",
    				facebook: "",
    				twitter: "",
    				email: "",
    				phone: "",
    				location: "Select",
    				building_preferences: "prefs"
    			},
    			{
    				sub: "100685528597008939195",
    				first_name: "Test First Name",
    				last_name: "Test Last Name",
    				gender: "Select",
    				class: 2025,
    				college: "Select",
    				major: "",
    				bio: "a bio...",
    				discord: "",
    				linkedin: "",
    				snapchat: "",
    				instagram: "",
    				facebook: "",
    				twitter: "",
    				email: "",
    				phone: "",
    				location: "Select",
    				building_preferences: "prefs"
    			}
    		]
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

    	function login_sessionToken_binding(value) {
    		sessionToken = value;
    		$$invalidate(2, sessionToken);
    	}

    	function login_page_binding(value) {
    		page = value;
    		$$invalidate(0, page);
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
    		login_sessionToken_binding,
    		login_page_binding,
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
