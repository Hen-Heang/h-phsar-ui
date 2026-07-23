
module.exports = ({
    content: ['./src/**/*.{js,jsx,ts,tsx}',"./node_modules/react-tailwindcss-datepicker/dist/index.esm.js"],

    darkMode: 'class',
    theme: {
        extend: {
          
            colors: {
                newGreen: '#3EB042',
                newRed: '#ED6666',
                newWhite: '#ECEFF5',
                black: '#09090c',
                primary: '#2563EB',
                cardColor :'#E0E7FF',
                darkGray: '#121212',
                brightRed: 'hsl(12, 88%, 59%)',
                brightRedLight: 'hsl(12, 88%, 69%)',
                brightRedSupLight: 'hsl(12, 88%, 95%)',
                newGray : '#777777',
                darkBlue: 'hsl(228, 39%, 23%)',
                darkGrayishBlue: 'hsl(227, 12%, 61%)',
                veryDarkBlue: 'hsl(233, 12%, 13%)',
                backGroundColor : '#E0E7FF',
                primaryColor : '#2563EB',
                logInText : '#777777',
                whiteF: '#FFFFFF',
                colorComplete: '#D5EFD6',
                colorCancel: '#FFDCDC',
                colorTable: '#D9D9D9',
                retailerPrimary: '#2563EB',
                retailerPrimaryDark: '#1E40AF',
                retailerPrimarySoft: '#DBEAFE',
                retailerSurface: '#FFFFFF',
                retailerBorder: '#E2E8F0',
                retailerText: '#1E293B',
                retailerMuted: '#64748B',
                complete: '#3EB042',
                confirm: '#5E9C60',
                preparing: '#DD6A57',
                requesting: '#F15B22',
                rejected: '#ED6666',
                delivering: '#78B8BC',
                border : '#2563EB',
                retailerBackground: '#F8FAFC',
                primaryColorRetailer: '#2563EB',
            },
            fontFamily: {
                Poppins: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
            },   
        },
    },
    plugins: [],
    variants: {
        scrollbar: ['rounded']
    }
})
