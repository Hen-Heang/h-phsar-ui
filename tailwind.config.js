
module.exports = ({
    content: ['./src/**/*.{js,jsx,ts,tsx}',"./node_modules/flowbite/**/*.js","./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",'node_modules/preline/dist/*.js',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
    // content: ['./src/**/*.{js,jsx,ts,tsx}',"./node_modules/flowbite/**/*.js",'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
],

    // enable dark mode via class strategy
    // content: ['./src/**/*.{js,jsx,ts,tsx}',"./node_modules/flowbite/**/*.js",'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
          
            colors: {
                newGreen: '#3EB042',
                newRed: '#ED6666',
                newWhite: '#ECEFF5',
                black: '#09090c',
                primary: '#0F766E',
                cardColor :'#DEFCFF',
                darkGray: '#121212',
                brightRed: 'hsl(12, 88%, 59%)',
                brightRedLight: 'hsl(12, 88%, 69%)',
                brightRedSupLight: 'hsl(12, 88%, 95%)',
                newGray : '#777777',
                darkBlue: 'hsl(228, 39%, 23%)',
                darkGrayishBlue: 'hsl(227, 12%, 61%)',
                veryDarkBlue: 'hsl(233, 12%, 13%)',
                backGroundColor : '#DEFCFF',
                primaryColor : '#0F766E',
                logInText : '#777777',
                whiteF: '#FFFFFF',
                colorComplete: '#D5EFD6',
                colorCancel: '#FFDCDC',
                colorTable: '#D9D9D9',
                retailerPrimary: '#C96A3A',
                retailerPrimaryDark: '#A94E24',
                retailerPrimarySoft: '#FFE7D8',
                retailerSurface: '#FFFCF8',
                retailerBorder: '#EEDBCD',
                retailerText: '#2F241D',
                retailerMuted: '#7D6B61',
                complete: '#3EB042',
                confirm: '#5E9C60',
                preparing: '#DD6A57',
                requesting: '#F15B22',
                rejected: '#ED6666',
                delivering: '#78B8BC',
                border : '#F15B22',
                retailerBackground: '#FFF8F2',
                primaryColorRetailer: '#C96A3A',
            },
            fontFamily: {
                Poppins: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
            },   
        },
    },
    plugins: [ require('flowbite/plugin'),require('preline/plugin')],
    variants: {
        scrollbar: ['rounded']
    }
})
