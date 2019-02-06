<template>
    <div class="scrollable-table">
        
        <table ref="table"
            class="scrolling table-hover"
            :class="{ scrolly: scrollVertical, scrollx: scrollHorizontal }"
            :style="tableStyle"
            >
            <thead name="thead" ref="thead"
                :class="{ scrollsync: syncHeaderScroll }"
                :style="syncHeaderScroll && scrollVertical ? stubScrollbarStyle : ''"
                @dragenter="onDragEnterHeader"
                @dragover.prevent="onDragOverHeader"
                @drop="onDropHeader"
                ><slot name="thead"/></thead>
            <tbody name="tbody" ref="tbody"
                @scroll.passive="updateSyncedScroll"><slot name="tbody"/></tbody>
            <tfoot name="tfoot" ref="tfoot"
                v-if="includeFooter"
                :class="{ scrollsync: syncFooterScroll }"
                :style="syncFooterScroll && scrollVertical ? stubScrollbarStyle : ''"
                ><slot name="tfoot"/></tfoot>
        </table>
		
		<div class="wrapper">
			<ul class="contextMenu list-group " ref="contextMenu">
				<li class="list-group-item list-group-item-action list-group-item-primary" v-for="menu in contextMenu" :key="menu.label" @click="menu.action">
					{{menu.label}}
				</li>
			</ul>
		</div>
    </div>
</template>
<script>
export default {
	name: "VueScrollingTable",
	props: {
        loading: { type: Boolean, required: false, default: false },
        hasData: { type: Boolean, required: false, default: true },
		deadAreaColor: { type: String, required: false, default: "#FFF" },
		includeFooter: { type: Boolean, required: false, default: false },
		syncHeaderScroll: { type: Boolean, required: false, default: true },
		syncFooterScroll: { type: Boolean, required: false, default: true },
		scrollHorizontal: { type: Boolean, required: false, default: true },
		scrollVertical: { type: Boolean, required: false, default: true },
		contextMenu: { type: Array, required: false, default: () => [] }
	},
	computed: {
		tableStyle() {
			return `background-color: ${this.deadAreaColor};`
		},
		stubScrollbarStyle() {
			return `background-color: ${this.deadAreaColor};
				scrollbar-base-color: ${this.deadAreaColor};
				scrollbar-face-color: ${this.deadAreaColor};
				scrollbar-highlight-color: ${this.deadAreaColor};
				scrollbar-track-color: ${this.deadAreaColor};
				scrollbar-arrow-color: ${this.deadAreaColor};
				scrollbar-shadow-color: ${this.deadAreaColor};
				scrollbar-darkshadow-color: ${this.deadAreaColor};`
		},
	},
	watch: {
		deadAreaColor() {
			this.setColors()
		},
	},
	mounted: function() {
		this.setColors()
		this.updateSyncedScroll()

		const tbody = this.$refs.tbody,
			thead = this.$refs.thead,
			context = this.$refs.contextMenu;
		
	},
	updated () {

	},
	methods: {
		updateSyncedScroll() {
			const b = this.$refs.tbody
			const l = b.scrollLeft
			if (this.scrollHorizontal) {
				if (this.syncHeaderScroll) {
					const h = this.$refs.thead
					if (h.scrollLeft !== l) {
						h.scrollLeft = l
					}
				}
				if (this.includeFooter && this.syncFooterScroll) {
					const f = this.$refs.tfoot
					if (f.scrollLeft !== l) {
						f.scrollLeft = l
					}
				}
			}
			this.$emit("scroll", b.scrollTop, l, b.scrollHeight, b.scrollWidth)
		},
		setColors() {
			const s = this.$refs.table.style
			s.setProperty("--dead-area-color", this.deadAreaColor)
		},
		onDragEnterHeader(e) {
			this.$emit("header-dragenter", e)
		},
		onDragOverHeader(e) {
			this.$emit("header-dragover", e)
		},
		onDropHeader(e) {
			this.$emit("header-drop", e)
        },
    }
}
</script>
<style>
.scrollable-table {
	height: 100%;
}
table.scrolling {
	display: flex;
	flex-direction: column;
	flex: 1 1 auto;
	width: 100%;
	height: 100%;
	border-collapse: collapse;
	overflow: hidden;
	background-color: #ccc;
	--dead-area-color: #ccc;
}

table.scrolling thead,
table.scrolling tfoot {
	flex: 0 0 auto;
	display: block;
	overflow: hidden;
}

table.scrolling tbody {
	display: block;
	flex: 1 1 auto;
	overflow: hidden;
}

table.scrolling.scrolly tbody,
table.scrolling.scrolly thead.scrollsync,
table.scrolling.scrolly tfoot.scrollsync {
	overflow-y: auto;
}

/* Turn on horizontal scrolling for the body only */
table.scrolling.scrollx tbody {
	overflow-x: auto;
}


table.scrolling.scrolly thead.scrollsync::-webkit-scrollbar {
	display: block;
	background-color: var(--dead-area-color);
}
table.scrolling.scrolly thead.scrollsync::-webkit-scrollbar-track {
	background-color: var(--dead-area-color);
}

/* IE11 adds an extra tbody, have to hide it. */
table.scrolling tbody:nth-child(3) {
	display: none;
}

/* The one caveat to scrolling this way: a hard-set width is required. Can override in thead/tbody slot. */
table.scrolling td,
table.scrolling th {
	border: 1px solid #ddd;

	overflow: hidden;
	word-wrap: break-word;
}


table.scrolling td.selectCol:first-child,
table.scrolling th.selectCol:first-child {
	
    width: 27px !important;
    min-width: 27px !important;
    max-width: 27px !important;
	
    position: -webkit-sticky;
    position: sticky;
    left:0;
	z-index: 1;
}

table.scrolling td:first-child {
    background-color: #fff;
}

table.scrolling th {
	background-color: #f7f7f7;
}
.overlay {
    background-color: rgba(0,0,0,0.1);
    z-index: 99;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
}
.overlay img {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    margin: auto;
}

.contextMenu {
    position: absolute;
    top:0;
    left:0;
	width: 0px;
	overflow:hidden;
	white-space: nowrap;
	margin:auto;
	visibility: hidden;
	-webkit-transition: width 0.3s;
	transition: width 0.3s;
}

.contextMenu .list-group-item-action {
	cursor: pointer;
	padding: 0.25rem 1.25rem;
}

.contextMenu.show {
	width: 150px;
	visibility:visible;
}
</style>