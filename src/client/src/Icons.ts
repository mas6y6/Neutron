import { h } from "vue";

export function ArrowLeft() {
    return h('svg', {
        xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none",
        stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round",
        class: "feather feather-chevron-right"
    }, [
        h('polyline', { points: "9 18 15 12 9 6" })
    ]);
}

export function Settings() {
    return h('svg', {
        xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none",
        stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round",
        class: "feather feather-settings"
    }, [
        h('circle', { cx: "12", cy: "12", r: "3" }),
        h('path', {
            d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
        })
    ]);
}

export function People() {
    return h('svg', {
        xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none",
        stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round",
        class: "feather feather-users"
    }, [
        h('path', { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }),
        h('circle', { cx: "9", cy: "7", r: "4" }),
        h('path', { d: "M23 21v-2a4 4 0 0 0-3-3.87" }),
        h('path', { d: "M16 3.13a4 4 0 0 1 0 7.75" })
    ]);
}

export function AdminIcon() {
    return h('svg', {
        xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none",
        stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round",
        class: "feather feather-tool"
    }, [
        h('path', {
            d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        })
    ]);
}

export function ChevronRight() {
    return h('svg', {
        xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none",
        stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round",
        class: "feather feather-chevron-right"
    }, [
        h('polyline', { points: "9 18 15 12 9 6" })
    ]);
}

export function ChevronLeft() {
    return h('svg', {
        xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none",
        stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round",
        class: "feather feather-chevron-left"
    }, [
        h('polyline', { points: "15 18 9 12 15 6" })
    ]);
}

export function Plus() {
    return h('svg', {
        xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none",
        stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round",
        class: "feather feather-plus"
    }, [
        h('line', { x1: "12", y1: "5", x2: "12", y2: "19" }),
        h('line', { x1: "5", y1: "12", x2: "19", y2: "12" })
    ]);
}

export function Search() {
    return h('svg', {
        xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none",
        stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round",
        class: "feather feather-search"
    }, [
        h('circle', { cx: "11", cy: "11", r: "8" }),
        h('line', { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
    ]);
}

export function User() {
    return h('svg', {
        xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none",
        stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round",
        class: "feather feather-user"
    }, [
        h('path', { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
        h('circle', { cx: "12", cy: "7", r: "4" })
    ]);
}
