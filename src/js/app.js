import Vue from "vue";
import chroma from "chroma-js";

new Vue({
    el: "#app",

    created() {
        this.activeTab = localStorage.getItem("activeTab")
            ? localStorage.getItem("activeTab")
            : "tailwind";
    },

    data: {
        activeTab: null,
        colorInputValue: "",
        tabs: [
            {
                id: "tailwind",
                title: "Tailwind"
            },
            {
                id: "sass",
                title: "SASS"
            },
            {
                id: "scss",
                title: "SCSS"
            },
            {
                id: "less",
                title: "Less"
            }
        ]
    },

    computed: {
        brand() {
            return !this.colorInputValue
                ? this.getRandomColor()
                : chroma(this.colorInputValue);
        },

        allColors() {
            const ret = [
                ...this.brands(),
                ...this.colors(),
                ...this.grays(),
            ];

            for (let i = 1; i < ret.length; i++) {
                if (ret[i - 1].group !== ret[i].group || typeof ret[i - 1].variantDark !== 'undefined') {
                    ret[i].spacer = true;
                }
            }

            // console.log(ret);

            return ret;
        }
    },

    methods: {

        getStr(template, cssName, cssVal) {
            switch (template) {
                case 'tailwind':
                    return `'${cssName}': '${cssVal.hex()}',`
                
                case 'sass':
                    return `$${cssName}: ${cssVal.hex()}`
                
                case 'scss':
                    return `$${cssName}: ${cssVal.hex()};`
                
                case 'less':
                    return `@${cssName}: ${cssVal.hex()};`
            }
        },

        getTemplate(template, color) {

            let str = '';
            if (typeof color.spacer !== 'undefined') {
                str += '<br />';
            }

            if (typeof color.variantLight !== 'undefined') {
                str += this.getStr(template, `${color.cssName}-light`, color.variantLight) + '<br />';
            }

            str += this.getStr(template, color.cssName, color.value) + '<br />';

            if (typeof color.variantDark !== 'undefined') {
                str += this.getStr(template, `${color.cssName}-dark`, color.variantDark) + '<br />';
            }

            return str;

        },

        setActiveTab(tab) {
            this.activeTab = tab;
            localStorage.setItem("activeTab", tab);
        },

        getRandomColor() {
            return chroma.random();
        },

        tint(hex) {
            return chroma.mix("#fff", hex, 0.25, "lab");
        },

        shade(hex) {
            return chroma.mix("#000", hex, 0.5, "lab");
        },

        brands() {

            function pal1(bc) {

                let cntBrighten = 5;
                let cntDarken = 4;

                const br = chroma(bc).luminance();

                if (br < 0.01) {
                    cntBrighten = 9;
                    cntDarken = 0;
                }
                // else if (br < 0.1) {
                //   cntBrighten = 4;
                //   cntDarken = 5;
                // }

                let cols1 = [];
                let c = 0.5;
                for (let i = 0; i < 1000, c < 1; i++) {
                    const col = chroma(bc).brighten(i / 180);
                    c = col.luminance();
                    if (c < 1) {
                        cols1.push(col);
                    }
                }

                cols1 = cols1.filter((x, i) => i % Math.ceil(cols1.length / cntBrighten) === 0);

                let cols2 = [];
                c = 0.5;
                for (let i = 1000; i > 0; i--) {
                    const col = chroma(bc).darken(i / 180);
                    c = col.luminance();
                    if (c > 0.015) {
                        cols2.push(col);
                    }
                }

                cols2 = cols2.filter((x, i) => i % Math.ceil(cols2.length / cntDarken) === 0);

                return [...cols2, ...cols1]
            }

            function pal2(bc) {

                let allCols = [];

                const cnt = 4;
                const fac = 0.12;

                for (let i = 0; i < cnt; i++) {
                    allCols.push(chroma(bc).darken((cnt - i) * fac));
                }

                allCols.push(bc);

                for (let i = 0; i < cnt; i++) {
                    allCols.push(chroma(bc).brighten((i + 1) * fac));
                }

                // console.log(allCols.map(x => x.hex()));

                return allCols;
            }

            // const allCols = pal1(this.brand);
            const allCols = pal2(this.brand);

            return allCols.map((x, i) => ({
                group: 'brands',
                name: `brand-${(i + 1) * 100}`,
                cssName: `brand-${(i + 1) * 100}`,
                value: x
            }));
        },

        colors() {
            let allCols = [
                {
                    group: 'colors',
                    name: 'Brand',
                    cssName: 'brand',
                    value: this.brand
                },
                {
                    group: 'colors',
                    name: 'CTA',
                    cssName: 'cta',
                    value: this.brand.set('hsl.h', '+150')
                },
                {
                    group: 'colors',
                    name: 'Info',
                    cssName: 'info',
                    value: chroma.mix('#3df', this.brand, 0.2, 'lab')
                },
                {
                    group: 'colors',
                    name: 'Warning',
                    cssName: 'warning',
                    value: chroma.mix('#fd0', this.brand, 0.2, 'lab')
                },
                {
                    group: 'colors',
                    name: 'Success',
                    cssName: 'success',
                    value: chroma.mix('#3e4', this.brand, 0.2, 'lab')
                },
                {
                    group: 'colors',
                    name: 'Danger',
                    cssName: 'danger',
                    value: chroma.mix('#f34', this.brand, 0.2, 'lab')
                }
            ];

            for (let c of allCols) {

                c.variantLight = this.tint(c.value);
                c.variantDark = this.shade(c.value);
            }
            return allCols;
        },

        grays() {
            return [
                {
                    group: 'grays',
                    name: 'White',
                    cssName: 'white',
                    value: chroma('#fff')
                },
                {
                    group: 'grays',
                    name: 'gray Lightest',
                    cssName: 'gray-lightest',
                    value: chroma.mix('#fafafa', this.brand, 0.01, 'lab')
                },
                {
                    group: 'grays',
                    name: 'gray Lighter',
                    cssName: 'gray-lighter',
                    value: chroma.mix('#e6e6e6', this.brand, 0.01, 'lab')
                },
                {
                    group: 'grays',
                    name: 'gray Light',
                    cssName: 'gray-light',
                    value: chroma.mix('#d2d2d2', this.brand, 0.01, 'lab')
                },
                {
                    group: 'grays',
                    name: 'gray',
                    cssName: 'gray',
                    value: chroma.mix('#bfbfbf', this.brand, 0.01, 'lab')
                },
                {
                    group: 'grays',
                    name: 'gray Dark',
                    cssName: 'gray-dark',
                    value: chroma.mix('#979797', this.brand, 0.01, 'lab')
                },
                {
                    group: 'grays',
                    name: 'gray Darker',
                    cssName: 'gray-darker',
                    value: chroma.mix('#6f6f6f', this.brand, 0.01, 'lab')
                },
                {
                    group: 'grays',
                    name: 'gray Darkest',
                    cssName: 'gray-darkest',
                    value: chroma.mix('#484848', this.brand, 0.01, 'lab')
                },
                {
                    group: 'grays',
                    name: 'Black',
                    cssName: 'black',
                    value: chroma.mix('#202020', this.brand, 0.01, 'lab')
                }
            ];
        },
    }
});
