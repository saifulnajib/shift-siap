import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
    theme: {
        extend: {
            colors: {
                "primary": "#137fec",
                "background-light": "#FDF5E6",
                "background-dark": "#101922",
                "earth-terracotta": "#E2725B",
                "earth-olive": "#808000",
                "earth-gray": "#708090",
                "taupe-deep": "#483C32",
                "taupe-soft": "#8B8589",
                "brown-border": "#A68966"
            },
            fontFamily: {
                "display": ["Inter", "Manrope", "sans-serif"],
                "body": ["Inter", "Manrope", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        }
    }
}
